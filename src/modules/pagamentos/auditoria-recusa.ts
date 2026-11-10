import type { Metodo } from "@/providers/payment";
import type { ErroProvedorPagamento } from "@/providers/payment/erros";

export function metadadosRecusaCadastroAsaas(erro: ErroProvedorPagamento, metodo: Metodo) {
  return {
    provedor: "asaas" as const,
    codigo: erro.code,
    statusHttp: erro.status,
    metodo,
  };
}
