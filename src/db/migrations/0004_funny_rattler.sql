CREATE TABLE "ordem_modelos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"plano_id" uuid,
	"contrato_modelo_id" uuid,
	"desconto" integer DEFAULT 0 NOT NULL,
	"desconto_obs" text,
	"valor_cobrado_tipo" "valor_cobrado_tipo" DEFAULT 'primeira_mensalidade_adesao' NOT NULL,
	"valor_personalizado" integer,
	"formas_pagamento" "metodo_pagamento"[] DEFAULT '{"pix","boleto","cartao"}' NOT NULL,
	"max_parcelas" integer DEFAULT 1 NOT NULL,
	"validade_dias" integer DEFAULT 7 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_por" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ordem_modelos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ordem_modelos" ADD CONSTRAINT "ordem_modelos_plano_id_planos_id_fk" FOREIGN KEY ("plano_id") REFERENCES "public"."planos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordem_modelos" ADD CONSTRAINT "ordem_modelos_contrato_modelo_id_contrato_modelos_id_fk" FOREIGN KEY ("contrato_modelo_id") REFERENCES "public"."contrato_modelos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordem_modelos" ADD CONSTRAINT "ordem_modelos_criado_por_user_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;