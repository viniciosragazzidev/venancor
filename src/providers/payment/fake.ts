import { randomUUID } from "node:crypto";
import { fakePermitido } from "@/lib/modo-teste";
import type { Cobranca, CriarCobrancaInput, EventoPagamento, PaymentProvider } from "./types";

export interface FakeChargeStore {
  buscar(providerPaymentId: string): Promise<Cobranca | null>;
  cancelar(providerPaymentId: string): Promise<void>;
}

const dbStore: FakeChargeStore = {
  async buscar(providerPaymentId) {
    const [{ eq }, { db }, { pagamentos }] = await Promise.all([
      import("drizzle-orm"),
      import("@/db/client"),
      import("@/db/schema"),
    ]);
    const [pagamento] = await db
      .select()
      .from(pagamentos)
      .where(eq(pagamentos.providerPaymentId, providerPaymentId))
      .limit(1);
    if (!pagamento || pagamento.provider !== "fake") return null;
    return {
      providerPaymentId,
      providerCustomerId: pagamento.providerCustomerId ?? "",
      status: pagamento.status,
      ...(pagamento.pixPayload ? { pixPayload: pagamento.pixPayload } : {}),
      ...(pagamento.pixQrBase64 ? { pixQrBase64: pagamento.pixQrBase64 } : {}),
      ...(pagamento.boletoUrl ? { boletoUrl: pagamento.boletoUrl } : {}),
      ...(pagamento.boletoLinha ? { boletoLinha: pagamento.boletoLinha } : {}),
      ...(pagamento.checkoutUrl ? { checkoutUrl: pagamento.checkoutUrl } : {}),
    };
  },
  async cancelar(providerPaymentId) {
    const [{ eq }, { db }, { pagamentos }] = await Promise.all([
      import("drizzle-orm"),
      import("@/db/client"),
      import("@/db/schema"),
    ]);
    await db
      .update(pagamentos)
      .set({ status: "cancelado", atualizadoEm: new Date() })
      .where(eq(pagamentos.providerPaymentId, providerPaymentId));
  },
};

export class FakePaymentProvider implements PaymentProvider {
  readonly nome = "fake";
  constructor(private readonly store: FakeChargeStore = dbStore) {}

  async criarCobranca(input: CriarCobrancaInput): Promise<Cobranca> {
    if (input.valorCentavos <= 0 || !Number.isInteger(input.valorCentavos))
      throw new Error("Valor inválido");
    const providerPaymentId = randomUUID();
    return {
      providerPaymentId,
      providerCustomerId: `fake-${input.ordemId}`,
      status: "pendente",
      ...(input.metodo === "pix" ? { pixPayload: `PIX-FAKE-${providerPaymentId}` } : {}),
      ...(input.metodo === "boleto" ? { boletoLinha: `BOLETO-FAKE-${providerPaymentId}` } : {}),
    };
  }

  async consultarCobranca(providerPaymentId: string): Promise<Cobranca> {
    const cobranca = await this.store.buscar(providerPaymentId);
    if (!cobranca) throw new Error("Cobrança fake não encontrada");
    return cobranca;
  }

  async cancelarCobranca(providerPaymentId: string): Promise<void> {
    await this.store.cancelar(providerPaymentId);
  }

  validarWebhook(_headers: Headers, rawBody: string): boolean {
    if (!fakePermitido()) return false;
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
