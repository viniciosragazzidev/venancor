"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { contratoModelos } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { requireAdmin } from "@/lib/require-admin";
import {
  contratoModeloAtualizacaoSchema,
  contratoModeloSchema,
  type ContratoModeloInput,
} from "./schemas";

export async function listarContratoModelos() {
  await requireAdmin();
  return db.select().from(contratoModelos);
}

export async function criarContratoModelo(input: ContratoModeloInput) {
  const admin = await requireAdmin();
  const data = contratoModeloSchema.parse(input);
  const [modelo] = await db.insert(contratoModelos).values(data).returning();
  await registrarAuditoria({
    entidade: "contrato_modelos",
    entidadeId: modelo.id,
    acao: "criar",
    ator: `admin:${admin.id}`,
  });
  return modelo;
}

export async function atualizarContratoModelo(id: string, input: Partial<ContratoModeloInput>) {
  const admin = await requireAdmin();
  const data = contratoModeloAtualizacaoSchema.parse(input);
  const [modelo] = await db
    .update(contratoModelos)
    .set({ ...data, atualizadoEm: new Date() })
    .where(eq(contratoModelos.id, id))
    .returning();
  if (!modelo) throw new Error("Modelo de contrato não encontrado");
  await registrarAuditoria({
    entidade: "contrato_modelos",
    entidadeId: id,
    acao: "atualizar",
    ator: `admin:${admin.id}`,
  });
  return modelo;
}

export async function desativarContratoModelo(id: string) {
  const admin = await requireAdmin();
  const [modelo] = await db
    .update(contratoModelos)
    .set({ ativo: false, atualizadoEm: new Date() })
    .where(eq(contratoModelos.id, id))
    .returning();
  if (!modelo) throw new Error("Modelo de contrato não encontrado");
  await registrarAuditoria({
    entidade: "contrato_modelos",
    entidadeId: id,
    acao: "desativar",
    ator: `admin:${admin.id}`,
  });
  return modelo;
}
