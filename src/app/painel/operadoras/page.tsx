import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { listarOperadoras } from "@/modules/planos/actions";

import { OperadorasTabela } from "./operadoras-tabela";

export const metadata: Metadata = {
  title: "Operadoras",
};

export default async function OperadorasPage() {
  const dados = await listarOperadoras();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Operadoras" description="Operadoras de plano de saúde e registros ANS." />
      <OperadorasTabela dados={dados} />
    </div>
  );
}
