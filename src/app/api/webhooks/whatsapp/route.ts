import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { mensagens } from "@/db/schema";
import { MetaWhatsAppProvider } from "@/providers/messaging/meta";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("hub.verify_token");
  const mode = url.searchParams.get("hub.mode");
  const challenge = url.searchParams.get("hub.challenge");
  if (
    mode !== "subscribe" ||
    !token ||
    !process.env.META_VERIFY_TOKEN ||
    token !== process.env.META_VERIFY_TOKEN ||
    !challenge
  )
    return new Response(null, { status: 403 });
  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const provider = new MetaWhatsAppProvider();
  if (!provider.validarWebhook(request.headers, raw))
    return NextResponse.json({ erro: "Webhook não autorizado" }, { status: 401 });
  try {
    const atualizacoes = provider.parseStatusWebhook(raw);
    for (const item of atualizacoes) {
      const [atual] = await db
        .select({ status: mensagens.status })
        .from(mensagens)
        .where(eq(mensagens.providerMessageId, item.providerMessageId))
        .limit(1);
      if (!atual) continue;
      const grau = { enfileirada: 0, enviada: 1, entregue: 2, lida: 3, falhou: 4 };
      if (grau[item.status] < grau[atual.status] && item.status !== "falhou") continue;
      await db
        .update(mensagens)
        .set({ status: item.status, erro: item.erro, atualizadoEm: new Date() })
        .where(eq(mensagens.providerMessageId, item.providerMessageId));
    }
    return NextResponse.json({ resultado: "ok" });
  } catch (error) {
    console.error("Falha no webhook WhatsApp", error);
    return NextResponse.json({ erro: "Falha ao processar webhook" }, { status: 500 });
  }
}
