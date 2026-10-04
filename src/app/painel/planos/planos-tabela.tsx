"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, PencilIcon, PlusIcon, PowerIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Campo, inputPill } from "@/components/admin/campo";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { formatarCentavos, parseMoeda, rotulo } from "@/components/admin/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  atualizarPlano,
  criarPlano,
  desativarPlano,
  listarPrecos,
  listarPlanos,
  type listarOperadoras,
} from "@/modules/planos/actions";
import { faixasEtarias, planoSchema, type PlanoInput } from "@/modules/planos/schemas";

type Plano = Awaited<ReturnType<typeof listarPlanos>>[number];
type Operadora = Awaited<ReturnType<typeof listarOperadoras>>[number];

const formSchema = planoSchema.omit({ precos: true, taxaAdesao: true });
type FormValores = z.input<typeof formSchema>;

export function PlanosTabela({ planos, operadoras }: { planos: Plano[]; operadoras: Operadora[] }) {
  const router = useRouter();
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Plano | null>(null);
  const [desativando, setDesativando] = useState<Plano | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [carregandoId, setCarregandoId] = useState<string | null>(null);
  const [taxaTexto, setTaxaTexto] = useState("");
  const [precosTexto, setPrecosTexto] = useState<string[]>(() => faixasEtarias.map(() => ""));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValores>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operadoraId: "",
      nome: "",
      codigo: "",
      segmentacao: "ambulatorial",
      acomodacao: "enfermaria",
      abrangencia: "municipal",
      tipoContratacao: "individual",
      coparticipacao: false,
      carencias: "",
      coberturas: "",
      redeCredenciada: "",
      ativo: true,
    },
  });

  const nomeOperadora = (id: string) =>
    operadoras.find((operadora) => operadora.id === id)?.nome ?? "—";

  function abrirNovo() {
    setEditando(null);
    reset({
      operadoraId: operadoras[0]?.id ?? "",
      nome: "",
      codigo: "",
      segmentacao: "ambulatorial",
      acomodacao: "enfermaria",
      abrangencia: "municipal",
      tipoContratacao: "individual",
      coparticipacao: false,
      carencias: "",
      coberturas: "",
      redeCredenciada: "",
      ativo: true,
    });
    setTaxaTexto("");
    setPrecosTexto(faixasEtarias.map(() => ""));
    setFormAberto(true);
  }

  async function abrirEdicao(plano: Plano) {
    setCarregandoId(plano.id);
    try {
      const precos = await listarPrecos(plano.id);
      const porFaixa = new Map(precos.map((preco) => [preco.faixaEtaria, preco.valor]));
      setEditando(plano);
      reset({
        operadoraId: plano.operadoraId,
        nome: plano.nome,
        codigo: plano.codigo,
        segmentacao: plano.segmentacao,
        acomodacao: plano.acomodacao,
        abrangencia: plano.abrangencia,
        tipoContratacao: plano.tipoContratacao,
        coparticipacao: plano.coparticipacao,
        carencias: plano.carencias,
        coberturas: plano.coberturas,
        redeCredenciada: plano.redeCredenciada,
        ativo: plano.ativo,
      });
      setTaxaTexto(formatarCentavos(plano.taxaAdesao));
      setPrecosTexto(
        faixasEtarias.map((faixa) => {
          const valor = porFaixa.get(faixa);
          return valor === undefined ? "" : formatarCentavos(valor);
        }),
      );
      setFormAberto(true);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível carregar os preços.");
    } finally {
      setCarregandoId(null);
    }
  }

  async function submeter(valores: FormValores) {
    const taxa = parseMoeda(taxaTexto);
    if (taxa === null) {
      toast.error("Informe uma taxa de adesão válida (ou 0).");
      return;
    }
    const precos = faixasEtarias.map((faixaEtaria, indice) => {
      const valor = parseMoeda(precosTexto[indice] ?? "");
      return valor === null ? null : { faixaEtaria, valor };
    });
    if (precos.some((preco) => preco === null)) {
      toast.error("Preencha os valores das 10 faixas etárias.");
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        ...valores,
        taxaAdesao: taxa,
        precos: precos as { faixaEtaria: (typeof faixasEtarias)[number]; valor: number }[],
        ativo: editando ? editando.ativo : true,
      } satisfies PlanoInput;
      if (editando) {
        await atualizarPlano(editando.id, payload);
        toast.success("Plano atualizado.");
      } else {
        await criarPlano(payload);
        toast.success("Plano criado.");
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
      await desativarPlano(desativando.id);
      toast.success("Plano desativado.");
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
          Novo plano
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {planos.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhum plano cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Plano</TableHead>
                    <TableHead>Operadora</TableHead>
                    <TableHead>Segmentação</TableHead>
                    <TableHead>Adesão</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planos.map((plano) => (
                    <TableRow key={plano.id}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{plano.nome}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {plano.codigo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{nomeOperadora(plano.operadoraId)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{rotulo(plano.segmentacao)}</Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatarCentavos(plano.taxaAdesao)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={plano.ativo ? "secondary" : "outline"}>
                          {plano.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar ${plano.nome}`}
                            disabled={carregandoId === plano.id}
                            onClick={() => void abrirEdicao(plano)}
                          >
                            {carregandoId === plano.id ? (
                              <LoaderCircleIcon
                                aria-hidden
                                className="animate-spin"
                                strokeWidth={1.5}
                              />
                            ) : (
                              <PencilIcon aria-hidden strokeWidth={1.5} />
                            )}
                          </Button>
                          {plano.ativo ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Desativar ${plano.nome}`}
                              onClick={() => setDesativando(plano)}
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
        <DialogContent variant="form" className="sm:max-w-4xl">
          <DialogHeader className="shrink-0 border-b px-6 py-5 pr-16 sm:px-8">
            <DialogTitle>{editando ? "Editar plano" : "Novo plano"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Atualize os dados e a tabela de preços do plano."
                : "Cadastre o plano e a mensalidade de cada faixa etária."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit(submeter)}
            noValidate
          >
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8">
              <section className="flex flex-col gap-5 rounded-3xl bg-muted/40 p-5 sm:p-6">
                <p className="text-sm font-medium">Dados do plano</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo
                    label="Operadora"
                    htmlFor="plano-operadora"
                    error={errors.operadoraId?.message}
                  >
                    <Controller
                      control={control}
                      name="operadoraId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="plano-operadora"
                            className={`${inputPill} w-full justify-between`}
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {operadoras
                              .filter(
                                (operadora) => operadora.ativa || operadora.id === field.value,
                              )
                              .map((operadora) => (
                                <SelectItem key={operadora.id} value={operadora.id}>
                                  {operadora.nome}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Campo>
                  <Campo label="Nome do plano" htmlFor="plano-nome" error={errors.nome?.message}>
                    <Input
                      id="plano-nome"
                      className={inputPill}
                      placeholder="Ex.: Enfermaria"
                      {...register("nome")}
                    />
                  </Campo>
                  <Campo label="Código" htmlFor="plano-codigo" error={errors.codigo?.message}>
                    <Input
                      id="plano-codigo"
                      className={inputPill}
                      placeholder="Ex.: PL-001"
                      {...register("codigo")}
                    />
                  </Campo>
                  <Campo
                    label="Taxa de adesão"
                    htmlFor="plano-adesao"
                    hint="Em reais. Use 0 se não houver."
                  >
                    <Input
                      id="plano-adesao"
                      className={`${inputPill} tabular-nums`}
                      inputMode="decimal"
                      placeholder="R$ 0,00"
                      value={taxaTexto}
                      onChange={(evento) => setTaxaTexto(evento.target.value)}
                    />
                  </Campo>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo label="Segmentação" error={errors.segmentacao?.message}>
                    <Controller
                      control={control}
                      name="segmentacao"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={`${inputPill} w-full justify-between`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {planoSchema.shape.segmentacao.options.map((opcao) => (
                              <SelectItem key={opcao} value={opcao}>
                                {rotulo(opcao)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Campo>
                  <Campo label="Acomodação" error={errors.acomodacao?.message}>
                    <Controller
                      control={control}
                      name="acomodacao"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={`${inputPill} w-full justify-between`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {planoSchema.shape.acomodacao.options.map((opcao) => (
                              <SelectItem key={opcao} value={opcao}>
                                {rotulo(opcao)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Campo>
                  <Campo label="Abrangência" error={errors.abrangencia?.message}>
                    <Controller
                      control={control}
                      name="abrangencia"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={`${inputPill} w-full justify-between`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {planoSchema.shape.abrangencia.options.map((opcao) => (
                              <SelectItem key={opcao} value={opcao}>
                                {rotulo(opcao)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Campo>
                  <Campo label="Tipo de contratação" error={errors.tipoContratacao?.message}>
                    <Controller
                      control={control}
                      name="tipoContratacao"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={`${inputPill} w-full justify-between`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {planoSchema.shape.tipoContratacao.options.map((opcao) => (
                              <SelectItem key={opcao} value={opcao}>
                                {rotulo(opcao)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Campo>
                </div>

                <Campo
                  label="Carências"
                  htmlFor="plano-carencias"
                  error={errors.carencias?.message}
                >
                  <Textarea
                    id="plano-carencias"
                    className="min-h-20 rounded-3xl px-5 py-3.5 text-sm"
                    placeholder="Ex.: 24 horas para urgência e emergência; 180 dias para parto..."
                    {...register("carencias")}
                  />
                </Campo>
                <Campo
                  label="Coberturas"
                  htmlFor="plano-coberturas"
                  error={errors.coberturas?.message}
                >
                  <Textarea
                    id="plano-coberturas"
                    className="min-h-20 rounded-3xl px-5 py-3.5 text-sm"
                    placeholder="Procedimentos e benefícios cobertos pelo plano..."
                    {...register("coberturas")}
                  />
                </Campo>
                <Campo
                  label="Rede credenciada"
                  htmlFor="plano-rede"
                  error={errors.redeCredenciada?.message}
                >
                  <Textarea
                    id="plano-rede"
                    className="min-h-20 rounded-3xl px-5 py-3.5 text-sm"
                    placeholder="Como consultar a rede de prestadores..."
                    {...register("redeCredenciada")}
                  />
                </Campo>

                <label className="flex cursor-pointer items-center gap-3 rounded-3xl border bg-muted/40 px-5 py-4 text-sm">
                  <Controller
                    control={control}
                    name="coparticipacao"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(valor) => field.onChange(valor === true)}
                      />
                    )}
                  />
                  <span>
                    <span className="font-medium">Coparticipação</span>
                    <span className="block text-xs text-muted-foreground">
                      O cliente paga um valor por atendimento, além da mensalidade.
                    </span>
                  </span>
                </label>
              </section>
              <section className="rounded-3xl bg-muted/40 p-5 sm:p-6">
                <p className="text-sm font-medium">Mensalidade por faixa etária</p>
                <p className="text-xs text-muted-foreground">
                  Informe o valor das 10 faixas ANS em reais.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {faixasEtarias.map((faixa, indice) => (
                    <div key={faixa} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-sm text-muted-foreground tabular-nums">
                        {faixa}
                      </span>
                      <Input
                        aria-label={`Valor da faixa ${faixa}`}
                        className="h-11 flex-1 rounded-full px-4 tabular-nums"
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        value={precosTexto[indice]}
                        onChange={(evento) =>
                          setPrecosTexto((atual) =>
                            atual.map((valor, posicao) =>
                              posicao === indice ? evento.target.value : valor,
                            ),
                          )
                        }
                      />
                    </div>
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
                {editando ? "Salvar alterações" : "Criar plano"}
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
        titulo="Desativar plano?"
        descricao={`O plano ${desativando?.nome ?? ""} deixará de estar disponível para novas propostas.`}
        confirmarTexto="Desativar"
        onConfirmar={confirmarDesativacao}
      />
    </div>
  );
}
