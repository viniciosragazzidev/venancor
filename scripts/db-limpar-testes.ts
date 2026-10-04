import "dotenv/config";
import postgres from "postgres";

// Apaga só dados transacionais de teste. Mantém usuários/login, catálogo (operadoras, planos,
// preços, modelos de contrato) e clientes cadastrados.
const TRANSACIONAIS = [
  "ordens",
  "ordem_beneficiarios",
  "ordem_snapshot_plano",
  "assinaturas",
  "consentimentos",
  "otp_codigos",
  "pagamentos",
  "mensagens",
  "webhook_eventos",
  "auditoria",
  "leads",
  "rateLimit",
];

async function main() {
  if (process.env.CONFIRMAR !== "sim")
    throw new Error("Defina CONFIRMAR=sim para apagar os dados de teste");
  const sql = postgres(process.env.DATABASE_URL!.replace(":5432/", ":6543/"), {
    max: 1,
    prepare: false,
  });
  try {
    await sql.begin((tx) =>
      tx.unsafe(`truncate table ${TRANSACIONAIS.map((t) => `"${t}"`).join(", ")} restart identity`),
    );
    console.log("dados de teste apagados:", TRANSACIONAIS.join(", "));
  } finally {
    await sql.end();
  }
}
main().catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exitCode = 1;
});
