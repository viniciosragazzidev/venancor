import { and, desc, gt, gte, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { ordens } from "@/db/schema";
import { log } from "@/lib/log";
import { enviarLembrete, historicoLembretes, vencimentosPendentes } from "./enviar";
import {
  avaliarLembrete,
  emHorarioSilencioso,
  ESPERA_MINIMA_VENCIMENTO_MS,
  LEMBRETE_ACAO,
  MAX_LEMBRETES,
} from "./regras";

/** Orders idle for longer than this are left alone (abandoned proposals). */
const IDADE_MAXIMA_MS = 45 * 86_400_000;
const CANDIDATOS_POR_EXECUCAO = 200;
export const LIMITE_ENVIOS_PADRAO = 20;

export const lembretesAutomaticosAtivos = () => process.env.LEMBRETES_AUTOMATICOS === "true";

export interface ResumoProcessamento {
  silencioso: boolean;
  avaliadas: number;
  enviados: number;
  falhas: number;
}

/**
 * Cron step: finds the orders with a reminder due and sends up to `limite` of them. Idempotent:
 * each send re-checks the rules inside a locked transaction (see enviarLembrete).
 */
export async function processarLembretesPendentes({
  agora = new Date(),
  limite = LIMITE_ENVIOS_PADRAO,
}: { agora?: Date; limite?: number } = {}): Promise<ResumoProcessamento> {
  if (emHorarioSilencioso(agora)) return { silencioso: true, avaliadas: 0, enviados: 0, falhas: 0 };
  const ultimoPasso = sql`coalesce(${ordens.assinadaEm}, ${ordens.visualizadaEm}, ${ordens.enviadaEm})`;
  const candidatos = await db
    .select()
    .from(ordens)
    .where(
      and(
        inArray(ordens.status, ["enviada", "visualizada", "assinada", "aguardando_pagamento"]),
        or(
          inArray(ordens.status, ["assinada", "aguardando_pagamento"]),
          gt(ordens.expiraEm, agora),
        ),
        lte(ultimoPasso, new Date(agora.getTime() - ESPERA_MINIMA_VENCIMENTO_MS)),
        gte(ultimoPasso, new Date(agora.getTime() - IDADE_MAXIMA_MS)),
        sql`(select count(*) from auditoria a where a.entidade = 'ordens' and a.entidade_id = ${ordens.id}::text and a.acao = ${LEMBRETE_ACAO}) < ${MAX_LEMBRETES}`,
      ),
    )
    .orderBy(desc(ultimoPasso))
    .limit(CANDIDATOS_POR_EXECUCAO);

  const ids = candidatos.map((ordem) => ordem.id);
  const [historicos, vencimentos] = await Promise.all([
    historicoLembretes(db, ids),
    vencimentosPendentes(db, ids),
  ]);
  const devidas = candidatos.filter(
    (ordem) =>
      avaliarLembrete(
        { ...ordem, vencimentoCobranca: vencimentos.get(ordem.id) ?? null },
        historicos.get(ordem.id) ?? [],
        agora,
        "automatico",
      ).enviar,
  );

  let enviados = 0;
  let falhas = 0;
  for (const ordem of devidas) {
    if (enviados >= limite) break;
    try {
      const resultado = await enviarLembrete(ordem.id, {
        origem: "automatico",
        ator: "sistema:lembretes",
        agora,
      });
      if (resultado.enviado) enviados += 1;
    } catch (erro) {
      falhas += 1;
      log.warn("Falha ao enviar lembrete", ordem.id, erro instanceof Error ? erro.message : erro);
    }
  }
  return { silencioso: false, avaliadas: candidatos.length, enviados, falhas };
}
