import { describe, expect, it } from "vitest";
import { FakePaymentProvider } from "./fake";

describe("FakePaymentProvider", () => {
  it("cria uma cobrança Pix consultável e cancelável", async () => {
    const provider = new FakePaymentProvider();
    const cobranca = await provider.criarCobranca({
      ordemId: "ordem-1",
      cliente: { nome: "Teste", cpf: "52998224725" },
      metodo: "pix",
      valorCentavos: 1000,
      vencimento: new Date(),
      descricao: "Teste",
    });
    expect(cobranca.pixPayload).toContain(cobranca.providerPaymentId);
    expect(await provider.consultarCobranca(cobranca.providerPaymentId)).toEqual(cobranca);
    await provider.cancelarCobranca(cobranca.providerPaymentId);
    expect((await provider.consultarCobranca(cobranca.providerPaymentId)).status).toBe("cancelado");
  });
});
