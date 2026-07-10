"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads, user } from "@/lib/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, sql, desc } from "drizzle-orm";

export interface ClientLead {
  id: number;
  nome: string;
  whatsapp: string;
  perfil: string;
  idades: string;
  status: "Aguardando" | "Em Atendimento" | "Proposta Enviada" | "Venda Concluída";
  corretorId: string | null;
  corretorNome?: string;
}

export async function getClientsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Não autenticado." };
    }

    const role = (session.user as any).role;
    const userId = session.user.id;

    const selectFields = {
      id: leads.id,
      nome: leads.nome,
      whatsapp: leads.whatsapp,
      perfil: sql<string>`COALESCE(${leads.perfil}, '')`,
      idades: sql<string>`COALESCE(${leads.idades}, '')`,
      status: sql<ClientLead["status"]>`COALESCE(${leads.status}, 'Aguardando')`,
      corretorId: leads.corretorId,
    };

    if (role === "ADMIN") {
      const pendingLeads = await db
        .select(selectFields)
        .from(leads)
        .where(eq(leads.status, "Aguardando"))
        .orderBy(desc(leads.id));

      const assignedClients = await db
        .select({
          ...selectFields,
          corretorNome: user.name,
        })
        .from(leads)
        .leftJoin(user, eq(leads.corretorId, user.id))
        .where(sql`${leads.status} != 'Aguardando'`)
        .orderBy(desc(leads.id));

      return { data: { leads: pendingLeads, clients: assignedClients } };
    } else {
      const pendingLeads = await db
        .select(selectFields)
        .from(leads)
        .where(eq(leads.status, "Aguardando"))
        .orderBy(desc(leads.id));

      const assignedClients = await db
        .select(selectFields)
        .from(leads)
        .where(and(
          sql`${leads.status} != 'Aguardando'`,
          eq(leads.corretorId, userId)
        ))
        .orderBy(desc(leads.id));

      return { data: { leads: pendingLeads, clients: assignedClients } };
    }
  } catch (error: any) {
    console.error("Error in getClientsAction:", error);
    return { error: error.message || "Erro ao buscar pipeline de clientes." };
  }
}

export async function startAttendanceAction(clientId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Não autenticado." };
    }

    const userId = session.user.id;

    const [checkLead] = await db
      .select({
        status: leads.status,
        corretorId: leads.corretorId,
      })
      .from(leads)
      .where(eq(leads.id, clientId));

    if (!checkLead) {
      return { error: "Registro não encontrado." };
    }

    if (checkLead.status !== "Aguardando") {
      return { error: "Este lead já foi assumido por outro corretor." };
    }

    await db
      .update(leads)
      .set({ status: "Em Atendimento", corretorId: userId })
      .where(eq(leads.id, clientId));

    revalidatePath("/crm/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Error in startAttendanceAction:", error);
    return { error: error.message || "Erro ao iniciar atendimento." };
  }
}

export async function updateClientStatusAction(
  clientId: number,
  status: "Em Atendimento" | "Proposta Enviada" | "Venda Concluída"
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Não autenticado." };
    }

    const role = (session.user as any).role;
    const userId = session.user.id;

    const [checkLead] = await db
      .select({ corretorId: leads.corretorId })
      .from(leads)
      .where(eq(leads.id, clientId));

    if (!checkLead) {
      return { error: "Cliente não encontrado." };
    }

    if (role !== "ADMIN" && checkLead.corretorId !== userId) {
      return { error: "Não autorizado. Este cliente pertence a outro corretor." };
    }

    await db
      .update(leads)
      .set({ status })
      .where(eq(leads.id, clientId));

    revalidatePath("/crm/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateClientStatusAction:", error);
    return { error: error.message || "Erro ao atualizar status do cliente." };
  }
}

export interface CreateLeadInput {
  nome: string;
  whatsapp: string;
  perfil: string;
  idades: string;
  destino?: "Aguardando" | "Em Atendimento";
  corretorId?: string;
}

export async function createLeadAction(input: CreateLeadInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Não autenticado." };
    }

    const { nome, whatsapp, perfil, idades, destino = "Aguardando", corretorId } = input;

    if (!nome || !whatsapp) {
      return { error: "Nome e WhatsApp são obrigatórios" };
    }

    const cleanedWhatsapp = whatsapp.replace(/\D/g, "");
    const status = destino === "Em Atendimento" ? "Em Atendimento" : "Aguardando";
    const assignedCorretor = destino === "Em Atendimento" ? corretorId || session.user.id : null;

    await db.insert(leads).values({
      nome,
      whatsapp: cleanedWhatsapp,
      perfil,
      idades,
      status,
      corretorId: assignedCorretor,
    });

    revalidatePath("/crm/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Error in createLeadAction:", error);
    return { error: error.message || "Erro ao registrar cliente" };
  }
}
