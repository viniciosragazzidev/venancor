import { randomUUID } from "node:crypto";
import type { Cobranca, CriarCobrancaInput, EventoPagamento, PaymentProvider } from "./types";

export class FakePaymentProvider implements PaymentProvider {
  readonly nome = "fake";
  private readonly cobrancas = new Map<string, Cobranca>();

  async criarCobranca(input: CriarCobrancaInput): Promise<Cobranca> {
    if (input.valorCentavos <= 0 || !Number.isInteger(input.valorCentavos))
      throw new Error("Valor inválido");
    const providerPaymentId = randomUUID();
    const cobranca: Cobranca = {
      providerPaymentId,
      providerCustomerId: `fake-${input.cliente.cpf}`,
      status: "pendente",
      ...(input.metodo === "pix" ? { pixPayload: `PIX-FAKE-${providerPaymentId}` } : {}),
      ...(input.metodo === "boleto" ? { boletoLinha: `BOLETO-FAKE-${providerPaymentId}` } : {}),
    };
    this.cobrancas.set(providerPaymentId, cobranca);
    return cobranca;
  }

  async consultarCobranca(providerPaymentId: string): Promise<Cobranca> {
    const cobranca = this.cobrancas.get(providerPaymentId);
    if (!cobranca) throw new Error("Cobrança fake não encontrada");
    return cobranca;
  }

  async cancelarCobranca(providerPaymentId: string): Promise<void> {
    const cobranca = await this.consultarCobranca(providerPaymentId);
    this.cobrancas.set(providerPaymentId, { ...cobranca, status: "cancelado" });
  }

  validarWebhook(_headers: Headers, rawBody: string): boolean {
    if (process.env.NODE_ENV === "production") return false;
    try {
      return JSON.parse(rawBody).provider === "fake";
    } catch {
      return false;
    }
  }

  parseWebhook(rawBody: string): EventoPagamento {
    const evento = JSON.parse(rawBody) as Record<string, unknown>;
    if (
      evento.provider !== "fake" ||
      typeof evento.eventId !== "string" ||
      typeof evento.providerPaymentId !== "string"
    ) {
      throw new Error("Webhook fake inválido");
    }
    const tipo = ["confirmado", "recebido", "vencido", "estornado"].includes(String(evento.tipo))
      ? (evento.tipo as EventoPagamento["tipo"])
      : "outro";
    return {
      eventId: evento.eventId,
      tipo,
      providerPaymentId: evento.providerPaymentId,
      ordemId: typeof evento.ordemId === "string" ? evento.ordemId : undefined,
      bruto: evento,
    };
  }
}
