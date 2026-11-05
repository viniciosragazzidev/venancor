import { describe, expect, it } from "vitest";
import { z } from "zod";
import { PagamentoSemAssinaturaError } from "@/modules/pagamentos/guard";
import { obterOtpParaAssinatura } from "@/modules/assinatura/otp-policy";
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

  it("mostra o CPF duplicado com o nome já cadastrado", async () => {
    const resultado = await executarAcao("painel.cliente.criar", async () => {
      throw new ErroNegocio("Já existe um cliente com este CPF (Ana Silva).");
    });
    expect(resultado).toEqual({
      ok: false,
      erro: "Já existe um cliente com este CPF (Ana Silva).",
    });
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

  it("mostra a primeira validação com o nome do campo em português no painel", async () => {
    const schema = z.object({ nome: z.string().min(1), nascimento: z.iso.date() });
    const erro = schema.safeParse({ nome: "", nascimento: "não é data" }).error;
    const resultado = await executarAcao(
      "painel.cliente.criar",
      async () => {
        throw erro;
      },
      { validacao: "campo" },
    );

    expect(resultado).toEqual({ ok: false, erro: expect.stringMatching(/^Nome:/) });
  });

  it("devolve o valor quando dá certo", async () => {
    expect(valorOuErro(await executarAcao("teste", async () => 42))).toBe(42);
  });
});

describe("erros de negócio do fluxo chegam ao cliente", () => {
  it("pagamento sem assinatura", () => {
    expect(mensagemParaCliente(new PagamentoSemAssinaturaError())).toBe(
      "Assine o contrato antes de pagar",
    );
  });

  it("código de confirmação não validado", async () => {
    process.env.ASSINATURA_EXIGE_OTP = "true";
    const r = await executarAcao("otp", () => obterOtpParaAssinatura(async () => null));
    delete process.env.ASSINATURA_EXIGE_OTP;
    expect(r).toEqual({
      ok: false,
      erro: "Código de confirmação não validado. Peça um novo código.",
    });
  });
});
