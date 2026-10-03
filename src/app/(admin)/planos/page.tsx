import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Planos",
};

export default function PlanosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Planos de saúde"
        description="Cadastre planos com tabela de preços por faixa etária."
      />
    </div>
  );
}
