import "dotenv/config";
import { auth } from "../src/lib/auth";
import { client } from "../src/db/client";

async function main() {
  const res = await auth.api.signInEmail({
    body: { email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD! },
  });
  console.log("login ok:", Boolean(res?.user?.id));
}

main()
  .catch((e) => {
    console.error("ERRO:", e?.cause?.message ?? e?.message ?? e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
