"use server";

import { executarAcao } from "@/lib/resultado-acao";
import { iniciarPagamento as iniciar } from "./iniciar";
import type { Metodo } from "@/providers/payment";

export async function iniciarPagamento(token: string, metodo: Metodo, parcelas?: number) {
  return executarAcao("pagamento", () => iniciar(token, metodo, parcelas));
}
