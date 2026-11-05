import { describe, expect, it } from "vitest";
import { criarOrdemSchema, criarOrdensLoteSchema, ordemModeloSchema } from "./schemas";

const CLIENTE = "33333333-3333-4333-8333-333333333333";
const PLANO = "11111111-1111-4111-8111-111111111111";

describe("política de assinatura das propostas", () => {
  it("mantém a assinatura obrigatória por padrão em ordem e modelo", () => {
    expect(criarOrdemSchema.parse({ clienteId: CLIENTE, planoId: PLANO }).exigeAssinatura).toBe(
      true,
    );
    expect(ordemModeloSchema.parse({ nome: "Padrão" }).exigeAssinatura).toBe(true);
  });

  it("aceita assinatura opcional no payload da ordem e do modelo", () => {
    expect(
      criarOrdemSchema.parse({ clienteId: CLIENTE, planoId: PLANO, exigeAssinatura: false })
        .exigeAssinatura,
    ).toBe(false);
    expect(
      ordemModeloSchema.parse({ nome: "Direto ao pagamento", exigeAssinatura: false })
        .exigeAssinatura,
    ).toBe(false);
  });

  it("limita o lote a 50 clientes e rejeita IDs duplicados", () => {
    const clienteIds = Array.from(
      { length: 50 },
      (_, index) => `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    );
    expect(criarOrdensLoteSchema.safeParse({ clienteIds, planoId: PLANO }).success).toBe(true);
    expect(
      criarOrdensLoteSchema.safeParse({ clienteIds: [...clienteIds, CLIENTE], planoId: PLANO })
        .success,
    ).toBe(false);
    expect(
      criarOrdensLoteSchema.safeParse({ clienteIds: [CLIENTE, CLIENTE], planoId: PLANO }).success,
    ).toBe(false);
  });
});
