"use server";

import { headers } from "next/headers";
import { ipDaRequisicao } from "@/lib/request-ip";
import { resolverToken } from "@/modules/ordens/cliente";
import { enviarOtp, validarOtp } from "./otp";
import { assinaturaExigeOtp } from "./otp-policy";

export async function solicitarOtp(token: string) {
  if (!assinaturaExigeOtp()) throw new Error("Verificação por código desativada");
  const ordem = await resolverToken(token);
  if (ordem.tipo !== "ativa" || ordem.dados.status !== "visualizada")
    throw new Error("Ordem indisponível");
  const requestHeaders = await headers();
  return enviarOtp(ordem.dados.id, ipDaRequisicao(requestHeaders));
}

export async function confirmarOtp(token: string, codigo: string) {
  if (!assinaturaExigeOtp()) throw new Error("Verificação por código desativada");
  const ordem = await resolverToken(token);
  if (ordem.tipo !== "ativa" || ordem.dados.status !== "visualizada")
    return { erro: "expirado" } as const;
  return validarOtp(ordem.dados.id, codigo);
}
