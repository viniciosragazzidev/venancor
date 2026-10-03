"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Campo, inputPill } from "@/components/admin/campo";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  formatarCPF,
  mascaraCEP,
  mascaraCPF,
  mascaraTelefone,
  rotulo,
} from "@/components/admin/format";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  atualizarCliente,
  atualizarDependente,
  buscarCep,
  criarCliente,
  criarDependente,
  excluirCliente,
  excluirDependente,
  listarDependentes,
  type listarClientes,
} from "@/modules/clientes/actions";
import {
  clienteSchema,
  dependenteSchema,
  type ClienteInput,
  type DependenteInput,
} from "@/modules/clientes/schemas";

type Cliente = Awaited<ReturnType<typeof listarClientes>>[number];
type Dependente = Awaited<ReturnType<typeof listarDependentes>>[number];

const formSchema = clienteSchema.omit({ whatsapp: true });
type FormValores = z.input<typeof formSchema>;

const hoje = new Date().toISOString().slice(0, 10);

function formatarWhatsapp(e164: string): string {
  const digitos = e164.replace(/\D/g, "").replace(/^55/, "");
  return mascaraTelefone(digitos);
}

export function ClientesTabela({ dados }: { dados: Cliente[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [excluindo, setExcluindo] = useState<Cliente | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [whatsappTexto, setWhatsappTexto] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [clienteSel, setClienteSel] = useState<Cliente | null>(null);
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [depsCarregando, setDepsCarregando] = useState(false);
  const [vista, setVista] = useState<"lista" | "form">("lista");
  const [editandoDep, setEditandoDep] = useState<Dependente | null>(null);
  const [enviandoDep, setEnviandoDep] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValores>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      nascimento: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
    },
  });

  const depForm = useForm<z.input<typeof dependenteSchema>>({
    resolver: zodResolver(dependenteSchema),
    defaultValues: { clienteId: "", nome: "", cpf: "", nascimento: "", parentesco: "conjuge" },
  });

  const cepValor = useWatch({ control, name: "cep" }) ?? "";
  const cepCampo = register("cep");

  const filtrados = dados.filter((cliente) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    return (
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cpf.includes(termo.replace(/\D/g, "")) ||
      cliente.cidade.toLowerCase().includes(termo)
    );
  });

  function abrirNovo() {
    setEditando(null);
    reset({
      nome: "",
      cpf: "",
      nascimento: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
    });
    setWhatsappTexto("");
    setFormAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setEditando(cliente);
    reset({
      nome: cliente.nome,
      cpf: mascaraCPF(cliente.cpf),
      nascimento: cliente.nascimento,
      email: cliente.email,
      cep: mascaraCEP(cliente.cep),
      logradouro: cliente.logradouro,
      numero: cliente.numero,
      complemento: cliente.complemento ?? "",
      bairro: cliente.bairro,
      cidade: cliente.cidade,
      uf: cliente.uf,
    });
    setWhatsappTexto(formatarWhatsapp(cliente.whatsapp));
    setFormAberto(true);
  }

  async function consultarCep() {
    const digitos = cepValor.replace(/\D/g, "");
    if (digitos.length !== 8) return;
    setBuscandoCep(true);
    try {
      const endereco = await buscarCep(digitos);
      setValue("logradouro", endereco.logradouro, { shouldDirty: true });
      setValue("bairro", endereco.bairro, { shouldDirty: true });
      setValue("cidade", endereco.cidade, { shouldDirty: true });
      setValue("uf", endereco.uf, { shouldDirty: true });
      if (endereco.complemento) {
        setValue("complemento", endereco.complemento, { shouldDirty: true });
      }
      toast.success("Endereço preenchido pelo CEP.");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível consultar o CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function submeter(valores: FormValores) {
    const digitos = whatsappTexto.replace(/\D/g, "");
    let whatsapp: string;
    if (whatsappTexto.trim().startsWith("+")) {
      whatsapp = whatsappTexto.trim();
    } else if (digitos.length === 10 || digitos.length === 11) {
      whatsapp = `+55${digitos}`;
    } else {
      toast.error("Informe um WhatsApp válido com DDD.");
      return;
    }
    setEnviando(true);
    try {
      const payload: ClienteInput = { ...valores, whatsapp };
      if (editando) {
        await atualizarCliente(editando.id, payload);
        toast.success("Cliente atualizado.");
      } else {
        await criarCliente(payload);
        toast.success("Cliente criado.");
      }
      setFormAberto(false);
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar.");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    try {
      await excluirCliente(excluindo.id);
      toast.success("Cliente excluído.");
      setExcluindo(null);
      router.refresh();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível excluir.");
    }
  }

  async function abrirDependentes(cliente: Cliente) {
    setClienteSel(cliente);
    setVista("lista");
    setEditandoDep(null);
    setDepsCarregando(true);
    try {
      setDependentes(await listarDependentes(cliente.id));
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Erro ao carregar dependentes.");
      setClienteSel(null);
    } finally {
      setDepsCarregando(false);
    }
  }

  function abrirFormDependente(dependente?: Dependente) {
    setEditandoDep(dependente ?? null);
    depForm.reset({
      clienteId: clienteSel?.id ?? "",
      nome: dependente?.nome ?? "",
      cpf: dependente ? mascaraCPF(dependente.cpf) : "",
      nascimento: dependente?.nascimento ?? "",
      parentesco: dependente?.parentesco ?? "conjuge",
    });
    setVista("form");
  }

  async function submeterDependente(valores: z.input<typeof dependenteSchema>) {
    if (!clienteSel) return;
    const dadosDep = {
      nome: valores.nome,
      cpf: valores.cpf,
      nascimento: valores.nascimento,
      parentesco: valores.parentesco,
    };
    setEnviandoDep(true);
    try {
      if (editandoDep) {
        await atualizarDependente(editandoDep.id, dadosDep);
        toast.success("Dependente atualizado.");
      } else {
        await criarDependente({ ...dadosDep, clienteId: clienteSel.id } satisfies DependenteInput);
        toast.success("Dependente adicionado.");
      }
      setDependentes(await listarDependentes(clienteSel.id));
      setVista("lista");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar.");
    } finally {
      setEnviandoDep(false);
    }
  }

  async function excluirDependenteLista(dependente: Dependente) {
    try {
      await excluirDependente(dependente.id);
      toast.success("Dependente excluído.");
      if (clienteSel) setDependentes(await listarDependentes(clienteSel.id));
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível excluir.");
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
            aria-label="Buscar clientes"
            className={`${inputPill} pl-12`}
            placeholder="Buscar por nome, CPF ou cidade"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        <Button className="h-12 w-full rounded-full px-6 sm:w-auto" onClick={abrirNovo}>
          <PlusIcon aria-hidden strokeWidth={1.5} />
          Novo cliente
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {filtrados.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              {dados.length === 0
                ? "Nenhum cliente cadastrado ainda."
                : "Nenhum cliente encontrado."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell className="tabular-nums">{formatarCPF(cliente.cpf)}</TableCell>
                      <TableCell className="tabular-nums">
                        {formatarWhatsapp(cliente.whatsapp)}
                      </TableCell>
                      <TableCell>
                        {cliente.cidade}/{cliente.uf}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Dependentes de ${cliente.nome}`}
                            onClick={() => void abrirDependentes(cliente)}
                          >
                            <UsersIcon aria-hidden strokeWidth={1.5} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar ${cliente.nome}`}
                            onClick={() => abrirEdicao(cliente)}
                          >
                            <PencilIcon aria-hidden strokeWidth={1.5} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Excluir ${cliente.nome}`}
                            onClick={() => setExcluindo(cliente)}
                          >
                            <Trash2Icon aria-hidden strokeWidth={1.5} />
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

      <Dialog open={formAberto} onOpenChange={setFormAberto}>
        <DialogContent className="gap-0 rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Atualize os dados do titular e do endereço."
                : "Preencha os dados pessoais e o endereço do titular."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex max-h-[75vh] flex-col gap-5 overflow-y-auto pt-4 pr-1"
            onSubmit={handleSubmit(submeter)}
            noValidate
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium">Dados pessoais</p>
              <Campo label="Nome completo" htmlFor="cliente-nome" error={errors.nome?.message}>
                <Input
                  id="cliente-nome"
                  className={inputPill}
                  placeholder="Nome do titular"
                  autoComplete="name"
                  {...register("nome")}
                />
              </Campo>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="CPF" htmlFor="cliente-cpf" error={errors.cpf?.message}>
                  <Input
                    id="cliente-cpf"
                    className={`${inputPill} tabular-nums`}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    {...register("cpf", {
                      onChange: (evento) => {
                        evento.target.value = mascaraCPF(evento.target.value);
                      },
                    })}
                  />
                </Campo>
                <Campo
                  label="Data de nascimento"
                  htmlFor="cliente-nascimento"
                  error={errors.nascimento?.message}
                >
                  <Input
                    id="cliente-nascimento"
                    type="date"
                    className={`${inputPill} tabular-nums`}
                    max={hoje}
                    {...register("nascimento")}
                  />
                </Campo>
                <Campo label="E-mail" htmlFor="cliente-email" error={errors.email?.message}>
                  <Input
                    id="cliente-email"
                    type="email"
                    className={inputPill}
                    placeholder="email@exemplo.com"
                    autoComplete="email"
                    {...register("email")}
                  />
                </Campo>
                <Campo
                  label="WhatsApp"
                  htmlFor="cliente-whatsapp"
                  error={null}
                  hint="Com DDD, ex.: (11) 99999-9999"
                >
                  <Input
                    id="cliente-whatsapp"
                    className={`${inputPill} tabular-nums`}
                    placeholder="(11) 99999-9999"
                    inputMode="tel"
                    value={whatsappTexto}
                    onChange={(evento) => setWhatsappTexto(mascaraTelefone(evento.target.value))}
                  />
                </Campo>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium">Endereço</p>
              <Campo
                label="CEP"
                htmlFor="cliente-cep"
                error={errors.cep?.message}
                hint="Digite o CEP para preencher o endereço automaticamente."
              >
                <div className="relative">
                  <Input
                    id="cliente-cep"
                    className={`${inputPill} pr-12 tabular-nums`}
                    placeholder="00000-000"
                    inputMode="numeric"
                    {...cepCampo}
                    onBlur={(evento) => {
                      cepCampo.onBlur(evento);
                      void consultarCep();
                    }}
                  />
                  {buscandoCep ? (
                    <LoaderCircleIcon
                      aria-hidden
                      strokeWidth={1.5}
                      className="absolute top-1/2 right-5 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                    />
                  ) : null}
                </div>
              </Campo>
              <Campo
                label="Logradouro"
                htmlFor="cliente-logradouro"
                error={errors.logradouro?.message}
              >
                <Input
                  id="cliente-logradouro"
                  className={inputPill}
                  placeholder="Rua, avenida..."
                  autoComplete="street-address"
                  {...register("logradouro")}
                />
              </Campo>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Número" htmlFor="cliente-numero" error={errors.numero?.message}>
                  <Input
                    id="cliente-numero"
                    className={inputPill}
                    placeholder="123"
                    {...register("numero")}
                  />
                </Campo>
                <Campo
                  label="Complemento"
                  htmlFor="cliente-complemento"
                  error={errors.complemento?.message}
                >
                  <Input
                    id="cliente-complemento"
                    className={inputPill}
                    placeholder="Apto, bloco..."
                    {...register("complemento")}
                  />
                </Campo>
                <Campo label="Bairro" htmlFor="cliente-bairro" error={errors.bairro?.message}>
                  <Input id="cliente-bairro" className={inputPill} {...register("bairro")} />
                </Campo>
                <Campo label="Cidade" htmlFor="cliente-cidade" error={errors.cidade?.message}>
                  <Input id="cliente-cidade" className={inputPill} {...register("cidade")} />
                </Campo>
                <Campo
                  label="UF"
                  htmlFor="cliente-uf"
                  error={errors.uf?.message}
                  className="sm:max-w-32"
                >
                  <Input
                    id="cliente-uf"
                    className={`${inputPill} uppercase`}
                    maxLength={2}
                    placeholder="SP"
                    {...register("uf", {
                      onChange: (evento) => {
                        evento.target.value = evento.target.value.toUpperCase();
                      },
                    })}
                  />
                </Campo>
              </div>
            </div>

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
                {editando ? "Salvar alterações" : "Criar cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet
        open={clienteSel !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setClienteSel(null);
        }}
      >
        <SheetContent className="data-[side=right]:sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {vista === "lista"
                ? `Dependentes de ${clienteSel?.nome ?? ""}`
                : editandoDep
                  ? "Editar dependente"
                  : "Novo dependente"}
            </SheetTitle>
            <SheetDescription>
              {vista === "lista"
                ? `${dependentes.length} ${dependentes.length === 1 ? "registrado" : "registrados"}.`
                : "Dados do dependente para incluir na proposta."}
            </SheetDescription>
          </SheetHeader>

          {vista === "lista" ? (
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4">
              {depsCarregando ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
              ) : dependentes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum dependente ainda.
                </p>
              ) : (
                dependentes.map((dependente) => (
                  <div
                    key={dependente.id}
                    className="flex items-center justify-between gap-3 rounded-3xl border bg-muted/40 p-4"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{dependente.nome}</span>
                        <Badge variant="secondary">{rotulo(dependente.parentesco)}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatarCPF(dependente.cpf)} ·{" "}
                        {dependente.nascimento.split("-").reverse().join("/")}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${dependente.nome}`}
                        onClick={() => abrirFormDependente(dependente)}
                      >
                        <PencilIcon aria-hidden strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir ${dependente.nome}`}
                        onClick={() => void excluirDependenteLista(dependente)}
                      >
                        <Trash2Icon aria-hidden strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form
              id="form-dependente"
              className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-2"
              onSubmit={depForm.handleSubmit(submeterDependente)}
              noValidate
            >
              <button
                type="button"
                className="flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setVista("lista")}
              >
                <ArrowLeftIcon aria-hidden strokeWidth={1.5} className="size-4" />
                Voltar
              </button>
              <Campo label="Nome" htmlFor="dep-nome" error={depForm.formState.errors.nome?.message}>
                <Input
                  id="dep-nome"
                  className={inputPill}
                  placeholder="Nome do dependente"
                  {...depForm.register("nome")}
                />
              </Campo>
              <Campo label="CPF" htmlFor="dep-cpf" error={depForm.formState.errors.cpf?.message}>
                <Input
                  id="dep-cpf"
                  className={`${inputPill} tabular-nums`}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  {...depForm.register("cpf", {
                    onChange: (evento) => {
                      evento.target.value = mascaraCPF(evento.target.value);
                    },
                  })}
                />
              </Campo>
              <Campo
                label="Data de nascimento"
                htmlFor="dep-nascimento"
                error={depForm.formState.errors.nascimento?.message}
              >
                <Input
                  id="dep-nascimento"
                  type="date"
                  className={`${inputPill} tabular-nums`}
                  max={hoje}
                  {...depForm.register("nascimento")}
                />
              </Campo>
              <Campo label="Parentesco" error={depForm.formState.errors.parentesco?.message}>
                <Controller
                  control={depForm.control}
                  name="parentesco"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`${inputPill} w-full justify-between`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dependenteSchema.shape.parentesco.options.map((opcao) => (
                          <SelectItem key={opcao} value={opcao}>
                            {rotulo(opcao)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Campo>
            </form>
          )}

          <SheetFooter>
            {vista === "lista" ? (
              <Button
                className="h-12 w-full rounded-full px-6"
                onClick={() => abrirFormDependente()}
                disabled={depsCarregando}
              >
                <PlusIcon aria-hidden strokeWidth={1.5} />
                Novo dependente
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1 rounded-full px-6"
                  disabled={enviandoDep}
                  onClick={() => setVista("lista")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="form-dependente"
                  className="h-12 flex-1 rounded-full px-6"
                  disabled={enviandoDep}
                >
                  {enviandoDep ? (
                    <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
                  ) : null}
                  Salvar
                </Button>
              </div>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={excluindo !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setExcluindo(null);
        }}
        titulo="Excluir cliente?"
        descricao={`Os dados de ${excluindo?.nome ?? ""} serão removidos. Clientes com ordens não podem ser excluídos.`}
        confirmarTexto="Excluir"
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
