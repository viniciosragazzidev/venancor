"use server";

import { resolverToken } from "@/modules/ordens/cliente";
import { enviarOtp, validarOtp } from "./otp";

export async function solicitarOtp(token: string) {
  const ordem = await resolverToken(token);
  if (ordem.tipo !== "ativa" || ordem.dados.status !== "visualizada")
    throw new Error("Ordem indisponível");
  await enviarOtp(ordem.dados.id);
}

export async function confirmarOtp(token: string, codigo: string) {
  const ordem = await resolverToken(token);
  if (ordem.tipo !== "ativa" || ordem.dados.status !== "visualizada")
    return { erro: "expirado" } as const;
  return validarOtp(ordem.dados.id, codigo);
}
