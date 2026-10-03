import { describe, expect, it } from "vitest";
import { gerarToken, hashToken } from "./tokens";

describe("token de link", () => {
  it("gera 32 bytes aleatórios e persiste apenas o hash", () => {
    const primeiro = gerarToken();
    const segundo = gerarToken();
    expect(Buffer.from(primeiro.token, "base64url")).toHaveLength(32);
    expect(primeiro.hash).toBe(hashToken(primeiro.token));
    expect(primeiro.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(segundo.token).not.toBe(primeiro.token);
  });
});
