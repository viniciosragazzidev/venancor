import { ZodError } from "zod";

/**
 * Result of a server action called from the client link. In production Next hides the message of
 * an error thrown by a server action (the client saw "Minified React error #441"), so the reason
 * comes back as data.
 */
export type ResultadoAcao<T> = { ok: true; valor: T } | { ok: false; erro: string };

/** Business errors (plain Error) keep their message; database, network and validation do not. */
export function mensagemParaCliente(erro: unknown): string {
  if (erro instanceof ZodError) return "Confira os dados informados e tente novamente.";
  if (erro instanceof Error && !("code" in erro) && erro.message) return erro.message;
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
