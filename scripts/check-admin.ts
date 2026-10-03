import "dotenv/config";
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
  try {
    const rows =
      await sql`select u.email, us.papel from "user" u left join usuarios us on us.user_id = u.id`;
    console.log(
      rows.map((r) => `${r.email} (${r.papel ?? "sem perfil"})`).join("\n") || "nenhum usuario",
    );
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exit(1);
});
