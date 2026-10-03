import { afterEach, expect, it, vi } from "vitest";
import { executarOtpAutomatico } from "./otp-automatico";

afterEach(() => vi.unstubAllEnvs());

it("valida o OTP e conclui automaticamente no modo teste", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_MODO_TESTE", "true");
  const validar = vi.fn(async () => ({ ok: true as const }));
  const concluir = vi.fn(async () => undefined);
  expect(await executarOtpAutomatico("123456", validar, concluir)).toEqual({ automatico: true });
  expect(validar).toHaveBeenCalledWith("123456");
  expect(concluir).toHaveBeenCalledOnce();
});

it("mantém a digitação manual sem a flag em produção", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_MODO_TESTE", "false");
  const validar = vi.fn();
  const concluir = vi.fn();
  expect(await executarOtpAutomatico("123456", validar, concluir)).toEqual({ automatico: false });
  expect(validar).not.toHaveBeenCalled();
  expect(concluir).not.toHaveBeenCalled();
});

it("em desenvolvimento com mensageria fake, não conclui se a validação falhar", async () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_MODO_TESTE", "false");
  const validar = vi.fn(async () => ({ erro: "invalido" as const }));
  const concluir = vi.fn();
  expect(await executarOtpAutomatico("123456", validar, concluir)).toEqual({
    automatico: true,
    erro: "invalido",
  });
  expect(concluir).not.toHaveBeenCalled();
});
