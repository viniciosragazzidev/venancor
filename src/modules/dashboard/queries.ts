import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { clientes, ordens, pagamentos, planos } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export interface DashboardResumo {
  periodo: { inicio: string; fim: string };
  ordens: { total: number; abertas: number; assinadas: number; pagas: number; expiradas: number };
  receitaConfirmadaCentavos: number;
  pagamentosEstornados: number;
  pagamentosOrfaos: number;
  recentes: {
    id: string;
    cliente: string;
    plano: string;
    status: string;
    valorCobrado: number;
    criadaEm: string;
  }[];
}

export async function carregarDashboard(agora = new Date()): Promise<DashboardResumo> {
  await requireAdmin();
  const inicio = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), 1));
  const fim = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() + 1, 1));
  const [[contagem], [receita], [estornos], [orfaos], recentes] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        abertas: sql<number>`count(*) filter (where ${ordens.status} in ('rascunho','enviada','visualizada','aguardando_pagamento'))::int`,
        assinadas: sql<number>`count(*) filter (where ${ordens.status} in ('assinada','aguardando_pagamento','paga'))::int`,
        pagas: sql<number>`count(*) filter (where ${ordens.status} = 'paga')::int`,
        expiradas: sql<number>`count(*) filter (where ${ordens.status} = 'expirada')::int`,
      })
      .from(ordens),
    db
      .select({ total: sql<number>`coalesce(sum(${pagamentos.valor}), 0)::int` })
      .from(pagamentos)
      .where(
        and(
          gte(pagamentos.pagoEm, inicio),
          lt(pagamentos.pagoEm, fim),
          sql`${pagamentos.status} in ('confirmado','recebido')`,
        ),
      ),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(pagamentos)
      .where(eq(pagamentos.status, "estornado")),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(pagamentos)
      .innerJoin(ordens, eq(pagamentos.ordemId, ordens.id))
      .where(
        and(
          sql`${pagamentos.status} in ('confirmado','recebido')`,
          sql`${ordens.status} in ('cancelada','expirada')`,
        ),
      ),
    db
      .select({
        id: ordens.id,
        cliente: clientes.nome,
        plano: planos.nome,
        status: ordens.status,
        valorCobrado: ordens.valorCobrado,
        criadaEm: ordens.criadoEm,
      })
      .from(ordens)
      .innerJoin(clientes, eq(ordens.clienteId, clientes.id))
      .innerJoin(planos, eq(ordens.planoId, planos.id))
      .orderBy(desc(ordens.criadoEm))
      .limit(10),
  ]);
  return {
    periodo: { inicio: inicio.toISOString(), fim: fim.toISOString() },
    ordens: contagem ?? { total: 0, abertas: 0, assinadas: 0, pagas: 0, expiradas: 0 },
    receitaConfirmadaCentavos: receita?.total ?? 0,
    pagamentosEstornados: estornos?.total ?? 0,
    pagamentosOrfaos: orfaos?.total ?? 0,
    recentes: recentes.map((r) => ({ ...r, criadaEm: r.criadaEm.toISOString() })),
  };
}
