"use server";

import { desc, eq, isNull, sql, and } from "drizzle-orm";
import { db } from "@/db/client";
import { auditoria, leads } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { criarCliente } from "@/modules/clientes/actions";
import { criarOrdem } from "@/modules/ordens/actions";
import { gerarOrdemLeadSchema, type GerarOrdemLeadInput } from "./schemas";

export type Lead = typeof leads.$inferSelect;

export async function listarLeads(): Promise<Lead[]> {
  await requireAdmin();
  return db.select().from(leads).orderBy(desc(leads.criadoEm)).limit(100);
}

export async function gerarOrdemAPartirDoLead(input: GerarOrdemLeadInput) {
  const admin = await requireAdmin();
  const dados = gerarOrdemLeadSchema.parse(input);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${dados.leadId}))`);
    const [lead] = await tx
      .select()
      .from(leads)
      .where(eq(leads.id, dados.leadId))
      .limit(1)
      .for("update");
    if (!lead) throw new Error("Lead não encontrado");
    if (lead.ordemId) throw new Error("Lead já convertido em ordem");
    let clienteId: string;
    if (dados.origemCliente === "existente") clienteId = dados.clienteId;
    else if (lead.clienteId) clienteId = lead.clienteId;
    else {
      const cliente = await criarCliente({
        ...dados.cliente,
        nome: lead.nome,
        whatsapp: `+55${lead.whatsapp}`,
      });
      clienteId = cliente.id;
      await tx
        .update(leads)
        .set({ clienteId, atualizadoEm: new Date() })
        .where(eq(leads.id, lead.id));
    }
    const { ordem, link } = await criarOrdem({ ...dados.ordem, clienteId, planoId: dados.planoId });
    const [convertido] = await tx
      .update(leads)
      .set({ clienteId, ordemId: ordem.id, status: "Convertido", atualizadoEm: new Date() })
      .where(and(eq(leads.id, lead.id), isNull(leads.ordemId)))
      .returning({ id: leads.id });
    if (!convertido) throw new Error("Lead convertido por outra operação");
    await tx
      .insert(auditoria)
      .values({
        entidade: "leads",
        entidadeId: lead.id,
        acao: "converter_em_ordem",
        ator: `admin:${admin.id}`,
        metadados: { ordemId: ordem.id, clienteId },
      });
    return { leadId: lead.id, clienteId, ordemId: ordem.id, link };
  });
}
