import { afterEach, describe, expect, it, vi } from "vitest";
import { codigoOtpDeTeste, fakePermitido, modoTesteAtivo } from "./modo-teste";

afterEach(() => vi.unstubAllEnvs());

describe("modo teste em produção", () => {
  it("bloqueia os provedores fake sem a flag", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_MODO_TESTE", "false");
    expect(modoTesteAtivo()).toBe(false);
    expect(fakePermitido()).toBe(false);
    expect(codigoOtpDeTeste("123456", "fake")).toBeUndefined();
  });

  it("libera os provedores fake somente com a flag", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_MODO_TESTE", "true");
    expect(modoTesteAtivo()).toBe(true);
    expect(fakePermitido()).toBe(true);
    expect(codigoOtpDeTeste("123456", "fake")).toBe("123456");
    expect(codigoOtpDeTeste("123456", "meta")).toBeUndefined();
  });

  it("devolve o OTP em desenvolvimento com mensageria fake", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_MODO_TESTE", "false");
    expect(codigoOtpDeTeste("123456", "fake")).toBe("123456");
    expect(codigoOtpDeTeste("123456", "meta")).toBeUndefined();
  });
});
