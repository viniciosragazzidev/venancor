import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/db/client";
import { leads } from "@/db/schema";
import { normalizarLead } from "@/modules/leads/normalize";
import { log } from "@/lib/log";

const autorizado = (recebido: string | null) => {
  const esperado = process.env.WEBHOOK_SECRET_TOKEN;
  if (!esperado || !recebido) return false;
  const a = Buffer.from(esperado);
  const b = Buffer.from(recebido);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function POST(request: Request) {
  const url = new URL(request.url);
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!autorizado(url.searchParams.get("token")) && !autorizado(bearer))
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const lead = normalizarLead(payload);
    await db.insert(leads).values(lead);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    log.error("Falha no webhook leads", error instanceof Error ? error.name : "erro_desconhecido");
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
}
