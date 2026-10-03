import { FakePaymentProvider } from "./fake";
import type { PaymentProvider } from "./types";

let fake: FakePaymentProvider | undefined;
export function getPaymentProvider(): PaymentProvider {
  const selected = process.env.PAYMENT_PROVIDER ?? "fake";
  if (selected === "fake") return (fake ??= new FakePaymentProvider());
  if (selected === "asaas") throw new Error("AsaasProvider será implementado em F6.2");
  throw new Error(`PaymentProvider desconhecido: ${selected}`);
}
export type * from "./types";
