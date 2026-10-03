import type { SignatureProvider } from "./types";

const inhouse: SignatureProvider = {
  nome: "inhouse",
  async assinar() {
    throw new Error("Assinatura em PDF será implementada em F5.2");
  },
  async verificar() {
    throw new Error("Verificação de PDF será implementada em F5.2");
  },
};

export function getSignatureProvider(): SignatureProvider {
  const selected = process.env.SIGNATURE_PROVIDER ?? "inhouse";
  if (selected === "inhouse") return inhouse;
  throw new Error(`SignatureProvider desconhecido: ${selected}`);
}
export type * from "./types";
