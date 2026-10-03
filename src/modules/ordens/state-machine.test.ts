import { describe, expect, it } from "vitest";
import { podeTransicionar, TRANSICOES, type OrdemStatus } from "./state-machine";

const status: OrdemStatus[] = [
  "rascunho",
  "enviada",
  "visualizada",
  "assinada",
  "aguardando_pagamento",
  "paga",
  "expirada",
  "cancelada",
];

describe("máquina de estados da ordem", () => {
  it("permite só as transições declaradas", () => {
    for (const de of status)
      for (const para of status) {
        expect(podeTransicionar(de, para)).toBe(TRANSICOES[de].includes(para));
      }
  });

  it("não permite pagar antes da assinatura nem sair de estados terminais", () => {
    for (const de of ["rascunho", "enviada", "visualizada"] as const) {
      expect(podeTransicionar(de, "aguardando_pagamento")).toBe(false);
      expect(podeTransicionar(de, "paga")).toBe(false);
    }
    for (const de of ["paga", "expirada", "cancelada"] as const)
      expect(status.some((para) => podeTransicionar(de, para))).toBe(false);
  });
});
