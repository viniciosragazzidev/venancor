import type {
  Cobranca,
  CriarCobrancaInput,
  DetalhesBoleto,
  EventoPagamento,
  PaymentProvider,
} from "./types";
import { parseWebhookAsaas, validarWebhookAsaas } from "./asaas-webhook";
import { ErroProvedorPagamento } from "./erros";
import { fakePermitido } from "@/lib/modo-teste";

export { ErroProvedorPagamento } from "./erros";

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
    if (!token) throw new ErroProvedorPagamento({ status: null, code: "missing_api_key" });
    let response: Response;
    try {
      response = await fetch(`${this.base}${path}`, {
        ...init,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "MedLink/1.0",
          access_token: token,
          ...init.headers,
        },
        // O sandbox chega a levar mais de 15s para gerar o QR Code Pix.
        signal: AbortSignal.timeout(40000),
      });
    } catch (error) {
      // TimeoutError/AbortError são DOMException (message só leitura): converte para Error comum.
      const nome = error instanceof Error ? error.name : "";
      throw new ErroProvedorPagamento({
        status: null,
        code: nome === "TimeoutError" || nome === "AbortError" ? "timeout" : "network_error",
      });
    }
    if (!response.ok) {
      let erroApi: { code?: string; description?: string } | undefined;
      try {
        const erro = (await response.json()) as {
          errors?: { code?: string; description?: string }[];
        };
        erroApi = erro.errors?.[0];
      } catch {
        // corpo vazio ou não-JSON
      }
      throw new ErroProvedorPagamento({
        status: response.status,
        code: erroApi?.code ?? `http_${response.status}`,
        description: erroApi?.description,
      });
    }
    const body = await response.text();
    if (!body) return undefined as T;
    try {
      return JSON.parse(body) as T;
    } catch {
      throw new ErroProvedorPagamento({ status: response.status, code: "invalid_response" });
    }
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
        // A página do Asaas (invoiceUrl) também mostra o Pix: vira o caminho de reserva se o
        // endpoint de QR falhar (o sandbox responde 400 "erro desconhecido" em algumas contas).
        result.checkoutUrl = payment.invoiceUrl;
        try {
          const qr = await this.request<{ payload: string; encodedImage: string }>(
            `/payments/${payment.id}/pixQrCode`,
          );
          result.pixPayload = qr.payload;
          result.pixQrBase64 = qr.encodedImage;
        } catch (error) {
          if (!payment.invoiceUrl) throw error;
        }
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

  async confirmarPagamentoSandbox(id: string): Promise<Cobranca> {
    if (process.env.ASAAS_ENV === "production" || !fakePermitido())
      throw new Error("Simulação Asaas disponível apenas no sandbox em modo de teste");
    await this.request<AsaasPayment>(`/sandbox/payment/${encodeURIComponent(id)}/confirm`, {
      method: "POST",
      body: "{}", // sem corpo JSON o sandbox responde 400 "erro desconhecido"
    });
    return this.consultarCobranca(id);
  }

  async detalhesBoleto(id: string): Promise<DetalhesBoleto> {
    const caminho = `/payments/${encodeURIComponent(id)}`;
    const linha = await this.request<{
      identificationField: string;
      nossoNumero?: string;
      barCode?: string;
    }>(`${caminho}/identificationField`);
    // Pix do boleto e dados do beneficiário são extras: se falharem, o boleto sai sem eles.
    const [pix, conta] = await Promise.all([
      this.request<{ payload?: string; encodedImage?: string }>(`${caminho}/pixQrCode`).catch(
        () => null,
      ),
      this.request<{ name?: string; companyName?: string; cpfCnpj?: string }>(
        "/myAccount/commercialInfo/",
      ).catch(() => null),
    ]);
    const nomeConta = conta?.companyName || conta?.name;
    return {
      linhaDigitavel: linha.identificationField,
      codigoBarras: linha.barCode,
      nossoNumero: linha.nossoNumero,
      pixPayload: pix?.payload,
      pixQrBase64: pix?.encodedImage,
      beneficiario: nomeConta ? { nome: nomeConta, documento: conta?.cpfCnpj } : undefined,
    };
  }

  async cancelarCobranca(id: string): Promise<void> {
    await this.request<unknown>(`/payments/${encodeURIComponent(id)}`, { method: "DELETE" });
  }
  validarWebhook(headers: Headers): boolean {
    return validarWebhookAsaas(headers);
  }
  parseWebhook(rawBody: string): EventoPagamento {
    return parseWebhookAsaas(rawBody);
  }
}
