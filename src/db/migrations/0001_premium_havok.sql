CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"whatsapp" text NOT NULL,
	"perfil" text DEFAULT 'Adesão' NOT NULL,
	"idades" text,
	"status" text DEFAULT 'Aguardando' NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"cliente_id" uuid,
	"ordem_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_ordem_id_unique" UNIQUE("ordem_id")
);
--> statement-breakpoint
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_ordem_id_ordens_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status","criado_em");