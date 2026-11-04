export type Metodo = "pix" | "boleto" | "cartao";
export interface ClientePagador {
  nome: string;
  cpf: string;
  email?: string;
  whatsapp?: string;
}
export interface CriarCobrancaInput {
  ordemId: string;
  cliente: ClientePagador;
  metodo: Metodo;
  valorCentavos: number;
  parcelas?: number;
  vencimento: Date;
  descricao: string;
}
export interface Cobranca {
  providerPaymentId: string;
  providerCustomerId: string;
  status: "pendente" | "confirmado" | "recebido" | "vencido" | "estornado" | "cancelado";
  pixPayload?: string;
  pixQrBase64?: string;
  boletoUrl?: string;
  boletoLinha?: string;
  checkoutUrl?: string;
}
export type EventoPagamentoTipo = "confirmado" | "recebido" | "vencido" | "estornado" | "outro";
export interface EventoPagamento {
  eventId: string;
  tipo: EventoPagamentoTipo;
  providerPaymentId: string;
  ordemId?: string;
  bruto: unknown;
}
/** Dados para desenhar o boleto próprio (04/11). Pix e beneficiário são opcionais. */
export interface DetalhesBoleto {
  linhaDigitavel: string;
  codigoBarras?: string;
  nossoNumero?: string;
  pixPayload?: string;
  pixQrBase64?: string;
  beneficiario?: { nome: string; documento?: string };
}
export interface PaymentProvider {
  readonly nome: string;
  detalhesBoleto?(providerPaymentId: string): Promise<DetalhesBoleto>;
  criarCobranca(input: CriarCobrancaInput): Promise<Cobranca>;
  consultarCobranca(providerPaymentId: string): Promise<Cobranca>;
  cancelarCobranca(providerPaymentId: string): Promise<void>;
  validarWebhook(headers: Headers, rawBody: string): boolean;
  parseWebhook(rawBody: string): EventoPagamento;
}
