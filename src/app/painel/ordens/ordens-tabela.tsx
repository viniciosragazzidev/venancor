"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  LoaderCircleIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Campo, inputPill } from "@/components/admin/campo";
import { formatarCentavos, parseMoeda } from "@/components/admin/format";
import {
  classesStatusOrdem,
  formatarDataHora,
  rotuloStatusOrdem,
} from "@/components/admin/status-ordem";
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
import { listarDependentes, type listarClientes } from "@/modules/clientes/actions";
import { criarOrdem, type listarOrdens } from "@/modules/ordens/actions";
import { criarOrdemSchema, type CriarOrdemInput } from "@/modules/ordens/schemas";
import { type listarPlanos } from "@/modules/planos/actions";

type Ordem = Awaited<ReturnType<typeof listarOrdens>>[number];
type Cliente = Awaited<ReturnType<typeof listarClientes>>[number];
type Plano = Awaited<ReturnType<typeof listarPlanos>>[number];
type Dependente = Awaited<ReturnType<typeof listarDependentes>>[number];

const resolverSchema = criarOrdemSchema.omit({
  dependenteIds: true,
  formasPagamento: true,
  desconto: true,
  valorPersonalizado: true,
  contratoModeloId: true,
});
type FormValores = z.input<typeof resolverSchema>;

const TIPOS_VALOR = [
  { valor: "primeira_mensalidade_adesao", rotulo: "1ª mensalidade + adesão" },
  { valor: "total_adesao_mensalidade_so", rotulo: "Adesão + mensalidades" },
  { valor: "adesao_so", rotulo: "Somente adesão" },
  { valor: "mensalidade_so", rotulo: "Somente mensalidade" },
  { valor: "personalizado", rotulo: "Valor personalizado" },
] as const;

const FORMAS = ["pix", "boleto", "cartao"] as const;

export function OrdensTabela({
  ordens,
  clientes,
  planos,
}: {
  ordens: Ordem[];
  clientes: Cliente[];
  planos: Plano[];
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [vista, setVista] = useState<"form" | "sucesso">("form");
  const [linkCriado, setLinkCriado] = useState<string | null>(null);
  const [ordemCriadaId, setOrdemCriadaId] = useState<string | null>(null);

  const [deps, setDeps] = useState<Dependente[]>([]);
  const [depsIds, setDepsIds] = useState<string[]>([]);
  const [carregandoDeps, setCarregandoDeps] = useState(false);
  const [formas, setFormas] = useState<string[]>([...FORMAS]);
  const [descontoTexto, setDescontoTexto] = useState("");
  const [personalizadoTexto, setPersonalizadoTexto] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValores>({
    resolver: zodResolver(resolverSchema),
    defaultValues: {
      clienteId: clientes[0]?.id ?? "",
      planoId: planos.find((plano) => plano.ativo)?.id ?? "",
      valorCobradoTipo: "primeira_mensalidade_adesao",
      descontoObs: "",
      maxParcelas: 1,
      validadeDias: 7,
    },
  });

  const tipoValor = useWatch({ control, name: "valorCobradoTipo" });

  const nomeCliente = (id: string) => clientes.find((cliente) => cliente.id === id)?.nome ?? "—";
  const nomePlano = (id: string) => planos.find((plano) => plano.id === id)?.nome ?? "—";

  const filtradas = ordens.filter((ordem) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    return (
      nomeCliente(ordem.clienteId).toLowerCase().includes(termo) ||
      nomePlano(ordem.planoId).toLowerCase().includes(termo) ||
      rotuloStatusOrdem(ordem.status).toLowerCase().includes(termo)
    );
  });

  function abrirNovo() {
    reset({
      clienteId: clientes[0]?.id ?? "",
      planoId: planos.find((plano) => plano.ativo)?.id ?? "",
      valorCobradoTipo: "primeira_mensalidade_adesao",
      descontoObs: "",
      maxParcelas: 1,
      validadeDias: 7,
    });
    setDeps([]);
    setDepsIds([]);
    setFormas([...FORMAS]);
    setDescontoTexto("");
    setPersonalizadoTexto("");
    setVista("form");
    setLinkCriado(null);
    setOrdemCriadaId(null);
    setFormAberto(true);
  }

  async function carregarDependentes(clienteId: string) {
    setDepsIds([]);
    if (!clienteId) {
      setDeps([]);
      return;
    }
    setCarregandoDeps(true);
    try {
      setDeps(await listarDependentes(clienteId));
    } catch {
      setDeps([]);
    } finally {
      setCarregandoDeps(false);
    }
  }

  async function submeter(valores: FormValores) {
    if (formas.length === 0) {
      toast.error("Informe ao menos uma forma de pagamento.");
      return;
    }
    const desconto = parseMoeda(descontoTexto) ?? 0;
    let valorPersonalizado: number | undefined;
    if (valores.valorCobradoTipo === "personalizado") {
      const centavos = parseMoeda(personalizadoTexto);
      if (centavos === null) {
        toast.error("Informe o valor personalizado.");
        return;
      }
      valorPersonalizado = centavos;
    }
    const payload: CriarOrdemInput = {
      clienteId: valores.clienteId,
      planoId: valores.planoId,
      dependenteIds: depsIds,
      desconto,
      descontoObs: valores.descontoObs?.trim() || undefined,
      valorCobradoTipo: valores.valorCobradoTipo,
      valorPersonalizado,
      formasPagamento: [...formas] as CriarOrdemInput["formasPagamento"],
      maxParcelas: valores.maxParcelas,
      validadeDias: valores.validadeDias,
    };
    setEnviando(true);
    try {
      const { ordem, link } = await criarOrdem(payload);
      setOrdemCriadaId(ordem.id);
      setLinkCriado(link);
      setVista("sucesso");
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível criar a ordem.");
    } finally {
      setEnviando(false);
    }
  }

  async function copiarLink() {
    if (!linkCriado) return;
    try {
      await navigator.clipboard.writeText(linkCriado);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            aria-hidden
            strokeWidth={1.5}
            className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Buscar ordens"
            className={`${inputPill} pl-12`}
            placeholder="Buscar por cliente, plano ou status"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        <Button className="h-12 w-full rounded-full px-6 sm:w-auto" onClick={abrirNovo}>
          <PlusIcon aria-hidden strokeWidth={1.5} />
          Nova ordem
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {filtradas.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              {ordens.length === 0 ? "Nenhuma ordem criada ainda." : "Nenhuma ordem encontrada."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Cobrado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((ordem) => (
                    <TableRow key={ordem.id}>
                      <TableCell className="font-medium">{nomeCliente(ordem.clienteId)}</TableCell>
                      <TableCell>{nomePlano(ordem.planoId)}</TableCell>
                      <TableCell className="tabular-nums">
                        {formatarCentavos(ordem.valorCobrado)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={classesStatusOrdem(ordem.status)}>
                          {rotuloStatusOrdem(ordem.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatarDataHora(ordem.expiraEm)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Ver ordem de ${nomeCliente(ordem.clienteId)}`}
                            onClick={() => router.push(`/painel/ordens/${ordem.id}`)}
                          >
                            <ChevronRightIcon aria-hidden strokeWidth={1.5} />
                          </Button>
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

      <Dialog
        open={formAberto}
        onOpenChange={(aberto) => {
          setFormAberto(aberto);
          if (!aberto) setVista("form");
        }}
      >
        <DialogContent
          variant={vista === "form" ? "form" : "default"}
          className={vista === "form" ? "sm:max-w-4xl" : undefined}
        >
          {vista === "sucesso" ? (
            <>
              <DialogHeader>
                <DialogTitle>Ordem criada</DialogTitle>
                <DialogDescription className="text-pretty">
                  A proposta está pronta. Compartilhe o link com o cliente ou envie depois pela tela
                  de detalhe.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-4">
                <p className="text-sm text-muted-foreground">Link da proposta:</p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    aria-label="Link da proposta"
                    className={`${inputPill} font-mono text-xs`}
                    value={linkCriado ?? ""}
                    onFocus={(evento) => evento.target.select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 shrink-0 rounded-full px-5"
                    onClick={() => void copiarLink()}
                  >
                    <CopyIcon aria-hidden strokeWidth={1.5} />
                    <span className="sr-only sm:not-sr-only">Copiar</span>
                  </Button>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full px-6"
                  onClick={() => setFormAberto(false)}
                >
                  Fechar
                </Button>
                <Button
                  type="button"
                  className="h-12 rounded-full px-6"
                  onClick={() => {
                    setFormAberto(false);
                    if (ordemCriadaId) router.push(`/painel/ordens/${ordemCriadaId}`);
                  }}
                >
                  Ver detalhe
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="shrink-0 border-b px-6 py-5 pr-16 sm:px-8">
                <DialogTitle>Nova ordem</DialogTitle>
                <DialogDescription>
                  Escolha o cliente, o plano e as condições da proposta.
                </DialogDescription>
              </DialogHeader>
              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={handleSubmit(submeter)}
                noValidate
              >
                <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8">
                  <section className="flex flex-col gap-5 rounded-3xl bg-muted/40 p-5 sm:p-6">
                    <p className="text-sm font-medium">Proposta</p>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Campo
                        label="Cliente"
                        htmlFor="ordem-cliente"
                        error={errors.clienteId?.message}
                      >
                        <Controller
                          control={control}
                          name="clienteId"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={(valor) => {
                                if (!valor) return;
                                field.onChange(valor);
                                void carregarDependentes(valor);
                              }}
                            >
                              <SelectTrigger
                                id="ordem-cliente"
                                className={`${inputPill} w-full justify-between`}
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {clientes.map((cliente) => (
                                  <SelectItem key={cliente.id} value={cliente.id}>
                                    {cliente.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </Campo>
                      <Campo label="Plano" htmlFor="ordem-plano" error={errors.planoId?.message}>
                        <Controller
                          control={control}
                          name="planoId"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger
                                id="ordem-plano"
                                className={`${inputPill} w-full justify-between`}
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {planos
                                  .filter((plano) => plano.ativo || plano.id === field.value)
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

                    <div className="rounded-3xl border bg-muted/40 p-4">
                      <p className="text-sm font-medium">Beneficiários</p>
                      <p className="text-xs text-muted-foreground">
                        O titular entra automaticamente. Marque os dependentes que vão na proposta.
                      </p>
                      <div className="mt-3 flex flex-col gap-2">
                        {carregandoDeps ? (
                          <p className="py-2 text-sm text-muted-foreground">Carregando...</p>
                        ) : deps.length === 0 ? (
                          <p className="py-2 text-sm text-muted-foreground">
                            Este cliente não tem dependentes cadastrados.
                          </p>
                        ) : (
                          deps.map((dependente) => (
                            <label
                              key={dependente.id}
                              className="flex cursor-pointer items-center gap-3 rounded-2xl bg-card px-4 py-3 text-sm"
                            >
                              <Checkbox
                                checked={depsIds.includes(dependente.id)}
                                onCheckedChange={(valor) =>
                                  setDepsIds((atual) =>
                                    valor === true
                                      ? [...atual, dependente.id]
                                      : atual.filter((id) => id !== dependente.id),
                                  )
                                }
                              />
                              <span className="font-medium">{dependente.nome}</span>
                              <span className="text-xs text-muted-foreground">
                                {dependente.nascimento.split("-").reverse().join("/")}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="flex flex-col gap-5 rounded-3xl bg-muted/40 p-5 sm:p-6">
                    <p className="text-sm font-medium">Valores</p>
                    <Campo label="O que será cobrado" error={errors.valorCobradoTipo?.message}>
                      <Controller
                        control={control}
                        name="valorCobradoTipo"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className={`${inputPill} w-full justify-between`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIPOS_VALOR.map((tipo) => (
                                <SelectItem key={tipo.valor} value={tipo.valor}>
                                  {tipo.rotulo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Campo>
                    {tipoValor === "personalizado" ? (
                      <Campo label="Valor personalizado" htmlFor="ordem-personalizado">
                        <Input
                          id="ordem-personalizado"
                          className={`${inputPill} tabular-nums`}
                          inputMode="decimal"
                          placeholder="R$ 0,00"
                          value={personalizadoTexto}
                          onChange={(evento) => setPersonalizadoTexto(evento.target.value)}
                        />
                      </Campo>
                    ) : null}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Campo label="Desconto" htmlFor="ordem-desconto" hint="Em reais.">
                        <Input
                          id="ordem-desconto"
                          className={`${inputPill} tabular-nums`}
                          inputMode="decimal"
                          placeholder="R$ 0,00"
                          value={descontoTexto}
                          onChange={(evento) => setDescontoTexto(evento.target.value)}
                        />
                      </Campo>
                      <Campo
                        label="Observação do desconto"
                        htmlFor="ordem-desconto-obs"
                        error={errors.descontoObs?.message}
                      >
                        <Input
                          id="ordem-desconto-obs"
                          className={inputPill}
                          placeholder="Ex.: campanha de retorno"
                          {...register("descontoObs")}
                        />
                      </Campo>
                    </div>
                  </section>

                  <section className="flex flex-col gap-5 rounded-3xl bg-muted/40 p-5 sm:p-6">
                    <p className="text-sm font-medium">Condições de pagamento</p>
                    <div className="flex flex-wrap gap-2">
                      {FORMAS.map((forma) => (
                        <label
                          key={forma}
                          className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
                            formas.includes(forma)
                              ? "border-primary bg-primary/10 text-primary"
                              : "bg-card"
                          }`}
                        >
                          <Checkbox
                            checked={formas.includes(forma)}
                            onCheckedChange={(valor) =>
                              setFormas((atual) =>
                                valor === true
                                  ? [...atual, forma]
                                  : atual.filter((item) => item !== forma),
                              )
                            }
                          />
                          {forma === "pix" ? "Pix" : forma === "boleto" ? "Boleto" : "Cartão"}
                        </label>
                      ))}
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Campo
                        label="Máximo de parcelas"
                        htmlFor="ordem-parcelas"
                        error={errors.maxParcelas?.message}
                      >
                        <Input
                          id="ordem-parcelas"
                          type="number"
                          min={1}
                          max={12}
                          className={`${inputPill} tabular-nums`}
                          {...register("maxParcelas", { valueAsNumber: true })}
                        />
                      </Campo>
                      <Campo
                        label="Validade do link (dias)"
                        htmlFor="ordem-validade"
                        error={errors.validadeDias?.message}
                      >
                        <Input
                          id="ordem-validade"
                          type="number"
                          min={1}
                          max={30}
                          className={`${inputPill} tabular-nums`}
                          {...register("validadeDias", { valueAsNumber: true })}
                        />
                      </Campo>
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
                    <CheckIcon aria-hidden strokeWidth={1.5} />
                    Criar ordem
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
