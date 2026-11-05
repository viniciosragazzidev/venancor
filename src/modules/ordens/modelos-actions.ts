"use server";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { ordemModelos } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { ErroNegocio, executarAcao, type ResultadoAcao } from "@/lib/resultado-acao";
import { requireAdmin } from "@/lib/require-admin";
import {
  ordemModeloAtualizacaoSchema,
  ordemModeloSchema,
  type OrdemModeloData,
  type OrdemModeloInput,
} from "./schemas";

type OrdemModelo = typeof ordemModelos.$inferSelect;

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

export async function criarOrdemModelo(
  input: OrdemModeloInput,
): Promise<ResultadoAcao<OrdemModelo>> {
  const admin = await requireAdmin();
  return executarAcao(
    "painel.ordem_modelo.criar",
    async () => {
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
        metadados: { exigeAssinatura: modelo.exigeAssinatura },
      });
      return modelo;
    },
    { validacao: "campo" },
  );
}

export async function atualizarOrdemModelo(
  id: string,
  input: Partial<OrdemModeloInput>,
): Promise<ResultadoAcao<OrdemModelo>> {
  const admin = await requireAdmin();
  return executarAcao(
    "painel.ordem_modelo.atualizar",
    async () => {
      const dados = normalizar(ordemModeloAtualizacaoSchema.parse(input));
      const [modelo] = await db
        .update(ordemModelos)
        .set({ ...dados, atualizadoEm: new Date() })
        .where(eq(ordemModelos.id, id))
        .returning();
      if (!modelo) throw new ErroNegocio("Modelo não encontrado.");
      await registrarAuditoria({
        entidade: "ordem_modelos",
        entidadeId: id,
        acao: "atualizar",
        ator: `admin:${admin.id}`,
        metadados: { exigeAssinatura: modelo.exigeAssinatura },
      });
      return modelo;
    },
    { validacao: "campo" },
  );
}

export async function desativarOrdemModelo(id: string): Promise<ResultadoAcao<OrdemModelo>> {
  const admin = await requireAdmin();
  return executarAcao("painel.ordem_modelo.desativar", async () => {
    const [modelo] = await db
      .update(ordemModelos)
      .set({ ativo: false, atualizadoEm: new Date() })
      .where(eq(ordemModelos.id, id))
      .returning();
    if (!modelo) throw new ErroNegocio("Modelo não encontrado.");
    await registrarAuditoria({
      entidade: "ordem_modelos",
      entidadeId: id,
      acao: "desativar",
      ator: `admin:${admin.id}`,
    });
    return modelo;
  });
}
