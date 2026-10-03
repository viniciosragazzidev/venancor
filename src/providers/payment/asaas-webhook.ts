import { timingSafeEqual } from "node:crypto";
import type { EventoPagamento } from "./types";

export function validarWebhookAsaas(headers: Headers): boolean {
  const esperado = process.env.ASAAS_WEBHOOK_TOKEN;
  const recebido = headers.get("asaas-access-token");
  if (!esperado || !recebido) return false;
  const a = Buffer.from(esperado);
  const b = Buffer.from(recebido);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function parseWebhookAsaas(raw: string): EventoPagamento {
  const payload: unknown = JSON.parse(raw);
  if (!payload || typeof payload !== "object") throw new Error("Payload inválido");
  const p = payload as Record<string, unknown>;
  const payment = p.payment;
  if (
    typeof p.id !== "string" ||
    typeof p.event !== "string" ||
    !payment ||
    typeof payment !== "object" ||
    typeof (payment as Record<string, unknown>).id !== "string"
  )
    throw new Error("Evento Asaas inválido");
  const tipos: Record<string, EventoPagamento["tipo"]> = {
    PAYMENT_CONFIRMED: "confirmado",
    PAYMENT_RECEIVED: "recebido",
    PAYMENT_OVERDUE: "vencido",
    PAYMENT_REFUNDED: "estornado",
  };
  return {
    eventId: p.id,
    tipo: tipos[p.event] ?? "outro",
    providerPaymentId: (payment as Record<string, string>).id,
    bruto: p,
  };
}
