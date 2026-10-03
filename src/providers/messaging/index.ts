import { FakeMessagingProvider } from "./fake";
import { MetaWhatsAppProvider } from "./meta";
import type { MessagingProvider } from "./types";

let fake: FakeMessagingProvider | undefined;
export function getMessagingProvider(): MessagingProvider {
  const selected = process.env.MESSAGING_PROVIDER ?? "fake";
  if (selected === "fake") {
    if (process.env.NODE_ENV === "production")
      throw new Error("Mensageria fake indisponível em produção");
    return (fake ??= new FakeMessagingProvider());
  }
  if (selected === "meta") return new MetaWhatsAppProvider();
  throw new Error(`MessagingProvider desconhecido: ${selected}`);
}
export type * from "./types";
