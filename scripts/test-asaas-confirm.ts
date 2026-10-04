import "dotenv/config";

// Diagnóstico (SANDBOX): cria cliente+Pix de R$ 10 e tenta confirmar pelos endpoints de teste.
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
  if (process.env.ASAAS_ENV === "production") throw new Error("Só sandbox");
  const cust = await call("/customers", { name: "Diagnostico MedLink", cpfCnpj: "24971563792" });
  const venc = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const pay = await call("/payments", {
    customer: cust.json.id,
    billingType: "PIX",
    value: 10,
    dueDate: venc,
  });
  console.log("criar pix:", pay.status, pay.json.id ?? JSON.stringify(pay.json.errors));
  const c1 = await call(`/sandbox/payment/${pay.json.id}/confirm`, {});
  console.log("sandbox confirm:", c1.status, c1.json.status ?? JSON.stringify(c1.json.errors));
  const c2 = await call(`/payments/${pay.json.id}/receiveInCash`, {
    paymentDate: new Date().toISOString().slice(0, 10),
    value: 10,
  });
  console.log("receiveInCash:", c2.status, c2.json.status ?? JSON.stringify(c2.json.errors));
}
main().catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exitCode = 1;
});
