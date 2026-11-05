"use server";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { auditoria, leads } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { ErroNegocio, executarAcaoPainel, type ResultadoAcao } from "@/lib/resultado-acao";
import { criarCliente } from "@/modules/clientes/actions";
import { criarOrdemComo } from "@/modules/ordens/criar";
import { gerarOrdemLeadSchema, type GerarOrdemLeadInput } from "./schemas";

export type Lead = typeof leads.$inferSelect;

export async function listarLeads(): Promise<Lead[]> {
  await requireAdmin();
  return db.select().from(leads).orderBy(desc(leads.criadoEm)).limit(100);
}

export async function gerarOrdemAPartirDoLead(
  input: GerarOrdemLeadInput,
): Promise<ResultadoAcao<{ leadId: string; clienteId: string; ordemId: string; link: string }>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.lead.converter_em_ordem", async () => {
    const dados = gerarOrdemLeadSchema.parse(input);
    return db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${dados.leadId}))`);
      const [lead] = await tx
        .select()
        .from(leads)
        .where(eq(leads.id, dados.leadId))
        .limit(1)
        .for("update");
      if (!lead) throw new ErroNegocio("Lead não encontrado.");
      if (lead.ordemId) throw new ErroNegocio("Lead já convertido em ordem.");
      let clienteId: string;
      if (dados.origemCliente === "existente") clienteId = dados.clienteId;
      else if (lead.clienteId) clienteId = lead.clienteId;
      else {
        const resultadoCliente = await criarCliente({
          ...dados.cliente,
          nome: lead.nome,
          whatsapp: `+55${lead.whatsapp}`,
        });
        if (!resultadoCliente.ok) throw new ErroNegocio(resultadoCliente.erro);
        clienteId = resultadoCliente.valor.id;
        await tx
          .update(leads)
          .set({ clienteId, atualizadoEm: new Date() })
          .where(eq(leads.id, lead.id));
      }
      const { ordem, link } = await criarOrdemComo(
        { ...dados.ordem, clienteId, planoId: dados.planoId },
        admin.id,
        tx,
      );
      const [convertido] = await tx
        .update(leads)
        .set({ clienteId, ordemId: ordem.id, status: "Convertido", atualizadoEm: new Date() })
        .where(and(eq(leads.id, lead.id), isNull(leads.ordemId)))
        .returning({ id: leads.id });
      if (!convertido) throw new ErroNegocio("Lead convertido por outra operação.");
      await tx.insert(auditoria).values({
        entidade: "leads",
        entidadeId: lead.id,
        acao: "converter_em_ordem",
        ator: `admin:${admin.id}`,
        metadados: { ordemId: ordem.id, clienteId },
      });
      return { leadId: lead.id, clienteId, ordemId: ordem.id, link };
    });
  });
}
