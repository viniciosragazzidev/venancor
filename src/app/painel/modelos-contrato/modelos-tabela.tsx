"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, PencilIcon, PlusIcon, PowerIcon } from "lucide-react";
import { Controller, useWatch, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Campo, inputPill } from "@/components/admin/campo";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  atualizarContratoModelo,
  criarContratoModelo,
  desativarContratoModelo,
  type listarContratoModelos,
} from "@/modules/contratos/actions";
import { contratoModeloSchema, type ContratoModeloInput } from "@/modules/contratos/schemas";
import { type listarPlanos } from "@/modules/planos/actions";

type Modelo = Awaited<ReturnType<typeof listarContratoModelos>>[number];
type Plano = Awaited<ReturnType<typeof listarPlanos>>[number];

const GENÉRICO = "generico";

const VARIAVEIS = [
  "{{cliente.nome}}",
  "{{cliente.cpf}}",
  "{{plano.nome}}",
  "{{valor.total}}",
  "{{beneficiarios.tabela}}",
  "{{data.hoje}}",
];

export function ModelosTabela({ modelos, planos }: { modelos: Modelo[]; planos: Plano[] }) {
  const router = useRouter();
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Modelo | null>(null);
  const [desativando, setDesativando] = useState<Modelo | null>(null);
  const [enviando, setEnviando] = useState(false);
  const corpoEl = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.input<typeof contratoModeloSchema>>({
    resolver: zodResolver(contratoModeloSchema),
    defaultValues: { nome: "", planoId: null, corpo: "", ativo: true },
  });

  const corpoValor = useWatch({ control, name: "corpo" }) ?? "";
  const corpoCampo = register("corpo");

  function nomePlano(planoId: string | null | undefined): string {
    if (!planoId) return "Genérico";
    return planos.find((plano) => plano.id === planoId)?.nome ?? "—";
  }

  function abrirNovo() {
    setEditando(null);
    reset({ nome: "", planoId: null, corpo: "", ativo: true });
    setFormAberto(true);
  }

  function abrirEdicao(modelo: Modelo) {
    setEditando(modelo);
    reset({ nome: modelo.nome, planoId: modelo.planoId, corpo: modelo.corpo, ativo: modelo.ativo });
    setFormAberto(true);
  }

  function inserirVariavel(variavel: string) {
    const el = corpoEl.current;
    const inicio = el?.selectionStart ?? corpoValor.length;
    const fim = el?.selectionEnd ?? corpoValor.length;
    const novo = `${corpoValor.slice(0, inicio)}${variavel}${corpoValor.slice(fim)}`;
    setValue("corpo", novo, { shouldDirty: true });
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const posicao = inicio + variavel.length;
      el.setSelectionRange(posicao, posicao);
    });
  }

  async function submeter(valores: z.input<typeof contratoModeloSchema>) {
    setEnviando(true);
    try {
      const payload: ContratoModeloInput = {
        ...valores,
        ativo: editando ? editando.ativo : true,
      };
      if (editando) {
        await atualizarContratoModelo(editando.id, payload);
        toast.success("Modelo atualizado.");
      } else {
        await criarContratoModelo(payload);
        toast.success("Modelo criado.");
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
      await desativarContratoModelo(desativando.id);
      toast.success("Modelo desativado.");
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
          Novo modelo
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {modelos.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhum modelo de contrato cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[560px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelos.map((modelo) => (
                    <TableRow key={modelo.id}>
                      <TableCell className="font-medium">{modelo.nome}</TableCell>
                      <TableCell>{nomePlano(modelo.planoId)}</TableCell>
                      <TableCell>
                        <Badge variant={modelo.ativo ? "secondary" : "outline"}>
                          {modelo.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar ${modelo.nome}`}
                            onClick={() => abrirEdicao(modelo)}
                          >
                            <PencilIcon aria-hidden strokeWidth={1.5} />
                          </Button>
                          {modelo.ativo ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Desativar ${modelo.nome}`}
                              onClick={() => setDesativando(modelo)}
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
        <DialogContent variant="form">
          <DialogHeader className="shrink-0 border-b px-6 py-5 pr-16 sm:px-8">
            <DialogTitle>{editando ? "Editar modelo" : "Novo modelo"}</DialogTitle>
            <DialogDescription>
              As variáveis {"{{...}}"} são substituídas pelos dados da proposta.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit(submeter)}
            noValidate
          >
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8">
              <section className="flex flex-col gap-5 rounded-3xl bg-muted/40 p-5 sm:p-6">
                <p className="text-sm font-medium">Dados do modelo</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo label="Nome" htmlFor="modelo-nome" error={errors.nome?.message}>
                    <Input
                      id="modelo-nome"
                      className={inputPill}
                      placeholder="Ex.: Contrato padrão"
                      {...register("nome")}
                    />
                  </Campo>
                  <Campo
                    label="Plano"
                    hint="Genérico vale para qualquer plano."
                    error={errors.planoId?.message}
                  >
                    <Controller
                      control={control}
                      name="planoId"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? GENÉRICO}
                          onValueChange={(valor) =>
                            field.onChange(valor === GENÉRICO ? null : valor)
                          }
                        >
                          <SelectTrigger className={`${inputPill} w-full justify-between`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={GENÉRICO}>Genérico</SelectItem>
                            {planos
                              .filter((plano) => plano.ativo)
                              .map((plano) => (
                                <SelectItem key={plano.id} value={plano.id}>
                                  {plano.nome}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Campo>
                </div>

                <Campo
                  label="Corpo do contrato"
                  htmlFor="modelo-corpo"
                  error={errors.corpo?.message}
                >
                  <Textarea
                    id="modelo-corpo"
                    {...corpoCampo}
                    ref={(el) => {
                      corpoEl.current = el;
                      corpoCampo.ref(el);
                    }}
                    className="min-h-56 rounded-3xl px-5 py-4 font-mono text-sm"
                    placeholder="Contrato de adesão ao plano {{plano.nome}}..."
                  />
                </Campo>
              </section>
              <section className="rounded-3xl bg-muted/40 p-5 sm:p-6">
                <p className="text-sm font-medium">Variáveis disponíveis</p>
                <p className="text-xs text-muted-foreground">
                  Clique para inserir no cursor do texto.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {VARIAVEIS.map((variavel) => (
                    <button
                      key={variavel}
                      type="button"
                      className="rounded-full border bg-card px-3 py-1.5 font-mono text-xs transition-colors hover:border-primary hover:text-primary"
                      onClick={() => inserirVariavel(variavel)}
                    >
                      {variavel}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-popover px-6 py-4 sm:px-8">
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
                {editando ? "Salvar alterações" : "Criar modelo"}
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
        titulo="Desativar modelo?"
        descricao={`O modelo ${desativando?.nome ?? ""} não estará mais disponível para novos contratos.`}
        confirmarTexto="Desativar"
        onConfirmar={confirmarDesativacao}
      />
    </div>
  );
}
