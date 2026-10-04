import { afterEach, expect, it, vi } from "vitest";
import { assinaturaExigeOtp, obterOtpParaAssinatura } from "./otp-policy";

afterEach(() => vi.unstubAllEnvs());

it("por padrão conclui sem consultar OTP", async () => {
  vi.stubEnv("ASSINATURA_EXIGE_OTP", "false");
  const buscar = vi.fn(async () => null);
  expect(assinaturaExigeOtp()).toBe(false);
  expect(await obterOtpParaAssinatura(buscar)).toBeNull();
  expect(buscar).not.toHaveBeenCalled();
});

it("quando religado exige OTP validado", async () => {
  vi.stubEnv("ASSINATURA_EXIGE_OTP", "true");
  const buscar = vi.fn(async () => null);
  expect(assinaturaExigeOtp()).toBe(true);
  await expect(obterOtpParaAssinatura(buscar)).rejects.toThrow("Código de confirmação");
  expect(await obterOtpParaAssinatura(async () => ({ telefone: "+5511999999999" }))).toEqual({
    telefone: "+5511999999999",
  });
});
