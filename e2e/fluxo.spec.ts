import "dotenv/config";

import { createHmac } from "node:crypto";
import postgres from "postgres";
import { expect, test, type Locator, type Page } from "@playwright/test";

// Pré-requisitos: banco migrado + db:seed-admin + db:seed (ver playwright.config.ts).
// Dados do seed: cliente "Cliente Exemplo", CPF 52998224725, WhatsApp +5511999999999.
const cpfSeed = "52998224725";
const whatsappSeed = "+5511999999999";
const clienteSeed = "Cliente Exemplo";

const adminEmail = process.env.ADMIN_EMAIL ?? "";
const adminSenha = process.env.ADMIN_PASSWORD ?? "";

/** O hash do OTP é salgado (HMAC-SHA256 + OTP_SECRET); 10⁶ códigos levam poucos segundos. */
function descobrirCodigoOtp(hash: string): string {
  const segredo = process.env.OTP_SECRET;
  if (!segredo || segredo.length < 32) throw new Error("OTP_SECRET ausente no .env");
  const [salt, digest] = hash.split(":");
  if (!salt || !digest || !/^[a-f0-9]{64}$/.test(digest)) throw new Error("hash de OTP inválido");
  for (let i = 0; i < 1_000_000; i += 1) {
    const codigo = i.toString().padStart(6, "0");
    const teste = createHmac("sha256", segredo).update(`${salt}:${codigo}`).digest("hex");
    if (teste === digest) return codigo;
  }
  throw new Error("não foi possível descobrir o código OTP");
}

async function assinarCanvas(cliente: Page, area: Locator) {
  const caixa = await area.boundingBox();
  if (!caixa) throw new Error("área de assinatura não encontrada");
  await cliente.mouse.move(caixa.x + 24, caixa.y + caixa.height / 2);
  await cliente.mouse.down();
  await cliente.mouse.move(caixa.x + caixa.width - 24, caixa.y + caixa.height / 3, {
    steps: 10,
  });
  await cliente.mouse.move(caixa.x + caixa.width / 2, caixa.y + (caixa.height * 2) / 3, {
    steps: 10,
  });
  await cliente.mouse.up();
}

test("fluxo feliz: criar ordem → assinar com OTP → pagar (fake) → paga no painel", async ({
  page,
  browser,
}) => {
  test.skip(!adminEmail || !adminSenha, "Configure ADMIN_EMAIL e ADMIN_PASSWORD no .env");
  test.skip(!process.env.DATABASE_URL, "Configure DATABASE_URL no .env");
  test.setTimeout(300_000);

  // 1) Admin entra no painel
  page.on("response", (resposta) => {
    if (resposta.url().includes("/api/"))
      console.log(`[e2e:admin] ${resposta.status()} ${new URL(resposta.url()).pathname}`);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log(`[e2e:admin] console: ${msg.text()}`);
  });
  await page.goto("/login");
  await page.locator("#email").fill(adminEmail);
  await page.locator("#password").fill(adminSenha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/painel");

  // 2) Cria a ordem para o cliente do seed com o primeiro plano ativo
  await page.goto("/painel/ordens");
  await page.getByRole("button", { name: "Nova ordem" }).click();
  await page.locator("#ordem-cliente").click();
  await page.getByRole("option", { name: clienteSeed }).click();
  await page.getByRole("button", { name: "Criar ordem" }).click();
  const campoLink = page.getByLabel("Link da proposta");
  await expect(campoLink).toBeVisible({ timeout: 30_000 });
  const link = await campoLink.inputValue();
  expect(link).toContain("/c/");

  // 3) Cliente abre o link e avança até a assinatura
  const contextoCliente = await browser.newContext({ locale: "pt-BR" });
  const cliente = await contextoCliente.newPage();
  cliente.on("response", async (resposta) => {
    if (resposta.url().includes("/api/dev/simular-pagamento")) {
      const corpo = await resposta.text().catch(() => "");
      console.log(`[e2e] simular-pagamento ${resposta.status()} ${corpo}`);
    }
  });
  cliente.on("console", (msg) => {
    if (msg.type() === "error") console.log(`[e2e] console: ${msg.text()}`);
  });
  try {
    await cliente.goto(link);
    await cliente.getByRole("button", { name: "Ver contrato" }).click();
    // base-ui Checkbox: o id fica no input oculto; o clicável é o botão role=checkbox.
    const consentimentos = cliente.getByRole("checkbox");
    await consentimentos.first().click();
    await consentimentos.nth(1).click();
    await cliente.getByRole("button", { name: "Assinar contrato" }).click();

    // 4) Assina: CPF do titular + traço no canvas + OTP
    await cliente.locator("#assinatura-cpf").fill(cpfSeed);
    await assinarCanvas(cliente, cliente.locator('canvas[aria-label*="assinatura"]'));
    await cliente.getByRole("button", { name: /Enviar c.digo por WhatsApp/ }).click();
    await expect(cliente.locator("#assinatura-otp")).toBeVisible({ timeout: 30_000 });

    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    let codigo: string | undefined;
    for (let tentativa = 0; tentativa < 10 && !codigo; tentativa += 1) {
      const linhas = await sql`select codigo_hash from otp_codigos
        where telefone = ${whatsappSeed} and usado_em is null
        order by enviado_em desc limit 1`;
      const hash = linhas[0]?.codigo_hash;
      if (typeof hash === "string") codigo = descobrirCodigoOtp(hash);
      else await cliente.waitForTimeout(500);
    }
    await sql.end({ timeout: 1 });
    if (!codigo) throw new Error("código OTP não encontrado no banco");

    await cliente.locator("#assinatura-otp").fill(codigo);
    await cliente.getByRole("button", { name: "Validar" }).click();
    await expect(cliente.getByText("Contrato assinado!")).toBeVisible({ timeout: 30_000 });
    await cliente.getByRole("button", { name: "Ir para o pagamento" }).click();

    // 5) Pagamento fake: gera o Pix e simula a confirmação (botão de dev)
    await cliente.getByRole("button", { name: "Gerar QR Code Pix" }).click();
    await cliente.getByRole("button", { name: /Simular pagamento/ }).click();
    await expect(cliente.getByText("Pagamento confirmado!")).toBeVisible({ timeout: 30_000 });
  } finally {
    try {
      await contextoCliente.close();
    } catch {
      // teardown pode fechar antes; sem problema
    }
  }

  // 6) O painel mostra a ordem como paga
  await page.goto("/painel/ordens");
  await expect(page.getByText("Paga", { exact: true })).toBeVisible({ timeout: 30_000 });
});
