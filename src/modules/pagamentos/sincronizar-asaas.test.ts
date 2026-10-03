import { afterEach, expect, it, vi } from "vitest";

vi.mock("@/db/client", () => ({ db: {} }));
vi.mock("./webhook", () => ({ processarEventoPagamento: vi.fn(async () => "processado") }));

import { processarEventoPagamento } from "./webhook";
import { sincronizarPagamentoAsaas } from "./sincronizar-asaas";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

it("consulta Asaas e envia cobrança confirmada pelo processador idempotente do webhook", async () => {
  vi.stubEnv("ASAAS_ENV", "sandbox");
  vi.stubEnv("ASAAS_API_KEY", "chave-de-teste");
  const fetchMock = vi.fn(async (url: string) => {
    expect(url).toBe("https://api-sandbox.asaas.com/v3/payments/pay_1");
    return Response.json({ id: "pay_1", customer: "cus_1", status: "CONFIRMED" });
  });
  vi.stubGlobal("fetch", fetchMock);
  expect(await sincronizarPagamentoAsaas("pay_1")).toBe("confirmado");
  expect(fetchMock.mock.calls[0][0]).toBe("https://api-sandbox.asaas.com/v3/payments/pay_1");
  expect(processarEventoPagamento).toHaveBeenCalledWith(
    "asaas",
    expect.objectContaining({
      eventId: "consulta:pay_1:confirmado",
      providerPaymentId: "pay_1",
      tipo: "confirmado",
    }),
  );
});

it("não processa cobranças ainda pendentes", async () => {
  vi.stubEnv("ASAAS_ENV", "sandbox");
  vi.stubEnv("ASAAS_API_KEY", "chave-de-teste");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        id: "pay_2",
        customer: "cus_2",
        status: "PENDING",
      }),
    ),
  );
  expect(await sincronizarPagamentoAsaas("pay_2")).toBe("pendente");
  expect(processarEventoPagamento).not.toHaveBeenCalled();
});
