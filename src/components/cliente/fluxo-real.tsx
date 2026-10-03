"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { concluirAssinatura } from "@/modules/assinatura/actions";
import { confirmarOtp, solicitarOtp } from "@/modules/assinatura/otp-actions";
import { aceitarConsentimento } from "@/modules/ordens/cliente-actions";
import {
  consultarStatusCliente,
  obterContratoAssinadoCliente,
} from "@/modules/ordens/cliente-status-actions";
import { iniciarPagamento } from "@/modules/pagamentos/actions";
import { fakePermitido } from "@/lib/modo-teste";
import { FluxoCliente, type AcoesFluxo } from "./fluxo-cliente";
import type { DadosOrdemCliente, OtpErro } from "./types";

const mensagemErro = (error: unknown) =>
  error instanceof Error ? error.message : "Tente novamente.";

export function FluxoReal({
  token,
  ordem,
  simulacaoDisponivel,
  otpAutomatico,
}: {
  token: string;
  ordem: DadosOrdemCliente;
  simulacaoDisponivel: boolean;
  otpAutomatico: boolean;
}) {
  const [status, setStatus] = useState(ordem.status);

  useEffect(() => {
    if (["paga", "expirada", "cancelada"].includes(status)) return;
    const timer = window.setInterval(async () => {
      if (document.hidden) return;
      try {
        const atual = await consultarStatusCliente(token);
        setStatus(atual === "invalido" ? "expirada" : atual);
      } catch {
        /* a próxima consulta tenta novamente */
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [status, token]);

  async function baixarContrato() {
    try {
      const url = await obterContratoAssinadoCliente(token);
      if (url === "/api/cliente/documento") {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!response.ok) throw new Error("Contrato assinado indisponível");
        const objeto = URL.createObjectURL(await response.blob());
        const link = document.createElement("a");
        link.href = objeto;
        link.download = "contrato-assinado.pdf";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(objeto), 60_000);
      } else window.location.assign(url);
    } catch (error) {
      toast.error(mensagemErro(error));
    }
  }

  const acoes: AcoesFluxo = {
    onAceitarConsentimentos: async () => {
      await aceitarConsentimento(token, "contrato");
      await aceitarConsentimento(token, "lgpd");
    },
    onEnviarOtp: async () => {
      try {
        const resultado = await solicitarOtp(token);
        return { ok: true, ...resultado };
      } catch (error) {
        toast.error(mensagemErro(error));
        return { erro: "falha" as OtpErro };
      }
    },
    onValidarOtp: async (codigo) => {
      try {
        const resultado = await confirmarOtp(token, codigo);
        return "ok" in resultado ? { ok: true } : resultado;
      } catch (error) {
        toast.error(mensagemErro(error));
        return { erro: "falha" as OtpErro };
      }
    },
    onConcluirAssinatura: async ({ nome, cpf, imagemDataUrl }) => {
      await concluirAssinatura(token, { nome, cpf, imagemBase64: imagemDataUrl });
      setStatus("assinada");
    },
    onIniciarPagamento: async (metodo, parcelas) => {
      const cobranca = await iniciarPagamento(token, metodo, parcelas);
      setStatus("aguardando_pagamento");
      return cobranca;
    },
    onBaixarContratoAssinado: () => {
      void baixarContrato();
    },
    onBaixarBoleto: (url) => {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else toast.error("Boleto indisponível. Gere a cobrança novamente.");
    },
    ...(fakePermitido() && simulacaoDisponivel
      ? {
          onSimularPagamento: async (pagamentoId: string) => {
            const response = await fetch("/api/dev/simular-pagamento", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pagamentoId, token }),
            });
            if (!response.ok) throw new Error("Não foi possível simular o pagamento.");
            const resultado = (await response.json()) as { status: string };
            if (resultado.status === "paga") setStatus("paga");
          },
        }
      : {}),
    onCompartilharLink: async () => {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link da proposta copiado.");
    },
  };
  return <FluxoCliente ordem={{ ...ordem, status }} acoes={acoes} otpAutomatico={otpAutomatico} />;
}
