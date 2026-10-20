"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BellRingIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  CopyPlusIcon,
  LayersIcon,
  LoaderCircleIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Campo, inputPill } from "@/components/admin/campo";
import { formatarCentavos, parseMoeda } from "@/components/admin/format";
import { FunilOrdem } from "@/components/admin/funil-ordem";
import { LembrarAgoraDialog } from "@/components/admin/lembrar-agora";
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
import { type ResumoLembretes } from "@/modules/lembretes/actions";
import { lembreteDisponivel, MAX_LEMBRETES } from "@/modules/lembretes/regras";
import {
  criarOrdemNoPainel,
  obterDuplicacaoOrdem,
  type listarOrdens,
} from "@/modules/ordens/actions";
import {
  modeloParaCondicoes,
  VALIDADE_PADRAO_DIAS,
  type CondicoesOrdem,
} from "@/modules/ordens/formulario";
import {
  contarPorFiltro,
  FILTROS_ETAPA,
  filtrarPorEtapa,
  type FiltroEtapa,
} from "@/modules/ordens/funil";
import { criarOrdemModelo } from "@/modules/ordens/modelos-actions";
import { criarOrdemSchema, type CriarOrdemInput } from "@/modules/ordens/schemas";
import { type listarPlanos } from "@/modules/planos/actions";

import { GerenciarModelosDialog, SalvarModeloDialog, type OrdemModelo } from "./modelos-ordem";

type Ordem = Awaited<ReturnType<typeof listarOrdens>>[number];
type Cliente = Awaited<ReturnType<typeof listarClientes>>[number];
type Plano = Awaited<ReturnType<typeof listarPlanos>>[number];
type Dependente = Awaited<ReturnType<typeof listarDependentes>>[number];
export interface ContratoOpcao {
  id: string;
  nome: string;
  planoId: string | null;
  ativo: boolean;
}

const SEM_MODELO = "nenhum";
const CONTRATO_AUTO = "auto";

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

/** Money input text from cents; zero stays empty so the placeholder shows. */
function textoMoeda(centavos: number | null) {
  return centavos ? formatarCentavos(centavos) : "";
}

export function OrdensTabela({
  ordens,
  clientes,
  planos,
  modelos,
  contratos,
  lembretes,
  agora,
}: {
  ordens: Ordem[];
  clientes: Cliente[];
  planos: Plano[];
  modelos: OrdemModelo[];
  contratos: ContratoOpcao[];
  /** Reminders sent per order id. */
  lembretes: Record<string, ResumoLembretes>;
  /** Server time of this render (refreshed with the list), for "aberto há 2 h". */
  agora: number;
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [etapaParam, setEtapaParam] = useQueryState("etapa", {
    defaultValue: "todos",
    scroll: false,
  });
  const etapa: FiltroEtapa = FILTROS_ETAPA.some((filtro) => filtro.valor === etapaParam)
    ? (etapaParam as FiltroEtapa)
    : "todos";
  const contagem = contarPorFiltro(ordens, agora);
  const [lembrarId, setLembrarId] = useState<string | null>(null);
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
  const [modeloId, setModeloId] = useState(SEM_MODELO);
  const [contratoId, setContratoId] = useState(CONTRATO_AUTO);
  const [duplicandoId, setDuplicandoId] = useState<string | null>(null);
  const [tituloForm, setTituloForm] = useState("Nova ordem");
  const [salvarModeloAberto, setSalvarModeloAberto] = useState(false);
  const [gerenciarAberto, setGerenciarAberto] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
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
  const planoSelecionado = useWatch({ control, name: "planoId" });

  const contratoServe = (id: string, planoId: string) => {
    const contrato = contratos.find((item) => item.id === id);
    return !!contrato && (!contrato.planoId || contrato.planoId === planoId);
  };

  const nomeCliente = (id: string) => clientes.find((cliente) => cliente.id === id)?.nome ?? "—";
  const nomePlano = (id: string) => planos.find((plano) => plano.id === id)?.nome ?? "—";

  const filtradas = filtrarPorEtapa(ordens, etapa, agora).filter((ordem) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    return (
      nomeCliente(ordem.clienteId).toLowerCase().includes(termo) ||
      nomePlano(ordem.planoId).toLowerCase().includes(termo) ||
      rotuloStatusOrdem(ordem.status).toLowerCase().includes(termo)
    );
  });

  /** Fills the non-client fields (plano, contrato, valores, pagamento, validade). */
  function aplicarCondicoes(condicoes: CondicoesOrdem) {
    const planoId = condicoes.planoId ?? getValues("planoId");
    if (condicoes.planoId) setValue("planoId", condicoes.planoId, { shouldValidate: true });
    setValue("valorCobradoTipo", condicoes.valorCobradoTipo);
    setValue("descontoObs", condicoes.descontoObs);
    setValue("maxParcelas", condicoes.maxParcelas);
    setValue("validadeDias", condicoes.validadeDias);
    setContratoId(
      condicoes.contratoModeloId && contratoServe(condicoes.contratoModeloId, planoId)
        ? condicoes.contratoModeloId
        : CONTRATO_AUTO,
    );
    setFormas([...condicoes.formasPagamento]);
    setDescontoTexto(textoMoeda(condicoes.desconto));
    setPersonalizadoTexto(textoMoeda(condicoes.valorPersonalizado));
  }

  function abrirFormulario(
    titulo: string,
    clienteId: string,
    condicoes: CondicoesOrdem,
    dependentes: Dependente[] = [],
    dependenteIds: string[] = [],
  ) {
    reset({
      clienteId,
      planoId: condicoes.planoId ?? planos.find((plano) => plano.ativo)?.id ?? "",
      valorCobradoTipo: "primeira_mensalidade_adesao",
      descontoObs: "",
      maxParcelas: 1,
      validadeDias: VALIDADE_PADRAO_DIAS,
    });
    aplicarCondicoes(condicoes);
    setDeps(dependentes);
    setDepsIds(dependenteIds);
    setModeloId(SEM_MODELO);
    setTituloForm(titulo);
    setVista("form");
    setLinkCriado(null);
    setOrdemCriadaId(null);
    setFormAberto(true);
  }

  function abrirNovo() {
    abrirFormulario("Nova ordem", clientes[0]?.id ?? "", {
      planoId: planos.find((plano) => plano.ativo)?.id ?? null,
      contratoModeloId: null,
      desconto: 0,
      descontoObs: "",
      valorCobradoTipo: "primeira_mensalidade_adesao",
      valorPersonalizado: null,
      formasPagamento: [...FORMAS],
      maxParcelas: 1,
      validadeDias: VALIDADE_PADRAO_DIAS,
    });
  }

  async function duplicar(ordem: Ordem) {
    setDuplicandoId(ordem.id);
    try {
      const resultado = await obterDuplicacaoOrdem(ordem.id);
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      const { clienteId, dependenteIds, ...condicoes } = resultado.valores;
      abrirFormulario("Duplicar ordem", clienteId, condicoes, resultado.dependentes, dependenteIds);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível duplicar a ordem.");
    } finally {
      setDuplicandoId(null);
    }
  }

  function escolherModelo(id: string) {
    setModeloId(id);
    const modelo = modelos.find((item) => item.id === id);
    if (modelo) aplicarCondicoes(modeloParaCondicoes(modelo));
  }

  /** Desconto and valor personalizado from the text inputs, or the reason they are invalid. */
  function lerValores(
    tipo: FormValores["valorCobradoTipo"],
  ): { desconto: number; valorPersonalizado?: number } | { erro: string } {
    const desconto = parseMoeda(descontoTexto) ?? 0;
    if (tipo !== "personalizado") return { desconto };
    const centavos = parseMoeda(personalizadoTexto);
    if (centavos === null) return { erro: "Informe o valor personalizado." };
    return { desconto, valorPersonalizado: centavos };
  }

  async function salvarComoModelo(nome: string) {
    const valores = getValues();
    if (formas.length === 0) {
      toast.error("Informe ao menos uma forma de pagamento.");
      return false;
    }
    const lidos = lerValores(valores.valorCobradoTipo);
    if ("erro" in lidos) {
      toast.error(lidos.erro);
      return false;
    }
    const maxParcelas = Number(valores.maxParcelas);
    const validadeDias = Number(valores.validadeDias);
    const resultado = await criarOrdemModelo({
      nome,
      planoId: valores.planoId || null,
      contratoModeloId: contratoId === CONTRATO_AUTO ? null : contratoId,
      desconto: lidos.desconto,
      descontoObs: valores.descontoObs?.trim() || null,
      valorCobradoTipo: valores.valorCobradoTipo,
      valorPersonalizado: lidos.valorPersonalizado ?? null,
      formasPagamento: [...formas] as CriarOrdemInput["formasPagamento"],
      maxParcelas: Number.isInteger(maxParcelas) ? maxParcelas : 1,
      validadeDias: Number.isInteger(validadeDias) ? validadeDias : VALIDADE_PADRAO_DIAS,
    });
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return false;
    }
    toast.success("Modelo salvo.");
    setModeloId(resultado.modelo.id);
    router.refresh();
    return true;
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
    const lidos = lerValores(valores.valorCobradoTipo);
    if ("erro" in lidos) {
      toast.error(lidos.erro);
      return;
    }
    const { desconto, valorPersonalizado } = lidos;
    const payload: CriarOrdemInput = {
      clienteId: valores.clienteId,
      planoId: valores.planoId,
      dependenteIds: depsIds,
      contratoModeloId: contratoId === CONTRATO_AUTO ? undefined : contratoId,
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
      const resultado = await criarOrdemNoPainel(payload);
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      setOrdemCriadaId(resultado.ordemId);
      setLinkCriado(resultado.link);
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
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="h-12 w-full rounded-full px-6 sm:w-auto"
            onClick={() => setGerenciarAberto(true)}
          >
            <LayersIcon aria-hidden strokeWidth={1.5} />
            Modelos
          </Button>
          <Button className="h-12 w-full rounded-full px-6 sm:w-auto" onClick={abrirNovo}>
            <PlusIcon aria-hidden strokeWidth={1.5} />
            Nova ordem
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filtrar por etapa"
          className="flex flex-wrap items-center gap-1 rounded-3xl border bg-muted/40 p-1 sm:rounded-full"
        >
          {FILTROS_ETAPA.map((filtro) => {
            const ativo = etapa === filtro.valor;
            return (
              <button
                key={filtro.valor}
                type="button"
                aria-pressed={ativo}
                className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition-colors ${
                  ativo
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => void setEtapaParam(filtro.valor === "todos" ? null : filtro.valor)}
              >
                {filtro.rotulo}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    ativo ? "bg-primary/15" : "bg-muted"
                  }`}
                >
                  {contagem[filtro.valor]}
                </span>
              </button>
            );
          })}
        </div>
        <p
          className="flex items-center gap-2 text-xs text-muted-foreground"
          title="A lista se atualiza sozinha a cada 30 segundos enquanto a página está aberta."
        >
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Ao vivo
        </p>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {filtradas.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              {ordens.length === 0
                ? "Nenhuma ordem criada ainda."
                : etapa !== "todos" && !busca.trim()
                  ? "Nenhuma ordem nesta etapa."
                  : "Nenhuma ordem encontrada."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Cobrado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
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
                      <TableCell>
                        <FunilOrdem
                          ordem={ordem}
                          agora={agora}
                          lembretes={lembretes[ordem.id]?.quantidade ?? 0}
                        />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatarDataHora(ordem.expiraEm)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {lembreteDisponivel(
                            ordem,
                            lembretes[ordem.id]?.quantidade ?? 0,
                            agora,
                          ) ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Lembrar ${nomeCliente(ordem.clienteId)} agora`}
                              title={`Lembrar agora (${lembretes[ordem.id]?.quantidade ?? 0} de ${MAX_LEMBRETES} lembretes enviados)`}
                              onClick={() => setLembrarId(ordem.id)}
                            >
                              <BellRingIcon aria-hidden strokeWidth={1.5} />
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Duplicar ordem de ${nomeCliente(ordem.clienteId)}`}
                            title="Duplicar"
                            disabled={duplicandoId !== null}
                            onClick={() => void duplicar(ordem)}
                          >
                            {duplicandoId === ordem.id ? (
                              <LoaderCircleIcon
                                aria-hidden
                                className="animate-spin"
                                strokeWidth={1.5}
                              />
                            ) : (
                              <CopyPlusIcon aria-hidden strokeWidth={1.5} />
                            )}
                          </Button>
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
                <DialogTitle>{tituloForm}</DialogTitle>
                <DialogDescription>
                  {tituloForm === "Duplicar ordem"
                    ? "Mesmas condições da ordem original. Ajuste o que precisar: uma nova ordem e um novo link serão criados."
                    : "Escolha o cliente, o plano e as condições da proposta."}
                </DialogDescription>
              </DialogHeader>
              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={handleSubmit(submeter)}
                noValidate
              >
                <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8">
                  <Campo
                    label="Modelo"
                    htmlFor="ordem-modelo"
                    hint={
                      modelos.length === 0
                        ? "Nenhum modelo salvo. Preencha a ordem e use Salvar como modelo."
                        : "Preenche plano, contrato, valores e condições. Depois é só escolher o cliente."
                    }
                  >
                    <Select
                      value={modeloId}
                      onValueChange={(valor) => {
                        if (valor) escolherModelo(valor);
                      }}
                    >
                      <SelectTrigger
                        id="ordem-modelo"
                        className={`${inputPill} w-full justify-between`}
                      >
                        <SelectValue>
                          {(valor: string) =>
                            modelos.find((modelo) => modelo.id === valor)?.nome ?? "Sem modelo"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SEM_MODELO}>Sem modelo</SelectItem>
                        {modelos.map((modelo) => (
                          <SelectItem key={modelo.id} value={modelo.id}>
                            {modelo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Campo>

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
                            <Select
                              value={field.value}
                              onValueChange={(valor) => {
                                if (!valor) return;
                                field.onChange(valor);
                                if (
                                  contratoId !== CONTRATO_AUTO &&
                                  !contratoServe(contratoId, valor)
                                )
                                  setContratoId(CONTRATO_AUTO);
                              }}
                            >
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
                      <Campo
                        label="Contrato"
                        htmlFor="ordem-contrato"
                        className="sm:col-span-2"
                        hint="Automático usa o modelo de contrato do plano (ou o geral)."
                      >
                        <Select
                          value={contratoId}
                          onValueChange={(valor) => {
                            if (valor) setContratoId(valor);
                          }}
                        >
                          <SelectTrigger
                            id="ordem-contrato"
                            className={`${inputPill} w-full justify-between`}
                          >
                            <SelectValue>
                              {(valor: string) =>
                                contratos.find((contrato) => contrato.id === valor)?.nome ??
                                "Automático"
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CONTRATO_AUTO}>Automático</SelectItem>
                            {contratos
                              .filter(
                                (contrato) =>
                                  contrato.id === contratoId ||
                                  (contrato.ativo &&
                                    contratoServe(contrato.id, planoSelecionado ?? "")),
                              )
                              .map((contrato) => (
                                <SelectItem key={contrato.id} value={contrato.id}>
                                  {contrato.nome}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
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
                    variant="ghost"
                    className="h-12 rounded-full px-6 sm:mr-auto"
                    disabled={enviando}
                    onClick={() => setSalvarModeloAberto(true)}
                  >
                    <SaveIcon aria-hidden strokeWidth={1.5} />
                    Salvar como modelo
                  </Button>
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

      <LembrarAgoraDialog
        ordemId={lembrarId}
        onOpenChange={(aberto) => {
          if (!aberto) setLembrarId(null);
        }}
      />
      <SalvarModeloDialog
        open={salvarModeloAberto}
        onOpenChange={setSalvarModeloAberto}
        onSalvar={salvarComoModelo}
      />
      <GerenciarModelosDialog
        open={gerenciarAberto}
        onOpenChange={setGerenciarAberto}
        modelos={modelos}
        planos={planos}
      />
    </div>
  );
}
