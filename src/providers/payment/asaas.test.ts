import { afterEach, describe, expect, it, vi } from "vitest";
import { AsaasProvider } from "./asaas";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  delete process.env.ASAAS_API_KEY;
  delete process.env.ASAAS_ENV;
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

  it("cria cliente e boleto com linha digitável real da resposta", async () => {
    vi.stubEnv("ASAAS_API_KEY", "chave-de-teste");
    vi.stubEnv("ASAAS_ENV", "sandbox");
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes("/customers?")) return Response.json({ data: [] });
      if (url.endsWith("/customers")) return Response.json({ id: "cus_novo" });
      if (url.endsWith("/payments")) {
        expect(JSON.parse(String(init?.body))).toMatchObject({
          customer: "cus_novo",
          billingType: "BOLETO",
          value: 150,
        });
        return Response.json({
          id: "pay_boleto",
          customer: "cus_novo",
          status: "PENDING",
          bankSlipUrl: "https://sandbox.asaas.com/boleto",
        });
      }
      return Response.json({ identificationField: "0019000009" });
    });
    vi.stubGlobal("fetch", fetchMock);
    const cobranca = await new AsaasProvider().criarCobranca({
      ordemId: "ord_1",
      cliente: { nome: "Ana", cpf: "12345678909" },
      metodo: "boleto",
      valorCentavos: 15000,
      vencimento: new Date("2026-10-10T12:00:00Z"),
      descricao: "Teste",
    });
    expect(cobranca).toMatchObject({
      providerCustomerId: "cus_novo",
      boletoLinha: "0019000009",
      boletoUrl: "https://sandbox.asaas.com/boleto",
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("usa a fatura hospedada para cartão e confirma somente no sandbox", async () => {
    vi.stubEnv("ASAAS_API_KEY", "chave-de-teste");
    vi.stubEnv("ASAAS_ENV", "sandbox");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_MODO_TESTE", "true");
    const urls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        urls.push(url);
        if (url.includes("/customers?")) return Response.json({ data: [{ id: "cus_1" }] });
        if (url.endsWith("/payments")) {
          expect(JSON.parse(String(init?.body))).toMatchObject({
            billingType: "CREDIT_CARD",
            installmentCount: 3,
            totalValue: 150,
          });
          return Response.json({
            id: "pay_1",
            customer: "cus_1",
            status: "PENDING",
            invoiceUrl: "https://sandbox.asaas.com/fatura",
          });
        }
        if (url.endsWith("/sandbox/payment/pay_1/confirm"))
          return Response.json({ id: "pay_1", customer: "cus_1", status: "CONFIRMED" });
        return Response.json({ id: "pay_1", customer: "cus_1", status: "CONFIRMED" });
      }),
    );
    const provider = new AsaasProvider();
    const cobranca = await provider.criarCobranca({
      ordemId: "ord_1",
      cliente: { nome: "Ana", cpf: "12345678909" },
      metodo: "cartao",
      valorCentavos: 15000,
      parcelas: 3,
      vencimento: new Date("2026-10-10T12:00:00Z"),
      descricao: "Teste",
    });
    expect(cobranca.checkoutUrl).toBe("https://sandbox.asaas.com/fatura");
    expect((await provider.confirmarPagamentoSandbox("pay_1")).status).toBe("confirmado");
    expect(urls).toContain("https://api-sandbox.asaas.com/v3/sandbox/payment/pay_1/confirm");
    vi.stubEnv("ASAAS_ENV", "production");
    const antes = urls.length;
    await expect(provider.confirmarPagamentoSandbox("pay_1")).rejects.toThrow("sandbox");
    expect(urls).toHaveLength(antes);
    vi.stubEnv("ASAAS_ENV", "sandbox");
    vi.stubEnv("NEXT_PUBLIC_MODO_TESTE", "false");
    await expect(provider.confirmarPagamentoSandbox("pay_1")).rejects.toThrow("modo de teste");
    expect(urls).toHaveLength(antes);
  });
});
