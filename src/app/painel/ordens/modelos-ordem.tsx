"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, LoaderCircleIcon, PencilIcon, PowerIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Campo, inputPill } from "@/components/admin/campo";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { formatarCentavos } from "@/components/admin/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  atualizarOrdemModelo,
  desativarOrdemModelo,
  type listarOrdemModelos,
} from "@/modules/ordens/modelos-actions";
import { type listarPlanos } from "@/modules/planos/actions";

export type OrdemModelo = Awaited<ReturnType<typeof listarOrdemModelos>>[number];
type Plano = Awaited<ReturnType<typeof listarPlanos>>[number];

/** Asks the name for "Salvar como modelo"; the caller saves the current form fields. */
export function SalvarModeloDialog({
  open,
  onOpenChange,
  onSalvar,
}: {
  open: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: (nome: string) => Promise<boolean>;
}) {
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!nome.trim()) {
      toast.error("Informe o nome do modelo.");
      return;
    }
    setSalvando(true);
    try {
      if (await onSalvar(nome.trim())) {
        setNome("");
        onOpenChange(false);
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-3xl">
        <DialogHeader>
          <DialogTitle>Salvar como modelo</DialogTitle>
          <DialogDescription className="text-pretty">
            Guarda plano, contrato, valores e condições de pagamento. Cliente e dependentes não
            entram no modelo.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4 pt-4"
          onSubmit={(evento) => {
            evento.preventDefault();
            void salvar();
          }}
        >
          <Campo label="Nome do modelo" htmlFor="ordem-modelo-nome">
            <Input
              id="ordem-modelo-nome"
              autoFocus
              className={inputPill}
              placeholder="Ex.: Plano X com desconto de campanha"
              value={nome}
              maxLength={120}
              onChange={(evento) => setNome(evento.target.value)}
            />
          </Campo>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full px-6"
              disabled={salvando}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="h-12 rounded-full px-6" disabled={salvando}>
              {salvando ? (
                <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
              ) : null}
              Salvar modelo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Rename or deactivate the saved order presets. */
export function GerenciarModelosDialog({
  open,
  onOpenChange,
  modelos,
  planos,
}: {
  open: boolean;
  onOpenChange: (aberto: boolean) => void;
  modelos: OrdemModelo[];
  planos: Plano[];
}) {
  const router = useRouter();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [desativando, setDesativando] = useState<OrdemModelo | null>(null);

  const nomePlano = (id: string | null) =>
    id ? (planos.find((plano) => plano.id === id)?.nome ?? "Plano removido") : "Sem plano";

  async function renomear(id: string) {
    if (!nomeEditado.trim()) {
      toast.error("Informe o nome do modelo.");
      return;
    }
    setSalvando(true);
    try {
      const resultado = await atualizarOrdemModelo(id, { nome: nomeEditado.trim() });
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Modelo renomeado.");
      setEditandoId(null);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarDesativacao() {
    if (!desativando) return;
    const resultado = await desativarOrdemModelo(desativando.id);
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return;
    }
    toast.success("Modelo desativado.");
    router.refresh();
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(aberto) => {
          onOpenChange(aberto);
          if (!aberto) setEditandoId(null);
        }}
      >
        <DialogContent className="gap-0 rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Modelos de proposta</DialogTitle>
            <DialogDescription className="text-pretty">
              Para criar um modelo, preencha a Nova ordem e use Salvar como modelo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pt-4">
            {modelos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum modelo salvo ainda.
              </p>
            ) : (
              modelos.map((modelo) => (
                <div
                  key={modelo.id}
                  className="flex items-center gap-3 rounded-2xl bg-muted/40 px-4 py-3"
                >
                  {editandoId === modelo.id ? (
                    <form
                      className="flex flex-1 items-center gap-2"
                      onSubmit={(evento) => {
                        evento.preventDefault();
                        void renomear(modelo.id);
                      }}
                    >
                      <Input
                        autoFocus
                        aria-label="Novo nome do modelo"
                        className={inputPill}
                        value={nomeEditado}
                        maxLength={120}
                        onChange={(evento) => setNomeEditado(evento.target.value)}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Salvar nome"
                        disabled={salvando}
                      >
                        {salvando ? (
                          <LoaderCircleIcon
                            aria-hidden
                            className="animate-spin"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <CheckIcon aria-hidden strokeWidth={1.5} />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Cancelar"
                        disabled={salvando}
                        onClick={() => setEditandoId(null)}
                      >
                        <XIcon aria-hidden strokeWidth={1.5} />
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium">{modelo.nome}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {nomePlano(modelo.planoId)}
                          {modelo.desconto > 0
                            ? `, desconto de ${formatarCentavos(modelo.desconto)}`
                            : ""}
                          {`, até ${modelo.maxParcelas}x`}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Renomear ${modelo.nome}`}
                        onClick={() => {
                          setEditandoId(modelo.id);
                          setNomeEditado(modelo.nome);
                        }}
                      >
                        <PencilIcon aria-hidden strokeWidth={1.5} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Desativar ${modelo.nome}`}
                        onClick={() => setDesativando(modelo)}
                      >
                        <PowerIcon aria-hidden strokeWidth={1.5} />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full px-6"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={desativando !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setDesativando(null);
        }}
        titulo="Desativar modelo?"
        descricao={`O modelo ${desativando?.nome ?? ""} deixa de aparecer na Nova ordem. As ordens já criadas não mudam.`}
        confirmarTexto="Desativar"
        onConfirmar={confirmarDesativacao}
      />
    </>
  );
}
