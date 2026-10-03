import type { CriarCobrancaInput, PaymentProvider } from "@/providers/payment";
import type { OrdemStatus } from "@/modules/ordens/state-machine";

export class PagamentoSemAssinaturaError extends Error {
  constructor() {
    super("Assine o contrato antes de pagar");
    this.name = "PagamentoSemAssinaturaError";
  }
}

export function assertPodeIniciarPagamento(status: OrdemStatus, assinaturaExiste: boolean): void {
  if (!assinaturaExiste || !["assinada", "aguardando_pagamento"].includes(status))
    throw new PagamentoSemAssinaturaError();
}

export async function criarCobrancaSeAssinada(
  provider: PaymentProvider,
  input: CriarCobrancaInput,
  status: OrdemStatus,
  assinaturaExiste: boolean,
) {
  assertPodeIniciarPagamento(status, assinaturaExiste);
  return provider.criarCobranca(input);
}
