import { describe, expect, it } from "vitest";
import { FakePaymentProvider } from "./fake";

describe("FakePaymentProvider", () => {
  it("cria uma cobrança Pix consultável e cancelável", async () => {
    const cobrancas = new Map<string, Awaited<ReturnType<FakePaymentProvider["criarCobranca"]>>>();
    const store = {
      buscar: async (id: string) => cobrancas.get(id) ?? null,
      cancelar: async (id: string) => {
        const cobranca = cobrancas.get(id);
        if (cobranca) cobrancas.set(id, { ...cobranca, status: "cancelado" as const });
      },
    };
    const provider = new FakePaymentProvider(store);
    const cobranca = await provider.criarCobranca({
      ordemId: "ordem-1",
      cliente: { nome: "Teste", cpf: "52998224725" },
      metodo: "pix",
      valorCentavos: 1000,
      vencimento: new Date(),
      descricao: "Teste",
    });
    expect(cobranca.pixPayload).toContain(cobranca.providerPaymentId);
    expect(cobranca.providerCustomerId).toBe("fake-ordem-1");
    cobrancas.set(cobranca.providerPaymentId, cobranca);
    const outraInvocacao = new FakePaymentProvider(store);
    expect(await outraInvocacao.consultarCobranca(cobranca.providerPaymentId)).toEqual(cobranca);
    await outraInvocacao.cancelarCobranca(cobranca.providerPaymentId);
    expect((await provider.consultarCobranca(cobranca.providerPaymentId)).status).toBe("cancelado");
  });
});
