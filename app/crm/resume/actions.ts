"use server";

import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { headers } from "next/headers";

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
  created_at: string;
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

    const [
      totalLeads,
      aguardando,
      emAtendimento,
      propostasEnviadas,
      vendasConcluidas,
      ultimosLeads,
      leadsPorCorretor,
      leadsPorOperadora,
    ] = await Promise.all([
      query<{ count: string }>("SELECT COUNT(*) as count FROM leads"),
      query<{ count: string }>("SELECT COUNT(*) as count FROM leads WHERE status = 'Aguardando'"),
      query<{ count: string }>("SELECT COUNT(*) as count FROM leads WHERE status = 'Em Atendimento'"),
      query<{ count: string }>("SELECT COUNT(*) as count FROM leads WHERE status = 'Proposta Enviada'"),
      query<{ count: string }>("SELECT COUNT(*) as count FROM leads WHERE status = 'Venda Concluída'"),
      query<LeadItem>(`
        SELECT l.id, l.nome, l.status, l.perfil, l.created_at, u.name as "corretorNome"
        FROM leads l
        LEFT JOIN "user" u ON l."corretorId" = u.id
        ORDER BY l.created_at DESC
        LIMIT 8
      `),
      query<CorretorRow>(`
        SELECT
          u.id,
          u.name as nome,
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE l.status = 'Em Atendimento')::int as "emAtendimento",
          COUNT(*) FILTER (WHERE l.status = 'Proposta Enviada')::int as propostas,
          COUNT(*) FILTER (WHERE l.status = 'Venda Concluída')::int as vendas
        FROM leads l
        JOIN "user" u ON l."corretorId" = u.id
        GROUP BY u.id, u.name
        ORDER BY total DESC
      `),
      query<OperadoraRow>(`
        SELECT
          l.perfil,
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE l.status = 'Em Atendimento')::int as "emAtendimento",
          COUNT(*) FILTER (WHERE l.status = 'Venda Concluída')::int as vendas
        FROM leads l
        GROUP BY l.perfil
        ORDER BY total DESC
      `),
    ]);

    return {
      data: {
        totalLeads: parseInt(totalLeads[0]?.count || "0"),
        aguardando: parseInt(aguardando[0]?.count || "0"),
        emAtendimento: parseInt(emAtendimento[0]?.count || "0"),
        propostasEnviadas: parseInt(propostasEnviadas[0]?.count || "0"),
        vendasConcluidas: parseInt(vendasConcluidas[0]?.count || "0"),
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
