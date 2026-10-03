"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { operadoras, planos, planoPrecos } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { requireAdmin } from "@/lib/require-admin";
import { getStorageAdapter } from "@/providers/storage";
import {
  operadoraSchema,
  planoAtualizacaoSchema,
  planoSchema,
  tabelaPrecosSchema,
  type OperadoraInput,
  type PlanoAtualizacaoInput,
  type PlanoInput,
  type PrecoInput,
} from "./schemas";

export async function listarOperadoras() {
  await requireAdmin();
  return db.select().from(operadoras);
}

export async function criarOperadora(input: OperadoraInput) {
  const admin = await requireAdmin();
  const data = operadoraSchema.parse(input);
  const [nova] = await db.insert(operadoras).values(data).returning();
  await registrarAuditoria({
    entidade: "operadoras",
    entidadeId: nova.id,
    acao: "criar",
    ator: `admin:${admin.id}`,
  });
  return nova;
}

export async function atualizarOperadora(id: string, input: Partial<OperadoraInput>) {
  const admin = await requireAdmin();
  const data = operadoraSchema.partial().parse(input);
  const [atualizada] = await db
    .update(operadoras)
    .set({ ...data, atualizadoEm: new Date() })
    .where(eq(operadoras.id, id))
    .returning();
  if (!atualizada) throw new Error("Operadora não encontrada");
  await registrarAuditoria({
    entidade: "operadoras",
    entidadeId: id,
    acao: "atualizar",
    ator: `admin:${admin.id}`,
  });
  return atualizada;
}

export async function desativarOperadora(id: string) {
  const admin = await requireAdmin();
  const [atualizada] = await db
    .update(operadoras)
    .set({ ativa: false, atualizadoEm: new Date() })
    .where(eq(operadoras.id, id))
    .returning();
  if (!atualizada) throw new Error("Operadora não encontrada");
  await registrarAuditoria({
    entidade: "operadoras",
    entidadeId: id,
    acao: "desativar",
    ator: `admin:${admin.id}`,
  });
  return atualizada;
}

export async function salvarLogoOperadora(id: string, file: File) {
  const admin = await requireAdmin();
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2_000_000)
    throw new Error("Logo deve ser PNG, JPEG ou WebP de até 2 MB");
  const [operadora] = await db
    .select({ id: operadoras.id })
    .from(operadoras)
    .where(eq(operadoras.id, id))
    .limit(1);
  if (!operadora) throw new Error("Operadora não encontrada");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `operadoras/${id}/logo-${crypto.randomUUID()}.${ext}`;
  await getStorageAdapter().put(key, new Uint8Array(await file.arrayBuffer()), file.type);
  await db
    .update(operadoras)
    .set({ logoPath: key, atualizadoEm: new Date() })
    .where(eq(operadoras.id, id));
  await registrarAuditoria({
    entidade: "operadoras",
    entidadeId: id,
    acao: "salvar_logo",
    ator: `admin:${admin.id}`,
  });
  return key;
}

export async function listarPlanos() {
  await requireAdmin();
  return db.select().from(planos);
}

export async function listarPrecos(planoId: string) {
  await requireAdmin();
  return db.select().from(planoPrecos).where(eq(planoPrecos.planoId, planoId));
}

export async function criarPlano(input: PlanoInput) {
  const admin = await requireAdmin();
  const { precos, ...data } = planoSchema.parse(input);
  const novo = await db.transaction(async (tx) => {
    const [plano] = await tx.insert(planos).values(data).returning();
    await tx.insert(planoPrecos).values(precos.map((preco) => ({ ...preco, planoId: plano.id })));
    return plano;
  });
  await registrarAuditoria({
    entidade: "planos",
    entidadeId: novo.id,
    acao: "criar",
    ator: `admin:${admin.id}`,
  });
  return novo;
}

export async function atualizarPlano(id: string, input: PlanoAtualizacaoInput) {
  const admin = await requireAdmin();
  const { precos, ...data } = planoAtualizacaoSchema.parse(input);
  const atualizado = await db.transaction(async (tx) => {
    const [plano] = await tx
      .update(planos)
      .set({ ...data, atualizadoEm: new Date() })
      .where(eq(planos.id, id))
      .returning();
    if (!plano) throw new Error("Plano não encontrado");
    if (precos) {
      await tx.delete(planoPrecos).where(eq(planoPrecos.planoId, id));
      await tx.insert(planoPrecos).values(precos.map((preco) => ({ ...preco, planoId: id })));
    }
    return plano;
  });
  await registrarAuditoria({
    entidade: "planos",
    entidadeId: id,
    acao: "atualizar",
    ator: `admin:${admin.id}`,
  });
  return atualizado;
}

export async function salvarPrecos(planoId: string, input: PrecoInput[]) {
  const admin = await requireAdmin();
  const precos = tabelaPrecosSchema.parse(input);
  await db.transaction(async (tx) => {
    await tx.delete(planoPrecos).where(eq(planoPrecos.planoId, planoId));
    await tx.insert(planoPrecos).values(precos.map((preco) => ({ ...preco, planoId })));
  });
  await registrarAuditoria({
    entidade: "planos",
    entidadeId: planoId,
    acao: "salvar_precos",
    ator: `admin:${admin.id}`,
  });
}

export async function desativarPlano(id: string) {
  const admin = await requireAdmin();
  const [plano] = await db
    .update(planos)
    .set({ ativo: false, atualizadoEm: new Date() })
    .where(eq(planos.id, id))
    .returning();
  if (!plano) throw new Error("Plano não encontrado");
  await registrarAuditoria({
    entidade: "planos",
    entidadeId: id,
    acao: "desativar",
    ator: `admin:${admin.id}`,
  });
  return plano;
}
