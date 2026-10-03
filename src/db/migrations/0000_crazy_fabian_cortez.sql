CREATE TYPE "public"."abrangencia" AS ENUM('municipal', 'estadual', 'nacional');--> statement-breakpoint
CREATE TYPE "public"."acomodacao" AS ENUM('enfermaria', 'apartamento');--> statement-breakpoint
CREATE TYPE "public"."canal_mensagem" AS ENUM('whatsapp', 'email');--> statement-breakpoint
CREATE TYPE "public"."faixa_etaria" AS ENUM('0-18', '19-23', '24-28', '29-33', '34-38', '39-43', '44-48', '49-53', '54-58', '59+');--> statement-breakpoint
CREATE TYPE "public"."mensagem_status" AS ENUM('enfileirada', 'enviada', 'entregue', 'lida', 'falhou');--> statement-breakpoint
CREATE TYPE "public"."metodo_pagamento" AS ENUM('pix', 'boleto', 'cartao');--> statement-breakpoint
CREATE TYPE "public"."ordem_status" AS ENUM('rascunho', 'enviada', 'visualizada', 'assinada', 'aguardando_pagamento', 'paga', 'expirada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."pagamento_status" AS ENUM('pendente', 'confirmado', 'recebido', 'vencido', 'estornado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."parentesco" AS ENUM('conjuge', 'filho', 'pai_mae', 'outro');--> statement-breakpoint
CREATE TYPE "public"."segmentacao" AS ENUM('ambulatorial', 'hospitalar', 'hospitalar_obstetricia', 'ambulatorial_hospitalar', 'ambulatorial_hospitalar_obstetricia', 'referencia');--> statement-breakpoint
CREATE TYPE "public"."tipo_contratacao" AS ENUM('individual', 'familiar', 'pme');--> statement-breakpoint
CREATE TYPE "public"."valor_cobrado_tipo" AS ENUM('primeira_mensalidade_adesao', 'total_adesao_mensalidade_so', 'adesao_so', 'mensalidade_so', 'personalizado');--> statement-breakpoint
CREATE TABLE "assinaturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ordem_id" uuid NOT NULL,
	"imagem_path" text NOT NULL,
	"pdf_path" text NOT NULL,
	"evidencias_pdf_path" text NOT NULL,
	"hash_sha256" text NOT NULL,
	"nome" text NOT NULL,
	"cpf" text NOT NULL,
	"ip" text NOT NULL,
	"user_agent" text NOT NULL,
	"geo" jsonb,
	"telefone_otp" text NOT NULL,
	"otp_validado_em" timestamp with time zone NOT NULL,
	"assinado_em" timestamp with time zone NOT NULL,
	"provider" text DEFAULT 'inhouse' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assinaturas_ordem_id_unique" UNIQUE("ordem_id")
);
--> statement-breakpoint
ALTER TABLE "assinaturas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entidade" text NOT NULL,
	"entidade_id" text NOT NULL,
	"acao" text NOT NULL,
	"ator" text NOT NULL,
	"metadados" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auditoria" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cpf" text NOT NULL,
	"nascimento" date NOT NULL,
	"email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"cep" text NOT NULL,
	"logradouro" text NOT NULL,
	"numero" text NOT NULL,
	"complemento" text,
	"bairro" text NOT NULL,
	"cidade" text NOT NULL,
	"uf" text NOT NULL,
	"criado_por" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clientes_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "consentimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ordem_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"aceito_em" timestamp with time zone NOT NULL,
	"ip" text NOT NULL,
	"user_agent" text NOT NULL,
	"versao_texto" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consentimentos_tipo_ck" CHECK ("consentimentos"."tipo" in ('contrato', 'lgpd'))
);
--> statement-breakpoint
ALTER TABLE "consentimentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "contrato_modelos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"plano_id" uuid,
	"corpo" text NOT NULL,
	"pdf_anexo_path" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contrato_modelos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "dependentes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"cpf" text NOT NULL,
	"nascimento" date NOT NULL,
	"parentesco" "parentesco" NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dependentes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mensagens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ordem_id" uuid,
	"canal" "canal_mensagem" NOT NULL,
	"template" text NOT NULL,
	"para" text NOT NULL,
	"status" "mensagem_status" DEFAULT 'enfileirada' NOT NULL,
	"provider_message_id" text,
	"erro" text,
	"enviada_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mensagens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "operadoras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cnpj" text NOT NULL,
	"registro_ans" text NOT NULL,
	"logo_path" text,
	"ativa" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "operadoras_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
ALTER TABLE "operadoras" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ordem_beneficiarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ordem_id" uuid NOT NULL,
	"titular" boolean NOT NULL,
	"nome" text NOT NULL,
	"cpf" text NOT NULL,
	"nascimento" date NOT NULL,
	"faixa_etaria" "faixa_etaria" NOT NULL,
	"valor" integer NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ordem_beneficiarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ordem_snapshot_plano" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ordem_id" uuid NOT NULL,
	"dados" jsonb NOT NULL,
	"contrato_corpo" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ordem_snapshot_plano_ordem_id_unique" UNIQUE("ordem_id")
);
--> statement-breakpoint
ALTER TABLE "ordem_snapshot_plano" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ordens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"plano_id" uuid NOT NULL,
	"contrato_modelo_id" uuid,
	"status" "ordem_status" DEFAULT 'rascunho' NOT NULL,
	"valor_mensal" integer NOT NULL,
	"valor_adesao" integer NOT NULL,
	"desconto" integer DEFAULT 0 NOT NULL,
	"desconto_obs" text,
	"valor_cobrado_tipo" "valor_cobrado_tipo" NOT NULL,
	"valor_cobrado" integer NOT NULL,
	"formas_pagamento" "metodo_pagamento"[] DEFAULT '{"pix","boleto","cartao"}' NOT NULL,
	"max_parcelas" integer DEFAULT 1 NOT NULL,
	"token_hash" text NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"enviada_em" timestamp with time zone,
	"visualizada_em" timestamp with time zone,
	"assinada_em" timestamp with time zone,
	"paga_em" timestamp with time zone,
	"cancelada_em" timestamp with time zone,
	"criada_por" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ordens_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "ordens_max_parcelas_ck" CHECK ("ordens"."max_parcelas" between 1 and 12)
);
--> statement-breakpoint
ALTER TABLE "ordens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "otp_codigos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ordem_id" uuid NOT NULL,
	"telefone" text NOT NULL,
	"codigo_hash" text NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"tentativas" integer DEFAULT 0 NOT NULL,
	"max_tentativas" integer DEFAULT 5 NOT NULL,
	"usado_em" timestamp with time zone,
	"enviado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "otp_codigos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ordem_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_customer_id" text,
	"provider_payment_id" text,
	"metodo" "metodo_pagamento" NOT NULL,
	"valor" integer NOT NULL,
	"parcelas" integer DEFAULT 1 NOT NULL,
	"status" "pagamento_status" DEFAULT 'pendente' NOT NULL,
	"pix_payload" text,
	"pix_qr_base64" text,
	"boleto_url" text,
	"boleto_linha" text,
	"checkout_url" text,
	"vencimento" date,
	"pago_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pagamentos_provider_payment_id_unique" UNIQUE("provider_payment_id")
);
--> statement-breakpoint
ALTER TABLE "pagamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "plano_precos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plano_id" uuid NOT NULL,
	"faixa_etaria" "faixa_etaria" NOT NULL,
	"valor" integer NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plano_precos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "planos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operadora_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"codigo" text NOT NULL,
	"segmentacao" "segmentacao" NOT NULL,
	"acomodacao" "acomodacao" NOT NULL,
	"abrangencia" "abrangencia" NOT NULL,
	"tipo_contratacao" "tipo_contratacao" NOT NULL,
	"coparticipacao" boolean DEFAULT false NOT NULL,
	"carencias" text NOT NULL,
	"coberturas" text NOT NULL,
	"rede_credenciada" text NOT NULL,
	"taxa_adesao" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "planos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"nome" text NOT NULL,
	"papel" text DEFAULT 'admin' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "webhook_eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"event_id" text NOT NULL,
	"tipo" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processado_em" timestamp with time zone,
	"erro" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhook_eventos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_ordem_id_ordens_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_criado_por_user_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consentimentos" ADD CONSTRAINT "consentimentos_ordem_id_ordens_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrato_modelos" ADD CONSTRAINT "contrato_modelos_plano_id_planos_id_fk" FOREIGN KEY ("plano_id") REFERENCES "public"."planos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dependentes" ADD CONSTRAINT "dependentes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_ordem_id_ordens_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordem_beneficiarios" ADD CONSTRAINT "ordem_beneficiarios_ordem_id_ordens_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordem_snapshot_plano" ADD CONSTRAINT "ordem_snapshot_plano_ordem_id_ordens_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens" ADD CONSTRAINT "ordens_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens" ADD CONSTRAINT "ordens_plano_id_planos_id_fk" FOREIGN KEY ("plano_id") REFERENCES "public"."planos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens" ADD CONSTRAINT "ordens_contrato_modelo_id_contrato_modelos_id_fk" FOREIGN KEY ("contrato_modelo_id") REFERENCES "public"."contrato_modelos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens" ADD CONSTRAINT "ordens_criada_por_user_id_fk" FOREIGN KEY ("criada_por") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp_codigos" ADD CONSTRAINT "otp_codigos_ordem_id_ordens_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_ordem_id_ordens_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plano_precos" ADD CONSTRAINT "plano_precos_plano_id_planos_id_fk" FOREIGN KEY ("plano_id") REFERENCES "public"."planos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planos" ADD CONSTRAINT "planos_operadora_id_operadoras_id_fk" FOREIGN KEY ("operadora_id") REFERENCES "public"."operadoras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auditoria_entidade_idx" ON "auditoria" USING btree ("entidade","entidade_id");--> statement-breakpoint
CREATE INDEX "mensagens_provider_message_idx" ON "mensagens" USING btree ("provider_message_id");--> statement-breakpoint
CREATE INDEX "ordens_status_idx" ON "ordens" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ordens_cliente_idx" ON "ordens" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "pagamentos_ordem_idx" ON "pagamentos" USING btree ("ordem_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plano_precos_plano_faixa_uq" ON "plano_precos" USING btree ("plano_id","faixa_etaria");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_eventos_provider_event_uq" ON "webhook_eventos" USING btree ("provider","event_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");