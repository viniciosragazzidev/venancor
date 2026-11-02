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

/** Client side: turns the result back into a value or a thrown Error with the readable message. */
export function valorOuErro<T>(resultado: ResultadoAcao<T>): T {
  if (!resultado.ok) throw new Error(resultado.erro);
  return resultado.valor;
}
