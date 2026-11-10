import { describe, expect, it } from "vitest";
import {
  ErroProvedorPagamento,
  descricaoAsaasSegura,
  erroAsaasEhDadoCadastro,
  mensagemErroAsaasCliente,
  mensagemErroAsaasPainel,
} from "./erros";

describe("mensagens do Asaas", () => {
  it.each([
    ["invalid_cpfCnpj", "CPF do cadastro está inválido"],
    ["invalid_email", "e-mail do cadastro está inválido"],
    ["invalid_phone", "telefone do cadastro está inválido"],
    ["invalid_mobilePhone", "telefone do cadastro está inválido"],
    ["invalid_postalCode", "CEP do cadastro está inválido"],
    ["invalid_value", "Asaas recusou o valor da cobrança"],
    ["invalid_billingType", "Esta forma de pagamento não está disponível"],
    ["invalid_dueDate", "A data de vencimento desta cobrança está inválida"],
  ])("traduz %s para uma orientação clara ao cliente", (code, trecho) => {
    const erro = new ErroProvedorPagamento({ status: 400, code });
    expect(mensagemErroAsaasCliente(erro)).toContain(trecho);
  });

  it("traduz configuração, limite e indisponibilidade do provedor", () => {
    expect(mensagemErroAsaasCliente(new ErroProvedorPagamento({ status: 401, code: "invalid_api_key" })))
      .toContain("configuração da conta");
    expect(mensagemErroAsaasCliente(new ErroProvedorPagamento({ status: 429, code: "rate_limit" })))
      .toContain("muitas solicitações");
    expect(mensagemErroAsaasCliente(new ErroProvedorPagamento({ status: 503, code: "server_error" })))
      .toContain("Asaas) não respondeu");
    expect(mensagemErroAsaasCliente(new ErroProvedorPagamento({ status: null, code: "timeout" })))
      .toContain("Asaas) não respondeu");
  });

  it("explica recusa de cartão sem revelar dados quando a descrição contém identificadores", () => {
    const erro = new ErroProvedorPagamento({
      status: 400,
      code: "invalid_creditCard",
      description: "Insufficient funds for card 4111 1111 1111 1111",
    });
    const mensagem = mensagemErroAsaasCliente(erro);
    expect(mensagem).toContain("recusada pelo cartão");
    expect(mensagem).toContain("Confira os dados ou tente outro cartão.");
    expect(mensagem).not.toContain("4111");
  });

  it("usa descrição desconhecida apenas se passar pelos filtros de dados pessoais", () => {
    expect(descricaoAsaasSegura("Forma de pagamento não aceita"))
      .toBe("Forma de pagamento não aceita");
    expect(descricaoAsaasSegura("CPF 123.456.789-00 inválido")).toBeNull();
    expect(descricaoAsaasSegura("Contato: ana@example.com não encontrado")).toBeNull();
    expect(descricaoAsaasSegura("x".repeat(141))).toBeNull();
    expect(mensagemErroAsaasCliente(new ErroProvedorPagamento({
      status: 400,
      code: "new_asaas_code",
      description: "Forma de pagamento não aceita",
    }))).toContain("Asaas recusou o pagamento: Forma de pagamento não aceita");
    expect(mensagemErroAsaasCliente(new ErroProvedorPagamento({
      status: 400,
      code: "new_asaas_code",
      description: "CPF 123.456.789-00 inválido",
    }))).toBe("O Asaas recusou o pagamento. Fale com seu corretor para verificar os dados ou tentar outra forma.");
  });

  it("deixa o painel identificar o código técnico sem divulgar dados", () => {
    const erro = new ErroProvedorPagamento({ status: 400, code: "invalid_cpfCnpj" });
    expect(mensagemErroAsaasPainel(erro)).toContain("invalid_cpfCnpj");
    expect(erroAsaasEhDadoCadastro(erro)).toBe(true);
    expect(erroAsaasEhDadoCadastro(new Error("invalid_cpfCnpj"))).toBe(false);
  });
});
