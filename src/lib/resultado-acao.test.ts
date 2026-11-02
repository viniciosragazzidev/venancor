import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ErroNegocio, executarAcao, mensagemParaCliente, valorOuErro } from "./resultado-acao";

describe("resultado de ação do link do cliente", () => {
  it("mantém a mensagem de erro de negócio", async () => {
    const r = await executarAcao("teste", async () => {
      throw new ErroNegocio("O CPF digitado não confere com o do titular da proposta.");
    });
    expect(r).toEqual({
      ok: false,
      erro: "O CPF digitado não confere com o do titular da proposta.",
    });
    expect(() => valorOuErro(r)).toThrow("não confere");
  });

  it("esconde erro de provedor, configuração e TypeError", () => {
    for (const erro of [
      new Error("Asaas respondeu HTTP 400 (invalid_customer: x)"),
      new Error("ASAAS_API_KEY não configurada"),
      new TypeError("Cannot read properties of undefined"),
      new TypeError("fetch failed"),
    ])
      expect(mensagemParaCliente(erro)).toBe(
        "Não foi possível concluir agora. Tente novamente em instantes.",
      );
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
