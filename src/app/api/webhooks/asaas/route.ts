import { NextResponse } from "next/server";
import { validarWebhookAsaas, parseWebhookAsaas } from "@/providers/payment/asaas-webhook";
import { processarEventoPagamento } from "@/modules/pagamentos/webhook";
import { log } from "@/lib/log";

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validarWebhookAsaas(request.headers))
    return NextResponse.json({ erro: "Webhook não autorizado" }, { status: 401 });
  try {
    const evento = parseWebhookAsaas(raw);
    const resultado = await processarEventoPagamento("asaas", evento);
    return NextResponse.json({ resultado });
  } catch (error) {
    log.error("Falha no webhook Asaas", error instanceof Error ? error.name : "erro_desconhecido");
    return NextResponse.json({ erro: "Falha ao processar webhook" }, { status: 500 });
  }
}
