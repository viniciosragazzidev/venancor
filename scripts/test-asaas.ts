import "dotenv/config";
import postgres from "postgres";
import { AsaasProvider } from "../src/providers/payment/asaas";

// Diagnóstico: cria uma cobrança Pix de R$ 10 no SANDBOX para o primeiro cliente cadastrado.
async function main() {
  process.env.ASAAS_API_KEY = (process.env.ASAAS_API_KEY ?? "").replace(/^\x5c/, "");
  if (process.env.ASAAS_ENV === "production") throw new Error("Só roda no sandbox");
  const sql = postgres(process.env.DATABASE_URL!.replace(":5432/", ":6543/"), {
    max: 1,
    prepare: false,
  });
  try {
    const [c] = await sql`select nome, cpf, email, whatsapp from clientes limit 1`;
    const cobranca = await new AsaasProvider().criarCobranca({
      ordemId: `diag-${Date.now()}`,
      cliente: { nome: c.nome, cpf: c.cpf, email: c.email, whatsapp: c.whatsapp },
      metodo: (process.env.METODO as "pix" | "boleto") ?? "pix",
      valorCentavos: 1000,
      vencimento: new Date(Date.now() + 86400000),
      descricao: "Diagnóstico MedLink",
    });
    console.log(
      "cobranca ok:",
      cobranca.providerPaymentId,
      cobranca.status,
      "pix:",
      Boolean(cobranca.pixPayload),
    );
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exitCode = 1;
});
