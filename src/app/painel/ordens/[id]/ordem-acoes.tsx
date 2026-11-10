"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BanIcon, BellRingIcon, CopyIcon, LoaderCircleIcon, MessageCircleIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { LembrarAgoraDialog } from "@/components/admin/lembrar-agora";
import { Button } from "@/components/ui/button";
import { valorOuErro } from "@/lib/resultado-acao";
import { cancelarOrdem, copiarLinkOrdem, enviarOrdem, gerarNovoLink } from "@/modules/ordens/actions";

const STATUS_COM_ENVIO = ["rascunho", "enviada", "visualizada"];
/** The client link still matters until payment: copy and "Gerar novo link" stay available. */
const STATUS_COM_LINK = ["rascunho", "enviada", "visualizada", "assinada", "aguardando_pagamento"];
const STATUS_SEM_CANCELAMENTO = ["paga", "expirada", "cancelada"];

export function OrdemAcoes({
  ordemId,
  status,
  podeLembrar = false,
}: {
  ordemId: string;
  status: string;
  /** Status allows a reminder and the 2-reminder cap was not reached. */
  podeLembrar?: boolean;
}) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState<"enviar" | "copiar" | "novo" | null>(null);
  const [confirmaEnvio, setConfirmaEnvio] = useState(false);
  const [confirmaNovoLink, setConfirmaNovoLink] = useState(false);
  const [confirmaCancelamento, setConfirmaCancelamento] = useState(false);
  const [lembrarAberto, setLembrarAberto] = useState(false);

  const podeEnviar = STATUS_COM_ENVIO.includes(status);
  const podeLink = STATUS_COM_LINK.includes(status);
  const podeCancelar = !STATUS_SEM_CANCELAMENTO.includes(status);
  if (!podeLink && !podeCancelar) return null;

  async function enviar() {
    setOcupado("enviar");
    try {
      valorOuErro(await enviarOrdem(ordemId));
      toast.success("Proposta enviada no WhatsApp do cliente, com o mesmo link.");
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "O servidor não confirmou o envio da proposta. Atualize a página e tente novamente.");
    } finally {
      setOcupado(null);
    }
  }

  async function copiar() {
    setOcupado("copiar");
    try {
      const { link, novo } = valorOuErro(await copiarLinkOrdem(ordemId));
      await navigator.clipboard.writeText(link);
      if (novo) toast.warning("Esta ordem era antiga e ganhou um link novo. A partir de agora ele não muda mais ao copiar.");
      else toast.success("Link copiado. É o mesmo link que o cliente já tem.");
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "O navegador bloqueou a cópia. Copie o link manualmente.");
    } finally {
      setOcupado(null);
    }
  }

  async function gerarNovo() {
    setOcupado("novo");
    try {
      const link = valorOuErro(await gerarNovoLink(ordemId));
      await navigator.clipboard.writeText(link);
      toast.success("Novo link gerado e copiado.");
      toast.warning("O link anterior deixou de funcionar. Mande este novo ao cliente.");
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "O servidor não confirmou a geração do link. Atualize a página e tente novamente.");
    } finally {
      setOcupado(null);
    }
  }

  async function cancelar() {
    try {
      valorOuErro(await cancelarOrdem(ordemId));
      toast.success("Ordem cancelada.");
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "O servidor não confirmou o cancelamento. Atualize a página e tente novamente.");
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {podeEnviar ? (
          <Button
            className="h-12 rounded-full px-6"
            disabled={ocupado !== null}
            onClick={() => setConfirmaEnvio(true)}
          >
            {ocupado === "enviar" ? (
              <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
            ) : (
              <MessageCircleIcon aria-hidden strokeWidth={1.5} />
            )}
            {status === "rascunho" ? "Enviar proposta" : "Reenviar proposta"}
          </Button>
        ) : null}
        {podeLink ? (
          <Button
            variant="outline"
            className="h-12 rounded-full px-6"
            disabled={ocupado !== null}
            onClick={() => void copiar()}
          >
            {ocupado === "copiar" ? (
              <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
            ) : (
              <CopyIcon aria-hidden strokeWidth={1.5} />
            )}
            Copiar link
          </Button>
        ) : null}
        {podeLink ? (
          <Button
            variant="ghost"
            className="h-12 rounded-full px-6"
            disabled={ocupado !== null}
            onClick={() => setConfirmaNovoLink(true)}
          >
            <RefreshCwIcon aria-hidden strokeWidth={1.5} />
            Gerar novo link
          </Button>
        ) : null}
        {podeLembrar ? (
          <Button
            variant="outline"
            className="h-12 rounded-full px-6"
            disabled={ocupado !== null}
            onClick={() => setLembrarAberto(true)}
          >
            <BellRingIcon aria-hidden strokeWidth={1.5} />
            Lembrar agora
          </Button>
        ) : null}
        {podeCancelar ? (
          <Button
            variant="destructive"
            className="h-12 rounded-full px-6"
            disabled={ocupado !== null}
            onClick={() => setConfirmaCancelamento(true)}
          >
            <BanIcon aria-hidden strokeWidth={1.5} />
            Cancelar ordem
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmaEnvio}
        onOpenChange={setConfirmaEnvio}
        titulo="Enviar proposta?"
        descricao="A proposta vai para o WhatsApp do cliente com o mesmo link de sempre. Links já enviados continuam funcionando."
        confirmarTexto="Enviar"
        onConfirmar={enviar}
      />

      <ConfirmDialog
        open={confirmaNovoLink}
        onOpenChange={setConfirmaNovoLink}
        titulo="Gerar novo link?"
        descricao="Um novo link será criado e copiado. O link anterior deixa de funcionar na hora: use só se o link vazou ou foi para a pessoa errada."
        confirmarTexto="Gerar e copiar"
        onConfirmar={gerarNovo}
      />

      <LembrarAgoraDialog
        ordemId={lembrarAberto ? ordemId : null}
        onOpenChange={setLembrarAberto}
      />

      <ConfirmDialog
        open={confirmaCancelamento}
        onOpenChange={setConfirmaCancelamento}
        titulo="Cancelar ordem?"
        descricao="A proposta deixará de estar disponível para o cliente. Essa ação não pode ser desfeita."
        confirmarTexto="Cancelar ordem"
        onConfirmar={cancelar}
      />
    </>
  );
}
