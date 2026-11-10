"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { contratoModelos } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { ErroNegocio, executarAcaoPainel, type ResultadoAcao } from "@/lib/resultado-acao";
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

export async function criarContratoModelo(input: ContratoModeloInput): Promise<ResultadoAcao<typeof contratoModelos.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.contrato_modelo.criar", async () => {
    const data = contratoModeloSchema.parse(input);
    const [modelo] = await db.insert(contratoModelos).values(data).returning();
    await registrarAuditoria({ entidade: "contrato_modelos", entidadeId: modelo.id, acao: "criar", ator: `admin:${admin.id}` });
    return modelo;
  });
}

export async function atualizarContratoModelo(id: string, input: Partial<ContratoModeloInput>): Promise<ResultadoAcao<typeof contratoModelos.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.contrato_modelo.atualizar", async () => {
    const data = contratoModeloAtualizacaoSchema.parse(input);
    const [modelo] = await db.update(contratoModelos).set({ ...data, atualizadoEm: new Date() }).where(eq(contratoModelos.id, id)).returning();
    if (!modelo) throw new ErroNegocio("Modelo de contrato não encontrado. Atualize a lista e tente de novo.");
    await registrarAuditoria({ entidade: "contrato_modelos", entidadeId: id, acao: "atualizar", ator: `admin:${admin.id}` });
    return modelo;
  });
}

export async function desativarContratoModelo(id: string): Promise<ResultadoAcao<typeof contratoModelos.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.contrato_modelo.desativar", async () => {
    const [modelo] = await db.update(contratoModelos).set({ ativo: false, atualizadoEm: new Date() }).where(eq(contratoModelos.id, id)).returning();
    if (!modelo) throw new ErroNegocio("Modelo de contrato não encontrado. Atualize a lista e tente de novo.");
    await registrarAuditoria({ entidade: "contrato_modelos", entidadeId: id, acao: "desativar", ator: `admin:${admin.id}` });
    return modelo;
  });
}
