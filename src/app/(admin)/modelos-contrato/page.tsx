import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Modelos de contrato",
};

export default function ModelosContratoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Modelos de contrato"
        description="Modelos com variáveis preenchidas com os dados do cliente."
      />
    </div>
  );
}
