"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assinaturas } from "@/db/schema";
import { getStorageAdapter } from "@/providers/storage";
import { resolverToken } from "./cliente";

export async function consultarStatusCliente(token: string) {
  const estado = await resolverToken(token);
  return estado.tipo === "ativa" || estado.tipo === "paga" ? estado.dados.status : estado.tipo;
}

export async function obterContratoAssinadoCliente(token: string): Promise<string> {
  const estado = await resolverToken(token);
  if (
    (estado.tipo !== "ativa" && estado.tipo !== "paga") ||
    !["assinada", "aguardando_pagamento", "paga"].includes(estado.dados.status)
  )
    throw new Error("Contrato assinado indisponível");
  const [assinatura] = await db
    .select({ pdfPath: assinaturas.pdfPath })
    .from(assinaturas)
    .where(eq(assinaturas.ordemId, estado.dados.id))
    .limit(1);
  if (!assinatura) throw new Error("Contrato assinado não encontrado");
  if ((process.env.STORAGE_DRIVER ?? "local") === "local")
    return `/api/cliente/documento?token=${encodeURIComponent(token)}`;
  return getStorageAdapter().getSignedUrl(assinatura.pdfPath);
}
