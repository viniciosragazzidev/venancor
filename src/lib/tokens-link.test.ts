import { beforeAll, describe, expect, it } from "vitest";

import { cifrarToken, decifrarToken, gerarToken, hashToken } from "./tokens";

beforeAll(() => {
  process.env.BETTER_AUTH_SECRET ??= "segredo-de-teste-com-mais-de-32-caracteres";
});

describe("link estável", () => {
  it("o token guardado volta igual e confere com o hash da ordem", () => {
    const { token, hash, cifrado } = gerarToken();
    expect(decifrarToken(cifrado, hash)).toBe(token);
  });

  it("depois de gerar novo link, o token antigo guardado não vale mais", () => {
    const antigo = gerarToken();
    const novo = gerarToken();
    expect(decifrarToken(antigo.cifrado, novo.hash)).toBeNull();
  });

  it("ordem antiga sem token guardado, ou valor corrompido, devolve null", () => {
    const { hash } = gerarToken();
    expect(decifrarToken(null, hash)).toBeNull();
    expect(decifrarToken("lixo", hash)).toBeNull();
    expect(decifrarToken(cifrarToken("outro") + "x", hashToken("outro"))).toBeNull();
  });
});
