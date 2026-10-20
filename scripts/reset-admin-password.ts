import "dotenv/config";
import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { client, db } from "../src/db/client";
import { account, session, user } from "../src/db/schema";

/**
 * Sets a new password for the admin (ADMIN_EMAIL, or the e-mail passed as argument) and ends their
 * open sessions. Prints the new password once; it is not saved anywhere.
 *   npx tsx scripts/reset-admin-password.ts [email]
 */
async function main() {
  const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
  if (!email) throw new Error("Informe o e-mail ou defina ADMIN_EMAIL");
  const [admin] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (!admin) throw new Error(`Nenhum usuário com o e-mail ${email}`);

  const password = randomBytes(12).toString("base64url");
  const updated = await db
    .update(account)
    .set({ password: await hashPassword(password), updatedAt: new Date() })
    .where(and(eq(account.userId, admin.id), eq(account.providerId, "credential")))
    .returning({ id: account.id });
  if (!updated.length) throw new Error("O usuário não tem login por senha (conta credential)");
  await db.delete(session).where(eq(session.userId, admin.id));

  console.info(`Senha nova de ${email}: ${password}`);
}

main()
  .catch((error) => {
    console.error("ERRO:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
