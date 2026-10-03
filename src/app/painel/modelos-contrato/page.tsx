import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { listarContratoModelos } from "@/modules/contratos/actions";
import { listarPlanos } from "@/modules/planos/actions";

import { ModelosTabela } from "./modelos-tabela";

export const metadata: Metadata = {
  title: "Modelos de contrato",
};

export default async function ModelosContratoPage() {
  const [modelos, planos] = await Promise.all([listarContratoModelos(), listarPlanos()]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Modelos de contrato"
        description="Modelos com variáveis substituídas na hora de gerar o contrato."
      />
      <ModelosTabela modelos={modelos} planos={planos} />
    </div>
  );
}
