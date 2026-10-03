import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ausente");
  const sql = postgres(url, { max: 1, prepare: false });
  try {
    await migrate(drizzle(sql), { migrationsFolder: "src/db/migrations" });
    const rows =
      await sql`select count(*)::int as n from information_schema.tables where table_schema = 'public'`;
    console.log("migrations ok, tabelas em public:", rows[0].n);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error("ERRO:", e?.cause?.code ?? e?.code ?? "", e?.cause?.message ?? e?.message ?? e);
  process.exit(1);
});
