import type { CriarCobrancaInput, PaymentProvider } from "@/providers/payment";
import type { OrdemStatus } from "@/modules/ordens/state-machine";
import { ErroNegocio } from "@/lib/resultado-acao";

export class PagamentoSemAssinaturaError extends ErroNegocio {
  constructor() {
    super("Assine o contrato antes de pagar");
    this.name = "PagamentoSemAssinaturaError";
  }
}

export function assertPodeIniciarPagamento(
  status: OrdemStatus,
  assinaturaExiste: boolean,
  exigeAssinatura = true,
): void {
  const assinaturaConcluida =
    assinaturaExiste && ["assinada", "aguardando_pagamento"].includes(status);
  const ordemSemAssinatura =
    !exigeAssinatura && ["visualizada", "aguardando_pagamento"].includes(status);
  if (!assinaturaConcluida && !ordemSemAssinatura) throw new PagamentoSemAssinaturaError();
}

export async function criarCobrancaSeAssinada(
  provider: PaymentProvider,
  input: CriarCobrancaInput,
  status: OrdemStatus,
  assinaturaExiste: boolean,
  exigeAssinatura = true,
) {
  assertPodeIniciarPagamento(status, assinaturaExiste, exigeAssinatura);
  return provider.criarCobranca(input);
}
