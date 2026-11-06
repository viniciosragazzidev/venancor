import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Key that encrypts the stored client token (so "Copiar link" can show the same link again). */
function chaveLink(): Buffer {
  const segredo = process.env.LINK_TOKEN_SECRET ?? process.env.BETTER_AUTH_SECRET;
  if (!segredo) throw new Error("BETTER_AUTH_SECRET não configurado");
  return createHash("sha256").update(`medlink-link:${segredo}`).digest();
}

export function cifrarToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", chaveLink(), iv);
  const dados = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), dados.toString("base64url")].join(".");
}

/** The stored token, only when it decrypts and still matches the order's current hash; otherwise null. */
export function decifrarToken(cifrado: string | null | undefined, hashAtual: string): string | null {
  if (!cifrado) return null;
  try {
    const [iv, tag, dados] = cifrado.split(".");
    if (!iv || !tag || !dados) return null;
    const decipher = createDecipheriv("aes-256-gcm", chaveLink(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    const token = Buffer.concat([decipher.update(Buffer.from(dados, "base64url")), decipher.final()]).toString("utf8");
    return hashToken(token) === hashAtual ? token : null;
  } catch {
    return null;
  }
}

export function gerarToken(): { token: string; hash: string; cifrado: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token), cifrado: cifrarToken(token) };
}
