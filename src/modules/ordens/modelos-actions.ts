"use server";

import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { ordemModelos } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { requireAdmin } from "@/lib/require-admin";
import {
  ordemModeloAtualizacaoSchema,
  ordemModeloSchema,
  type OrdemModeloData,
  type OrdemModeloInput,
} from "./schemas";

type Resultado<T> = { ok: true; modelo: T } | { ok: false; erro: string };
type OrdemModelo = typeof ordemModelos.$inferSelect;

/** Same reason as criarOrdemNoPainel: in production Next hides thrown messages. */
function falha(erro: unknown, padrao: string): { ok: false; erro: string } {
  console.error("[ordem-modelos]", erro);
  if (erro instanceof z.ZodError)
    return { ok: false, erro: erro.issues[0]?.message ?? "Dados inválidos." };
  return { ok: false, erro: erro instanceof Error ? erro.message : padrao };
}

/** A custom value only makes sense for "personalizado". */
function normalizar<T extends Partial<OrdemModeloData>>(dados: T): T {
  if (dados.valorCobradoTipo && dados.valorCobradoTipo !== "personalizado")
    return { ...dados, valorPersonalizado: null };
  return dados;
}

export async function listarOrdemModelos() {
  await requireAdmin();
  return db
    .select()
    .from(ordemModelos)
    .where(eq(ordemModelos.ativo, true))
    .orderBy(asc(ordemModelos.nome));
}

export async function criarOrdemModelo(input: OrdemModeloInput): Promise<Resultado<OrdemModelo>> {
  const admin = await requireAdmin();
  try {
    const dados = normalizar(ordemModeloSchema.parse(input));
    const [modelo] = await db
      .insert(ordemModelos)
      .values({ ...dados, criadoPor: admin.id })
      .returning();
    await registrarAuditoria({
      entidade: "ordem_modelos",
      entidadeId: modelo.id,
      acao: "criar",
      ator: `admin:${admin.id}`,
    });
    return { ok: true, modelo };
  } catch (erro) {
    return falha(erro, "Não foi possível salvar o modelo.");
  }
}

export async function atualizarOrdemModelo(
  id: string,
  input: Partial<OrdemModeloInput>,
): Promise<Resultado<OrdemModelo>> {
  const admin = await requireAdmin();
  try {
    const dados = normalizar(ordemModeloAtualizacaoSchema.parse(input));
    const [modelo] = await db
      .update(ordemModelos)
      .set({ ...dados, atualizadoEm: new Date() })
      .where(eq(ordemModelos.id, id))
      .returning();
    if (!modelo) throw new Error("Modelo não encontrado");
    await registrarAuditoria({
      entidade: "ordem_modelos",
      entidadeId: id,
      acao: "atualizar",
      ator: `admin:${admin.id}`,
    });
    return { ok: true, modelo };
  } catch (erro) {
    return falha(erro, "Não foi possível atualizar o modelo.");
  }
}

export async function desativarOrdemModelo(id: string): Promise<Resultado<OrdemModelo>> {
  const admin = await requireAdmin();
  try {
    const [modelo] = await db
      .update(ordemModelos)
      .set({ ativo: false, atualizadoEm: new Date() })
      .where(eq(ordemModelos.id, id))
      .returning();
    if (!modelo) throw new Error("Modelo não encontrado");
    await registrarAuditoria({
      entidade: "ordem_modelos",
      entidadeId: id,
      acao: "desativar",
      ator: `admin:${admin.id}`,
    });
    return { ok: true, modelo };
  } catch (erro) {
    return falha(erro, "Não foi possível desativar o modelo.");
  }
}
