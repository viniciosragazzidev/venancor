import { expect, it } from "vitest";
import { gerarCodigoOtp, hashOtp, verificarOtpHash } from "./otp-crypto";

it("gera seis dígitos e confere apenas o hash do OTP", () => {
  const codigo = gerarCodigoOtp();
  expect(codigo).toMatch(/^\d{6}$/);
  const hash = hashOtp(codigo, "segredo-com-pelo-menos-32-caracteres");
  expect(hash).not.toContain(codigo);
  expect(verificarOtpHash(codigo, hash, "segredo-com-pelo-menos-32-caracteres")).toBe(true);
  expect(
    verificarOtpHash(
      "000000" === codigo ? "111111" : "000000",
      hash,
      "segredo-com-pelo-menos-32-caracteres",
    ),
  ).toBe(false);
});
