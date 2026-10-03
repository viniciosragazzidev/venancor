import type { Metadata } from "next";

import { FluxoMock } from "@/components/cliente/fluxo-mock";

export const metadata: Metadata = {
  title: "Sua proposta",
  robots: { index: false },
};

// TODO (Cofre, F4.1): ler o token da rota (props.params), resolver a ordem
// (hash, expirada/cancelada/paga), marcar `visualizada` e renderizar os dados reais.
export default function PaginaProposta() {
  return <FluxoMock />;
}
