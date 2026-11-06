import { describe, expect, it } from "vitest";

import { validarTrocaSenha } from "./trocar-senha-form";

describe("validarTrocaSenha", () => {
  const ok = { atual: "senha-antiga-123", nova: "senha-nova-12345", confirmacao: "senha-nova-12345" };

  it("aceita troca válida", () => {
    expect(validarTrocaSenha(ok)).toBeNull();
  });

  it("recusa sem senha atual, curta, igual à atual ou com confirmação diferente", () => {
    expect(validarTrocaSenha({ ...ok, atual: "" })).toBe("Informe a senha atual.");
    expect(validarTrocaSenha({ ...ok, nova: "curta", confirmacao: "curta" })).toContain("12 caracteres");
    expect(validarTrocaSenha({ ...ok, nova: ok.atual, confirmacao: ok.atual })).toContain("diferente");
    expect(validarTrocaSenha({ ...ok, confirmacao: "outra-coisa-123" })).toContain("confirmação");
  });
});
