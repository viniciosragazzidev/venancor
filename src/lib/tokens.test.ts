import { beforeAll, describe, expect, it } from "vitest";
import { gerarToken, hashToken } from "./tokens";

beforeAll(() => {
  process.env.BETTER_AUTH_SECRET ??= "segredo-de-teste-com-mais-de-32-caracteres";
});

describe("token de link", () => {
  it("gera 32 bytes aleatórios; busca pelo hash e guarda o token só cifrado", () => {
    const primeiro = gerarToken();
    const segundo = gerarToken();
    expect(Buffer.from(primeiro.token, "base64url")).toHaveLength(32);
    expect(primeiro.hash).toBe(hashToken(primeiro.token));
    expect(primeiro.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(primeiro.cifrado).not.toContain(primeiro.token);
    expect(segundo.token).not.toBe(primeiro.token);
  });
});
