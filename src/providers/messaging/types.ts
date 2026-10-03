export type TemplateNome =
  "proposta_enviada" | "codigo_assinatura" | "pagamento_confirmado" | "lembrete_proposta";
export interface EnviarTemplateInput {
  para: string;
  template: TemplateNome;
  variaveis: Record<string, string>;
  ordemId?: string;
}
export interface EnvioResultado {
  providerMessageId: string;
  status: "enviada" | "falhou";
  erro?: string;
}
export interface StatusEntrega {
  providerMessageId: string;
  status: "enviada" | "entregue" | "lida" | "falhou";
  erro?: string;
}
export interface MessagingProvider {
  readonly nome: string;
  enviarTemplate(input: EnviarTemplateInput): Promise<EnvioResultado>;
  validarWebhook(headers: Headers, rawBody: string): boolean;
  parseStatusWebhook(rawBody: string): StatusEntrega[];
}
