export type CategoriaErroPagamento =
  | "dados_cliente"
  | "metodo"
  | "configuracao"
  | "limite"
  | "indisponibilidade"
  | "recusa"
  | "desconhecido";

export class ErroProvedorPagamento extends Error {
  readonly provedor = "asaas" as const;
  readonly status: number | null;
  readonly code: string;
  readonly description: string | null;
  readonly categoria: CategoriaErroPagamento;

  constructor(input: {
    status: number | null;
    code: string;
    description?: string | null;
    categoria?: CategoriaErroPagamento;
  }) {
    super(`Asaas ${input.status === null ? "sem resposta" : `HTTP ${input.status}`} (${input.code})`);
    this.name = "ErroProvedorPagamento";
    this.status = input.status;
    this.code = input.code;
    this.description = input.description?.trim() || null;
    this.categoria = input.categoria ?? categorizarErro(input.status, input.code);
  }
}

const LABELS: Record<string, { campo: string; admin: string; cliente: string }> = {
  invalid_cpfCnpj: {
    campo: "CPF",
    admin: "CPF do cadastro inválido",
    cliente: "O CPF do cadastro está inválido. Fale com seu corretor para corrigir.",
  },
  invalid_email: {
    campo: "E-mail",
    admin: "e-mail do cadastro inválido",
    cliente: "O e-mail do cadastro está inválido. Fale com seu corretor para corrigir.",
  },
  invalid_phone: {
    campo: "telefone",
    admin: "telefone do cadastro inválido",
    cliente: "O telefone do cadastro está inválido. Fale com seu corretor para corrigir.",
  },
  invalid_mobilePhone: {
    campo: "telefone",
    admin: "telefone do cadastro inválido",
    cliente: "O telefone do cadastro está inválido. Fale com seu corretor para corrigir.",
  },
  invalid_postalCode: {
    campo: "CEP",
    admin: "CEP do cadastro inválido",
    cliente: "O CEP do cadastro está inválido. Fale com seu corretor para corrigir.",
  },
  invalid_value: {
    campo: "valor da cobrança",
    admin: "valor da cobrança inválido",
    cliente: "O Asaas recusou o valor da cobrança. Fale com seu corretor para conferir a proposta.",
  },
  invalid_billingType: {
    campo: "forma de pagamento",
    admin: "forma de pagamento inválida ou indisponível",
    cliente: "Esta forma de pagamento não está disponível. Escolha outra opção ou fale com seu corretor.",
  },
  invalid_dueDate: {
    campo: "vencimento",
    admin: "data de vencimento inválida",
    cliente: "A data de vencimento desta cobrança está inválida. Fale com seu corretor para corrigir a proposta.",
  },
  invalid_creditCard: {
    campo: "cartão",
    admin: "transação recusada pelo cartão",
    cliente: "A transação foi recusada pelo cartão. Confira os dados ou tente outro cartão.",
  },
};

const DADOS_CADASTRO = new Set([
  "invalid_cpfCnpj",
  "invalid_email",
  "invalid_phone",
  "invalid_mobilePhone",
  "invalid_postalCode",
]);

function categorizarErro(status: number | null, code: string): CategoriaErroPagamento {
  if (DADOS_CADASTRO.has(code)) return "dados_cliente";
  if (status === 401 || status === 403 || code === "missing_api_key" || code === "invalid_environment")
    return "configuracao";
  if (status === 429) return "limite";
  if (status === null || status >= 500 || ["timeout", "network_error", "invalid_response"].includes(code))
    return "indisponibilidade";
  if (["invalid_value", "invalid_billingType", "invalid_dueDate"].includes(code)) return "metodo";
  if (code === "invalid_creditCard") return "recusa";
  return "desconhecido";
}

/** Drops descriptions that can include personal identifiers, card data, or credentials. */
export function descricaoAsaasSegura(description: string | null | undefined): string | null {
  const value = description?.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!value || value.length > 140) return null;
  if (/\b[\w.+-]+@[\w.-]+\.[A-Z]{2,}\b/i.test(value)) return null;
  if (/\d[\d\s()./-]{7,}\d/.test(value)) return null;
  if (/\b[A-Z0-9_-]{24,}\b/i.test(value)) return null;
  if (/\b(?:access[_ -]?token|api[_ -]?key|authorization|bearer|secret)\b/i.test(value)) return null;
  if (/\b(?:cpf|cnpj|e-?mail|phone|mobilephone|telefone|postalcode|cep|creditcard|cart[aã]o|name|nome|customer|cliente)\b\s*[:=]/i.test(value)) return null;
  return value;
}

function motivoCartao(description: string | null) {
  if (!description) return null;
  if (/insufficient funds|saldo insuficiente/i.test(description)) return "O cartão não tem limite ou saldo suficiente.";
  if (/expir(ed|y)|vencid[oa]/i.test(description)) return "O cartão pode estar vencido.";
  if (/security code|cvv|cvc/i.test(description)) return "Confira o código de segurança do cartão.";
  if (/invalid card number|número do cartão inválido/i.test(description)) return "Confira o número do cartão.";
  if (/not authorized|não autorizad/i.test(description)) return "A administradora não autorizou a cobrança.";
  return descricaoAsaasSegura(description);
}

export function mensagemErroAsaasCliente(error: ErroProvedorPagamento): string {
  if (error.status === 401 || error.status === 403 || error.categoria === "configuracao")
    return "Pagamento indisponível no momento por configuração da conta. Avise seu corretor.";
  if (error.status === 429 || error.categoria === "limite")
    return "O sistema de pagamento está com muitas solicitações. Tente de novo em alguns minutos.";
  if (error.status === 408 || error.status !== null && error.status >= 500 || error.categoria === "indisponibilidade")
    return "O sistema de pagamento (Asaas) não respondeu. Tente de novo em alguns minutos.";

  const mapped = LABELS[error.code];
  if (mapped) {
    if (error.code !== "invalid_creditCard") return mapped.cliente;
    const reason = motivoCartao(error.description);
    return reason
      ? `A transação foi recusada pelo cartão. ${reason} Confira os dados ou tente outro cartão.`
      : mapped.cliente;
  }

  const description = descricaoAsaasSegura(error.description);
  return description
    ? `O Asaas recusou o pagamento: ${description}. Fale com seu corretor se precisar de ajuda.`
    : "O Asaas recusou o pagamento. Fale com seu corretor para verificar os dados ou tentar outra forma.";
}

export function mensagemErroAsaasPainel(error: ErroProvedorPagamento): string {
  const status = error.status === null ? "sem resposta" : `HTTP ${error.status}`;
  const code = error.code || "sem código";
  if (error.status === 401 || error.status === 403 || error.categoria === "configuracao")
    return `Asaas recusou a autenticação ou configuração da conta (${status}, ${code}). Confira a chave e o ambiente.`;
  if (error.status === 429 || error.categoria === "limite")
    return `Asaas atingiu um limite de requisições (${status}, ${code}). Aguarde alguns minutos e tente de novo.`;
  if (error.status === 408 || error.status !== null && error.status >= 500 || error.categoria === "indisponibilidade")
    return `Asaas está indisponível (${status}, ${code}). Tente de novo em alguns minutos.`;

  const mapped = LABELS[error.code];
  const description = descricaoAsaasSegura(error.description);
  if (mapped) return `Asaas recusou: ${mapped.admin} (${code}, ${status}).`;
  return description
    ? `Asaas recusou: ${description} (${code}, ${status}).`
    : `Asaas recusou a operação (${status}, ${code}). Confira os dados da proposta.`;
}

export function erroAsaasEhDadoCadastro(error: unknown): error is ErroProvedorPagamento {
  return error instanceof ErroProvedorPagamento && error.categoria === "dados_cliente";
}
