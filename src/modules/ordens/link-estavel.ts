/** Tolerance cliente.ts gives a signed order waiting for payment after the link deadline. */
export const TOLERANCIA_PAGAMENTO_MS = 30 * 86_400_000;
const RENOVAR_ANTES_MS = 86_400_000;

export type DecisaoLink = "usar" | "renovar" | "vencido";

/**
 * What "Copiar link"/"Reenviar" may do with the current link, mirroring resolverToken (cliente.ts):
 * - deadline passed before signing: the client already sees "expirada" → "vencido" (only "Gerar novo link" reopens);
 * - signed and waiting for payment: the link keeps working up to 30 days after the deadline → "usar", never extended;
 * - deadline still ahead but within 24h → "renovar" (+7 days, same link); otherwise "usar".
 */
export function decidirLinkAtual(input: { status: string; expiraEm: Date; agora: Date }): DecisaoLink {
  const restante = input.expiraEm.getTime() - input.agora.getTime();
  if (input.status === "aguardando_pagamento" || input.status === "assinada") {
    return restante < -TOLERANCIA_PAGAMENTO_MS ? "vencido" : "usar";
  }
  if (restante <= 0) return "vencido";
  return restante < RENOVAR_ANTES_MS ? "renovar" : "usar";
}
