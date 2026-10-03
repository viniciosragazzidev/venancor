import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assinaturas } from "@/db/schema";
import { resolverToken } from "@/modules/ordens/cliente";
import { storageDriver } from "@/providers/storage";

export async function POST(request: Request) {
  if (storageDriver() !== "local") return new Response(null, { status: 404 });
  const body: unknown = await request.json().catch(() => null);
  const token =
    body && typeof body === "object" && "token" in body && typeof body.token === "string"
      ? body.token
      : "";
  const estado = await resolverToken(token);
  if (
    (estado.tipo !== "ativa" && estado.tipo !== "paga") ||
    !["assinada", "aguardando_pagamento", "paga"].includes(estado.dados.status)
  )
    return new Response(null, { status: 404 });
  const [assinatura] = await db
    .select({ pdfPath: assinaturas.pdfPath })
    .from(assinaturas)
    .where(eq(assinaturas.ordemId, estado.dados.id))
    .limit(1);
  if (
    !assinatura ||
    !/^ordens\/[0-9a-f-]+\/[0-9a-f-]+\/contrato-assinado\.pdf$/i.test(assinatura.pdfPath)
  )
    return new Response(null, { status: 404 });
  const root = path.resolve(process.cwd(), ".storage");
  const file = path.resolve(root, assinatura.pdfPath);
  if (!file.startsWith(root + path.sep)) return new Response(null, { status: 404 });
  try {
    const bytes = await readFile(file);
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=contrato-assinado.pdf",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
