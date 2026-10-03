"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BanIcon, CopyIcon, LoaderCircleIcon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cancelarOrdem, copiarLinkOrdem, enviarOrdem } from "@/modules/ordens/actions";

const STATUS_COM_LINK = ["rascunho", "enviada", "visualizada"];
const STATUS_SEM_CANCELAMENTO = ["paga", "expirada", "cancelada"];

export function OrdemAcoes({ ordemId, status }: { ordemId: string; status: string }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState<"enviar" | "copiar" | null>(null);
  const [confirmaEnvio, setConfirmaEnvio] = useState(false);
  const [confirmaCopia, setConfirmaCopia] = useState(false);
  const [confirmaCancelamento, setConfirmaCancelamento] = useState(false);

  const podeLink = STATUS_COM_LINK.includes(status);
  const podeCancelar = !STATUS_SEM_CANCELAMENTO.includes(status);
  if (!podeLink && !podeCancelar) return null;

  async function enviar() {
    setOcupado("enviar");
    try {
      await enviarOrdem(ordemId);
      toast.success("Proposta enviada no WhatsApp do cliente.");
      toast.warning("Um novo link foi gerado — o link anterior deixou de funcionar.");
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível enviar.");
    } finally {
      setOcupado(null);
    }
  }

  async function copiar() {
    setOcupado("copiar");
    try {
      const link = await copiarLinkOrdem(ordemId);
      await navigator.clipboard.writeText(link);
      toast.success("Novo link copiado para a área de transferência.");
      toast.warning("O link anterior foi invalidado — compartilhe somente este novo link.");
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível gerar o link.");
    } finally {
      setOcupado(null);
    }
  }

  async function cancelar() {
    try {
      await cancelarOrdem(ordemId);
      toast.success("Ordem cancelada.");
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível cancelar.");
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {podeLink ? (
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
            onClick={() => setConfirmaCopia(true)}
          >
            <CopyIcon aria-hidden strokeWidth={1.5} />
            Copiar link
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
        descricao="Um novo link será gerado e enviado no WhatsApp do cliente. Qualquer link anterior deixará de funcionar."
        confirmarTexto="Enviar"
        onConfirmar={enviar}
      />

      <ConfirmDialog
        open={confirmaCopia}
        onOpenChange={setConfirmaCopia}
        titulo="Gerar novo link?"
        descricao="Um novo link será criado e copiado. O link anterior é invalidado imediatamente: se você já o compartilhou com o cliente, ele deixa de funcionar."
        confirmarTexto="Gerar e copiar"
        onConfirmar={copiar}
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
