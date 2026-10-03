"use server";

import { headers } from "next/headers";
import { concluirAssinatura as concluir } from "./concluir";
import type { ConcluirAssinaturaInput } from "./schema";

export async function concluirAssinatura(token: string, input: ConcluirAssinaturaInput) {
  const h = await headers();
  return concluir(token, input, {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido",
    userAgent: h.get("user-agent") ?? "desconhecido",
  });
}
