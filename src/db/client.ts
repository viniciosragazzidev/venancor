import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");

// Um pool só por processo. No dev, cada hot reload reavalia este módulo; sem o cache em
// globalThis, cada reload abria um pool novo e o session pooler do Supabase estourava
// (EMAXCONNSESSION, limite de 15 clientes). Em serverless cada instância usa poucas conexões.
const globalForDb = globalThis as unknown as { medlinkSql?: ReturnType<typeof postgres> };

/**
 * Em produção (serverless) usa o modo transação do pooler do Supabase (porta 6543): a conexão volta ao pool
 * ao fim de cada transação. No modo sessão (5432) cada instância da Vercel prende conexões e, com várias
 * instâncias (ex.: logo após um deploy), o limite de 15 estoura e o login cai com 500 (incidente 11/11).
 * `prepare: false` abaixo é o que o modo transação exige.
 */
export function urlDoPooler(url: string, producao: boolean) {
  if (!producao) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".pooler.supabase.com") && parsed.port === "5432") {
      parsed.port = "6543";
      return parsed.toString();
    }
  } catch {
    // URL fora do formato padrão: usa como veio.
  }
  return url;
}

export const client =
  globalForDb.medlinkSql ??
  postgres(connectionString, {
    // Session pooler (5432), como até 10/11. O modo transação (urlDoPooler, porta 6543) foi testado em 11/11 e o
    // login parou (getSession do Better Auth vazio): não usar sem testar o login de ponta a ponta.
    max: process.env.NODE_ENV === "production" ? 3 : 5,
    idle_timeout: 20,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.medlinkSql = client;

export const db = drizzle(client, { schema });
