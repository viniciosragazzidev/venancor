CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'CORRETOR',
	"status" text DEFAULT 'ONLINE',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"whatsapp" varchar(50) NOT NULL,
	"perfil" varchar(100),
	"idades" varchar(100),
	"status" varchar(50) DEFAULT 'Aguardando',
	"corretorId" text,
	"utm_source" varchar(255),
	"utm_medium" varchar(255),
	"utm_campaign" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "operadoras" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"logo_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "planos" (
	"id" serial PRIMARY KEY NOT NULL,
	"operadoraId" integer NOT NULL,
	"nome" varchar(255) NOT NULL,
	"tipoContratacao" varchar(100),
	"segmentacao" varchar(100),
	"abrangencia" varchar(100),
	"beneficios" text,
	"coparticipacao" varchar(50),
	"cidades" text,
	"carenciaUrgencia" varchar(100),
	"carenciaConsultas" varchar(100),
	"carenciaExamesSimples" varchar(100),
	"carenciaAltaComplexidade" varchar(100),
	"carenciaPreexistencias" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "precos" (
	"id" serial PRIMARY KEY NOT NULL,
	"planoId" integer NOT NULL,
	"faixa0a18" numeric(10, 2),
	"faixa19a23" numeric(10, 2),
	"faixa24a28" numeric(10, 2),
	"faixa29a33" numeric(10, 2),
	"faixa34a38" numeric(10, 2),
	"faixa39a43" numeric(10, 2),
	"faixa44a48" numeric(10, 2),
	"faixa49a53" numeric(10, 2),
	"faixa54a58" numeric(10, 2),
	"faixa59mais" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'backlog',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "leads" ADD CONSTRAINT "leads_corretorId_user_id_fk" FOREIGN KEY ("corretorId") REFERENCES "public"."user"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "planos" ADD CONSTRAINT "planos_operadoraId_operadoras_id_fk" FOREIGN KEY ("operadoraId") REFERENCES "public"."operadoras"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "precos" ADD CONSTRAINT "precos_planoId_planos_id_fk" FOREIGN KEY ("planoId") REFERENCES "public"."planos"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null;
END $$;