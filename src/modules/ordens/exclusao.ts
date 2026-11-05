import type { OrdemStatus } from "./state-machine";

const STATUS_EXCLUIVEIS = new Set<OrdemStatus>([
  "rascunho",
  "enviada",
  "visualizada",
  "expirada",
  "cancelada",
]);

export const MAX_ORDENS_EXCLUSAO = 100;

export function motivoBloqueioExclusaoOrdem(input: {
  status: OrdemStatus;
  assinaturaExiste: boolean;
  pagamentoExiste: boolean;
}): string | null {
  if (input.assinaturaExiste) return "A ordem tem registro de assinatura.";
  if (input.pagamentoExiste) return "A ordem tem registro de pagamento.";
  if (!STATUS_EXCLUIVEIS.has(input.status)) {
    return "Ordens assinadas, aguardando pagamento ou pagas não podem ser excluídas.";
  }
  return null;
}
