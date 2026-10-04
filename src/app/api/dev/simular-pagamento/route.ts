import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { pagamentos } from "@/db/schema";
import { processarEventoPagamento } from "@/modules/pagamentos/webhook";
import { resolverToken } from "@/modules/ordens/cliente";
import { fakePermitido } from "@/lib/modo-teste";
import { AsaasProvider } from "@/providers/payment/asaas";
import { sincronizarPagamentoAsaas } from "@/modules/pagamentos/sincronizar-asaas";

export async function POST(request: Request) {
  if (!fakePermitido()) return new Response(null, { status: 404 });
  const provider = process.env.PAYMENT_PROVIDER ?? "fake";
  if (provider !== "fake" && !(provider === "asaas" && process.env.ASAAS_ENV !== "production"))
    return new Response(null, { status: 404 });
  const input: unknown = await request.json().catch(() => null);
  if (
    !input ||
    typeof input !== "object" ||
    typeof (input as Record<string, unknown>).pagamentoId !== "string" ||
    typeof (input as Record<string, unknown>).token !== "string"
  )
    return NextResponse.json({ erro: "pagamentoId e token obrigatórios" }, { status: 400 });
  const { pagamentoId, token } = input as { pagamentoId: string; token: string };
  const ordem = await resolverToken(token);
  if (ordem.tipo !== "ativa" || !["assinada", "aguardando_pagamento"].includes(ordem.dados.status))
    return NextResponse.json({ erro: "Ordem indisponível" }, { status: 404 });
  const [pagamento] = await db
    .select()
    .from(pagamentos)
    .where(eq(pagamentos.id, pagamentoId))
    .limit(1);
  if (
    !pagamento ||
    pagamento.ordemId !== ordem.dados.id ||
    pagamento.status !== "pendente" ||
    pagamento.provider !== provider ||
    !pagamento.providerPaymentId
  )
    return NextResponse.json({ erro: "Pagamento não encontrado" }, { status: 404 });
  if (provider === "asaas") {
    await new AsaasProvider().confirmarPagamentoSandbox(pagamento.providerPaymentId);
    await sincronizarPagamentoAsaas(pagamento.providerPaymentId);
    const [atual] = await db
      .select({ status: pagamentos.status })
      .from(pagamentos)
      .where(eq(pagamentos.id, pagamentoId))
      .limit(1);
    return NextResponse.json({
      status:
        atual?.status === "confirmado" || atual?.status === "recebido"
          ? "paga"
          : "aguardando_pagamento",
      pagamentoId,
    });
  }
  const evento = {
    eventId: randomUUID(),
    tipo: "confirmado" as const,
    providerPaymentId: pagamento.providerPaymentId,
    bruto: { provider: "fake", pagamentoId, tipo: "confirmado" },
  };
  await processarEventoPagamento("fake", evento);
  return NextResponse.json({ status: "paga", pagamentoId });
}
