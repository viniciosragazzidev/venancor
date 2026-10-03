import "dotenv/config";

import { defineConfig, devices } from "@playwright/test";

// Pré-requisitos (ver README): .env preenchido, banco migrado (db:migrate),
// admin criado (db:seed-admin) e seed de exemplo (db:seed) rodados.
// Provedores fake/local padrão — o fluxo inteiro roda sem Asaas, Meta ou bucket.
export default defineConfig({
  testDir: "e2e",
  // Dev server compila as rotas sob demanda (login, /c/[token], pdf-lib...):
  // orçamento generoso para o fluxo feliz em CI local.
  timeout: 300_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    locale: "pt-BR",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
    // O servidor do E2E precisa confiar na origem localhost (Better Auth valida o
    // Origin contra BETTER_AUTH_URL). Se o .env apontar para outro domínio,
    // estas variáveis vencem (variáveis de ambiente não são sobrescritas pelo .env).
    // F9.1 roda com fakes: o botão de simular pagamento exige PAYMENT_PROVIDER=fake
    // e o OTP/assinatura não podem depender de APIs externas.
    env: {
      APP_URL: "http://localhost:3000",
      BETTER_AUTH_URL: "http://localhost:3000",
      PAYMENT_PROVIDER: "fake",
      MESSAGING_PROVIDER: "fake",
      STORAGE_DRIVER: "local",
    },
  },
});
