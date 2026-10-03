import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Ordens",
};

export default function OrdensPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ordens de venda"
        description="Crie propostas e acompanhe o status de cada ordem."
      />
    </div>
  );
}
