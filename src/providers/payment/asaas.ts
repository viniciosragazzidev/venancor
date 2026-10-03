import type { Cobranca, CriarCobrancaInput, EventoPagamento, PaymentProvider } from "./types";
import { parseWebhookAsaas, validarWebhookAsaas } from "./asaas-webhook";

type AsaasPayment = {
  id: string;
  customer: string;
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
};
type AsaasCustomer = { id: string };

export class AsaasProvider implements PaymentProvider {
  readonly nome = "asaas";
  private get base() {
    return process.env.ASAAS_ENV === "production"
      ? "https://api.asaas.com/v3"
      : "https://api-sandbox.asaas.com/v3";
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = process.env.ASAAS_API_KEY;
    if (!token) throw new Error("ASAAS_API_KEY não configurada");
    const response = await fetch(`${this.base}${path}`, {
      ...init,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "MedLink/1.0",
        access_token: token,
        ...init.headers,
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Asaas respondeu HTTP ${response.status}`);
    const body = await response.text();
    return (body ? JSON.parse(body) : undefined) as T;
  }

  private status(status: string): Cobranca["status"] {
    return (
      (
        {
          CONFIRMED: "confirmado",
          RECEIVED: "recebido",
          OVERDUE: "vencido",
          REFUNDED: "estornado",
          DELETED: "cancelado",
        } as Record<string, Cobranca["status"]>
      )[status] ?? "pendente"
    );
  }

  private async customer(input: CriarCobrancaInput): Promise<string> {
    const cpf = input.cliente.cpf.replace(/\D/g, "");
    const existente = await this.request<{ data: AsaasCustomer[] }>(
      `/customers?cpfCnpj=${cpf}&limit=1`,
    );
    if (existente.data?.[0]?.id) return existente.data[0].id;
    const novo = await this.request<AsaasCustomer>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: input.cliente.nome,
        cpfCnpj: cpf,
        email: input.cliente.email,
        mobilePhone: input.cliente.whatsapp?.replace(/\D/g, ""),
        notificationDisabled: true,
      }),
    });
    return novo.id;
  }

  async criarCobranca(input: CriarCobrancaInput): Promise<Cobranca> {
    if (!Number.isInteger(input.valorCentavos) || input.valorCentavos <= 0)
      throw new Error("Valor inválido");
    const customer = await this.customer(input);
    const parcelado = input.metodo === "cartao" && (input.parcelas ?? 1) > 1;
    const payment = await this.request<AsaasPayment>("/payments", {
      method: "POST",
      body: JSON.stringify({
        customer,
        billingType: { pix: "PIX", boleto: "BOLETO", cartao: "CREDIT_CARD" }[input.metodo],
        ...(parcelado
          ? { installmentCount: input.parcelas, totalValue: input.valorCentavos / 100 }
          : { value: input.valorCentavos / 100 }),
        dueDate: input.vencimento.toISOString().slice(0, 10),
        description: input.descricao.slice(0, 500),
        externalReference: input.ordemId,
      }),
    });
    const result: Cobranca = {
      providerPaymentId: payment.id,
      providerCustomerId: customer,
      status: this.status(payment.status),
    };
    try {
      if (input.metodo === "pix") {
        const qr = await this.request<{ payload: string; encodedImage: string }>(
          `/payments/${payment.id}/pixQrCode`,
        );
        result.pixPayload = qr.payload;
        result.pixQrBase64 = qr.encodedImage;
      } else if (input.metodo === "boleto") {
        result.boletoUrl = payment.bankSlipUrl ?? payment.invoiceUrl;
        const line = await this.request<{ identificationField: string }>(
          `/payments/${payment.id}/identificationField`,
        );
        result.boletoLinha = line.identificationField;
      } else result.checkoutUrl = payment.invoiceUrl;
    } catch (error) {
      await this.cancelarCobranca(payment.id).catch(() => undefined);
      throw error;
    }
    return result;
  }

  async consultarCobranca(id: string): Promise<Cobranca> {
    const p = await this.request<AsaasPayment>(`/payments/${encodeURIComponent(id)}`);
    return {
      providerPaymentId: p.id,
      providerCustomerId: p.customer,
      status: this.status(p.status),
      checkoutUrl: p.invoiceUrl,
      boletoUrl: p.bankSlipUrl,
    };
  }

  async cancelarCobranca(id: string): Promise<void> {
    await this.request<unknown>(`/payments/${encodeURIComponent(id)}`, { method: "DELETE" });
  }
  validarWebhook(headers: Headers, _rawBody: string): boolean {
    return validarWebhookAsaas(headers);
  }
  parseWebhook(rawBody: string): EventoPagamento {
    return parseWebhookAsaas(rawBody);
  }
}
