"use client";

import { useState } from "react";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  confirmarTexto = "Confirmar",
  onConfirmar,
}: {
  open: boolean;
  onOpenChange: (aberto: boolean) => void;
  titulo: string;
  descricao: string;
  confirmarTexto?: string;
  onConfirmar: () => Promise<void> | void;
}) {
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    setEnviando(true);
    try {
      await onConfirmar();
      onOpenChange(false);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-balance">{titulo}</DialogTitle>
          <DialogDescription className="text-pretty">{descricao}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-full px-6"
            disabled={enviando}
            onClick={() => onOpenChange(false)}
          >
            Voltar
          </Button>
          <Button
            type="button"
            className="h-12 rounded-full px-6"
            disabled={enviando}
            onClick={confirmar}
          >
            {enviando ? (
              <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
            ) : null}
            {confirmarTexto}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
