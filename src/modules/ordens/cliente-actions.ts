"use server";

import { headers } from "next/headers";
import { ipDaRequisicao } from "@/lib/request-ip";
import { registrarConsentimento } from "./cliente";

export async function aceitarConsentimento(token: string, tipo: "contrato" | "lgpd") {
  const requestHeaders = await headers();
  const ip = ipDaRequisicao(requestHeaders);
  const userAgent = requestHeaders.get("user-agent") ?? "desconhecido";
  await registrarConsentimento(token, tipo, ip, userAgent);
}
