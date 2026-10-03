import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { listarOperadoras, listarPlanos } from "@/modules/planos/actions";

import { PlanosTabela } from "./planos-tabela";

export const metadata: Metadata = {
  title: "Planos",
};

export default async function PlanosPage() {
  const [planos, operadoras] = await Promise.all([listarPlanos(), listarOperadoras()]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Planos"
        description="Planos por operadora, com tabela de preços por faixa etária."
      />
      <PlanosTabela planos={planos} operadoras={operadoras} />
    </div>
  );
}
