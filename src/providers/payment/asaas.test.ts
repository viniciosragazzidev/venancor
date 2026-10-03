import { afterEach, describe, expect, it, vi } from "vitest";
import { AsaasProvider } from "./asaas";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.ASAAS_API_KEY;
});

describe("AsaasProvider", () => {
  it("cria cobrança Pix no sandbox e retorna QR", async () => {
    process.env.ASAAS_API_KEY = "chave-de-teste";
    process.env.ASAAS_ENV = "sandbox";
    const urls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urls.push(url);
        const body = url.includes("/customers?")
          ? { data: [{ id: "cus_1" }] }
          : url.endsWith("/payments")
            ? { id: "pay_1", customer: "cus_1", status: "PENDING" }
            : { payload: "pix-copia-cola", encodedImage: "base64" };
        return new Response(JSON.stringify(body), { status: 200 });
      }),
    );
    const charge = await new AsaasProvider().criarCobranca({
      ordemId: "ord_1",
      cliente: { nome: "Ana", cpf: "12345678909" },
      metodo: "pix",
      valorCentavos: 15000,
      vencimento: new Date("2026-10-10T12:00:00Z"),
      descricao: "Teste",
    });
    expect(charge).toMatchObject({ providerPaymentId: "pay_1", pixPayload: "pix-copia-cola" });
    expect(urls.every((url) => url.startsWith("https://api-sandbox.asaas.com/v3/"))).toBe(true);
  });
});
