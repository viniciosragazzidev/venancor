import { and, eq } from "drizzle-orm";
import { auditoria, ordens, ordemStatus } from "@/db/schema";

export type OrdemStatus = (typeof ordemStatus.enumValues)[number];
export const TRANSICOES: Record<OrdemStatus, readonly OrdemStatus[]> = {
  rascunho: ["enviada", "cancelada"],
  enviada: ["visualizada", "expirada", "cancelada"],
  visualizada: ["assinada", "expirada", "cancelada"],
  assinada: ["aguardando_pagamento", "cancelada"],
  aguardando_pagamento: ["paga", "expirada", "cancelada"],
  paga: [],
  expirada: [],
  cancelada: [],
};

export function podeTransicionar(de: OrdemStatus, para: OrdemStatus): boolean {
  return TRANSICOES[de].includes(para);
}

export class TransicaoInvalidaError extends Error {
  constructor(de: OrdemStatus, para: OrdemStatus) {
    super(`Transição de ${de} para ${para} não permitida`);
    this.name = "TransicaoInvalidaError";
  }
}

export class ConflitoTransicaoError extends Error {
  constructor() {
    super("A ordem foi alterada por outro processo");
    this.name = "ConflitoTransicaoError";
  }
}

export async function transicionar(
  ordemId: string,
  para: OrdemStatus,
  ator: string,
): Promise<void> {
  if (!ator.trim()) throw new Error("Ator obrigatório");
  const { db } = await import("@/db/client");
  await db.transaction(async (tx) => {
    const [ordem] = await tx
      .select({ status: ordens.status })
      .from(ordens)
      .where(eq(ordens.id, ordemId))
      .limit(1);
    if (!ordem) throw new Error("Ordem não encontrada");
    const de = ordem.status;
    if (!podeTransicionar(de, para)) throw new TransicaoInvalidaError(de, para);
    const agora = new Date();
    const datas: Partial<typeof ordens.$inferInsert> =
      para === "enviada"
        ? { enviadaEm: agora }
        : para === "visualizada"
          ? { visualizadaEm: agora }
          : para === "assinada"
            ? { assinadaEm: agora }
            : para === "paga"
              ? { pagaEm: agora }
              : para === "cancelada"
                ? { canceladaEm: agora }
                : {};
    const [atualizada] = await tx
      .update(ordens)
      .set({ status: para, atualizadoEm: agora, ...datas })
      .where(and(eq(ordens.id, ordemId), eq(ordens.status, de)))
      .returning({ id: ordens.id });
    if (!atualizada) throw new ConflitoTransicaoError();
    await tx.insert(auditoria).values({
      entidade: "ordens",
      entidadeId: ordemId,
      acao: "transicionar",
      ator,
      metadados: { de, para },
    });
  });
}
