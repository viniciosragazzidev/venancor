"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assinaturas } from "@/db/schema";
import { getStorageAdapter, storageDriver } from "@/providers/storage";
import { resolverToken } from "./cliente";
import { sincronizarPendentesAsaas } from "@/modules/pagamentos/sincronizar-asaas";

export async function consultarStatusCliente(token: string) {
  const estado = await resolverToken(token);
  if (estado.tipo === "ativa" && estado.dados.status === "aguardando_pagamento") {
    await sincronizarPendentesAsaas(estado.dados.id);
    const atualizado = await resolverToken(token);
    return atualizado.tipo === "ativa" || atualizado.tipo === "paga"
      ? atualizado.dados.status
      : atualizado.tipo;
  }
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
  if (storageDriver() === "local") return "/api/cliente/documento";
  return getStorageAdapter().getSignedUrl(assinatura.pdfPath);
}
