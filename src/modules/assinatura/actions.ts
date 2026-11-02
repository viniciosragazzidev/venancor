"use server";

import { headers } from "next/headers";
import { ipDaRequisicao } from "@/lib/request-ip";
import { executarAcao } from "@/lib/resultado-acao";
import { concluirAssinatura as concluir } from "./concluir";
import type { ConcluirAssinaturaInput } from "./schema";

export async function concluirAssinatura(token: string, input: ConcluirAssinaturaInput) {
  return executarAcao("assinatura", async () => {
    const h = await headers();
    return concluir(token, input, {
      ip: ipDaRequisicao(h),
      userAgent: h.get("user-agent") ?? "desconhecido",
    });
  });
}
