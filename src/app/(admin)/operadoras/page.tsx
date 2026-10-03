import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Operadoras",
};

export default function OperadorasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Operadoras"
        description="Cadastre as operadoras com CNPJ e registro ANS."
      />
    </div>
  );
}
