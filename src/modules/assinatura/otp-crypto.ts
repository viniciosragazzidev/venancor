import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export function gerarCodigoOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(
  codigo: string,
  segredo: string,
  salt = randomBytes(16).toString("hex"),
): string {
  return `${salt}:${createHmac("sha256", segredo).update(`${salt}:${codigo}`).digest("hex")}`;
}

export function verificarOtpHash(codigo: string, hash: string, segredo: string): boolean {
  const [salt, digest] = hash.split(":");
  if (!salt || !digest || !/^[a-f0-9]{64}$/.test(digest)) return false;
  const esperado = hashOtp(codigo, segredo, salt).split(":")[1];
  return timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(esperado, "hex"));
}
