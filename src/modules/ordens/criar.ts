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
  planoPrecos,
  planos,
} from "@/db/schema";
import { calcularOrdem, type FaixaEtaria } from "@/lib/pricing";
import { ErroNegocio } from "@/lib/resultado-acao";
import { gerarToken } from "@/lib/tokens";
import { urlCliente } from "./link";
import { criarOrdemSchema, type CriarOrdemInput } from "./schemas";

type TransacaoBanco = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Creates an order (draft) with its snapshot. Not a server action: callers check who the admin is
 * (the panel action) or run with a known admin (import scripts).
 */
export async function criarOrdemComo(
  input: CriarOrdemInput,
  adminId: string,
  transacaoExterna?: TransacaoBanco,
) {
  const admin = { id: adminId };
  const dados = criarOrdemSchema.parse(input);
  const dependenteIds = [...new Set(dados.dependenteIds)];
  if (dependenteIds.length !== dados.dependenteIds.length)
    throw new ErroNegocio("Dependente repetido");
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
  if (!cliente || !plano) throw new ErroNegocio("Cliente ou plano não encontrado");
  const [operadora] = await db
    .select()
    .from(operadoras)
    .where(eq(operadoras.id, plano.operadoraId))
    .limit(1);
  if (!operadora) throw new ErroNegocio("Operadora não encontrada");
  const familiares = dependenteIds.length
    ? await db
        .select()
        .from(dependentes)
        .where(and(eq(dependentes.clienteId, cliente.id), inArray(dependentes.id, dependenteIds)))
    : [];
  if (familiares.length !== dependenteIds.length)
    throw new ErroNegocio("Dependente não pertence ao cliente");
  const tabela = await db.select().from(planoPrecos).where(eq(planoPrecos.planoId, plano.id));
  if (tabela.length !== 10) throw new ErroNegocio("Tabela de preços incompleta");
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
  if (!generico)
    throw new ErroNegocio(
      "Nenhum modelo de contrato ativo para este plano. Cadastre um em Modelos de contrato (pode ser geral, sem plano).",
    );
  if (generico.planoId && generico.planoId !== plano.id)
    throw new ErroNegocio("Modelo de contrato não pertence ao plano");
  const { token, hash, cifrado } = gerarToken();
  const link = urlCliente(token);
  const expiraEm = new Date(Date.now() + dados.validadeDias * 86_400_000);
  const inserirOrdem = async (tx: TransacaoBanco) => {
    const [nova] = await tx
      .insert(ordens)
      .values({
        clienteId: cliente.id,
        planoId: plano.id,
        contratoModeloId: generico.id,
        vigenciaInicio: dados.vigenciaInicio ?? null,
        diaVencimento: dados.diaVencimento ?? null,
        valorMensal: calculo.valorMensal,
        valorAdesao: calculo.valorAdesao,
        desconto: calculo.desconto,
        descontoObs: dados.descontoObs,
        valorCobradoTipo: dados.valorCobradoTipo,
        valorCobrado: calculo.valorCobrado,
        formasPagamento: dados.formasPagamento,
        maxParcelas: dados.maxParcelas,
        exigeAssinatura: dados.exigeAssinatura,
        tokenHash: hash,
        tokenCifrado: cifrado,
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
      metadados: { planoId: plano.id, exigeAssinatura: dados.exigeAssinatura },
    });
    return nova;
  };
  const ordem = transacaoExterna
    ? await inserirOrdem(transacaoExterna)
    : await db.transaction(inserirOrdem);
  return { ordem, link };
}
