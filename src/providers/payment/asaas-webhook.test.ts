import { describe, expect, it } from "vitest";
import { parseWebhookAsaas, validarWebhookAsaas } from "./asaas-webhook";

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
  it("exige token do webhook", () => {
    const anterior = process.env.ASAAS_WEBHOOK_TOKEN;
    process.env.ASAAS_WEBHOOK_TOKEN = "segredo-de-teste";
    try {
      expect(validarWebhookAsaas(new Headers({ "asaas-access-token": "segredo-de-teste" }))).toBe(
        true,
      );
      expect(validarWebhookAsaas(new Headers({ "asaas-access-token": "segredo-alterado" }))).toBe(
        false,
      );
      expect(validarWebhookAsaas(new Headers())).toBe(false);
    } finally {
      if (anterior === undefined) delete process.env.ASAAS_WEBHOOK_TOKEN;
      else process.env.ASAAS_WEBHOOK_TOKEN = anterior;
    }
  });
});
