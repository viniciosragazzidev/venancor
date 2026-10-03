import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { usuarios } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const [usuario] = await db
    .select({ papel: usuarios.papel })
    .from(usuarios)
    .where(eq(usuarios.userId, session.user.id))
    .limit(1);
  if (usuario?.papel !== "admin") notFound();
  return session.user;
}
