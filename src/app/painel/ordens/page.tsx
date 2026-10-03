import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { PollingAsaas } from "@/components/admin/polling-asaas";
import { listarClientes } from "@/modules/clientes/actions";
import { listarOrdens } from "@/modules/ordens/actions";
import { listarPlanos } from "@/modules/planos/actions";

import { OrdensTabela } from "./ordens-tabela";

export const metadata: Metadata = {
  title: "Ordens",
};

export default async function OrdensPage() {
  const [ordens, clientes, planos] = await Promise.all([
    listarOrdens(),
    listarClientes(),
    listarPlanos(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <PollingAsaas
        ativo={
          (process.env.PAYMENT_PROVIDER ?? "fake") === "asaas" &&
          process.env.ASAAS_ENV === "sandbox"
        }
      />
      <PageHeader
        title="Ordens"
        description="Propostas criadas para os clientes, com status e link de assinatura."
      />
      <OrdensTabela ordens={ordens} clientes={clientes} planos={planos} />
    </div>
  );
}
