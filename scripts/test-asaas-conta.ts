import "dotenv/config";

// Diagnóstico (SANDBOX): estado das chaves Pix e da conta.
const base = "https://api-sandbox.asaas.com/v3";
const key = (process.env.ASAAS_API_KEY ?? "").replace(/^\x5c/, "");
const headers = { access_token: key, "User-Agent": "MedLink/1.0" };
async function main() {
  const k = await (await fetch(`${base}/pix/addressKeys`, { headers })).json();
  console.log(
    "chaves:",
    (k.data ?? [])
      .map((x: { type: string; status: string }) => `${x.type} ${x.status}`)
      .join(", ") || JSON.stringify(k.errors ?? k),
  );
  const s = await (await fetch(`${base}/myAccount/status`, { headers })).json();
  console.log("conta:", JSON.stringify(s).slice(0, 300));
}
main().catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exitCode = 1;
});
