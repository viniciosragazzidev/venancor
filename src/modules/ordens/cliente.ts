import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { clientes, ordemBeneficiarios, ordemSnapshotPlano, ordens } from "@/db/schema";
import { hashToken } from "@/lib/tokens";
import { renderizarContrato, type VariavelContrato } from "@/modules/contratos/render";
import { transicionar, type OrdemStatus } from "./state-machine";
import { ErroNegocio } from "@/lib/resultado-acao";

const snapshotSchema = z.object({
  operadora: z.object({ nome: z.string(), registroAns: z.string() }),
  plano: z.object({
    nome: z.string(),
    codigo: z.string(),
    segmentacao: z.string(),
    acomodacao: z.string(),
    abrangencia: z.string(),
    tipoContratacao: z.string(),
    coparticipacao: z.boolean(),
    carencias: z.string(),
    coberturas: z.string(),
    redeCredenciada: z.string(),
  }),
});

export interface DadosOrdemCliente {
  id: string;
  status: OrdemStatus;
  expira_em: string;
  cliente: { nome: string; cpf: string; whatsapp: string };
  plano: {
    operadora_nome: string;
    plano_nome: string;
    segmentacao: string;
    acomodacao: string;
    abrangencia: string;
    tipo_contratacao: string;
    coparticipacao: boolean;
    carencias: string;
    coberturas: string;
    rede_credenciada: string;
  };
  beneficiarios: {
    titular: boolean;
    nome: string;
    cpf: string;
    nascimento: string;
    faixa_etaria: string;
    valor: number;
  }[];
  valor_mensal: number;
  valor_adesao: number;
  desconto: number;
  valor_cobrado: number;
  valor_cobrado_tipo: string;
  formas_pagamento: ("pix" | "boleto" | "cartao")[];
  max_parcelas: number;
  contrato_corpo: string;
}

export type ResolucaoToken =
  | { tipo: "invalido" }
  | { tipo: "expirada" | "cancelada" }
  | { tipo: "ativa" | "paga"; dados: DadosOrdemCliente };

const brl = (centavos: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);
const mascararCpf = (cpf: string) => cpf.replace(/^(\d{3})\d{5}(\d{3})$/, "$1*****$2");
const NAO_INFORMADO = "Não informado";
const dataBr = (iso: string) => iso.split("-").reverse().join("/");
const telefoneBr = (e164: string) =>
  e164.replace(/^\+55/, "").replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
const formasRotulo: Record<string, string> = { pix: "Pix", boleto: "Boleto", cartao: "Cartão" };

function enderecoCompleto(cliente: typeof clientes.$inferSelect) {
  if (!cliente.logradouro) return NAO_INFORMADO;
  const rua = [cliente.logradouro, cliente.numero, cliente.complemento].filter(Boolean).join(", ");
  const cidade = [cliente.cidade, cliente.uf].filter(Boolean).join("/");
  const cep = cliente.cep ? `CEP ${cliente.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")}` : "";
  return [rua, cliente.bairro, cidade, cep].filter(Boolean).join(" - ");
}

/**
 * Resolves the client link. `registrarAbertura: false` shows the proposal without marking it as
 * opened (admin preview, link-preview robots); any client action still records it.
 */
export async function resolverToken(
  token: string,
  { registrarAbertura = true }: { registrarAbertura?: boolean } = {},
): Promise<ResolucaoToken> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { tipo: "invalido" };
  const [ordem] = await db
    .select()
    .from(ordens)
    .where(eq(ordens.tokenHash, hashToken(token)))
    .limit(1);
  if (!ordem) return { tipo: "invalido" };
  if (ordem.status === "cancelada") return { tipo: "cancelada" };
  const passouPrazo = ordem.expiraEm.getTime() < Date.now();
  if (passouPrazo && ["rascunho", "enviada", "visualizada"].includes(ordem.status)) {
    if (Date.now() - ordem.expiraEm.getTime() > 30 * 86_400_000 && ordem.status !== "rascunho")
      await transicionar(ordem.id, "expirada", "sistema");
    return { tipo: "expirada" };
  }
  if (ordem.status === "expirada") return { tipo: "expirada" };
  if (
    passouPrazo &&
    ordem.status === "aguardando_pagamento" &&
    Date.now() - ordem.expiraEm.getTime() > 30 * 86_400_000
  ) {
    await transicionar(ordem.id, "expirada", "sistema");
    return { tipo: "expirada" };
  }
  if (registrarAbertura && ordem.status === "rascunho") {
    await transicionar(ordem.id, "enviada", "cliente");
    await transicionar(ordem.id, "visualizada", "cliente");
  } else if (registrarAbertura && ordem.status === "enviada")
    await transicionar(ordem.id, "visualizada", "cliente");
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, ordem.clienteId))
    .limit(1);
  const [snapshot] = await db
    .select()
    .from(ordemSnapshotPlano)
    .where(eq(ordemSnapshotPlano.ordemId, ordem.id))
    .limit(1);
  const beneficiarios = await db
    .select()
    .from(ordemBeneficiarios)
    .where(eq(ordemBeneficiarios.ordemId, ordem.id));
  if (!cliente || !snapshot || !beneficiarios.length)
    throw new Error("Snapshot da ordem incompleto");
  const titular = beneficiarios.find((item) => item.titular);
  if (!titular) throw new Error("Titular ausente do snapshot");
  const { operadora, plano } = snapshotSchema.parse(snapshot.dados);
  const dependentesOrdem = beneficiarios.filter((b) => !b.titular);
  const vars: Record<VariavelContrato, string> = {
    "cliente.nome": titular.nome,
    "cliente.cpf": mascararCpf(titular.cpf),
    "cliente.rg": cliente.rg ?? NAO_INFORMADO,
    "cliente.nascimento": dataBr(titular.nascimento),
    "cliente.mae": cliente.nomeMae ?? NAO_INFORMADO,
    "cliente.estado_civil": cliente.estadoCivil ?? NAO_INFORMADO,
    "cliente.email": cliente.email,
    "cliente.telefone": telefoneBr(cliente.whatsapp),
    "cliente.endereco": enderecoCompleto(cliente),
    "operadora.nome": operadora.nome,
    "plano.nome": plano.nome,
    "plano.rede": plano.redeCredenciada || NAO_INFORMADO,
    "plano.abrangencia": plano.abrangencia.charAt(0).toUpperCase() + plano.abrangencia.slice(1),
    "plano.carencias": plano.carencias || NAO_INFORMADO,
    "plano.coberturas": plano.coberturas || NAO_INFORMADO,
    "proposta.numero": String(ordem.numero),
    "vigencia.inicio": ordem.vigenciaInicio
      ? dataBr(ordem.vigenciaInicio)
      : "Imediata, a partir da confirmação do pagamento",
    "pagamento.vencimento": ordem.diaVencimento ? `Todo dia ${ordem.diaVencimento}` : NAO_INFORMADO,
    "pagamento.formas": ordem.formasPagamento.map((f) => formasRotulo[f] ?? f).join(", "),
    "beneficiarios.quantidade": String(beneficiarios.length),
    "dependentes.lista": dependentesOrdem.length
      ? dependentesOrdem
          .map(
            (b, i) =>
              `Dependente ${i + 1}: ${b.nome}, CPF ${mascararCpf(b.cpf)}, nascimento ${dataBr(b.nascimento)}`,
          )
          .join("\n")
      : "Nenhum dependente",
    "valor.total": brl(ordem.valorCobrado),
    // Monthly fee the client will pay: the table price minus the discount.
    "valor.mensal": brl(ordem.valorMensal - ordem.desconto),
    "valor.adesao": brl(ordem.valorAdesao),
    "beneficiarios.tabela": beneficiarios
      .map((b) => `${b.nome} (${b.faixaEtaria}): ${brl(b.valor)}`)
      .join("\n"),
    "data.hoje": new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(
      ordem.criadoEm,
    ),
  };
  const dados: DadosOrdemCliente = {
    id: ordem.id,
    status: ["rascunho", "enviada"].includes(ordem.status) ? "visualizada" : ordem.status,
    expira_em: ordem.expiraEm.toISOString(),
    cliente: { nome: titular.nome, cpf: mascararCpf(titular.cpf), whatsapp: cliente.whatsapp },
    plano: {
      operadora_nome: operadora.nome,
      plano_nome: plano.nome,
      segmentacao: plano.segmentacao,
      acomodacao: plano.acomodacao,
      abrangencia: plano.abrangencia,
      tipo_contratacao: plano.tipoContratacao,
      coparticipacao: plano.coparticipacao,
      carencias: plano.carencias,
      coberturas: plano.coberturas,
      rede_credenciada: plano.redeCredenciada,
    },
    beneficiarios: beneficiarios.map((b) => ({
      titular: b.titular,
      nome: b.nome,
      cpf: mascararCpf(b.cpf),
      nascimento: b.nascimento,
      faixa_etaria: b.faixaEtaria,
      valor: b.valor,
    })),
    valor_mensal: ordem.valorMensal,
    valor_adesao: ordem.valorAdesao,
    desconto: ordem.desconto,
    valor_cobrado: ordem.valorCobrado,
    valor_cobrado_tipo: ordem.valorCobradoTipo,
    formas_pagamento: ordem.formasPagamento,
    max_parcelas: ordem.maxParcelas,
    contrato_corpo: renderizarContrato(snapshot.contratoCorpo, vars),
  };
  return { tipo: ordem.status === "paga" ? "paga" : "ativa", dados };
}

export async function registrarConsentimento(
  token: string,
  tipo: "contrato" | "lgpd",
  ip: string,
  userAgent: string,
) {
  const resolucao = await resolverToken(token);
  if (resolucao.tipo !== "ativa" || !["enviada", "visualizada"].includes(resolucao.dados.status))
    throw new ErroNegocio("Esta proposta não está mais disponível para aceite.");
  const { consentimentos } = await import("@/db/schema");
  const versaoTexto =
    tipo === "contrato"
      ? `sha256:${createHash("sha256").update(resolucao.dados.contrato_corpo).digest("hex")}`
      : "lgpd-v1";
  await db.insert(consentimentos).values({
    ordemId: resolucao.dados.id,
    tipo,
    aceitoEm: new Date(),
    ip,
    userAgent,
    versaoTexto,
  });
}
