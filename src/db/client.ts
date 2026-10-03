import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");

// Um pool só por processo. No dev, cada hot reload reavalia este módulo; sem o cache em
// globalThis, cada reload abria um pool novo e o session pooler do Supabase estourava
// (EMAXCONNSESSION, limite de 15 clientes). Em serverless cada instância usa poucas conexões.
const globalForDb = globalThis as unknown as { medlinkSql?: ReturnType<typeof postgres> };

export const client =
  globalForDb.medlinkSql ??
  postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 3 : 5,
    idle_timeout: 20,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.medlinkSql = client;

export const db = drizzle(client, { schema });
