import { describe, expect, it } from "vitest";
import { parseWebhookAsaas } from "./asaas-webhook";

describe("webhook Asaas", () => {
  it("mapeia confirmação pelo identificador do pagamento", () => {
    expect(
      parseWebhookAsaas(
        JSON.stringify({ id: "evt_1", event: "PAYMENT_CONFIRMED", payment: { id: "pay_1" } }),
      ),
    ).toMatchObject({ eventId: "evt_1", tipo: "confirmado", providerPaymentId: "pay_1" });
  });
  it("rejeita evento sem identificadores", () => {
    expect(() => parseWebhookAsaas('{"event":"PAYMENT_CONFIRMED"}')).toThrow();
  });
});
