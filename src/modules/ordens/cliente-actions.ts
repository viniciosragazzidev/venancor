"use server";

import { headers } from "next/headers";
import { ipDaRequisicao } from "@/lib/request-ip";
import { executarAcao } from "@/lib/resultado-acao";
import { registrarConsentimento } from "./cliente";

export async function aceitarConsentimento(token: string, tipo: "contrato" | "lgpd") {
  return executarAcao("consentimento", async () => {
    const requestHeaders = await headers();
    const ip = ipDaRequisicao(requestHeaders);
    const userAgent = requestHeaders.get("user-agent") ?? "desconhecido";
    await registrarConsentimento(token, tipo, ip, userAgent);
  });
}
