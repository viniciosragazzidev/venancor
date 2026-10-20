import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { PollingAsaas } from "@/components/admin/polling-asaas";
import { listarClientes } from "@/modules/clientes/actions";
import { listarContratoModelos } from "@/modules/contratos/actions";
import { listarOrdens } from "@/modules/ordens/actions";
import { listarOrdemModelos } from "@/modules/ordens/modelos-actions";
import { listarPlanos } from "@/modules/planos/actions";

import { OrdensTabela } from "./ordens-tabela";

export const metadata: Metadata = {
  title: "Ordens",
};

export default async function OrdensPage() {
  const [ordens, clientes, planos, modelos, contratos] = await Promise.all([
    listarOrdens(),
    listarClientes(),
    listarPlanos(),
    listarOrdemModelos(),
    listarContratoModelos(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <PollingAsaas
        ativo={
          (process.env.PAYMENT_PROVIDER ?? "fake") === "asaas" &&
          process.env.ASAAS_ENV !== "production"
        }
      />
      <PageHeader
        title="Ordens"
        description="Propostas criadas para os clientes, com status e link de assinatura."
      />
      <OrdensTabela
        ordens={ordens}
        clientes={clientes}
        planos={planos}
        modelos={modelos}
        contratos={contratos.map(({ id, nome, planoId, ativo }) => ({ id, nome, planoId, ativo }))}
      />
    </div>
  );
}
