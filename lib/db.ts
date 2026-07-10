import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  connPool: Pool | undefined;
};

function sanitizeConnectionString(url: string | undefined): string | undefined {
  if (!url) return url;
  return url
    .replace(/sslmode=require/g, "sslmode=verify-full")
    .replace(/sslmode=prefer/g, "sslmode=verify-full")
    .replace(/sslmode=verify-ca/g, "sslmode=verify-full");
}

function createPool() {
  const connectionString = sanitizeConnectionString(process.env.DATABASE_URL);
  const isNeon = connectionString?.includes("neon.tech");

  return new Pool({
    connectionString,
    ssl: isNeon ? { rejectUnauthorized: false } : undefined,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
}

export const pool = globalForDb.connPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.connPool = pool;
}

export const db = drizzle(pool, { schema });

export async function query<T = any>(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
