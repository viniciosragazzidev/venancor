"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { valorOuErro } from "@/lib/resultado-acao";
import { excluirOrdensEmMassa } from "@/modules/ordens/actions";

/**
 * Exclusão de uma ordem cancelada (item 2, 11/11). Mesma regra do lote: bloqueada se houver pagamento,
 * assinatura ou aceite. Quando bloqueada, o botão continua visível e explica o motivo.
 */
export function ExcluirOrdemCancelada({ ordemId, numero, bloqueio }: { ordemId: string; numero: number; bloqueio: string | null }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  async function excluir() {
    setOcupado(true);
    try {
      const resultado = valorOuErro(await excluirOrdensEmMassa([ordemId]));
      if (resultado.excluidas.length) {
        toast.success(`Ordem #${numero} excluída. O histórico de auditoria foi mantido.`);
        router.push("/painel/ordens");
        router.refresh();
        return;
      }
      toast.error(resultado.puladas[0]?.motivo ?? "A ordem não pôde ser excluída.");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível excluir a ordem. Tente de novo.");
    } finally {
      setOcupado(false);
      setConfirmando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="destructive"
        className="h-12 w-max rounded-full px-6"
        disabled={bloqueio !== null || ocupado}
        onClick={() => setConfirmando(true)}
      >
        <Trash2Icon aria-hidden strokeWidth={1.5} />
        Excluir ordem
      </Button>
      {bloqueio ? (
        <p role="note" className="text-sm text-muted-foreground">
          Não é possível excluir: {bloqueio}
        </p>
      ) : null}

      <ConfirmDialog
        open={confirmando}
        onOpenChange={setConfirmando}
        titulo={`Excluir a ordem #${numero}?`}
        descricao="A ordem cancelada sai da lista. O histórico de auditoria é mantido. Essa ação não pode ser desfeita."
        confirmarTexto="Excluir ordem"
        onConfirmar={excluir}
      />
    </div>
  );
}
