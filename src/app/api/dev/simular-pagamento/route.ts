import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { pagamentos } from "@/db/schema";
import { processarEventoPagamento } from "@/modules/pagamentos/webhook";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  if ((process.env.PAYMENT_PROVIDER ?? "fake") !== "fake")
    return NextResponse.json({ erro: "Simulação exige provedor fake" }, { status: 400 });
  const input: unknown = await request.json().catch(() => null);
  if (
    !input ||
    typeof input !== "object" ||
    typeof (input as Record<string, unknown>).pagamentoId !== "string"
  )
    return NextResponse.json({ erro: "pagamentoId obrigatório" }, { status: 400 });
  const pagamentoId = (input as { pagamentoId: string }).pagamentoId;
  const [pagamento] = await db
    .select()
    .from(pagamentos)
    .where(eq(pagamentos.id, pagamentoId))
    .limit(1);
  if (!pagamento || pagamento.provider !== "fake" || !pagamento.providerPaymentId)
    return NextResponse.json({ erro: "Pagamento fake não encontrado" }, { status: 404 });
  const evento = {
    eventId: randomUUID(),
    tipo: "confirmado" as const,
    providerPaymentId: pagamento.providerPaymentId,
    bruto: { provider: "fake", pagamentoId, tipo: "confirmado" },
  };
  await processarEventoPagamento("fake", evento);
  return NextResponse.json({ status: "paga", pagamentoId });
}
