import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/db/client", () => ({ db: {} }));
import { MetaWhatsAppProvider } from "./meta";

const provider = new MetaWhatsAppProvider();
const previous = process.env.META_APP_SECRET;
afterEach(() => {
  process.env.META_APP_SECRET = previous;
});

describe("webhook Meta", () => {
  it("valida assinatura do corpo exato e rejeita alteração", () => {
    process.env.META_APP_SECRET = "segredo-de-teste";
    const raw = '{"entry":[]}';
    const signature = `sha256=${createHmac("sha256", "segredo-de-teste").update(raw).digest("hex")}`;
    const headers = new Headers({ "x-hub-signature-256": signature });
    expect(provider.validarWebhook(headers, raw)).toBe(true);
    expect(provider.validarWebhook(headers, `${raw} `)).toBe(false);
  });
  it("extrai estados de entrega de múltiplas alterações", () => {
    const result = provider.parseStatusWebhook(
      JSON.stringify({
        entry: [
          {
            changes: [
              { value: { statuses: [{ id: "wamid.1", status: "delivered" }] } },
              { value: { statuses: [{ id: "wamid.2", status: "read" }] } },
            ],
          },
        ],
      }),
    );
    expect(result).toMatchObject([
      { providerMessageId: "wamid.1", status: "entregue" },
      { providerMessageId: "wamid.2", status: "lida" },
    ]);
  });
});
