import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { log } from "@/lib/log";
import {
  lembretesAutomaticosAtivos,
  processarLembretesPendentes,
} from "@/modules/lembretes/processar";

export const maxDuration = 60;

const autorizado = (recebido: string | null) => {
  const esperado = process.env.CRON_SECRET;
  if (!esperado || !recebido) return false;
  const a = Buffer.from(esperado);
  const b = Buffer.from(recebido);
  return a.length === b.length && timingSafeEqual(a, b);
};

/** Vercel Cron calls this with "Authorization: Bearer <CRON_SECRET>". */
export async function GET(request: Request) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!autorizado(bearer))
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!lembretesAutomaticosAtivos()) return NextResponse.json({ success: true, ativo: false });
  try {
    const resumo = await processarLembretesPendentes();
    return NextResponse.json({ success: true, ativo: true, ...resumo });
  } catch (error) {
    log.error(
      "Falha no cron de lembretes",
      error instanceof Error ? error.name : "erro_desconhecido",
    );
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
