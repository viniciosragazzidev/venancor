import { FakeMessagingProvider } from "./fake";
import type { MessagingProvider } from "./types";

let fake: FakeMessagingProvider | undefined;
export function getMessagingProvider(): MessagingProvider {
  const selected = process.env.MESSAGING_PROVIDER ?? "fake";
  if (selected === "fake") return (fake ??= new FakeMessagingProvider());
  if (selected === "meta") throw new Error("MetaWhatsAppProvider será implementado em F7.1");
  throw new Error(`MessagingProvider desconhecido: ${selected}`);
}
export type * from "./types";
