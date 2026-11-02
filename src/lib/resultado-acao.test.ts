import { describe, expect, it } from "vitest";
import { z } from "zod";
import { executarAcao, mensagemParaCliente, valorOuErro } from "./resultado-acao";

describe("resultado de ação do link do cliente", () => {
  it("mantém a mensagem de erro de negócio", async () => {
    const r = await executarAcao("teste", async () => {
      throw new Error("O CPF digitado não confere com o do titular da proposta.");
    });
    expect(r).toEqual({
      ok: false,
      erro: "O CPF digitado não confere com o do titular da proposta.",
    });
    expect(() => valorOuErro(r)).toThrow("não confere");
  });

  it("esconde erro técnico e de validação", () => {
    const banco = Object.assign(new Error('column "x" does not exist'), { code: "42703" });
    expect(mensagemParaCliente(banco)).not.toContain("column");
    expect(mensagemParaCliente(z.string().safeParse(1).error)).toContain("Confira");
  });

  it("devolve o valor quando dá certo", async () => {
    expect(valorOuErro(await executarAcao("teste", async () => 42))).toBe(42);
  });
});
