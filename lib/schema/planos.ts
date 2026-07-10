import { pgTable, serial, varchar, text, integer, decimal } from "drizzle-orm/pg-core";

export const operadoras = pgTable("operadoras", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  logoUrl: text("logo_url"),
});

export const planos = pgTable("planos", {
  id: serial("id").primaryKey(),
  operadoraId: integer("operadoraId")
    .notNull()
    .references(() => operadoras.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipoContratacao: varchar("tipoContratacao", { length: 100 }),
  segmentacao: varchar("segmentacao", { length: 100 }),
  abrangencia: varchar("abrangencia", { length: 100 }),
  beneficios: text("beneficios"),
  coparticipacao: varchar("coparticipacao", { length: 50 }),
  cidades: text("cidades"),
  carenciaUrgencia: varchar("carenciaUrgencia", { length: 100 }),
  carenciaConsultas: varchar("carenciaConsultas", { length: 100 }),
  carenciaExamesSimples: varchar("carenciaExamesSimples", { length: 100 }),
  carenciaAltaComplexidade: varchar("carenciaAltaComplexidade", { length: 100 }),
  carenciaPreexistencias: varchar("carenciaPreexistencias", { length: 100 }),
});

export const precos = pgTable("precos", {
  id: serial("id").primaryKey(),
  planoId: integer("planoId")
    .notNull()
    .references(() => planos.id, { onDelete: "cascade" }),
  faixa0a18: decimal("faixa0a18", { precision: 10, scale: 2 }),
  faixa19a23: decimal("faixa19a23", { precision: 10, scale: 2 }),
  faixa24a28: decimal("faixa24a28", { precision: 10, scale: 2 }),
  faixa29a33: decimal("faixa29a33", { precision: 10, scale: 2 }),
  faixa34a38: decimal("faixa34a38", { precision: 10, scale: 2 }),
  faixa39a43: decimal("faixa39a43", { precision: 10, scale: 2 }),
  faixa44a48: decimal("faixa44a48", { precision: 10, scale: 2 }),
  faixa49a53: decimal("faixa49a53", { precision: 10, scale: 2 }),
  faixa54a58: decimal("faixa54a58", { precision: 10, scale: 2 }),
  faixa59mais: decimal("faixa59mais", { precision: 10, scale: 2 }),
});
