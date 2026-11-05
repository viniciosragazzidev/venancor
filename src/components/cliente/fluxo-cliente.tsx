"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeftIcon, ShareIcon, ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { Brand } from "@/components/admin/brand";
import { FaixaAmbienteTeste } from "@/components/ambiente-teste";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { TelaAssinatura } from "./tela-assinatura";
import { TelaContrato } from "./tela-contrato";
import { TelaPagamento } from "./tela-pagamento";
import { TelaResumo } from "./tela-resumo";
import { TelaStatus, TelaSucesso } from "./tela-sucesso";
import type { CobrancaCliente, DadosOrdemCliente, MetodoPagamento, OtpErro } from "./types";

type Etapa = "resumo" | "contrato" | "assinatura" | "pagamento";

const passos = [
  { id: "resumo", label: "Resumo" },
  { id: "contrato", label: "Contrato" },
  { id: "assinatura", label: "Assinatura" },
  { id: "pagamento", label: "Pagamento" },
] satisfies { id: Etapa; label: string }[];

const titulos: Record<Etapa, { titulo: string; subtitulo: string }> = {
  resumo: {
    titulo: "Sua proposta",
    subtitulo: "Confira o plano, os beneficiários e os valores antes de assinar.",
  },
  contrato: {
    titulo: "Contrato",
    subtitulo: "Leia o contrato gerado em seu nome e confirme os termos.",
  },
  assinatura: {
    titulo: "Assinatura",
    subtitulo: "Confirme seus dados, assine e valide o código enviado por WhatsApp.",
  },
  pagamento: {
    titulo: "Pagamento",
    subtitulo: "Escolha a forma de pagamento para ativar o plano.",
  },
};

function passosDaOrdem(exigeAssinatura: boolean) {
  return exigeAssinatura
    ? passos
    : passos.filter((passo) => passo.id === "resumo" || passo.id === "pagamento");
}

const indiceEtapa = (etapa: Etapa, exigeAssinatura: boolean) =>
  passosDaOrdem(exigeAssinatura).findIndex((passo) => passo.id === etapa);

export type Consentimentos = { contrato: boolean; lgpd: boolean };

export type AcoesFluxo = {
  onAceitarConsentimentos: () => Promise<void>;
  onEnviarOtp: (
    telefone: string,
  ) => Promise<{ ok: true; codigoTeste?: string } | { erro: OtpErro }>;
  onValidarOtp: (codigo: string) => Promise<{ ok: true } | { erro: OtpErro }>;
  onConcluirAssinatura: (dados: {
    nome: string;
    cpf: string;
    imagemDataUrl: string;
    consentimentos: Consentimentos;
  }) => Promise<void>;
  onIniciarPagamento: (metodo: MetodoPagamento, parcelas?: number) => Promise<CobrancaCliente>;
  onBaixarContratoAssinado: () => void;
  onBaixarBoleto: (url?: string) => void;
  onSimularPagamento?: (pagamentoId: string) => Promise<void>;
  onCompartilharLink: () => Promise<void>;
};

export function FluxoCliente({
  ordem,
  acoes,
  otpAutomatico = false,
  exigeOtp = false,
}: {
  ordem: DadosOrdemCliente;
  acoes: AcoesFluxo;
  otpAutomatico?: boolean;
  exigeOtp?: boolean;
}) {
  const jaAssinada = ["assinada", "aguardando_pagamento", "paga"].includes(ordem.status);
  const [etapa, setEtapa] = useState<Etapa>(
    jaAssinada || !ordem.exige_assinatura ? "pagamento" : "resumo",
  );
  const [, setAssinaturaConcluida] = useState(jaAssinada);
  const [sucessoAssinatura, setSucessoAssinatura] = useState(false);
  const [consentimentos, setConsentimentos] = useState<Consentimentos>({
    contrato: false,
    lgpd: false,
  });

  const statusTerminal =
    ordem.status === "expirada" || ordem.status === "cancelada" || ordem.status === "paga";
  const emSucesso = statusTerminal || sucessoAssinatura;

  function voltar() {
    const etapas = passosDaOrdem(ordem.exige_assinatura);
    const indice = indiceEtapa(etapa, ordem.exige_assinatura);
    if (indice > 0) {
      setEtapa(etapas[indice - 1].id);
    }
  }

  async function compartilhar() {
    try {
      await acoes.onCompartilharLink();
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  function conteudo() {
    if (ordem.status === "expirada") {
      return <TelaStatus tipo="expirada" />;
    }
    if (ordem.status === "cancelada") {
      return <TelaStatus tipo="cancelada" />;
    }
    if (ordem.status === "paga") {
      return ordem.exige_assinatura ? (
        <TelaSucesso variante="pagamento" onAcaoPrimaria={acoes.onBaixarContratoAssinado} />
      ) : (
        <TelaSucesso variante="pagamento-sem-assinatura" />
      );
    }
    if (sucessoAssinatura) {
      return (
        <TelaSucesso
          variante="assinatura"
          onAcaoPrimaria={() => {
            setSucessoAssinatura(false);
            setEtapa("pagamento");
          }}
          onAcaoSecundaria={acoes.onBaixarContratoAssinado}
        />
      );
    }

    switch (etapa) {
      case "resumo":
        return (
          <TelaResumo
            ordem={ordem}
            onAvancar={() => setEtapa(ordem.exige_assinatura ? "contrato" : "pagamento")}
          />
        );
      case "contrato":
        return (
          <TelaContrato
            ordem={ordem}
            consentimentos={consentimentos}
            onConsentimentos={setConsentimentos}
            onAvancar={async () => {
              try {
                await acoes.onAceitarConsentimentos();
                setEtapa("assinatura");
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Não foi possível registrar os aceites.",
                );
              }
            }}
          />
        );
      case "assinatura":
        return (
          <TelaAssinatura
            exigeOtp={exigeOtp}
            otpAutomatico={otpAutomatico}
            cliente={ordem.cliente}
            consentimentos={consentimentos}
            onEnviarOtp={acoes.onEnviarOtp}
            onValidarOtp={acoes.onValidarOtp}
            onConcluirAssinatura={async (dados, automatico) => {
              await acoes.onConcluirAssinatura(dados);
              setAssinaturaConcluida(true);
              if (automatico) setEtapa("pagamento");
              else setSucessoAssinatura(true);
            }}
          />
        );
      case "pagamento":
        return (
          <div className="flex flex-col gap-4">
            {!ordem.exige_assinatura ? <TelaResumo ordem={ordem} /> : null}
            <TelaPagamento
              ordem={ordem}
              onIniciarPagamento={acoes.onIniciarPagamento}
              onBaixarBoleto={acoes.onBaixarBoleto}
              onSimularPagamento={acoes.onSimularPagamento}
            />
          </div>
        );
    }
  }

  const etapaAtual = titulos[etapa];

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <FaixaAmbienteTeste />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
        <header className="flex items-center justify-between py-4">
          {indiceEtapa(etapa, ordem.exige_assinatura) > 0 && !emSucesso ? (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Voltar"
              onClick={voltar}
            >
              <ChevronLeftIcon aria-hidden strokeWidth={1.5} />
            </Button>
          ) : (
            <span className="size-8" aria-hidden />
          )}
          <Brand />
          <div className="flex items-center gap-2">
            {!emSucesso ? (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label="Compartilhar link da proposta"
                onClick={compartilhar}
              >
                <ShareIcon aria-hidden strokeWidth={1.5} />
              </Button>
            ) : null}
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    aria-label="Seus dados protegidos"
                  />
                }
              >
                <ShieldCheckIcon aria-hidden strokeWidth={1.5} />
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl gap-0 p-0">
                <SheetHeader className="px-5 pt-5 pb-2">
                  <SheetTitle className="text-balance">Seus dados protegidos</SheetTitle>
                  <SheetDescription className="sr-only">
                    Segurança e privacidade da proposta
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2.5 px-5 pb-6 text-sm leading-relaxed text-pretty text-muted-foreground">
                  <p>
                    {ordem.exige_assinatura
                      ? "Este link é pessoal e usa um endereço único, impossível de adivinhar. A assinatura é registrada com evidências (data, hora e dispositivo) e o pagamento só é liberado depois da assinatura concluída."
                      : "Este link é pessoal e usa um endereço único, impossível de adivinhar. Esta proposta não exige assinatura e segue direto para o pagamento."}
                  </p>
                  <p>
                    Seus dados são tratados conforme a LGPD e usados apenas para a contratação do
                    plano.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {!emSucesso ? (
          <>
            {/* Sem trilha de etapas em nenhuma tela do link (pedido do Vinicios, 04/11). */}
            <div className="h-6" aria-hidden />
            <div className="flex flex-col gap-1.5 pb-5">
              <h1 className="text-2xl leading-tight font-medium tracking-tight text-balance">
                {etapaAtual.titulo}
              </h1>
              <p className="text-sm text-pretty text-muted-foreground">
                {etapa === "assinatura" && !exigeOtp
                  ? "Confirme seus dados e assine para continuar ao pagamento."
                  : etapaAtual.subtitulo}
              </p>
            </div>
          </>
        ) : null}

        <motion.div
          key={emSucesso ? "sucesso" : etapa}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className="flex-1"
        >
          {conteudo()}
        </motion.div>

        <footer className="pt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
          MedLink · Proposta enviada pelo seu corretor. Seus dados são protegidos conforme a LGPD.
        </footer>
      </div>
    </div>
  );
}
