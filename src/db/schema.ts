import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth-schema";

export * from "./auth-schema";

const id = () => uuid("id").defaultRandom().primaryKey();
const criadoEm = () => timestamp("criado_em", { withTimezone: true }).defaultNow().notNull();
const atualizadoEm = () =>
  timestamp("atualizado_em", { withTimezone: true }).defaultNow().notNull();

export const ordemStatus = pgEnum("ordem_status", [
  "rascunho",
  "enviada",
  "visualizada",
  "assinada",
  "aguardando_pagamento",
  "paga",
  "expirada",
  "cancelada",
]);
export const faixaEtaria = pgEnum("faixa_etaria", [
  "0-18",
  "19-23",
  "24-28",
  "29-33",
  "34-38",
  "39-43",
  "44-48",
  "49-53",
  "54-58",
  "59+",
]);
export const segmentacao = pgEnum("segmentacao", [
  "ambulatorial",
  "hospitalar",
  "hospitalar_obstetricia",
  "ambulatorial_hospitalar",
  "ambulatorial_hospitalar_obstetricia",
  "referencia",
]);
export const acomodacao = pgEnum("acomodacao", ["enfermaria", "apartamento"]);
export const abrangencia = pgEnum("abrangencia", ["municipal", "estadual", "nacional"]);
export const tipoContratacao = pgEnum("tipo_contratacao", ["individual", "familiar", "pme"]);
export const metodoPagamento = pgEnum("metodo_pagamento", ["pix", "boleto", "cartao"]);
export const pagamentoStatus = pgEnum("pagamento_status", [
  "pendente",
  "confirmado",
  "recebido",
  "vencido",
  "estornado",
  "cancelado",
]);
export const parentesco = pgEnum("parentesco", ["conjuge", "filho", "pai_mae", "outro"]);
export const canalMensagem = pgEnum("canal_mensagem", ["whatsapp", "email"]);
export const mensagemStatus = pgEnum("mensagem_status", [
  "enfileirada",
  "enviada",
  "entregue",
  "lida",
  "falhou",
]);
export const valorCobradoTipo = pgEnum("valor_cobrado_tipo", [
  "primeira_mensalidade_adesao",
  "total_adesao_mensalidade_so",
  "adesao_so",
  "mensalidade_so",
  "personalizado",
]);

export const usuarios = pgTable("usuarios", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id),
  nome: text("nome").notNull(),
  papel: text("papel").default("admin").notNull(),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const operadoras = pgTable("operadoras", {
  id: id(),
  nome: text("nome").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  registroAns: text("registro_ans").notNull(),
  logoPath: text("logo_path"),
  ativa: boolean("ativa").default(true).notNull(),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const planos = pgTable("planos", {
  id: id(),
  operadoraId: uuid("operadora_id")
    .notNull()
    .references(() => operadoras.id),
  nome: text("nome").notNull(),
  codigo: text("codigo").notNull(),
  segmentacao: segmentacao("segmentacao").notNull(),
  acomodacao: acomodacao("acomodacao").notNull(),
  abrangencia: abrangencia("abrangencia").notNull(),
  tipoContratacao: tipoContratacao("tipo_contratacao").notNull(),
  coparticipacao: boolean("coparticipacao").default(false).notNull(),
  carencias: text("carencias").notNull(),
  coberturas: text("coberturas").notNull(),
  redeCredenciada: text("rede_credenciada").notNull(),
  taxaAdesao: integer("taxa_adesao").default(0).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const planoPrecos = pgTable(
  "plano_precos",
  {
    id: id(),
    planoId: uuid("plano_id")
      .notNull()
      .references(() => planos.id, { onDelete: "cascade" }),
    faixaEtaria: faixaEtaria("faixa_etaria").notNull(),
    valor: integer("valor").notNull(),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [uniqueIndex("plano_precos_plano_faixa_uq").on(t.planoId, t.faixaEtaria)],
).enableRLS();
export const contratoModelos = pgTable("contrato_modelos", {
  id: id(),
  nome: text("nome").notNull(),
  planoId: uuid("plano_id").references(() => planos.id),
  corpo: text("corpo").notNull(),
  pdfAnexoPath: text("pdf_anexo_path"),
  ativo: boolean("ativo").default(true).notNull(),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const clientes = pgTable("clientes", {
  id: id(),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull().unique(),
  nascimento: date("nascimento").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  cep: text("cep").notNull(),
  logradouro: text("logradouro").notNull(),
  numero: text("numero").notNull(),
  complemento: text("complemento"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  uf: text("uf").notNull(),
  criadoPor: text("criado_por").references(() => user.id),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const leads = pgTable(
  "leads",
  {
    id: id(),
    nome: text("nome").notNull(),
    whatsapp: text("whatsapp").notNull(),
    perfil: text("perfil").default("Adesão").notNull(),
    idades: text("idades"),
    status: text("status").default("Aguardando").notNull(),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    clienteId: uuid("cliente_id").references(() => clientes.id),
    ordemId: uuid("ordem_id")
      .unique()
      .references(() => ordens.id),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [index("leads_status_idx").on(t.status, t.criadoEm)],
).enableRLS();
export const dependentes = pgTable("dependentes", {
  id: id(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull(),
  nascimento: date("nascimento").notNull(),
  parentesco: parentesco("parentesco").notNull(),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const ordens = pgTable(
  "ordens",
  {
    id: id(),
    clienteId: uuid("cliente_id")
      .notNull()
      .references(() => clientes.id),
    planoId: uuid("plano_id")
      .notNull()
      .references(() => planos.id),
    contratoModeloId: uuid("contrato_modelo_id").references(() => contratoModelos.id),
    status: ordemStatus("status").default("rascunho").notNull(),
    valorMensal: integer("valor_mensal").notNull(),
    valorAdesao: integer("valor_adesao").notNull(),
    desconto: integer("desconto").default(0).notNull(),
    descontoObs: text("desconto_obs"),
    valorCobradoTipo: valorCobradoTipo("valor_cobrado_tipo").notNull(),
    valorCobrado: integer("valor_cobrado").notNull(),
    formasPagamento: metodoPagamento("formas_pagamento")
      .array()
      .default(["pix", "boleto", "cartao"])
      .notNull(),
    maxParcelas: integer("max_parcelas").default(1).notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
    enviadaEm: timestamp("enviada_em", { withTimezone: true }),
    visualizadaEm: timestamp("visualizada_em", { withTimezone: true }),
    assinadaEm: timestamp("assinada_em", { withTimezone: true }),
    pagaEm: timestamp("paga_em", { withTimezone: true }),
    canceladaEm: timestamp("cancelada_em", { withTimezone: true }),
    criadaPor: text("criada_por").references(() => user.id),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [
    index("ordens_status_idx").on(t.status),
    index("ordens_cliente_idx").on(t.clienteId),
    check("ordens_max_parcelas_ck", sql`${t.maxParcelas} between 1 and 12`),
  ],
).enableRLS();
export const ordemBeneficiarios = pgTable("ordem_beneficiarios", {
  id: id(),
  ordemId: uuid("ordem_id")
    .notNull()
    .references(() => ordens.id, { onDelete: "cascade" }),
  titular: boolean("titular").notNull(),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull(),
  nascimento: date("nascimento").notNull(),
  faixaEtaria: faixaEtaria("faixa_etaria").notNull(),
  valor: integer("valor").notNull(),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const ordemSnapshotPlano = pgTable("ordem_snapshot_plano", {
  id: id(),
  ordemId: uuid("ordem_id")
    .notNull()
    .unique()
    .references(() => ordens.id, { onDelete: "cascade" }),
  dados: jsonb("dados").notNull(),
  contratoCorpo: text("contrato_corpo").notNull(),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const consentimentos = pgTable(
  "consentimentos",
  {
    id: id(),
    ordemId: uuid("ordem_id")
      .notNull()
      .references(() => ordens.id, { onDelete: "cascade" }),
    tipo: text("tipo").notNull(),
    aceitoEm: timestamp("aceito_em", { withTimezone: true }).notNull(),
    ip: text("ip").notNull(),
    userAgent: text("user_agent").notNull(),
    versaoTexto: text("versao_texto").notNull(),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [check("consentimentos_tipo_ck", sql`${t.tipo} in ('contrato', 'lgpd')`)],
).enableRLS();
export const assinaturas = pgTable("assinaturas", {
  id: id(),
  ordemId: uuid("ordem_id")
    .notNull()
    .unique()
    .references(() => ordens.id),
  imagemPath: text("imagem_path").notNull(),
  pdfPath: text("pdf_path").notNull(),
  evidenciasPdfPath: text("evidencias_pdf_path").notNull(),
  hashSha256: text("hash_sha256").notNull(),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull(),
  ip: text("ip").notNull(),
  userAgent: text("user_agent").notNull(),
  geo: jsonb("geo"),
  telefoneOtp: text("telefone_otp").notNull(),
  otpValidadoEm: timestamp("otp_validado_em", { withTimezone: true }).notNull(),
  assinadoEm: timestamp("assinado_em", { withTimezone: true }).notNull(),
  provider: text("provider").default("inhouse").notNull(),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const otpCodigos = pgTable("otp_codigos", {
  id: id(),
  ordemId: uuid("ordem_id")
    .notNull()
    .references(() => ordens.id, { onDelete: "cascade" }),
  telefone: text("telefone").notNull(),
  codigoHash: text("codigo_hash").notNull(),
  expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
  tentativas: integer("tentativas").default(0).notNull(),
  maxTentativas: integer("max_tentativas").default(5).notNull(),
  usadoEm: timestamp("usado_em", { withTimezone: true }),
  enviadoEm: timestamp("enviado_em", { withTimezone: true }).defaultNow().notNull(),
  criadoEm: criadoEm(),
  atualizadoEm: atualizadoEm(),
}).enableRLS();
export const pagamentos = pgTable(
  "pagamentos",
  {
    id: id(),
    ordemId: uuid("ordem_id")
      .notNull()
      .references(() => ordens.id),
    provider: text("provider").notNull(),
    providerCustomerId: text("provider_customer_id"),
    providerPaymentId: text("provider_payment_id").unique(),
    metodo: metodoPagamento("metodo").notNull(),
    valor: integer("valor").notNull(),
    parcelas: integer("parcelas").default(1).notNull(),
    status: pagamentoStatus("status").default("pendente").notNull(),
    pixPayload: text("pix_payload"),
    pixQrBase64: text("pix_qr_base64"),
    boletoUrl: text("boleto_url"),
    boletoLinha: text("boleto_linha"),
    checkoutUrl: text("checkout_url"),
    vencimento: date("vencimento"),
    pagoEm: timestamp("pago_em", { withTimezone: true }),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [index("pagamentos_ordem_idx").on(t.ordemId)],
).enableRLS();
export const webhookEventos = pgTable(
  "webhook_eventos",
  {
    id: id(),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    tipo: text("tipo").notNull(),
    payload: jsonb("payload").notNull(),
    processadoEm: timestamp("processado_em", { withTimezone: true }),
    erro: text("erro"),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [uniqueIndex("webhook_eventos_provider_event_uq").on(t.provider, t.eventId)],
).enableRLS();
export const mensagens = pgTable(
  "mensagens",
  {
    id: id(),
    ordemId: uuid("ordem_id").references(() => ordens.id),
    canal: canalMensagem("canal").notNull(),
    template: text("template").notNull(),
    para: text("para").notNull(),
    status: mensagemStatus("status").default("enfileirada").notNull(),
    providerMessageId: text("provider_message_id"),
    erro: text("erro"),
    enviadaEm: timestamp("enviada_em", { withTimezone: true }),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [index("mensagens_provider_message_idx").on(t.providerMessageId)],
).enableRLS();
export const auditoria = pgTable(
  "auditoria",
  {
    id: id(),
    entidade: text("entidade").notNull(),
    entidadeId: text("entidade_id").notNull(),
    acao: text("acao").notNull(),
    ator: text("ator").notNull(),
    metadados: jsonb("metadados").default({}).notNull(),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [index("auditoria_entidade_idx").on(t.entidade, t.entidadeId)],
).enableRLS();
