"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  auditoria,
  clientes,
  contratoModelos,
  dependentes,
  operadoras,
  ordemBeneficiarios,
  ordemSnapshotPlano,
  ordens,
  pagamentos,
  planoPrecos,
  planos,
} from "@/db/schema";
import { calcularOrdem, type FaixaEtaria } from "@/lib/pricing";
import { requireAdmin } from "@/lib/require-admin";
import { gerarToken } from "@/lib/tokens";
import { getMessagingProvider } from "@/providers/messaging";
import { getPaymentProvider } from "@/providers/payment";
import { criarOrdemSchema, type CriarOrdemInput } from "./schemas";
import { transicionar } from "./state-machine";

function urlCliente(token: string) {
  const base = process.env.APP_URL ?? process.env.BETTER_AUTH_URL;
  if (!base) throw new Error("APP_URL não configurada");
  return new URL(`/c/${token}`, base).toString();
}

export async function criarOrdem(input: CriarOrdemInput) {
  const admin = await requireAdmin();
  const dados = criarOrdemSchema.parse(input);
  const dependenteIds = [...new Set(dados.dependenteIds)];
  if (dependenteIds.length !== dados.dependenteIds.length) throw new Error("Dependente repetido");
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, dados.clienteId))
    .limit(1);
  const [plano] = await db
    .select()
    .from(planos)
    .where(and(eq(planos.id, dados.planoId), eq(planos.ativo, true)))
    .limit(1);
  if (!cliente || !plano) throw new Error("Cliente ou plano não encontrado");
  const [operadora] = await db
    .select()
    .from(operadoras)
    .where(eq(operadoras.id, plano.operadoraId))
    .limit(1);
  if (!operadora) throw new Error("Operadora não encontrada");
  const familiares = dependenteIds.length
    ? await db
        .select()
        .from(dependentes)
        .where(and(eq(dependentes.clienteId, cliente.id), inArray(dependentes.id, dependenteIds)))
    : [];
  if (familiares.length !== dependenteIds.length)
    throw new Error("Dependente não pertence ao cliente");
  const tabela = await db.select().from(planoPrecos).where(eq(planoPrecos.planoId, plano.id));
  if (tabela.length !== 10) throw new Error("Tabela de preços incompleta");
  const precos = Object.fromEntries(tabela.map((item) => [item.faixaEtaria, item.valor])) as Record<
    FaixaEtaria,
    number
  >;
  const pessoas = [cliente, ...familiares];
  const calculo = calcularOrdem(
    pessoas.map((pessoa) => ({ nascimento: new Date(`${pessoa.nascimento}T12:00:00Z`) })),
    precos,
    plano.taxaAdesao,
    dados.desconto,
    dados.valorCobradoTipo,
    dados.valorPersonalizado,
  );
  const [modelo] = await db
    .select()
    .from(contratoModelos)
    .where(
      and(
        dados.contratoModeloId
          ? eq(contratoModelos.id, dados.contratoModeloId)
          : eq(contratoModelos.planoId, plano.id),
        eq(contratoModelos.ativo, true),
      ),
    )
    .limit(1);
  const [generico] = modelo
    ? [modelo]
    : await db
        .select()
        .from(contratoModelos)
        .where(and(isNull(contratoModelos.planoId), eq(contratoModelos.ativo, true)))
        .limit(1);
  if (!generico) throw new Error("Modelo de contrato não encontrado");
  if (generico.planoId && generico.planoId !== plano.id)
    throw new Error("Modelo de contrato não pertence ao plano");
  const { token, hash } = gerarToken();
  const link = urlCliente(token);
  const expiraEm = new Date(Date.now() + dados.validadeDias * 86_400_000);
  const ordem = await db.transaction(async (tx) => {
    const [nova] = await tx
      .insert(ordens)
      .values({
        clienteId: cliente.id,
        planoId: plano.id,
        contratoModeloId: generico.id,
        valorMensal: calculo.valorMensal,
        valorAdesao: calculo.valorAdesao,
        desconto: calculo.desconto,
        descontoObs: dados.descontoObs,
        valorCobradoTipo: dados.valorCobradoTipo,
        valorCobrado: calculo.valorCobrado,
        formasPagamento: dados.formasPagamento,
        maxParcelas: dados.maxParcelas,
        tokenHash: hash,
        expiraEm,
        criadaPor: admin.id,
      })
      .returning();
    await tx.insert(ordemBeneficiarios).values(
      pessoas.map((pessoa, i) => ({
        ordemId: nova.id,
        titular: i === 0,
        nome: pessoa.nome,
        cpf: pessoa.cpf,
        nascimento: pessoa.nascimento,
        faixaEtaria: calculo.itens[i].faixa,
        valor: calculo.itens[i].valor,
      })),
    );
    await tx.insert(ordemSnapshotPlano).values({
      ordemId: nova.id,
      dados: {
        operadora: { nome: operadora.nome, registroAns: operadora.registroAns },
        plano: {
          nome: plano.nome,
          codigo: plano.codigo,
          segmentacao: plano.segmentacao,
          acomodacao: plano.acomodacao,
          abrangencia: plano.abrangencia,
          tipoContratacao: plano.tipoContratacao,
          coparticipacao: plano.coparticipacao,
          carencias: plano.carencias,
          coberturas: plano.coberturas,
          redeCredenciada: plano.redeCredenciada,
        },
        precos: tabela.map(({ faixaEtaria, valor }) => ({ faixaEtaria, valor })),
      },
      contratoCorpo: generico.corpo,
    });
    await tx.insert(auditoria).values({
      entidade: "ordens",
      entidadeId: nova.id,
      acao: "criar",
      ator: `admin:${admin.id}`,
      metadados: { planoId: plano.id },
    });
    return nova;
  });
  return { ordem, link };
}

export async function listarOrdens() {
  await requireAdmin();
  return db.select().from(ordens);
}

export async function gerarNovoLink(ordemId: string) {
  const admin = await requireAdmin();
  const { token, hash } = gerarToken();
  const link = urlCliente(token);
  const [ordem] = await db
    .update(ordens)
    .set({
      tokenHash: hash,
      expiraEm: new Date(Date.now() + 7 * 86_400_000),
      atualizadoEm: new Date(),
    })
    .where(
      and(eq(ordens.id, ordemId), inArray(ordens.status, ["rascunho", "enviada", "visualizada"])),
    )
    .returning();
  if (!ordem) throw new Error("Ordem indisponível para novo link");
  await db.insert(auditoria).values({
    entidade: "ordens",
    entidadeId: ordemId,
    acao: "regenerar_link",
    ator: `admin:${admin.id}`,
  });
  return link;
}

export async function enviarOrdem(ordemId: string) {
  const admin = await requireAdmin();
  const [ordem] = await db.select().from(ordens).where(eq(ordens.id, ordemId)).limit(1);
  if (!ordem || !["rascunho", "enviada", "visualizada"].includes(ordem.status))
    throw new Error("Ordem indisponível para envio");
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, ordem.clienteId))
    .limit(1);
  const [plano] = await db.select().from(planos).where(eq(planos.id, ordem.planoId)).limit(1);
  if (!cliente || !plano) throw new Error("Dados da ordem ausentes");
  const link = await gerarNovoLink(ordemId);
  await getMessagingProvider().enviarTemplate({
    para: cliente.whatsapp,
    template: "proposta_enviada",
    variaveis: { nome: cliente.nome, plano: plano.nome, link },
    ordemId,
  });
  if (ordem.status === "rascunho") await transicionar(ordemId, "enviada", `admin:${admin.id}`);
  return link;
}

export async function reenviarOrdem(ordemId: string) {
  return enviarOrdem(ordemId);
}
export async function copiarLinkOrdem(ordemId: string) {
  return gerarNovoLink(ordemId);
}

export async function cancelarOrdem(ordemId: string) {
  const admin = await requireAdmin();
  const [ordem] = await db
    .select({ status: ordens.status })
    .from(ordens)
    .where(eq(ordens.id, ordemId))
    .limit(1);
  if (
    !ordem ||
    !["rascunho", "enviada", "visualizada", "assinada", "aguardando_pagamento"].includes(
      ordem.status,
    )
  )
    throw new Error("Ordem indisponível para cancelamento");
  const pendentes = await db
    .select()
    .from(pagamentos)
    .where(and(eq(pagamentos.ordemId, ordemId), eq(pagamentos.status, "pendente")));
  for (const pagamento of pendentes) {
    if (!pagamento.providerPaymentId) continue;
    const provider = getPaymentProvider();
    if (provider.nome !== pagamento.provider)
      throw new Error("Provedor da cobrança não configurado");
    await provider.cancelarCobranca(pagamento.providerPaymentId);
  }
  await transicionar(ordemId, "cancelada", `admin:${admin.id}`);
  await db
    .update(pagamentos)
    .set({ status: "cancelado", atualizadoEm: new Date() })
    .where(and(eq(pagamentos.ordemId, ordemId), eq(pagamentos.status, "pendente")));
}
