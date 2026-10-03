import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Clientes",
};

export default function ClientesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Clientes" description="Cadastre clientes e seus dependentes." />
    </div>
  );
}
