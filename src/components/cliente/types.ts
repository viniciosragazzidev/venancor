export type { DadosOrdemCliente } from "@/modules/ordens/cliente";
export type { PagamentoIniciado as CobrancaCliente } from "@/modules/pagamentos/iniciar";
export type { Metodo as MetodoPagamento } from "@/providers/payment";
export type OtpErro = "expirado" | "invalido" | "bloqueado" | "falha";
