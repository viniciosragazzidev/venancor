"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, asc, sql } from "drizzle-orm";

export interface Corretor {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CORRETOR";
  status: "ONLINE" | "PAUSADO" | "INATIVO";
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
    return { error: "Acesso não autorizado. Apenas administradores podem gerenciar a equipe." };
  }

  return { session };
}

export async function getCorretoresAction() {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const corretores = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: sql<Corretor["role"]>`COALESCE(${user.role}, 'CORRETOR')`,
        status: sql<Corretor["status"]>`COALESCE(${user.status}, 'ONLINE')`,
      })
      .from(user)
      .orderBy(asc(user.name));

    return { data: corretores };
  } catch (error: any) {
    console.error("Error in getCorretoresAction:", error);
    return { error: error.message || "Erro ao buscar equipe de corretores" };
  }
}

export interface CreateCorretorInput {
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "CORRETOR";
}

export async function createCorretorAction(input: CreateCorretorInput) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const { name, email, passwordHash: password } = input;

    if (!name || !email || !password) {
      return { error: "Nome, e-mail e senha são obrigatórios." };
    }

    if (password.length < 6) {
      return { error: "A senha inicial deve ter pelo menos 6 caracteres." };
    }

    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!signUpResult || !signUpResult.user) {
      return { error: "Falha ao cadastrar credenciais de login." };
    }

    const newUserId = signUpResult.user.id;

    await db
      .update(user)
      .set({ role: input.role, status: "ONLINE" })
      .where(eq(user.id, newUserId));

    revalidatePath("/crm/corretores");
    return { success: true };
  } catch (error: any) {
    console.error("Error in createCorretorAction:", error);
    if (error.message?.includes("already exists") || error.code === "23505") {
      return { error: "Este endereço de e-mail já está cadastrado no sistema." };
    }
    return { error: error.message || "Erro ao cadastrar corretor." };
  }
}

export async function updateCorretorStatusAction(
  corretorId: string,
  status: "ONLINE" | "PAUSADO" | "INATIVO"
) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    await db
      .update(user)
      .set({ status })
      .where(eq(user.id, corretorId));

    revalidatePath("/crm/corretores");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateCorretorStatusAction:", error);
    return { error: error.message || "Erro ao atualizar status." };
  }
}

export async function desativarCorretorAction(corretorId: string) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const currentUserId = authCheck.session?.user.id;
    if (corretorId === currentUserId) {
      return { error: "Você não pode desativar seu próprio usuário administrador." };
    }

    await db
      .update(user)
      .set({ status: "INATIVO" })
      .where(eq(user.id, corretorId));

    revalidatePath("/crm/corretores");
    return { success: true };
  } catch (error: any) {
    console.error("Error in desativarCorretorAction:", error);
    return { error: error.message || "Erro ao desativar corretor." };
  }
}
