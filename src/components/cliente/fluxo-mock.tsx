"use client";

import { toast } from "sonner";

import { FluxoCliente, type AcoesFluxo } from "./fluxo-cliente";
import {
  mockCobrancaBoleto,
  mockCobrancaCartao,
  mockCobrancaPix,
  mockOrdem,
  type CobrancaCliente,
  type MetodoPagamento,
} from "./mock";

const atrasar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const mockCobranca: Record<MetodoPagamento, CobrancaCliente> = {
  pix: mockCobrancaPix,
  boleto: mockCobrancaBoleto,
  cartao: mockCobrancaCartao,
};

export function FluxoMock() {
  const acoes: AcoesFluxo = {
    onEnviarOtp: async () => {
      // TODO (Cofre, F5.1): enviarOtp via MessagingProvider com rate limit
      await atrasar(700);
      return { ok: true };
    },
    onValidarOtp: async () => {
      // TODO (Cofre, F5.1): validarOtp (5 tentativas, expirado/invalido/bloqueado)
      await atrasar(500);
      return { ok: true };
    },
    onConcluirAssinatura: async () => {
      // TODO (Cofre, F5.3): concluirAssinatura (OTP + consentimentos + Storage + PDF)
      await atrasar(400);
    },
    onIniciarPagamento: async (metodo) => {
      // TODO (Cofre, F6.1): iniciarPagamento com guarda da regra de ouro
      await atrasar(600);
      return mockCobranca[metodo];
    },
    onBaixarContratoAssinado: () => {
      // TODO (Cofre, F5.5): URL assinada do PDF do contrato
      toast.info("Download do contrato será conectado pelo Cofre (F5.5).");
    },
    onBaixarBoleto: () => {
      // TODO (Cofre, F6.5): PDF do boleto (boleto_url)
      toast.info("Download do boleto será conectado pelo Cofre (F6.5).");
    },
    onBaixarComprovante: () => {
      // TODO (Cofre, F6.5): comprovante do pagamento
      toast.info("Download do comprovante será conectado pelo Cofre (F6.5).");
    },
    onCompartilharLink: async () => {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link da proposta copiado.");
    },
  };

  return <FluxoCliente ordem={mockOrdem} acoes={acoes} />;
}
