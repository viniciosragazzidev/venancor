"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { devTasks } from "@/lib/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, sql, desc } from "drizzle-orm";

export interface DevTask {
  id: number;
  title: string;
  description: string;
  status: "backlog" | "doing" | "done";
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at: string;
}

async function checkAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Não autenticado" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    return { error: "Acesso restrito. Apenas administradores podem gerenciar o roadmap de desenvolvimento." };
  }

  return { session };
}

export async function getDevTasksAction() {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const tasks = await db
      .select({
        id: devTasks.id,
        title: devTasks.title,
        description: sql<string>`COALESCE(${devTasks.description}, '')`,
        status: sql<DevTask["status"]>`COALESCE(${devTasks.status}, 'backlog')`,
        priority: sql<DevTask["priority"]>`COALESCE(${devTasks.priority}, 'medium')`,
        created_at: sql<string>`${devTasks.createdAt}::text`,
        updated_at: sql<string>`${devTasks.updatedAt}::text`,
      })
      .from(devTasks)
      .orderBy(desc(devTasks.createdAt));

    return { data: tasks };
  } catch (error: any) {
    console.error("Error in getDevTasksAction:", error);
    return { error: error.message || "Erro ao buscar tarefas de desenvolvimento." };
  }
}

export interface CreateDevTaskInput {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
}

export async function createDevTaskAction(input: CreateDevTaskInput) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const { title, description, priority } = input;

    if (!title || title.trim().length === 0) {
      return { error: "O título da tarefa é obrigatório." };
    }

    const [result] = await db
      .insert(devTasks)
      .values({
        title: title.trim(),
        description: description || "",
        priority,
        status: "backlog",
      })
      .returning({
        id: devTasks.id,
        title: devTasks.title,
        description: sql<string>`COALESCE(${devTasks.description}, '')`,
        status: sql<DevTask["status"]>`COALESCE(${devTasks.status}, 'backlog')`,
        priority: sql<DevTask["priority"]>`COALESCE(${devTasks.priority}, 'medium')`,
        created_at: sql<string>`${devTasks.createdAt}::text`,
        updated_at: sql<string>`${devTasks.updatedAt}::text`,
      });

    revalidatePath("/crm/dev-roadmap");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in createDevTaskAction:", error);
    return { error: error.message || "Erro ao criar tarefa." };
  }
}

export async function updateDevTaskStatusAction(
  taskId: number,
  status: "backlog" | "doing" | "done"
) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    await db
      .update(devTasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(devTasks.id, taskId));

    revalidatePath("/crm/dev-roadmap");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateDevTaskStatusAction:", error);
    return { error: error.message || "Erro ao atualizar status da tarefa." };
  }
}

export async function updateDevTaskAction(
  taskId: number,
  input: { title: string; description: string; priority: "low" | "medium" | "high" | "critical" }
) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const { title, description, priority } = input;

    if (!title || title.trim().length === 0) {
      return { error: "O título da tarefa é obrigatório." };
    }

    await db
      .update(devTasks)
      .set({
        title: title.trim(),
        description: description || "",
        priority,
        updatedAt: new Date(),
      })
      .where(eq(devTasks.id, taskId));

    revalidatePath("/crm/dev-roadmap");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateDevTaskAction:", error);
    return { error: error.message || "Erro ao atualizar tarefa." };
  }
}

export async function deleteDevTaskAction(taskId: number) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    await db.delete(devTasks).where(eq(devTasks.id, taskId));

    revalidatePath("/crm/dev-roadmap");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteDevTaskAction:", error);
    return { error: error.message || "Erro ao deletar tarefa." };
  }
}
