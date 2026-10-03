import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { client, db } from "./client";
import { account, user, usuarios } from "./schema";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error("ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios para o seed");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD deve ter pelo menos 12 caracteres");
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existing.length) {
    console.info("Admin já existe; seed ignorado.");
    return;
  }
  const userId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(user).values({ id: userId, name: "Administrador", email, emailVerified: true });
    await tx.insert(account).values({
      id: randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: await hashPassword(password),
    });
    await tx.insert(usuarios).values({ userId, nome: "Administrador", papel: "admin" });
  });
  console.info("Admin criado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
