"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { lembrarAgora } from "@/modules/lembretes/actions";

/** Confirmation + send of a manual reminder (template lembrete_proposta). */
export function LembrarAgoraDialog({
  ordemId,
  onOpenChange,
}: {
  ordemId: string | null;
  onOpenChange: (aberto: boolean) => void;
}) {
  const router = useRouter();

  async function lembrar() {
    if (!ordemId) return;
    try {
      const resultado = await lembrarAgora(ordemId);
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Lembrete enviado no WhatsApp do cliente.");
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível enviar o lembrete.");
    }
  }

  return (
    <ConfirmDialog
      open={ordemId !== null}
      onOpenChange={onOpenChange}
      titulo="Lembrar o cliente agora?"
      descricao="O cliente recebe um lembrete no WhatsApp com um link novo (o link anterior deixa de funcionar). Cada ordem recebe no máximo 2 lembretes."
      confirmarTexto="Enviar lembrete"
      onConfirmar={lembrar}
    />
  );
}
