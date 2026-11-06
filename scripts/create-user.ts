import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { client, db } from "../src/db/client";
import { account, user, usuarios } from "../src/db/schema";

/**
 * Creates a panel login (papel admin, the only one the panel accepts today).
 * The password comes from the NOVA_SENHA environment variable so it never lands in a file or log.
 *   NOVA_SENHA='...' npx tsx scripts/create-user.ts email@dominio.com "Nome Completo"
 */
async function main() {
  const [email, nome] = [process.argv[2]?.trim().toLowerCase(), process.argv[3]?.trim()];
  const password = process.env.NOVA_SENHA ?? "";
  if (!email || !nome) throw new Error('Uso: NOVA_SENHA=... npx tsx scripts/create-user.ts email "Nome"');
  if (password.length < 12) throw new Error("NOVA_SENHA precisa ter pelo menos 12 caracteres");
  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (existing) throw new Error(`Já existe um login com ${email}`);
  const userId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(user).values({ id: userId, name: nome, email, emailVerified: true });
    await tx.insert(account).values({
      id: randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: await hashPassword(password),
    });
    await tx.insert(usuarios).values({ userId, nome, papel: "admin" });
  });
  console.info(`Login criado: ${nome} <${email}> (papel admin).`);
}

main()
  .catch((error) => {
    console.error("ERRO:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
