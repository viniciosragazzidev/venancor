import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { auditoria } from "@/db/schema";
import { assinaturas } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { getStorageAdapter } from "@/providers/storage";

export interface EventoOrdem {
  id: string;
  acao: string;
  ator: string;
  metadados: Record<string, unknown>;
  criadoEm: string;
}

export async function listarEventosOrdem(ordemId: string): Promise<EventoOrdem[]> {
  await requireAdmin();
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(ordemId)) throw new Error("ID da ordem inválido");
  const rows = await db
    .select({
      id: auditoria.id,
      acao: auditoria.acao,
      ator: auditoria.ator,
      metadados: auditoria.metadados,
      criadoEm: auditoria.criadoEm,
    })
    .from(auditoria)
    .where(and(eq(auditoria.entidade, "ordens"), eq(auditoria.entidadeId, ordemId)))
    .orderBy(desc(auditoria.criadoEm));
  return rows.map((row) => ({
    ...row,
    metadados: row.metadados as Record<string, unknown>,
    criadoEm: row.criadoEm.toISOString(),
  }));
}

export interface DownloadsOrdem {
  contratoUrl: string;
  evidenciasUrl: string;
  hashSha256: string;
  assinadoEm: string;
}

export async function obterDownloadsOrdem(ordemId: string): Promise<DownloadsOrdem | null> {
  await requireAdmin();
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(ordemId)) throw new Error("ID da ordem inválido");
  const [assinatura] = await db
    .select()
    .from(assinaturas)
    .where(eq(assinaturas.ordemId, ordemId))
    .limit(1);
  if (!assinatura) return null;
  const storage = getStorageAdapter();
  const [contratoUrl, evidenciasUrl] = await Promise.all([
    storage.getSignedUrl(assinatura.pdfPath),
    storage.getSignedUrl(assinatura.evidenciasPdfPath),
  ]);
  return {
    contratoUrl,
    evidenciasUrl,
    hashSha256: assinatura.hashSha256,
    assinadoEm: assinatura.assinadoEm.toISOString(),
  };
}
