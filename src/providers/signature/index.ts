import type { SignatureProvider } from "./types";
import { InHouseSignatureProvider } from "./inhouse";

const inhouse: SignatureProvider = new InHouseSignatureProvider();

export function getSignatureProvider(): SignatureProvider {
  const selected = process.env.SIGNATURE_PROVIDER ?? "inhouse";
  if (selected === "inhouse") return inhouse;
  throw new Error(`SignatureProvider desconhecido: ${selected}`);
}
export type * from "./types";
