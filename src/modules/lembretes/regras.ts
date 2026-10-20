/**
 * Rules for client reminders (template lembrete_proposta). Pure: the cron, the "Lembrar agora"
 * button and the tests all decide through avaliarLembrete.
 *
 * - sem_assinatura: sent or opened, not signed, 24h after the last step.
 * - sem_pagamento: signed, not paid, 24h after signing.
 * - vencimento: Pix/boleto due (or link expiring) within 24h, once.
 * Each kind goes out at most once (automatic), at most MAX_LEMBRETES per order in total, never
 * for paid/cancelled/expired orders and never between 20h and 8h in São Paulo.
 */

export const LEMBRETE_ACAO = "lembrete_enviado";
export const MAX_LEMBRETES = 2;

const HORA = 3_600_000;
/** Wait after the last step (sent/opened/signed) before an automatic reminder. */
export const ESPERA_APOS_ETAPA_MS = 24 * HORA;
/** A due date this close counts as "expiring soon". */
export const JANELA_VENCIMENTO_MS = 24 * HORA;
/** Do not send the "expiring" reminder right after the client got the link or signed. */
export const ESPERA_MINIMA_VENCIMENTO_MS = 6 * HORA;
/** Minimum gap between two automatic reminders of the same order. */
export const INTERVALO_ENTRE_LEMBRETES_MS = 24 * HORA;
/** After the link deadline a pending payment still works for this long (see resolverToken). */
export const TOLERANCIA_PAGAMENTO_MS = 30 * 24 * HORA;

export const HORA_INICIO_ENVIO = 8;
export const HORA_FIM_ENVIO = 20;
const FUSO = "America/Sao_Paulo";

export type TipoLembrete = "sem_assinatura" | "sem_pagamento" | "vencimento";
export type OrigemLembrete = "automatico" | "manual";

export interface OrdemLembrete {
  status: string;
  expiraEm: Date;
  enviadaEm: Date | null;
  visualizadaEm: Date | null;
  assinadaEm: Date | null;
  /** Due date (YYYY-MM-DD) of the earliest pending Pix/boleto charge, if any. */
  vencimentoCobranca: string | null;
}

export interface LembreteRegistrado {
  tipo: TipoLembrete | null;
  enviadoEm: Date;
}

export type MotivoBloqueio =
  | "finalizada"
  | "nao_enviada"
  | "link_expirado"
  | "limite"
  | "horario_silencioso"
  | "ja_lembrado"
  | "aguardando";

export type AvaliacaoLembrete =
  { enviar: true; tipo: TipoLembrete; prazo: Date } | { enviar: false; motivo: MotivoBloqueio };

const FINALIZADAS = ["paga", "cancelada", "expirada"];
const ETAPA_ASSINATURA = ["enviada", "visualizada"];
const ETAPA_PAGAMENTO = ["assinada", "aguardando_pagamento"];

export const MENSAGENS_BLOQUEIO: Record<MotivoBloqueio, string> = {
  finalizada: "Ordem paga, cancelada ou expirada não recebe lembrete.",
  nao_enviada: "A proposta ainda não foi enviada ao cliente.",
  link_expirado: "O link expirou. Reenvie a proposta para gerar um link novo.",
  limite: `Esta ordem já recebeu ${MAX_LEMBRETES} lembretes (limite).`,
  horario_silencioso: `Lembretes só saem entre ${HORA_INICIO_ENVIO}h e ${HORA_FIM_ENVIO}h (horário de Brasília).`,
  ja_lembrado: "O cliente já recebeu este lembrete.",
  aguardando: "Ainda não é hora de lembrar o cliente.",
};

/** Hour (0-23) in São Paulo. */
export function horaSaoPaulo(agora: Date): number {
  const hora = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO,
    hour: "numeric",
    hourCycle: "h23",
  }).format(agora);
  return Number(hora) % 24;
}

export function emHorarioSilencioso(agora: Date): boolean {
  const hora = horaSaoPaulo(agora);
  return hora >= HORA_FIM_ENVIO || hora < HORA_INICIO_ENVIO;
}

/** End of the due day in São Paulo (UTC-3, no daylight saving since 2019). */
export function fimDoVencimento(data: string): Date {
  return new Date(`${data}T23:59:59-03:00`);
}

/** dd/mm/aaaa in São Paulo, for the template's {{3}}. */
export function formatarPrazo(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO }).format(data);
}

export function avaliarLembrete(
  ordem: OrdemLembrete,
  historico: readonly LembreteRegistrado[],
  agora: Date,
  origem: OrigemLembrete,
): AvaliacaoLembrete {
  const bloqueio = (motivo: MotivoBloqueio): AvaliacaoLembrete => ({ enviar: false, motivo });
  if (FINALIZADAS.includes(ordem.status)) return bloqueio("finalizada");
  const assinatura = ETAPA_ASSINATURA.includes(ordem.status);
  const pagamento = ETAPA_PAGAMENTO.includes(ordem.status);
  if (!assinatura && !pagamento) return bloqueio("nao_enviada");
  if (historico.length >= MAX_LEMBRETES) return bloqueio("limite");
  if (emHorarioSilencioso(agora)) return bloqueio("horario_silencioso");

  const t = agora.getTime();
  if (assinatura && ordem.expiraEm.getTime() <= t) return bloqueio("link_expirado");

  const ultimoPasso = assinatura
    ? (ordem.visualizadaEm ?? ordem.enviadaEm)
    : (ordem.assinadaEm ?? ordem.visualizadaEm ?? ordem.enviadaEm);
  if (!ultimoPasso) return bloqueio("nao_enviada");
  const desdePasso = t - ultimoPasso.getTime();

  // Deadline the client sees: link expiry before signing; after signing, the charge due date.
  const prazoVencimento = assinatura
    ? ordem.expiraEm
    : ordem.vencimentoCobranca
      ? fimDoVencimento(ordem.vencimentoCobranca)
      : null;
  const prazo =
    prazoVencimento ??
    (ordem.expiraEm.getTime() > t
      ? ordem.expiraEm
      : new Date(ordem.expiraEm.getTime() + TOLERANCIA_PAGAMENTO_MS));

  const jaEnviado = (tipo: TipoLembrete) => historico.some((item) => item.tipo === tipo);
  const vencendo =
    prazoVencimento !== null &&
    prazoVencimento.getTime() > t &&
    prazoVencimento.getTime() - t <= JANELA_VENCIMENTO_MS &&
    !jaEnviado("vencimento");
  const tipoEtapa: TipoLembrete = assinatura ? "sem_assinatura" : "sem_pagamento";

  if (origem === "manual")
    return { enviar: true, tipo: vencendo ? "vencimento" : tipoEtapa, prazo };

  const ultimoLembrete = Math.max(0, ...historico.map((item) => item.enviadoEm.getTime()));
  if (ultimoLembrete && t - ultimoLembrete < INTERVALO_ENTRE_LEMBRETES_MS)
    return bloqueio("aguardando");
  if (vencendo && desdePasso >= ESPERA_MINIMA_VENCIMENTO_MS)
    return { enviar: true, tipo: "vencimento", prazo };
  if (jaEnviado(tipoEtapa)) return bloqueio("ja_lembrado");
  if (desdePasso < ESPERA_APOS_ETAPA_MS) return bloqueio("aguardando");
  return { enviar: true, tipo: tipoEtapa, prazo };
}

/** Whether the panel offers "Lembrar agora" (the server still checks every rule). */
export function lembreteDisponivel(
  ordem: { status: string; expiraEm: Date | string },
  quantidadeEnviada: number,
  agora: number,
): boolean {
  if (quantidadeEnviada >= MAX_LEMBRETES) return false;
  if (ETAPA_PAGAMENTO.includes(ordem.status)) return true;
  return ETAPA_ASSINATURA.includes(ordem.status) && new Date(ordem.expiraEm).getTime() > agora;
}
