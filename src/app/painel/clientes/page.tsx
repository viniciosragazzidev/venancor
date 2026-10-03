import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { listarClientes } from "@/modules/clientes/actions";

import { ClientesTabela } from "./clientes-tabela";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function ClientesPage() {
  const dados = await listarClientes();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Titulares, endereços e dependentes de cada cliente."
      />
      <ClientesTabela dados={dados} />
    </div>
  );
}
