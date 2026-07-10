"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads, user } from "@/lib/schema";
import { headers } from "next/headers";
import { count, sql, eq, and } from "drizzle-orm";

export interface DashboardData {
  totalLeads: number;
  aguardando: number;
  emAtendimento: number;
  propostasEnviadas: number;
  vendasConcluidas: number;
  ultimosLeads: LeadItem[];
  leadsPorCorretor: CorretorRow[];
  leadsPorOperadora: OperadoraRow[];
}

export interface LeadItem {
  id: number;
  nome: string;
  status: string;
  perfil: string;
  corretorNome: string | null;
}

export interface CorretorRow {
  id: string;
  nome: string;
  total: number;
  emAtendimento: number;
  propostas: number;
  vendas: number;
}

export interface OperadoraRow {
  perfil: string;
  total: number;
  emAtendimento: number;
  vendas: number;
}

export async function getDashboardAction(): Promise<{ data?: DashboardData; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Não autenticado." };
    }

    const [totalLeads, aguardando, emAtendimento, propostasEnviadas, vendasConcluidas] =
      await Promise.all([
        db.select({ value: count() }).from(leads),
        db.select({ value: count() }).from(leads).where(eq(leads.status, "Aguardando")),
        db.select({ value: count() }).from(leads).where(eq(leads.status, "Em Atendimento")),
        db.select({ value: count() }).from(leads).where(eq(leads.status, "Proposta Enviada")),
        db.select({ value: count() }).from(leads).where(eq(leads.status, "Venda Concluída")),
      ]);

    const ultimosLeads = await db
      .select({
        id: leads.id,
        nome: leads.nome,
        status: sql<string>`COALESCE(${leads.status}, '')`,
        perfil: sql<string>`COALESCE(${leads.perfil}, '')`,
        corretorNome: user.name,
      })
      .from(leads)
      .leftJoin(user, eq(leads.corretorId, user.id))
      .orderBy(sql`${leads.id} DESC`)
      .limit(8);

    const leadsPorCorretor = await db
      .select({
        id: user.id,
        nome: user.name,
        total: count(),
        emAtendimento: sql<number>`COUNT(*) FILTER (WHERE ${leads.status} = 'Em Atendimento')`,
        propostas: sql<number>`COUNT(*) FILTER (WHERE ${leads.status} = 'Proposta Enviada')`,
        vendas: sql<number>`COUNT(*) FILTER (WHERE ${leads.status} = 'Venda Concluída')`,
      })
      .from(leads)
      .innerJoin(user, eq(leads.corretorId, user.id))
      .groupBy(user.id, user.name)
      .orderBy(sql`count DESC`);

    const leadsPorOperadora = await db
      .select({
        perfil: sql<string>`COALESCE(${leads.perfil}, 'Sem operadora')`,
        total: count(),
        emAtendimento: sql<number>`COUNT(*) FILTER (WHERE ${leads.status} = 'Em Atendimento')`,
        vendas: sql<number>`COUNT(*) FILTER (WHERE ${leads.status} = 'Venda Concluída')`,
      })
      .from(leads)
      .groupBy(leads.perfil)
      .orderBy(sql`count DESC`);

    return {
      data: {
        totalLeads: Number(totalLeads[0]?.value ?? 0),
        aguardando: Number(aguardando[0]?.value ?? 0),
        emAtendimento: Number(emAtendimento[0]?.value ?? 0),
        propostasEnviadas: Number(propostasEnviadas[0]?.value ?? 0),
        vendasConcluidas: Number(vendasConcluidas[0]?.value ?? 0),
        ultimosLeads,
        leadsPorCorretor,
        leadsPorOperadora,
      },
    };
  } catch (error: any) {
    console.error("Error in getDashboardAction:", error);
    return { error: error.message || "Erro ao carregar dashboard." };
  }
}
