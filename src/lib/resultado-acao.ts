import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";

/**
 * Result of a server action called from the client link. In production Next hides the message of
 * an error thrown by a server action (the client saw "Minified React error #441"), so the reason
 * comes back as data.
 */
export type ResultadoAcao<T> = { ok: true; valor: T } | { ok: false; erro: string };

export type OpcoesResultadoAcao = { validacao?: "generica" | "campo" };

const camposPt: Record<string, string> = {
  nome: "Nome",
  cpf: "CPF",
  nascimento: "Data de nascimento",
  email: "E-mail",
  whatsapp: "WhatsApp",
  nomeMae: "Nome da mãe",
  rg: "RG",
  estadoCivil: "Estado civil",
  cep: "CEP",
  logradouro: "Logradouro",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  uf: "Estado",
  clienteId: "Cliente",
  clienteIds: "Clientes",
  ordemIds: "Ordens",
  planoId: "Plano",
  dependenteIds: "Dependentes",
  parentesco: "Parentesco",
  contratoModeloId: "Modelo de contrato",
  valorCobradoTipo: "Forma de cobrança",
  valorPersonalizado: "Valor personalizado",
  formasPagamento: "Formas de pagamento",
  maxParcelas: "Máximo de parcelas",
  validadeDias: "Validade do link",
  desconto: "Desconto",
  descontoObs: "Observação do desconto",
  vigenciaInicio: "Início da vigência",
  diaVencimento: "Dia do vencimento",
  exigeAssinatura: "Exigir assinatura do contrato",
  incluirDependentes: "Incluir dependentes",
  nomeModelo: "Nome do modelo",
};

/** An error whose message is written for the client and safe to show on the link page. */
export class ErroNegocio extends Error {
  readonly negocio = true;
}

/**
 * Only messages marked as business errors reach the client. Everything else (database, payment
 * provider, configuration, network, bugs) becomes a generic message and stays in the server log.
 */
export function mensagemParaCliente(erro: unknown, opcoes: OpcoesResultadoAcao = {}): string {
  if (erro instanceof ErroNegocio) return erro.message;
  if (erro instanceof ZodError) {
    if (opcoes.validacao === "campo") {
      const primeira = erro.issues[0];
      if (primeira) {
        const chave = primeira.path.find((parte): parte is string => typeof parte === "string");
        const campo = chave ? camposPt[chave] : undefined;
        return campo ? `${campo}: ${primeira.message}` : primeira.message;
      }
    }
    return "Confira os dados informados e tente novamente.";
  }
  return "Não foi possível concluir agora. Tente novamente em instantes.";
}

export async function executarAcao<T>(
  rotulo: string,
  acao: () => Promise<T>,
  opcoes: OpcoesResultadoAcao = {},
): Promise<ResultadoAcao<T>> {
  try {
    return { ok: true, valor: await acao() };
  } catch (erro) {
    // Login redirect and not found (requireAdmin) must keep working.
    unstable_rethrow(erro);
    if (!(erro instanceof ErroNegocio) && !(erro instanceof ZodError)) console.error(`[${rotulo}] falhou`, erro);
    return { ok: false, erro: mensagemParaCliente(erro, opcoes) };
  }
}

/** Server action of the panel: field-named validation messages, never throws (React #441). */
export async function executarAcaoPainel<T>(rotulo: string, acao: () => Promise<T>): Promise<ResultadoAcao<T>> {
  return executarAcao(rotulo, acao, { validacao: "campo" });
}

/** Client side: turns the result back into a value or a thrown Error with the readable message. */
export function valorOuErro<T>(resultado: ResultadoAcao<T>): T {
  if (!resultado.ok) throw new Error(resultado.erro);
  return resultado.valor;
}
