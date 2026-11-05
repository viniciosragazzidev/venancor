import { describe, expect, it } from "vitest";
import { motivoBloqueioExclusaoOrdem } from "./exclusao";

describe("exclusão de ordens", () => {
  it("bloqueia toda ordem assinada, com pagamento ou em status protegido", () => {
    expect(
      motivoBloqueioExclusaoOrdem({
        status: "visualizada",
        assinaturaExiste: true,
        pagamentoExiste: false,
      }),
    ).toBe("A ordem tem registro de assinatura.");
    expect(
      motivoBloqueioExclusaoOrdem({
        status: "cancelada",
        assinaturaExiste: false,
        pagamentoExiste: true,
      }),
    ).toBe("A ordem tem registro de pagamento.");
    for (const status of ["assinada", "aguardando_pagamento", "paga"] as const) {
      expect(
        motivoBloqueioExclusaoOrdem({ status, assinaturaExiste: false, pagamentoExiste: false }),
      ).toContain("não podem ser excluídas");
    }
  });

  it("permite só status elegíveis sem registros de assinatura ou pagamento", () => {
    for (const status of ["rascunho", "enviada", "visualizada", "expirada", "cancelada"] as const) {
      expect(
        motivoBloqueioExclusaoOrdem({ status, assinaturaExiste: false, pagamentoExiste: false }),
      ).toBeNull();
    }
  });
});
