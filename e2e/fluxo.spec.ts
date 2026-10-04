import "dotenv/config";

import { expect, test, type Locator, type Page } from "@playwright/test";

// Pré-requisitos: banco migrado + db:seed-admin + db:seed (ver playwright.config.ts).
// Dados do seed: cliente "Cliente Exemplo", CPF 52998224725.
const cpfSeed = "52998224725";
const clienteSeed = "Cliente Exemplo";

const adminEmail = process.env.ADMIN_EMAIL ?? "";
const adminSenha = process.env.ADMIN_PASSWORD ?? "";

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

test("fluxo feliz: criar ordem → assinar sem OTP → pagar → paga no painel", async ({
  page,
  browser,
}) => {
  test.skip(!adminEmail || !adminSenha, "Configure ADMIN_EMAIL e ADMIN_PASSWORD no .env");
  test.skip(process.env.ASSINATURA_EXIGE_OTP === "true", "Este cenário cobre assinatura sem OTP");
  test.skip(!process.env.DATABASE_URL, "Configure DATABASE_URL no .env");
  test.setTimeout(300_000);

  // 1) Admin entra no painel
  page.on("response", (resposta) => {
    if (resposta.url().includes("/api/"))
      console.log(`[e2e:admin] ${resposta.status()} ${new URL(resposta.url()).pathname}`);
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
  cliente.on("response", (resposta) => {
    if (resposta.url().includes("/api/"))
      console.log(`[e2e] ${resposta.status()} ${new URL(resposta.url()).pathname}`);
  });
  try {
    await cliente.goto(link);
    await cliente.getByRole("button", { name: "Ver contrato" }).click();
    // base-ui Checkbox: o id fica no input oculto; o clicável é o botão role=checkbox.
    const consentimentos = cliente.getByRole("checkbox");
    await consentimentos.first().click();
    await consentimentos.nth(1).click();
    await cliente.getByRole("button", { name: "Assinar contrato" }).click();

    // 4) Assina: CPF do titular + traço no canvas, sem código
    await cliente.locator("#assinatura-cpf").fill(cpfSeed);
    await assinarCanvas(cliente, cliente.locator('canvas[aria-label*="assinatura"]'));
    await expect(cliente.locator("#assinatura-otp")).toHaveCount(0);
    await cliente.getByRole("button", { name: "Assinar e continuar ao pagamento" }).click();
    // Dev server compila pdf-lib/storage no primeiro uso: geração de PDFs é lenta.
    await expect(cliente.getByText("Total a pagar")).toBeVisible({ timeout: 60_000 });

    // 5) Pagamento de teste: gera o Pix e simula a confirmação
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
  await expect(page.getByText("Paga", { exact: true }).first()).toBeVisible({ timeout: 30_000 });
});
