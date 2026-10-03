import { fakePermitido } from "@/lib/modo-teste";
import type { OtpErro } from "./types";

export async function executarOtpAutomatico(
  codigoTeste: string | undefined,
  validar: (codigo: string) => Promise<{ ok: true } | { erro: OtpErro }>,
  concluir: () => Promise<void>,
): Promise<{ automatico: false } | { automatico: true; erro?: OtpErro }> {
  if (!fakePermitido() || !codigoTeste) return { automatico: false };
  const resultado = await validar(codigoTeste);
  if ("erro" in resultado) return { automatico: true, erro: resultado.erro };
  await concluir();
  return { automatico: true };
}
