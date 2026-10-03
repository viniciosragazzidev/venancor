import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { assinaturas, auditoria, ordens, pagamentos, webhookEventos } from "@/db/schema";
import type { EventoPagamento } from "@/providers/payment";

export async function processarEventoPagamento(
  provider: string,
  evento: EventoPagamento,
): Promise<"processado" | "duplicado"> {
  if (!evento.eventId || !evento.providerPaymentId) throw new Error("Evento de pagamento inválido");
  return db.transaction(async (tx) => {
    const [registro] = await tx
      .insert(webhookEventos)
      .values({
        provider,
        eventId: evento.eventId,
        tipo: evento.tipo,
        payload: evento.bruto ?? {},
      })
      .onConflictDoNothing({ target: [webhookEventos.provider, webhookEventos.eventId] })
      .returning({ id: webhookEventos.id });
    if (!registro) return "duplicado";
    if (evento.tipo !== "outro") {
      const [pagamento] = await tx
        .select()
        .from(pagamentos)
        .where(
          and(
            eq(pagamentos.provider, provider),
            eq(pagamentos.providerPaymentId, evento.providerPaymentId),
          ),
        )
        .limit(1)
        .for("update");
      if (!pagamento) throw new Error("Pagamento do webhook não encontrado");
      const [ordem] = await tx
        .select({ status: ordens.status })
        .from(ordens)
        .where(eq(ordens.id, pagamento.ordemId))
        .limit(1)
        .for("update");
      if (!ordem) throw new Error("Ordem do webhook não encontrada");
      if (evento.tipo === "confirmado" || evento.tipo === "recebido") {
        const [assinatura] = await tx
          .select({ id: assinaturas.id })
          .from(assinaturas)
          .where(eq(assinaturas.ordemId, pagamento.ordemId))
          .limit(1);
        if (!assinatura || !["assinada", "aguardando_pagamento", "paga"].includes(ordem.status))
          throw new Error("Pagamento não pode ser confirmado sem assinatura");
        const agora = new Date();
        await tx
          .update(pagamentos)
          .set({ status: evento.tipo, pagoEm: agora, atualizadoEm: agora })
          .where(eq(pagamentos.id, pagamento.id));
        if (ordem.status === "aguardando_pagamento") {
          await tx
            .update(ordens)
            .set({ status: "paga", pagaEm: agora, atualizadoEm: agora })
            .where(eq(ordens.id, pagamento.ordemId));
          await tx.insert(auditoria).values({
            entidade: "ordens",
            entidadeId: pagamento.ordemId,
            acao: "pagamento_confirmado",
            ator: `webhook:${provider}`,
            metadados: { pagamentoId: pagamento.id, eventoId: evento.eventId },
          });
        }
      } else if (pagamento.status !== "confirmado" && pagamento.status !== "recebido") {
        await tx
          .update(pagamentos)
          .set({ status: evento.tipo, atualizadoEm: new Date() })
          .where(eq(pagamentos.id, pagamento.id));
      }
    }
    await tx
      .update(webhookEventos)
      .set({ processadoEm: new Date() })
      .where(eq(webhookEventos.id, registro.id));
    return "processado";
  });
}
