import { describe, expect, it } from "vitest";
import { z } from "zod";
import { PagamentoSemAssinaturaError } from "@/modules/pagamentos/guard";
import { obterOtpParaAssinatura } from "@/modules/assinatura/otp-policy";
import { ErroNegocio, executarAcao, mensagemParaCliente, valorOuErro } from "./resultado-acao";
import { ErroProvedorPagamento } from "@/providers/payment/erros";

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

  it("explica a recusa do Asaas sem expor os dados do cadastro", () => {
    const erro = new ErroProvedorPagamento({
      status: 400,
      code: "invalid_cpfCnpj",
      description: "CPF 123.456.789-00 inválido",
    });
    expect(mensagemParaCliente(erro)).toBe(
      "O CPF do cadastro está inválido. Fale com seu corretor para corrigir.",
    );
    expect(mensagemParaCliente(erro)).not.toContain("123.456.789-00");
  });

  it("identifica configuração e indisponibilidade do Asaas", () => {
    expect(mensagemParaCliente(new ErroProvedorPagamento({ status: 401, code: "invalid_api_key" })))
      .toContain("configuração da conta");
    expect(mensagemParaCliente(new ErroProvedorPagamento({ status: 503, code: "http_503" })))
      .toContain("Asaas");
  });

  it("dá uma referência para erros inesperados sem mostrar detalhes internos", () => {
    const mensagem = mensagemParaCliente(new TypeError("Cannot read properties of undefined"), {
      rotulo: "painel.ordem.criar",
      referencia: "A1B2C3",
    });
    expect(mensagem).toBe("Erro inesperado ao criar a ordem (ref. A1B2C3). Tente novamente.");
    expect(mensagem).not.toContain("Cannot read");
  });

  it("esconde erro técnico e de validação", () => {
    const banco = Object.assign(new Error('column "x" does not exist'), { code: "42703" });
    expect(mensagemParaCliente(banco)).not.toContain("column");
    expect(mensagemParaCliente(z.string().safeParse(1).error)).toContain("Informe um valor válido.");
    expect(mensagemParaCliente(z.enum(["pix", "boleto"]).safeParse("cartao").error))
      .toContain("Selecione uma opção válida.");
  });

  it("mostra a primeira validação com o nome do campo em português no painel", async () => {
    const schema = z.object({ nome: z.string().min(1), nascimento: z.iso.date() });
    const erro = schema.safeParse({ nome: "", nascimento: "não é data" }).error;
    const resultado = await executarAcao(
      "painel.cliente.criar",
      async () => {
        throw erro;
      },
      { validacao: "campo", rotulo: "painel.cliente.criar" },
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

describe("resumoErroSeguro (log e painel sem dados pessoais)", () => {
  it("não leva os parâmetros de uma consulta que falhou", async () => {
    const { resumoErroSeguro, mensagemParaPainel } = await import("./resultado-acao");
    const causa = Object.assign(new Error('duplicate key value violates unique constraint "clientes_cpf_unique"'), { code: "23505" });
    const erro = new Error("Failed query: insert into clientes values ($1, $2)\nparams: 19412345678,joao@exemplo.com", { cause: causa });
    const resumo = resumoErroSeguro(erro);
    expect(resumo).toContain("23505");
    expect(resumo).toContain("clientes_cpf_unique");
    expect(resumo).not.toContain("19412345678");
    expect(resumo).not.toContain("joao@exemplo.com");
    const painel = mensagemParaPainel(erro, { rotulo: "painel.cliente.criar", referencia: "ABC123" });
    expect(painel).toContain("clientes_cpf_unique");
    expect(painel).toContain("ABC123");
    expect(painel).not.toContain("19412345678");
  });

  it("mascara e-mail, números longos e tokens soltos", async () => {
    const { resumoErroSeguro } = await import("./resultado-acao");
    const resumo = resumoErroSeguro(new Error("falhou para ana@x.com cpf 194.123.456-78 token abcdefghijklmnopqrstuvwxyz123"));
    expect(resumo).not.toMatch(/ana@x\.com|194\.123|abcdefghijklmnop/);
  });
});
