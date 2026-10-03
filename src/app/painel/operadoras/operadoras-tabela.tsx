"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, PencilIcon, PlusIcon, PowerIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Campo, inputPill } from "@/components/admin/campo";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { formatarCNPJ, mascaraCNPJ } from "@/components/admin/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  atualizarOperadora,
  criarOperadora,
  desativarOperadora,
  type listarOperadoras,
} from "@/modules/planos/actions";
import { operadoraSchema, type OperadoraInput } from "@/modules/planos/schemas";

type Operadora = Awaited<ReturnType<typeof listarOperadoras>>[number];

export function OperadorasTabela({ dados }: { dados: Operadora[] }) {
  const router = useRouter();
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Operadora | null>(null);
  const [desativando, setDesativando] = useState<Operadora | null>(null);
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof operadoraSchema>>({
    resolver: zodResolver(operadoraSchema),
    defaultValues: { nome: "", cnpj: "", registroAns: "", ativa: true },
  });

  function abrirNovo() {
    setEditando(null);
    reset({ nome: "", cnpj: "", registroAns: "", ativa: true });
    setFormAberto(true);
  }

  function abrirEdicao(operadora: Operadora) {
    setEditando(operadora);
    reset({
      nome: operadora.nome,
      cnpj: mascaraCNPJ(operadora.cnpj),
      registroAns: operadora.registroAns,
      ativa: operadora.ativa,
    });
    setFormAberto(true);
  }

  async function submeter(valores: z.input<typeof operadoraSchema>) {
    setEnviando(true);
    try {
      if (editando) {
        await atualizarOperadora(editando.id, valores);
        toast.success("Operadora atualizada.");
      } else {
        await criarOperadora(valores as OperadoraInput);
        toast.success("Operadora criada.");
      }
      setFormAberto(false);
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar.");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarDesativacao() {
    if (!desativando) return;
    try {
      await desativarOperadora(desativando.id);
      toast.success("Operadora desativada.");
      setDesativando(null);
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível desativar.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button className="h-12 rounded-full px-6" onClick={abrirNovo}>
          <PlusIcon aria-hidden strokeWidth={1.5} />
          Nova operadora
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {dados.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma operadora cadastrada ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Registro ANS</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.map((operadora) => (
                    <TableRow key={operadora.id}>
                      <TableCell className="font-medium">{operadora.nome}</TableCell>
                      <TableCell className="tabular-nums">{formatarCNPJ(operadora.cnpj)}</TableCell>
                      <TableCell className="tabular-nums">{operadora.registroAns}</TableCell>
                      <TableCell>
                        <Badge variant={operadora.ativa ? "secondary" : "outline"}>
                          {operadora.ativa ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar ${operadora.nome}`}
                            onClick={() => abrirEdicao(operadora)}
                          >
                            <PencilIcon aria-hidden strokeWidth={1.5} />
                          </Button>
                          {operadora.ativa ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Desativar ${operadora.nome}`}
                              onClick={() => setDesativando(operadora)}
                            >
                              <PowerIcon aria-hidden strokeWidth={1.5} />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formAberto} onOpenChange={setFormAberto}>
        <DialogContent className="gap-0 rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar operadora" : "Nova operadora"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Atualize os dados cadastrais da operadora."
                : "Cadastre a operadora com CNPJ e registro ANS."}
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4 pt-4" onSubmit={handleSubmit(submeter)} noValidate>
            <Campo label="Nome" htmlFor="operadora-nome" error={errors.nome?.message}>
              <Input
                id="operadora-nome"
                className={inputPill}
                placeholder="Ex.: Amil"
                {...register("nome")}
              />
            </Campo>
            <Campo label="CNPJ" htmlFor="operadora-cnpj" error={errors.cnpj?.message}>
              <Input
                id="operadora-cnpj"
                className={`${inputPill} tabular-nums`}
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
                {...register("cnpj", {
                  onChange: (evento) => {
                    evento.target.value = mascaraCNPJ(evento.target.value);
                  },
                })}
              />
            </Campo>
            <Campo label="Registro ANS" htmlFor="operadora-ans" error={errors.registroAns?.message}>
              <Input
                id="operadora-ans"
                className={`${inputPill} tabular-nums`}
                placeholder="Ex.: 000000"
                {...register("registroAns")}
              />
            </Campo>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full px-6"
                disabled={enviando}
                onClick={() => setFormAberto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="h-12 rounded-full px-6" disabled={enviando}>
                {enviando ? (
                  <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
                ) : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={desativando !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setDesativando(null);
        }}
        titulo="Desativar operadora?"
        descricao={`A operadora ${desativando?.nome ?? ""} deixará de aparecer para novos planos. Você pode reativar depois.`}
        confirmarTexto="Desativar"
        onConfirmar={confirmarDesativacao}
      />
    </div>
  );
}
