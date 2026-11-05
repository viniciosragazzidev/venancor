ALTER TABLE "ordem_modelos" ADD COLUMN "exige_assinatura" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "ordens" ADD COLUMN "exige_assinatura" boolean DEFAULT true NOT NULL;