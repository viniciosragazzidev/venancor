import "dotenv/config";
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!.replace(":5432/", ":6543/"), {
    max: 1,
    prepare: false,
  });
  try {
    const tabelas =
      await sql`select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1`;
    for (const { table_name } of tabelas) {
      const [r] = await sql.unsafe(`select count(*)::int as n from "${table_name}"`);
      console.log(`${table_name}: ${r.n}`);
    }
  } finally {
    await sql.end();
  }
}
main().catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exitCode = 1;
});
