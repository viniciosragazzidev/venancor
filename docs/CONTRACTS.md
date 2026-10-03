# CONTRACTS (fonte para Cofre e Mutirão)

Convenções: tabelas e colunas em snake_case pt-BR; PK `id uuid default gen_random_uuid()`; `criado_em`/`atualizado_em timestamptz default now()`; dinheiro em **centavos (integer)**, nunca float; datas em UTC no banco, exibição America/Sao_Paulo. CPF só dígitos no banco (11 chars). Telefone E.164.

### Tabelas Better Auth (adapter Drizzle, nomes padrão; gerar com `npx @better-auth/cli generate` e conferir)

- `user`: id text PK, name text, email text unique, email_verified bool, image text null, created_at, updated_at
- `session`: id text PK, user_id FK→user (cascade), token text unique, expires_at, ip_address null, user_agent null, created_at, updated_at
- `account`: id text PK, user_id FK→user (cascade), account_id, provider_id, password text (hash), access_token/refresh_token/id_token null, *_expires_at null, scope null, created_at, updated_at
- `verification`: id text PK, identifier, value, expires_at, created_at, updated_at
  `usuarios` abaixo é o perfil 1:1 (`user_id` text FK→user.id).

## 1. Enums (pgEnum)

- `ordem_status`: rascunho, enviada, visualizada, assinada, aguardando_pagamento, paga, expirada, cancelada
- `faixa_etaria`: 0-18, 19-23, 24-28, 29-33, 34-38, 39-43, 44-48, 49-53, 54-58, 59+
- `segmentacao`: ambulatorial, hospitalar, hospitalar_obstetricia, ambulatorial_hospitalar, ambulatorial_hospitalar_obstetricia, referencia
- `acomodacao`: enfermaria, apartamento
- `abrangencia`: municipal, estadual, nacional
- `tipo_contratacao`: individual, familiar, pme
- `metodo_pagamento`: pix, boleto, cartao
- `pagamento_status`: pendente, confirmado, recebido, vencido, estornado, cancelado
- `parentesco`: conjuge, filho, pai_mae, outro
- `canal_mensagem`: whatsapp, email
- `mensagem_status`: enfileirada, enviada, entregue, lida, falhou
- `valor_cobrado_tipo`: primeira_mensalidade_adesao, total_adesao_mensalidade_so, adesao_so, mensalidade_so, personalizado

## 2. Tabelas

| Tabela               | Colunas (além de id/criado_em/atualizado_em)                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| usuarios             | user_id (FK Better Auth, unique), nome, papel text default 'admin'                                                                                                                                                                                                                                                                                                                                                                                                      |
| operadoras           | nome, cnpj (unique), registro_ans, logo_path (Storage), ativa bool                                                                                                                                                                                                                                                                                                                                                                                                      |
| planos               | operadora_id FK, nome, codigo, segmentacao, acomodacao, abrangencia, tipo_contratacao, coparticipacao bool, carencias text, coberturas text (rico/markdown), rede_credenciada text, taxa_adesao int (centavos, default 0), ativo bool                                                                                                                                                                                                                                   |
| plano_precos         | plano_id FK, faixa_etaria, valor int; unique(plano_id, faixa_etaria)                                                                                                                                                                                                                                                                                                                                                                                                    |
| contrato_modelos     | nome, plano_id FK null (null = genérico), corpo text (com `{{vars}}`), pdf_anexo_path null, ativo bool                                                                                                                                                                                                                                                                                                                                                                  |
| clientes             | nome, cpf (unique), nascimento date, email, whatsapp, cep, logradouro, numero, complemento, bairro, cidade, uf, criado_por                                                                                                                                                                                                                                                                                                                                              |
| dependentes          | cliente_id FK cascade, nome, cpf, nascimento, parentesco                                                                                                                                                                                                                                                                                                                                                                                                                |
| ordens               | cliente_id, plano_id, contrato_modelo_id, status ordem_status default rascunho, valor_mensal int, valor_adesao int, desconto int default 0, desconto_obs text, valor_cobrado_tipo, valor_cobrado int, formas_pagamento metodo_pagamento[] default all, max_parcelas int default 1 (1-12), token_hash text unique (SHA-256 do token; token puro nunca é salvo), expira_em timestamptz, enviada_em, visualizada_em, assinada_em, paga_em, cancelada_em (null), criada_por |
| ordem_beneficiarios  | ordem_id FK cascade, titular bool, nome, cpf, nascimento, faixa_etaria, valor int (snapshot)                                                                                                                                                                                                                                                                                                                                                                            |
| ordem_snapshot_plano | ordem_id FK unique, dados jsonb (plano+operadora+precos+contrato renderizado base), contrato_corpo text                                                                                                                                                                                                                                                                                                                                                                 |
| consentimentos       | ordem_id, tipo ('contrato','lgpd'), aceito_em, ip, user_agent, versao_texto                                                                                                                                                                                                                                                                                                                                                                                             |
| assinaturas          | ordem_id unique, imagem_path, pdf_path, evidencias_pdf_path, hash_sha256, nome, cpf, ip, user_agent, geo jsonb null, telefone_otp, otp_validado_em, assinado_em, provider text ('inhouse')                                                                                                                                                                                                                                                                              |
| otp_codigos          | ordem_id FK, telefone, codigo_hash (HMAC/sha256+salt), expira_em (5 min), tentativas int default 0, max_tentativas int default 5, usado_em null, enviado_em                                                                                                                                                                                                                                                                                                             |
| pagamentos           | ordem_id FK, provider, provider_customer_id, provider_payment_id (unique), metodo, valor int, parcelas int, status pagamento_status, pix_payload, pix_qr_base64, boleto_url, boleto_linha, checkout_url, vencimento date, pago_em                                                                                                                                                                                                                                       |
| webhook_eventos      | provider, event_id (unique(provider,event_id)), tipo, payload jsonb, processado_em null, erro null                                                                                                                                                                                                                                                                                                                                                                      |
| mensagens            | ordem_id null, canal, template, para, status, provider_message_id (idx), erro, enviada_em                                                                                                                                                                                                                                                                                                                                                                               |
| auditoria            | entidade, entidade_id, acao, ator text ('admin:<id>'/'cliente'/'webhook:asaas'/'sistema'), metadados jsonb (sem CPF/OTP em claro), criado_em                                                                                                                                                                                                                                                                                                                            |

Índices: ordens(status), ordens(cliente_id), pagamentos(ordem_id), mensagens(provider_message_id), auditoria(entidade, entidade_id).
RLS: `ENABLE ROW LEVEL SECURITY` em todas as tabelas, sem policies (acesso só via servidor).
Recorrência futura: `pagamentos` já é 1:N com ordens; adicionar `assinatura_recorrente` depois sem mudar o existente.

## 3. Máquina de estados (`modules/ordens/state-machine.ts`)

```ts
export type OrdemStatus =
  | "rascunho"
  | "enviada"
  | "visualizada"
  | "assinada"
  | "aguardando_pagamento"
  | "paga"
  | "expirada"
  | "cancelada";
export const TRANSICOES: Record<OrdemStatus, OrdemStatus[]> = {
  rascunho: ["enviada", "cancelada"],
  enviada: ["visualizada", "expirada", "cancelada"],
  visualizada: ["assinada", "expirada", "cancelada"],
  assinada: ["aguardando_pagamento", "cancelada"],
  aguardando_pagamento: ["paga", "expirada", "cancelada"],
  paga: [],
  expirada: [],
  cancelada: [],
};
export function podeTransicionar(de: OrdemStatus, para: OrdemStatus): boolean;
export function transicionar(ordemId: string, para: OrdemStatus, ator: string): Promise<void>; // valida, UPDATE ... WHERE status=de (otimista), grava auditoria
```

Regras: reenvio mantém `enviada`/`visualizada` (não é transição). Cobrança vencida não muda a ordem: em `aguardando_pagamento` pode-se criar nova cobrança (nova linha em `pagamentos`). `expirada` segue DECISIONS D6.
**Regra de ouro (backend):** `PaymentProvider.criarCobranca` só é chamado por `modules/pagamentos` após checar `assinaturas` existente e `ordem.status ∈ {assinada, aguardando_pagamento}`; transição `assinada→aguardando_pagamento` ocorre na criação da cobrança. Nenhuma rota/ação pública cria cobrança sem essa checagem (teste unitário obrigatório).

## 4. Interfaces dos provedores (`src/providers/*/types.ts`)

```ts
// payment
export type Metodo = "pix" | "boleto" | "cartao";
export interface ClientePagador {
  nome: string;
  cpf: string;
  email?: string;
  whatsapp?: string;
}
export interface CriarCobrancaInput {
  ordemId: string;
  cliente: ClientePagador;
  metodo: Metodo;
  valorCentavos: number;
  parcelas?: number;
  vencimento: Date;
  descricao: string;
}
export interface Cobranca {
  providerPaymentId: string;
  providerCustomerId: string;
  status: "pendente" | "confirmado" | "recebido" | "vencido" | "estornado" | "cancelado";
  pixPayload?: string;
  pixQrBase64?: string;
  boletoUrl?: string;
  boletoLinha?: string;
  checkoutUrl?: string;
}
export type EventoPagamentoTipo = "confirmado" | "recebido" | "vencido" | "estornado" | "outro";
export interface EventoPagamento {
  eventId: string;
  tipo: EventoPagamentoTipo;
  providerPaymentId: string;
  ordemId?: string;
  bruto: unknown;
}
export interface PaymentProvider {
  readonly nome: string;
  criarCobranca(i: CriarCobrancaInput): Promise<Cobranca>;
  consultarCobranca(providerPaymentId: string): Promise<Cobranca>;
  cancelarCobranca(providerPaymentId: string): Promise<void>;
  validarWebhook(headers: Headers, rawBody: string): boolean; // compara token em tempo constante
  parseWebhook(rawBody: string): EventoPagamento;
}

// messaging
export type TemplateNome =
  "proposta_enviada" | "codigo_assinatura" | "pagamento_confirmado" | "lembrete_proposta";
export interface EnviarTemplateInput {
  para: string /*E.164*/;
  template: TemplateNome;
  variaveis: Record<string, string>;
  ordemId?: string;
}
export interface EnvioResultado {
  providerMessageId: string;
  status: "enviada" | "falhou";
  erro?: string;
}
export interface StatusEntrega {
  providerMessageId: string;
  status: "enviada" | "entregue" | "lida" | "falhou";
  erro?: string;
}
export interface MessagingProvider {
  readonly nome: string;
  enviarTemplate(i: EnviarTemplateInput): Promise<EnvioResultado>;
  validarWebhook(headers: Headers, rawBody: string): boolean; // X-Hub-Signature-256 (HMAC app secret)
  parseStatusWebhook(rawBody: string): StatusEntrega[];
}

// signature
export interface DadosAssinatura {
  ordemId: string;
  nome: string;
  cpf: string;
  telefoneOtp: string;
  otpValidadoEm: Date;
  imagemPng: Uint8Array;
  ip: string;
  userAgent: string;
  geo?: { lat: number; lng: number; precisao?: number };
  contratoHtmlOuTexto: string;
  anexoPdf?: Uint8Array;
}
export interface AssinaturaConcluida {
  providerRef?: string;
  pdfAssinado: Uint8Array;
  paginaEvidencias: Uint8Array;
  hashSha256: string;
  assinadoEm: Date;
}
export interface SignatureProvider {
  readonly nome: string;
  assinar(d: DadosAssinatura): Promise<AssinaturaConcluida>; // InHouse: pdf-lib; hash do PDF final (hex)
  verificar(pdf: Uint8Array, hashEsperado: string): Promise<boolean>;
}
```

Factories: `getPaymentProvider()`, `getMessagingProvider()`, `getSignatureProvider()` em `src/providers/<x>/index.ts`, escolhidas por env (`PAYMENT_PROVIDER=asaas|fake`, `MESSAGING_PROVIDER=meta|fake`, `SIGNATURE_PROVIDER=inhouse`). Nada fora de `providers/` importa SDK/HTTP de terceiros.

## 5. Contratos de módulos (assinaturas mínimas)

```ts
// lib/pricing.ts (puro)
faixaPorIdade(nascimento: Date, ref?: Date): FaixaEtaria
calcularOrdem(benef: {nascimento: Date}[], precos: Record<FaixaEtaria, number>, adesao: number, desconto: number, tipo: ValorCobradoTipo, custom?: number): { itens: {faixa: FaixaEtaria; valor: number}[]; valorMensal: number; valorAdesao: number; desconto: number; valorCobrado: number }
// lib/tokens.ts
gerarToken(): { token: string /*base64url, 32 bytes crypto*/; hash: string }  ; hashToken(t: string): string
// lib/audit.ts
registrarAuditoria(e: { entidade: string; entidadeId: string; acao: string; ator: string; metadados?: object }): Promise<void>
// lib/log.ts: logger com mascaramento de CPF (###.***.***-##) e OTP
// modules/assinatura: enviarOtp(ordemId), validarOtp(ordemId, codigo) -> { ok } | { erro: 'expirado'|'invalido'|'bloqueado' }, concluirAssinatura(ordemId, payload)
// modules/pagamentos: iniciarPagamento(token, metodo, parcelas?) ; processarWebhook(provider, rawBody, headers)
```

Rotas públicas: `GET/POST /c/[token]` (server actions), `POST /api/webhooks/asaas`, `GET+POST /api/webhooks/whatsapp` (GET = verificação hub.challenge).
