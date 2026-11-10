"use server";

import { and, count, eq, max } from "drizzle-orm";
import { db } from "@/db/client";
import { auditoria } from "@/db/schema";
import { ErroNegocio, executarAcaoPainel } from "@/lib/resultado-acao";
import { requireAdmin } from "@/lib/require-admin";
import { enviarLembrete } from "./enviar";
import { LEMBRETE_ACAO, MENSAGENS_BLOQUEIO } from "./regras";

export interface ResumoLembretes {
  quantidade: number;
  ultimoEm: string | null;
}

/** Reminders sent per order, for the orders list. */
export async function listarResumoLembretes(): Promise<Record<string, ResumoLembretes>> {
  await requireAdmin();
  const linhas = await db
    .select({
      ordemId: auditoria.entidadeId,
      quantidade: count(),
      ultimoEm: max(auditoria.criadoEm),
    })
    .from(auditoria)
    .where(and(eq(auditoria.entidade, "ordens"), eq(auditoria.acao, LEMBRETE_ACAO)))
    .groupBy(auditoria.entidadeId);
  return Object.fromEntries(
    linhas.map((linha) => [
      linha.ordemId,
      { quantidade: linha.quantidade, ultimoEm: linha.ultimoEm?.toISOString() ?? null },
    ]),
  );
}

/**
 * "Lembrar agora" in the panel: same rules as the cron except the 24h waits (still blocks
 * paid/cancelled/expired orders, quiet hours and the cap). Errors come back as data because Next
 * hides thrown messages in production.
 */
export async function lembrarAgora(
  ordemId: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const admin = await requireAdmin();
  const resultado = await executarAcaoPainel("painel.lembrete.enviar", async () => {
    const resultado = await enviarLembrete(ordemId, {
      origem: "manual",
      ator: `admin:${admin.id}`,
    });
    if (resultado.enviado) return true;
    const mensagem = resultado.motivo === "indisponivel"
      ? "Esta ordem não está disponível para envio de lembrete. Confira o status da proposta."
      : MENSAGENS_BLOQUEIO[resultado.motivo];
    throw new ErroNegocio(mensagem);
  });
  return resultado.ok ? { ok: true } : resultado;
}
