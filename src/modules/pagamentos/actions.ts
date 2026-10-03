"use server";

import { iniciarPagamento as iniciar } from "./iniciar";
import type { Metodo } from "@/providers/payment";

export async function iniciarPagamento(token: string, metodo: Metodo, parcelas?: number) {
  return iniciar(token, metodo, parcelas);
}
