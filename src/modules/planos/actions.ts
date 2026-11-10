"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { operadoras, planos, planoPrecos } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { ErroNegocio, executarAcaoPainel, type ResultadoAcao } from "@/lib/resultado-acao";
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

export async function criarOperadora(input: OperadoraInput): Promise<ResultadoAcao<typeof operadoras.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.operadora.criar", async () => {
    const data = operadoraSchema.parse(input);
    const [nova] = await db.insert(operadoras).values(data).returning();
    await registrarAuditoria({ entidade: "operadoras", entidadeId: nova.id, acao: "criar", ator: `admin:${admin.id}` });
    return nova;
  });
}

export async function atualizarOperadora(id: string, input: Partial<OperadoraInput>): Promise<ResultadoAcao<typeof operadoras.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.operadora.atualizar", async () => {
    const data = operadoraSchema.partial().parse(input);
    const [atualizada] = await db.update(operadoras).set({ ...data, atualizadoEm: new Date() }).where(eq(operadoras.id, id)).returning();
    if (!atualizada) throw new ErroNegocio("Operadora não encontrada. Atualize a lista e tente de novo.");
    await registrarAuditoria({ entidade: "operadoras", entidadeId: id, acao: "atualizar", ator: `admin:${admin.id}` });
    return atualizada;
  });
}

export async function desativarOperadora(id: string): Promise<ResultadoAcao<typeof operadoras.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.operadora.desativar", async () => {
    const [atualizada] = await db.update(operadoras).set({ ativa: false, atualizadoEm: new Date() }).where(eq(operadoras.id, id)).returning();
    if (!atualizada) throw new ErroNegocio("Operadora não encontrada. Atualize a lista e tente de novo.");
    await registrarAuditoria({ entidade: "operadoras", entidadeId: id, acao: "desativar", ator: `admin:${admin.id}` });
    return atualizada;
  });
}

export async function salvarLogoOperadora(id: string, file: File): Promise<ResultadoAcao<string>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.operadora.logo", async () => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2_000_000)
      throw new ErroNegocio("A logo precisa ser PNG, JPEG ou WebP e ter no máximo 2 MB.");
    const [operadora] = await db.select({ id: operadoras.id }).from(operadoras).where(eq(operadoras.id, id)).limit(1);
    if (!operadora) throw new ErroNegocio("Operadora não encontrada. Atualize a lista e tente de novo.");
    // Sempre PNG (04/11): o boleto próprio em PDF só embute PNG/JPEG, e WebP não entra no pdf-lib.
    const { default: sharp } = await import("sharp");
    const png = await sharp(Buffer.from(await file.arrayBuffer()))
      .resize({ width: 600, height: 300, fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
    const key = `operadoras/${id}/logo-${crypto.randomUUID()}.png`;
    await getStorageAdapter().put(key, new Uint8Array(png), "image/png");
    await db.update(operadoras).set({ logoPath: key, atualizadoEm: new Date() }).where(eq(operadoras.id, id));
    await registrarAuditoria({ entidade: "operadoras", entidadeId: id, acao: "salvar_logo", ator: `admin:${admin.id}` });
    return key;
  });
}

export async function listarPlanos() {
  await requireAdmin();
  return db.select().from(planos);
}

export async function listarPrecos(planoId: string): Promise<ResultadoAcao<(typeof planoPrecos.$inferSelect)[]>> {
  await requireAdmin();
  return executarAcaoPainel("painel.plano.listar_precos", () => db.select().from(planoPrecos).where(eq(planoPrecos.planoId, planoId)));
}

export async function criarPlano(input: PlanoInput): Promise<ResultadoAcao<typeof planos.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.plano.criar", async () => {
    const { precos, ...data } = planoSchema.parse(input);
    const novo = await db.transaction(async (tx) => {
      const [plano] = await tx.insert(planos).values(data).returning();
      await tx.insert(planoPrecos).values(precos.map((preco) => ({ ...preco, planoId: plano.id })));
      return plano;
    });
    await registrarAuditoria({ entidade: "planos", entidadeId: novo.id, acao: "criar", ator: `admin:${admin.id}` });
    return novo;
  });
}

export async function atualizarPlano(id: string, input: PlanoAtualizacaoInput): Promise<ResultadoAcao<typeof planos.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.plano.atualizar", async () => {
    const { precos, ...data } = planoAtualizacaoSchema.parse(input);
    const atualizado = await db.transaction(async (tx) => {
      const [plano] = await tx.update(planos).set({ ...data, atualizadoEm: new Date() }).where(eq(planos.id, id)).returning();
      if (!plano) throw new ErroNegocio("Plano não encontrado. Atualize a lista e tente de novo.");
      if (precos) {
        await tx.delete(planoPrecos).where(eq(planoPrecos.planoId, id));
        await tx.insert(planoPrecos).values(precos.map((preco) => ({ ...preco, planoId: id })));
      }
      return plano;
    });
    await registrarAuditoria({ entidade: "planos", entidadeId: id, acao: "atualizar", ator: `admin:${admin.id}` });
    return atualizado;
  });
}

export async function salvarPrecos(planoId: string, input: PrecoInput[]): Promise<ResultadoAcao<void>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.plano.salvar_precos", async () => {
    const precos = tabelaPrecosSchema.parse(input);
    await db.transaction(async (tx) => {
      const [plano] = await tx.select({ id: planos.id }).from(planos).where(eq(planos.id, planoId)).limit(1);
      if (!plano) throw new ErroNegocio("Plano não encontrado. Atualize a lista e tente de novo.");
      await tx.delete(planoPrecos).where(eq(planoPrecos.planoId, planoId));
      await tx.insert(planoPrecos).values(precos.map((preco) => ({ ...preco, planoId })));
    });
    await registrarAuditoria({ entidade: "planos", entidadeId: planoId, acao: "salvar_precos", ator: `admin:${admin.id}` });
  });
}

export async function desativarPlano(id: string): Promise<ResultadoAcao<typeof planos.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.plano.desativar", async () => {
    const [plano] = await db.update(planos).set({ ativo: false, atualizadoEm: new Date() }).where(eq(planos.id, id)).returning();
    if (!plano) throw new ErroNegocio("Plano não encontrado. Atualize a lista e tente de novo.");
    await registrarAuditoria({ entidade: "planos", entidadeId: id, acao: "desativar", ator: `admin:${admin.id}` });
    return plano;
  });
}
