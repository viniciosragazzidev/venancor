"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  auditoria,
  clientes,
  dependentes,
  ordemBeneficiarios,
  ordens,
  pagamentos,
  planos,
} from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { gerarToken } from "@/lib/tokens";
import { getMessagingProvider } from "@/providers/messaging";
import { getPaymentProvider } from "@/providers/payment";
import { sincronizarPendentesAsaas } from "@/modules/pagamentos/sincronizar-asaas";
import { ordemParaDuplicacao, type DuplicacaoOrdem } from "./formulario";
import { urlCliente } from "./link";
import { criarOrdemComo } from "./criar";
import { type CriarOrdemInput } from "./schemas";
import { transicionar } from "./state-machine";

export async function criarOrdem(input: CriarOrdemInput) {
  const admin = await requireAdmin();
  return criarOrdemComo(input, admin.id);
}

/**
 * The panel's "Criar ordem". In production Next hides the message of an error thrown by a server
 * action (the screen showed "Minified React error #441"), so the reason comes back as data.
 */
export async function criarOrdemNoPainel(
  input: CriarOrdemInput,
): Promise<{ ok: true; ordemId: string; link: string } | { ok: false; erro: string }> {
  try {
    const { ordem, link } = await criarOrdem(input);
    return { ok: true, ordemId: ordem.id, link };
  } catch (erro) {
    console.error("[ordens] criar falhou", erro);
    return {
      ok: false,
      erro: erro instanceof Error ? erro.message : "Não foi possível criar a ordem.",
    };
  }
}

/**
 * "Duplicar" in the orders list: the original order's conditions, client and dependents, to
 * prefill the "Criar ordem" form. Creating still goes through criarOrdemNoPainel (new order and
 * link); the original is not touched.
 */
export async function obterDuplicacaoOrdem(
  ordemId: string,
): Promise<
  | { ok: true; valores: DuplicacaoOrdem; dependentes: (typeof dependentes.$inferSelect)[] }
  | { ok: false; erro: string }
> {
  await requireAdmin();
  try {
    const [ordem] = await db.select().from(ordens).where(eq(ordens.id, ordemId)).limit(1);
    if (!ordem) throw new Error("Ordem não encontrada");
    const [beneficiarios, familiares] = await Promise.all([
      db
        .select({ titular: ordemBeneficiarios.titular, cpf: ordemBeneficiarios.cpf })
        .from(ordemBeneficiarios)
        .where(eq(ordemBeneficiarios.ordemId, ordem.id)),
      db.select().from(dependentes).where(eq(dependentes.clienteId, ordem.clienteId)),
    ]);
    return {
      ok: true,
      valores: ordemParaDuplicacao(ordem, beneficiarios, familiares),
      dependentes: familiares,
    };
  } catch (erro) {
    console.error("[ordens] duplicar falhou", erro);
    return {
      ok: false,
      erro: erro instanceof Error ? erro.message : "Não foi possível duplicar a ordem.",
    };
  }
}

export async function listarOrdens() {
  await requireAdmin();
  await sincronizarPendentesAsaas();
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
