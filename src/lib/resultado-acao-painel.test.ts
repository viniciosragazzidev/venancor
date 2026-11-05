import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ErroNegocio, executarAcaoPainel, mensagemParaCliente } from "./resultado-acao";

describe("panel actions never throw (production hides the message, React #441)", () => {
  it("returns the business message", async () => {
    const resultado = await executarAcaoPainel("teste", async () => {
      throw new ErroNegocio("Já existe um cliente com este CPF. Procure por ele na lista.");
    });
    expect(resultado).toEqual({ ok: false, erro: "Já existe um cliente com este CPF. Procure por ele na lista." });
  });

  it("names the field of a validation error", () => {
    const erro = z.object({ email: z.email("E-mail inválido") }).safeParse({ email: "x" }).error;
    expect(mensagemParaCliente(erro, { validacao: "campo" })).toBe("E-mail: E-mail inválido");
  });

  it("keeps unknown errors generic", async () => {
    const resultado = await executarAcaoPainel("teste", async () => {
      throw new Error("duplicate key value violates unique constraint");
    });
    expect(resultado).toEqual({ ok: false, erro: "Não foi possível concluir agora. Tente novamente em instantes." });
  });

  it("returns the value when it works", async () => {
    expect(await executarAcaoPainel("teste", async () => 7)).toEqual({ ok: true, valor: 7 });
  });
});
