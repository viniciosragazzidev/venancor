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
      if (!pagamento) {
        await tx
          .insert(auditoria)
          .values({
            entidade: "pagamentos",
            entidadeId: evento.providerPaymentId,
            acao: "pagamento_orfao",
            ator: `webhook:${provider}`,
            metadados: { eventoId: evento.eventId },
          });
        await tx
          .update(webhookEventos)
          .set({ processadoEm: new Date(), erro: "Pagamento não encontrado" })
          .where(eq(webhookEventos.id, registro.id));
        return "processado";
      }
      const [ordem] = await tx
        .select({ status: ordens.status })
        .from(ordens)
        .where(eq(ordens.id, pagamento.ordemId))
        .limit(1)
        .for("update");
      if (!ordem) {
        await tx
          .update(webhookEventos)
          .set({ processadoEm: new Date(), erro: "Ordem não encontrada" })
          .where(eq(webhookEventos.id, registro.id));
        return "processado";
      }
      if (evento.tipo === "confirmado" || evento.tipo === "recebido") {
        const [assinatura] = await tx
          .select({ id: assinaturas.id })
          .from(assinaturas)
          .where(eq(assinaturas.ordemId, pagamento.ordemId))
          .limit(1);
        const agora = new Date();
        await tx
          .update(pagamentos)
          .set({ status: evento.tipo, pagoEm: agora, atualizadoEm: agora })
          .where(eq(pagamentos.id, pagamento.id));
        if (!assinatura || !["assinada", "aguardando_pagamento", "paga"].includes(ordem.status)) {
          const terminal = ordem.status === "cancelada" || ordem.status === "expirada";
          await tx
            .insert(auditoria)
            .values({
              entidade: "ordens",
              entidadeId: pagamento.ordemId,
              acao: terminal ? "pagamento_orfao" : "webhook_ignorado",
              ator: `webhook:${provider}`,
              metadados: {
                pagamentoId: pagamento.id,
                eventoId: evento.eventId,
                motivo: !assinatura ? "sem_assinatura" : `status_${ordem.status}`,
                requerAtencao: true,
              },
            });
        } else if (ordem.status === "aguardando_pagamento") {
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
      } else if (evento.tipo === "estornado") {
        await tx
          .update(pagamentos)
          .set({ status: "estornado", atualizadoEm: new Date() })
          .where(eq(pagamentos.id, pagamento.id));
        await tx
          .insert(auditoria)
          .values({
            entidade: "ordens",
            entidadeId: pagamento.ordemId,
            acao: "pagamento_estornado",
            ator: `webhook:${provider}`,
            metadados: {
              pagamentoId: pagamento.id,
              eventoId: evento.eventId,
              requerAtencao: ordem.status === "paga",
            },
          });
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
