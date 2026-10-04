import "dotenv/config";
import postgres from "postgres";

// Diagnóstico (SANDBOX): descobre qual campo do POST /payments o Asaas rejeita.
const base = "https://api-sandbox.asaas.com/v3";
const key = (process.env.ASAAS_API_KEY ?? "").replace(/^\x5c/, "");
async function call(path: string, body?: unknown) {
  const r = await fetch(base + path, {
    method: body ? "POST" : "GET",
    headers: { access_token: key, "Content-Type": "application/json", "User-Agent": "MedLink/1.0" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  return { status: r.status, json: t ? JSON.parse(t) : {} };
}
async function main() {
  const sql = postgres(process.env.DATABASE_URL!.replace(":5432/", ":6543/"), {
    max: 1,
    prepare: false,
  });
  const [c] = await sql`select cpf from clientes limit 1`;
  await sql.end();
  const cpf = String(c.cpf).replace(/\D/g, "");
  const busca = await call(`/customers?cpfCnpj=${cpf}&limit=1`);
  const customer = busca.json.data?.[0]?.id;
  console.log("customer do seed:", customer ? "existe" : "nao existe");
  const venc = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const baseBody = { customer, billingType: "PIX", value: 10, dueDate: venc };
  for (const [nome, extra] of Object.entries({
    minimo: {},
    description: { description: "Plano X" },
    externalReference: { externalReference: "00000000-0000-0000-0000-000000000000" },
  })) {
    const r = await call("/payments", { ...baseBody, ...extra });
    console.log(nome, r.status, r.json.id ? "ok" : JSON.stringify(r.json.errors));
  }
}
main().catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exitCode = 1;
});

// QR Code logo após criar, e de novo após alguns segundos
async function qr() {
  const busca = await call(`/payments?billingType=PIX&limit=1`);
  const id = busca.json.data?.[0]?.id;
  for (const espera of [0, 5000]) {
    await new Promise((r) => setTimeout(r, espera));
    const r = await call(`/payments/${id}/pixQrCode`);
    console.log(
      `pixQrCode (+${espera}ms)`,
      r.status,
      r.json.payload ? "ok" : JSON.stringify(r.json.errors),
    );
  }
}
qr().catch((e) => console.error("ERRO qr:", e?.message ?? e));
