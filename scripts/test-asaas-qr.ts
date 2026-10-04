import "dotenv/config";

// Diagnóstico (SANDBOX): cria Pix novo e pede o QR Code imediatamente e após 10s.
const base = "https://api-sandbox.asaas.com/v3";
const key = (process.env.ASAAS_API_KEY ?? "").replace(/^\x5c/, "");
const headers = {
  access_token: key,
  "User-Agent": "MedLink/1.0",
  "Content-Type": "application/json",
};
async function main() {
  const cust = await (
    await fetch(`${base}/customers`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: "Diag QR", cpfCnpj: "24971563792" }),
    })
  ).json();
  const venc = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const pay = await (
    await fetch(`${base}/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify({ customer: cust.id, billingType: "PIX", value: 10, dueDate: venc }),
    })
  ).json();
  console.log("pix criado:", pay.id, "invoiceUrl:", Boolean(pay.invoiceUrl));
  for (const espera of [0, 10000]) {
    await new Promise((r) => setTimeout(r, espera));
    const r = await fetch(`${base}/payments/${pay.id}/pixQrCode`, { headers });
    const j = await r.json();
    console.log(`QR +${espera / 1000}s:`, r.status, j.payload ? "ok" : JSON.stringify(j.errors));
  }
}
main().catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exitCode = 1;
});
