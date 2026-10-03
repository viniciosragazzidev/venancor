"use server";

import { headers } from "next/headers";
import { registrarConsentimento } from "./cliente";

export async function aceitarConsentimento(
  token: string,
  tipo: "contrato" | "lgpd",
  versaoTexto: string,
) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
  const userAgent = requestHeaders.get("user-agent") ?? "desconhecido";
  await registrarConsentimento(token, tipo, ip, userAgent, versaoTexto);
}
