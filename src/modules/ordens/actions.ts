"use server";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import {
  assinaturas,
  auditoria,
  clientes,
  consentimentos,
  dependentes,
  leads,
  mensagens,
  ordemBeneficiarios,
  ordemSnapshotPlano,
  ordens,
  otpCodigos,
  pagamentos,
  planos,
} from "@/db/schema";
import { ErroNegocio, executarAcao, type ResultadoAcao } from "@/lib/resultado-acao";
import { requireAdmin } from "@/lib/require-admin";
import { decifrarToken, gerarToken } from "@/lib/tokens";
import { getMessagingProvider } from "@/providers/messaging";
import { getPaymentProvider } from "@/providers/payment";
import { sincronizarPendentesAsaas } from "@/modules/pagamentos/sincronizar-asaas";
import { executarCriacaoOrdensLote } from "./lote";
import { MAX_ORDENS_EXCLUSAO, motivoBloqueioExclusaoOrdem } from "./exclusao";
import { ordemParaDuplicacao, type DuplicacaoOrdem } from "./formulario";
import { urlCliente } from "./link";
import { decidirLinkAtual } from "./link-estavel";
import { criarOrdemComo } from "./criar";
import {
  criarOrdemSchema,
  criarOrdensLoteSchema,
  type CriarOrdemInput,
  type CriarOrdensLoteInput,
} from "./schemas";
import { transicionar, type OrdemStatus } from "./state-machine";

const excluirOrdensLoteSchema = z.object({
  ordemIds: z
    .array(z.uuid())
    .min(1, "Selecione ao menos uma ordem")
    .max(MAX_ORDENS_EXCLUSAO, `Selecione no máximo ${MAX_ORDENS_EXCLUSAO} ordens`),
});

export async function criarOrdemNoPainel(
  input: CriarOrdemInput,
): Promise<ResultadoAcao<{ ordemId: string; link: string }>> {
  const admin = await requireAdmin();
  return executarAcao(
    "painel.ordem.criar",
    async () => {
      const dados = criarOrdemSchema.parse(input);
      const { ordem, link } = await criarOrdemComo(dados, admin.id);
      return { ordemId: ordem.id, link };
    },
    { validacao: "campo" },
  );
}

export async function criarOrdensEmLote(
  input: CriarOrdensLoteInput,
): Promise<ResultadoAcao<Awaited<ReturnType<typeof executarCriacaoOrdensLote>>>> {
  const admin = await requireAdmin();
  return executarAcao(
    "painel.ordens.criar_lote",
    async () => {
      const dados = criarOrdensLoteSchema.parse(input);
      const { clienteIds, incluirDependentes, ...condicoes } = dados;
      const clientesEncontrados = await db
        .select({ id: clientes.id, nome: clientes.nome })
        .from(clientes)
        .where(inArray(clientes.id, clienteIds));
      const porId = new Map(clientesEncontrados.map((cliente) => [cliente.id, cliente]));
      const validos = clienteIds.flatMap((id) => {
        const cliente = porId.get(id);
        return cliente ? [cliente] : [];
      });
      const resultado = await executarCriacaoOrdensLote(validos, async (cliente) => {
        const dependenteIds = incluirDependentes
          ? (
              await db
                .select({ id: dependentes.id })
                .from(dependentes)
                .where(eq(dependentes.clienteId, cliente.id))
            ).map((dependente) => dependente.id)
          : [];
        const { ordem } = await criarOrdemComo(
          { ...condicoes, clienteId: cliente.id, dependenteIds },
          admin.id,
        );
        return { ordemId: ordem.id, numero: ordem.numero };
      });
      const ausentes = clienteIds
        .filter((id) => !porId.has(id))
        .map((id) => ({ id, nome: "Cliente indisponível", erro: "Cliente não encontrado." }));
      return { criadas: resultado.criadas, falhas: [...resultado.falhas, ...ausentes] };
    },
    { validacao: "campo" },
  );
}

/**
 * The source lead is retained and detached if its draft order is removed. Its status returns to
 * Aguardando so an admin can create a replacement order. Consent blocks deletion, audit history
 * stays intact, and message delivery logs are detached from the removed order.
 */
export async function excluirOrdensEmMassa(ordemIds: string[]): Promise<
  ResultadoAcao<{
    excluidas: Array<{ ordemId: string; numero: number }>;
    puladas: Array<{ ordemId: string; numero?: number; motivo: string }>;
  }>
> {
  const admin = await requireAdmin();
  return executarAcao(
    "painel.ordens.excluir_lote",
    async () => {
      const { ordemIds: ids } = excluirOrdensLoteSchema.parse({ ordemIds: [...new Set(ordemIds)] });
      return db.transaction(async (tx) => {
        const excluidas: Array<{ ordemId: string; numero: number }> = [];
        const puladas: Array<{ ordemId: string; numero?: number; motivo: string }> = [];
        for (const ordemId of ids) {
          const [ordem] = await tx
            .select({ id: ordens.id, numero: ordens.numero, status: ordens.status })
            .from(ordens)
            .where(eq(ordens.id, ordemId))
            .limit(1)
            .for("update");
          if (!ordem) {
            puladas.push({ ordemId, motivo: "Ordem não encontrada." });
            continue;
          }
          const [assinatura] = await tx
            .select({ id: assinaturas.id })
            .from(assinaturas)
            .where(eq(assinaturas.ordemId, ordemId))
            .limit(1);
          const [pagamento] = await tx
            .select({ id: pagamentos.id })
            .from(pagamentos)
            .where(eq(pagamentos.ordemId, ordemId))
            .limit(1);
          const [consentimento] = await tx
            .select({ id: consentimentos.id })
            .from(consentimentos)
            .where(eq(consentimentos.ordemId, ordemId))
            .limit(1);
          const motivo = motivoBloqueioExclusaoOrdem({
            status: ordem.status as OrdemStatus,
            assinaturaExiste: Boolean(assinatura),
            pagamentoExiste: Boolean(pagamento),
            consentimentoExiste: Boolean(consentimento),
          });
          if (motivo) {
            puladas.push({ ordemId, numero: ordem.numero, motivo });
            continue;
          }

          await tx.delete(otpCodigos).where(eq(otpCodigos.ordemId, ordemId));
          await tx.delete(ordemBeneficiarios).where(eq(ordemBeneficiarios.ordemId, ordemId));
          await tx.delete(ordemSnapshotPlano).where(eq(ordemSnapshotPlano.ordemId, ordemId));
          await tx
            .update(mensagens)
            .set({ ordemId: null, atualizadoEm: new Date() })
            .where(eq(mensagens.ordemId, ordemId));
          const [lead] = await tx
            .update(leads)
            .set({ ordemId: null, status: "Aguardando", atualizadoEm: new Date() })
            .where(eq(leads.ordemId, ordemId))
            .returning({ id: leads.id });
          if (lead) {
            await tx.insert(auditoria).values({
              entidade: "leads",
              entidadeId: lead.id,
              acao: "desvincular_ordem_excluida",
              ator: `admin:${admin.id}`,
              metadados: { ordemId, numero: ordem.numero },
            });
          }
          await tx.delete(ordens).where(eq(ordens.id, ordemId));
          await tx.insert(auditoria).values({
            entidade: "ordens",
            entidadeId: ordemId,
            acao: "excluir_em_massa",
            ator: `admin:${admin.id}`,
            metadados: { numero: ordem.numero, status: ordem.status },
          });
          excluidas.push({ ordemId, numero: ordem.numero });
        }
        return { excluidas, puladas };
      });
    },
    { validacao: "campo" },
  );
}

/** Loads the original order's conditions to prefill a new, independent proposal. */
export async function obterDuplicacaoOrdem(
  ordemId: string,
): Promise<
  | { ok: true; valores: DuplicacaoOrdem; dependentes: (typeof dependentes.$inferSelect)[] }
  | { ok: false; erro: string }
> {
  await requireAdmin();
  try {
    const [ordem] = await db.select().from(ordens).where(eq(ordens.id, ordemId)).limit(1);
    if (!ordem) throw new ErroNegocio("Ordem não encontrada.");
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

/** Statuses in which the client link is still useful (before signing, or signed waiting for payment). */
const STATUS_LINK_ATIVO = ["rascunho", "enviada", "visualizada", "assinada", "aguardando_pagamento"] as const;
const VALIDADE_LINK_MS = 7 * 86_400_000;

/**
 * The order's current link, without replacing it (06/11): "Copiar link", "Enviar/Reenviar" and the
 * reminders reuse the same link, so a link already sent keeps working. A deadline ending within 24h
 * is extended for 7 more days, same link; a link already expired is never reopened (decidirLinkAtual). Only orders created before this change (no stored token)
 * get a new link, once. A new link only comes from "Gerar novo link".
 */
async function linkAtualComoAdmin(ordemId: string, adminId: string): Promise<{ link: string; novo: boolean }> {
  const [ordem] = await db.select().from(ordens).where(eq(ordens.id, ordemId)).limit(1);
  if (!ordem || !(STATUS_LINK_ATIVO as readonly string[]).includes(ordem.status))
    throw new ErroNegocio("Esta ordem não tem link ativo para o cliente.");
  const decisao = decidirLinkAtual({ status: ordem.status, expiraEm: ordem.expiraEm, agora: new Date() });
  if (decisao === "vencido")
    throw new ErroNegocio("Este link venceu. Use \"Gerar novo link\" para mandar um link novo ao cliente.");
  const token = decifrarToken(ordem.tokenCifrado, ordem.tokenHash);
  if (!token) return { link: await gerarNovoLinkComoAdmin(ordemId, adminId), novo: true };
  if (decisao === "renovar") {
    await db
      .update(ordens)
      .set({ expiraEm: new Date(Date.now() + VALIDADE_LINK_MS), atualizadoEm: new Date() })
      .where(and(eq(ordens.id, ordemId), eq(ordens.tokenHash, ordem.tokenHash)));
    await db.insert(auditoria).values({
      entidade: "ordens",
      entidadeId: ordemId,
      acao: "renovar_prazo_link",
      ator: `admin:${adminId}`,
    });
  }
  return { link: urlCliente(token), novo: false };
}

async function gerarNovoLinkComoAdmin(ordemId: string, adminId: string) {
  const { token, hash, cifrado } = gerarToken();
  const link = urlCliente(token);
  const [ordem] = await db
    .update(ordens)
    .set({
      tokenHash: hash,
      tokenCifrado: cifrado,
      expiraEm: new Date(Date.now() + 7 * 86_400_000),
      atualizadoEm: new Date(),
    })
    .where(
      and(eq(ordens.id, ordemId), inArray(ordens.status, [...STATUS_LINK_ATIVO])),
    )
    .returning();
  if (!ordem) throw new ErroNegocio("Esta ordem não está disponível para gerar um novo link.");
  await db.insert(auditoria).values({
    entidade: "ordens",
    entidadeId: ordemId,
    acao: "regenerar_link",
    ator: `admin:${adminId}`,
  });
  return link;
}

export async function gerarNovoLink(ordemId: string): Promise<ResultadoAcao<string>> {
  const admin = await requireAdmin();
  return executarAcao("painel.ordem.gerar_link", () => gerarNovoLinkComoAdmin(ordemId, admin.id));
}

async function enviarOrdemComoAdmin(ordemId: string, adminId: string) {
  const [ordem] = await db.select().from(ordens).where(eq(ordens.id, ordemId)).limit(1);
  if (!ordem || !["rascunho", "enviada", "visualizada"].includes(ordem.status))
    throw new ErroNegocio("Esta ordem não está disponível para envio.");
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, ordem.clienteId))
    .limit(1);
  const [plano] = await db.select().from(planos).where(eq(planos.id, ordem.planoId)).limit(1);
  if (!cliente || !plano) throw new ErroNegocio("Os dados desta ordem estão incompletos.");
  const { link } = await linkAtualComoAdmin(ordemId, adminId);
  await getMessagingProvider().enviarTemplate({
    para: cliente.whatsapp,
    template: "proposta_enviada",
    variaveis: { nome: cliente.nome, plano: plano.nome, link },
    ordemId,
  });
  if (ordem.status === "rascunho") await transicionar(ordemId, "enviada", `admin:${adminId}`);
  return link;
}

export async function enviarOrdem(ordemId: string): Promise<ResultadoAcao<string>> {
  const admin = await requireAdmin();
  return executarAcao("painel.ordem.enviar", () => enviarOrdemComoAdmin(ordemId, admin.id));
}

export async function reenviarOrdem(ordemId: string): Promise<ResultadoAcao<string>> {
  return enviarOrdem(ordemId);
}

/** Copies the current link (same link already sent); `novo` is true only for old orders without one. */
export async function copiarLinkOrdem(ordemId: string): Promise<ResultadoAcao<{ link: string; novo: boolean }>> {
  const admin = await requireAdmin();
  return executarAcao("painel.ordem.copiar_link", () => linkAtualComoAdmin(ordemId, admin.id));
}

export async function cancelarOrdem(ordemId: string): Promise<ResultadoAcao<void>> {
  const admin = await requireAdmin();
  return executarAcao("painel.ordem.cancelar", async () => {
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
      throw new ErroNegocio("Esta ordem não está disponível para cancelamento.");
    const pendentes = await db
      .select()
      .from(pagamentos)
      .where(and(eq(pagamentos.ordemId, ordemId), eq(pagamentos.status, "pendente")));
    for (const pagamento of pendentes) {
      if (!pagamento.providerPaymentId) continue;
      const provider = getPaymentProvider();
      if (provider.nome !== pagamento.provider)
        throw new ErroNegocio("O provedor desta cobrança não está configurado.");
      await provider.cancelarCobranca(pagamento.providerPaymentId);
    }
    await transicionar(ordemId, "cancelada", `admin:${admin.id}`);
    await db
      .update(pagamentos)
      .set({ status: "cancelado", atualizadoEm: new Date() })
      .where(and(eq(pagamentos.ordemId, ordemId), eq(pagamentos.status, "pendente")));
  });
}
