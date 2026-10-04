import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Brand } from "@/components/admin/brand";
import { FaixaAmbienteTeste } from "@/components/ambiente-teste";
import { FluxoReal } from "@/components/cliente/fluxo-real";
import { TelaStatus } from "@/components/cliente/tela-sucesso";
import { resolverToken } from "@/modules/ordens/cliente";
import { fakePermitido } from "@/lib/modo-teste";
import { assinaturaExigeOtp } from "@/modules/assinatura/otp-policy";

export const metadata: Metadata = {
  title: "Sua proposta",
  robots: { index: false },
};

export default async function PaginaProposta({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const estado = await resolverToken(token);
  if (estado.tipo === "invalido") notFound();
  if (estado.tipo === "expirada" || estado.tipo === "cancelada")
    return (
      <div className="flex min-h-svh flex-col bg-muted/40">
        <FaixaAmbienteTeste />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
          <header className="flex justify-center py-4">
            <Brand />
          </header>
          <TelaStatus tipo={estado.tipo} />
        </div>
      </div>
    );
  if (!("dados" in estado)) notFound();
  const provider = process.env.PAYMENT_PROVIDER ?? "fake";
  const simulacaoDisponivel =
    provider === "fake" || (provider === "asaas" && process.env.ASAAS_ENV !== "production");
  const otpAutomatico = fakePermitido() && (process.env.MESSAGING_PROVIDER ?? "fake") === "fake";
  return (
    <FluxoReal
      token={token}
      ordem={estado.dados}
      simulacaoDisponivel={simulacaoDisponivel}
      otpAutomatico={otpAutomatico}
      exigeOtp={assinaturaExigeOtp()}
    />
  );
}
