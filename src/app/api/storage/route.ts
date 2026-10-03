import { readFile } from "node:fs/promises";
import path from "node:path";
import { or, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assinaturas } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(request: Request) {
  await requireAdmin();
  if (process.env.STORAGE_DRIVER !== "local" && process.env.STORAGE_DRIVER !== undefined)
    return new Response(null, { status: 404 });
  const key = new URL(request.url).searchParams.get("path");
  if (!key || !/^ordens\/[0-9a-f-]+\/[0-9a-f-]+\/(contrato-assinado|evidencias)\.pdf$/i.test(key))
    return new Response(null, { status: 404 });
  const [assinatura] = await db
    .select({ id: assinaturas.id })
    .from(assinaturas)
    .where(or(eq(assinaturas.pdfPath, key), eq(assinaturas.evidenciasPdfPath, key)))
    .limit(1);
  if (!assinatura) return new Response(null, { status: 404 });
  const root = path.resolve(process.cwd(), ".storage");
  const file = path.resolve(root, key);
  if (!file.startsWith(root + path.sep)) return new Response(null, { status: 404 });
  try {
    const bytes = await readFile(file);
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${path.basename(file)}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
