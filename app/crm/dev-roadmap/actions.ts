"use server";

import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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

    await query(`
      CREATE TABLE IF NOT EXISTS dev_tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'backlog',
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const tasks = await query<DevTask>(`
      SELECT id, title, description, status, priority, created_at, updated_at
      FROM dev_tasks
      ORDER BY created_at DESC
    `);

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

    const result = await query<DevTask>(`
      INSERT INTO dev_tasks (title, description, priority, status)
      VALUES ($1, $2, $3, 'backlog')
      RETURNING id, title, description, status, priority, created_at, updated_at
    `, [title.trim(), description || '', priority]);

    revalidatePath("/crm/dev-roadmap");
    return { success: true, data: result[0] };
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

    await query(`
      UPDATE dev_tasks
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `, [status, taskId]);

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

    await query(`
      UPDATE dev_tasks
      SET title = $1, description = $2, priority = $3, updated_at = NOW()
      WHERE id = $4
    `, [title.trim(), description || '', priority, taskId]);

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

    await query(`
      DELETE FROM dev_tasks WHERE id = $1
    `, [taskId]);

    revalidatePath("/crm/dev-roadmap");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteDevTaskAction:", error);
    return { error: error.message || "Erro ao deletar tarefa." };
  }
}
