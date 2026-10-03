import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Brand } from "@/components/admin/brand";
import { FluxoReal } from "@/components/cliente/fluxo-real";
import { TelaStatus } from "@/components/cliente/tela-sucesso";
import { resolverToken } from "@/modules/ordens/cliente";

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
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
          <header className="flex justify-center py-4">
            <Brand />
          </header>
          <TelaStatus tipo={estado.tipo} />
        </div>
      </div>
    );
  if (!("dados" in estado)) notFound();
  return <FluxoReal token={token} ordem={estado.dados} />;
}
