import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ErroNegocio, executarAcaoPainel, mensagemParaCliente } from "./resultado-acao";
import { ErroProvedorPagamento } from "@/providers/payment/erros";

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

  it("returns an actionable Asaas error for admins", async () => {
    const resultado = await executarAcaoPainel("painel.cliente.criar", async () => {
      throw new ErroProvedorPagamento({ status: 400, code: "invalid_cpfCnpj" });
    });
    expect(resultado).toEqual({
      ok: false,
      erro: "Asaas recusou: CPF do cadastro inválido (invalid_cpfCnpj, HTTP 400).",
    });
  });

  it("returns a short reference for unexpected errors", async () => {
    const resultado = await executarAcaoPainel("teste", async () => {
      throw new Error("duplicate key value violates unique constraint");
    });
    expect(resultado).toMatchObject({ ok: false, erro: expect.stringMatching(/^Erro inesperado ao teste \(ref\. [A-F0-9]{6}\)\.$/) });
  });

  it("returns the value when it works", async () => {
    expect(await executarAcaoPainel("teste", async () => 7)).toEqual({ ok: true, valor: 7 });
  });
});
