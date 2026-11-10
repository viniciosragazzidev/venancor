"use server";

import { headers } from "next/headers";
import { ipDaRequisicao } from "@/lib/request-ip";
import { mensagemPropostaIndisponivel, resolverToken } from "@/modules/ordens/cliente";
import { enviarOtp, validarOtp } from "./otp";
import { assinaturaExigeOtp } from "./otp-policy";
import { ErroNegocio, executarAcao } from "@/lib/resultado-acao";

export async function solicitarOtp(token: string) {
  return executarAcao("otp", () => solicitar(token));
}

async function solicitar(token: string) {
  if (!assinaturaExigeOtp()) throw new ErroNegocio("Verificação por código desativada");
  const ordem = await resolverToken(token);
  if (ordem.tipo !== "ativa" || ordem.dados.status !== "visualizada")
    throw new ErroNegocio(mensagemPropostaIndisponivel(ordem.tipo, "assinatura"));
  const requestHeaders = await headers();
  return enviarOtp(ordem.dados.id, ipDaRequisicao(requestHeaders));
}

export async function confirmarOtp(token: string, codigo: string) {
  return executarAcao("otp", () => confirmar(token, codigo));
}

async function confirmar(token: string, codigo: string) {
  if (!assinaturaExigeOtp()) throw new ErroNegocio("Verificação por código desativada");
  const ordem = await resolverToken(token);
  if (ordem.tipo !== "ativa" || ordem.dados.status !== "visualizada")
    throw new ErroNegocio(mensagemPropostaIndisponivel(ordem.tipo, "assinatura"));
  return validarOtp(ordem.dados.id, codigo);
}
