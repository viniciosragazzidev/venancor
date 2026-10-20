import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { auditoria, clientes, ordens, pagamentos, planos } from "@/db/schema";
import { gerarToken } from "@/lib/tokens";
import { urlCliente } from "@/modules/ordens/link";
import { getMessagingProvider } from "@/providers/messaging";
import {
  avaliarLembrete,
  formatarPrazo,
  LEMBRETE_ACAO,
  type LembreteRegistrado,
  type MotivoBloqueio,
  type OrigemLembrete,
  type TipoLembrete,
} from "./regras";

type Executor = Pick<typeof db, "select">;

export type ResultadoLembrete =
  | { enviado: true; tipo: TipoLembrete }
  | { enviado: false; motivo: MotivoBloqueio | "indisponivel" };

const TIPOS: readonly TipoLembrete[] = ["sem_assinatura", "sem_pagamento", "vencimento"];

/** Reminders already sent, read from the order's audit trail (acao lembrete_enviado). */
export async function historicoLembretes(
  executor: Executor,
  ordemIds: string[],
): Promise<Map<string, LembreteRegistrado[]>> {
  const mapa = new Map<string, LembreteRegistrado[]>();
  if (ordemIds.length === 0) return mapa;
  const linhas = await executor
    .select({
      ordemId: auditoria.entidadeId,
      metadados: auditoria.metadados,
      criadoEm: auditoria.criadoEm,
    })
    .from(auditoria)
    .where(
      and(
        eq(auditoria.entidade, "ordens"),
        eq(auditoria.acao, LEMBRETE_ACAO),
        inArray(auditoria.entidadeId, ordemIds),
      ),
    );
  for (const linha of linhas) {
    const tipo = (linha.metadados as { tipo?: unknown } | null)?.tipo;
    const lista = mapa.get(linha.ordemId) ?? [];
    lista.push({
      tipo: TIPOS.includes(tipo as TipoLembrete) ? (tipo as TipoLembrete) : null,
      enviadoEm: linha.criadoEm,
    });
    mapa.set(linha.ordemId, lista);
  }
  return mapa;
}

/** Earliest due date of a pending Pix/boleto charge per order. */
export async function vencimentosPendentes(
  executor: Executor,
  ordemIds: string[],
): Promise<Map<string, string>> {
  const mapa = new Map<string, string>();
  if (ordemIds.length === 0) return mapa;
  const linhas = await executor
    .select({ ordemId: pagamentos.ordemId, vencimento: pagamentos.vencimento })
    .from(pagamentos)
    .where(
      and(
        inArray(pagamentos.ordemId, ordemIds),
        eq(pagamentos.status, "pendente"),
        inArray(pagamentos.metodo, ["pix", "boleto"]),
      ),
    )
    .orderBy(asc(pagamentos.vencimento));
  for (const linha of linhas)
    if (linha.vencimento && !mapa.has(linha.ordemId)) mapa.set(linha.ordemId, linha.vencimento);
  return mapa;
}

/**
 * Sends one reminder if the rules allow it. Runs inside a transaction holding the order row, so
 * two cron runs (or the cron and the button) cannot remind the same order twice: the second one
 * re-reads the history after the first commits.
 *
 * The client link only exists as a hash, so the reminder carries a fresh link (same as "Reenviar
 * proposta"); the deadline is kept. The message is the last step: if the provider fails, the token
 * rotation and the audit row roll back.
 */
export async function enviarLembrete(
  ordemId: string,
  opcoes: { origem: OrigemLembrete; ator: string; agora?: Date },
): Promise<ResultadoLembrete> {
  const agora = opcoes.agora ?? new Date();
  return db.transaction(async (tx) => {
    const consulta = tx.select().from(ordens).where(eq(ordens.id, ordemId)).limit(1);
    const [ordem] =
      opcoes.origem === "automatico"
        ? await consulta.for("update", { skipLocked: true })
        : await consulta.for("update");
    if (!ordem) return { enviado: false, motivo: "indisponivel" };

    const [historico, vencimentos] = await Promise.all([
      historicoLembretes(tx, [ordem.id]),
      vencimentosPendentes(tx, [ordem.id]),
    ]);
    const avaliacao = avaliarLembrete(
      { ...ordem, vencimentoCobranca: vencimentos.get(ordem.id) ?? null },
      historico.get(ordem.id) ?? [],
      agora,
      opcoes.origem,
    );
    if (!avaliacao.enviar) return { enviado: false, motivo: avaliacao.motivo };

    const [dados] = await tx
      .select({ nome: clientes.nome, whatsapp: clientes.whatsapp, plano: planos.nome })
      .from(clientes)
      .innerJoin(planos, eq(planos.id, ordem.planoId))
      .where(eq(clientes.id, ordem.clienteId))
      .limit(1);
    if (!dados) throw new Error("Dados da ordem ausentes");

    const { token, hash } = gerarToken();
    const [rotacionada] = await tx
      .update(ordens)
      .set({ tokenHash: hash, atualizadoEm: agora })
      .where(and(eq(ordens.id, ordem.id), eq(ordens.status, ordem.status)))
      .returning({ id: ordens.id });
    if (!rotacionada) return { enviado: false, motivo: "indisponivel" };
    await tx.insert(auditoria).values({
      entidade: "ordens",
      entidadeId: ordem.id,
      acao: LEMBRETE_ACAO,
      ator: opcoes.ator,
      metadados: { tipo: avaliacao.tipo, origem: opcoes.origem },
    });

    const resultado = await getMessagingProvider().enviarTemplate({
      para: dados.whatsapp,
      template: "lembrete_proposta",
      variaveis: {
        nome: dados.nome,
        plano: dados.plano,
        prazo: formatarPrazo(avaliacao.prazo),
        link: urlCliente(token),
      },
      ordemId: ordem.id,
    });
    if (resultado.status !== "enviada")
      throw new Error(resultado.erro ?? "Falha ao enviar o lembrete");
    return { enviado: true, tipo: avaliacao.tipo };
  });
}
