import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assinaturas, consentimentos, pagamentos } from "@/db/schema";
import { motivoBloqueioExclusaoOrdem } from "./exclusao";
import type { OrdemStatus } from "./state-machine";

/**
 * Motivo que impede excluir esta ordem, pela mesma regra do lote (excluirOrdensEmMassa). Null = pode excluir.
 * Só leitura: a exclusão em si é feita pela action do lote, com auditoria.
 */
export async function motivoExclusaoDaOrdem(ordemId: string, status: string): Promise<string | null> {
  const [assinatura] = await db
    .select({ id: assinaturas.id })
    .from(assinaturas)
    .where(eq(assinaturas.ordemId, ordemId))
    .limit(1);
  const [pagamento] = await db
    .select({ id: pagamentos.id })
    .from(pagamentos)
    .where(eq(pagamentos.ordemId, ordemId))
    .limit(1);
  const [consentimento] = await db
    .select({ id: consentimentos.id })
    .from(consentimentos)
    .where(eq(consentimentos.ordemId, ordemId))
    .limit(1);
  return motivoBloqueioExclusaoOrdem({
    status: status as OrdemStatus,
    assinaturaExiste: Boolean(assinatura),
    pagamentoExiste: Boolean(pagamento),
    consentimentoExiste: Boolean(consentimento),
  });
}
