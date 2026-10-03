import { FakePaymentProvider } from "./fake";
import { AsaasProvider } from "./asaas";
import type { PaymentProvider } from "./types";

let fake: FakePaymentProvider | undefined;
export function getPaymentProvider(): PaymentProvider {
  const selected = process.env.PAYMENT_PROVIDER ?? "fake";
  if (selected === "fake") {
    if (process.env.NODE_ENV === "production")
      throw new Error("Pagamento fake indisponível em produção");
    return (fake ??= new FakePaymentProvider());
  }
  if (selected === "asaas") return new AsaasProvider();
  throw new Error(`PaymentProvider desconhecido: ${selected}`);
}
export type * from "./types";
