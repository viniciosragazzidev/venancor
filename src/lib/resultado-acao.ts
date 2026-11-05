import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";

/**
 * Result of a server action called from the client link. In production Next hides the message of
 * an error thrown by a server action (the client saw "Minified React error #441"), so the reason
 * comes back as data.
 */
export type ResultadoAcao<T> = { ok: true; valor: T } | { ok: false; erro: string };

/** An error whose message is written for the client and safe to show on the link page. */
export class ErroNegocio extends Error {
  readonly negocio = true;
}

/**
 * Only messages marked as business errors reach the client. Everything else (database, payment
 * provider, configuration, network, bugs) becomes a generic message and stays in the server log.
 */
export function mensagemParaCliente(erro: unknown): string {
  if (erro instanceof ErroNegocio) return erro.message;
  if (erro instanceof ZodError) return "Confira os dados informados e tente novamente.";
  return "Não foi possível concluir agora. Tente novamente em instantes.";
}

export async function executarAcao<T>(
  rotulo: string,
  acao: () => Promise<T>,
): Promise<ResultadoAcao<T>> {
  try {
    return { ok: true, valor: await acao() };
  } catch (erro) {
    console.error(`[${rotulo}] falhou`, erro);
    return { ok: false, erro: mensagemParaCliente(erro) };
  }
}

/** Field names of the panel forms, for the validation message. */
const ROTULOS_CAMPOS: Record<string, string> = {
  nome: "Nome",
  cpf: "CPF",
  nascimento: "Nascimento",
  email: "E-mail",
  whatsapp: "WhatsApp",
  nomeMae: "Nome da mãe",
  rg: "RG",
  estadoCivil: "Estado civil",
  cep: "CEP",
  logradouro: "Endereço",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  uf: "UF",
  parentesco: "Parentesco",
};

/**
 * Panel version: the operator needs to know which field is wrong, so a validation error names the
 * field. Business errors keep their message; anything else stays generic and goes to the server log.
 */
export function mensagemParaPainel(erro: unknown): string {
  if (erro instanceof ZodError) {
    const issue = erro.issues[0];
    const campo = typeof issue?.path[0] === "string" ? ROTULOS_CAMPOS[issue.path[0]] : undefined;
    const detalhe = issue?.message && !/^(Invalid|Expected|Too)/.test(issue.message) ? issue.message : "valor inválido";
    return campo ? `${campo}: ${detalhe}.` : "Confira os dados informados e tente novamente.";
  }
  return mensagemParaCliente(erro);
}

/** Server action of the panel: never throws, so production does not hide the reason (#441). */
export async function executarAcaoPainel<T>(
  rotulo: string,
  acao: () => Promise<T>,
): Promise<ResultadoAcao<T>> {
  try {
    return { ok: true, valor: await acao() };
  } catch (erro) {
    // Login redirect and not found (requireAdmin) must keep working.
    unstable_rethrow(erro);
    if (!(erro instanceof ErroNegocio) && !(erro instanceof ZodError)) console.error(`[${rotulo}] falhou`, erro);
    return { ok: false, erro: mensagemParaPainel(erro) };
  }
}

/** Client side: turns the result back into a value or a thrown Error with the readable message. */
export function valorOuErro<T>(resultado: ResultadoAcao<T>): T {
  if (!resultado.ok) throw new Error(resultado.erro);
  return resultado.valor;
}
