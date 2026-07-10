import { pgTable, serial, varchar, text } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }).notNull(),
  perfil: varchar("perfil", { length: 100 }),
  idades: varchar("idades", { length: 100 }),
  status: varchar("status", { length: 50 }).default("Aguardando"),
  corretorId: text("corretorId").references(() => user.id, {
    onDelete: "set null",
  }),
  utmSource: varchar("utm_source", { length: 255 }),
  utmMedium: varchar("utm_medium", { length: 255 }),
  utmCampaign: varchar("utm_campaign", { length: 255 }),
});
