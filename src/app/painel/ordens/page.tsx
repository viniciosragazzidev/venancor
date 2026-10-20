import type { Metadata } from "next";

import { AtualizacaoAoVivo } from "@/components/admin/atualizacao-ao-vivo";
import { PageHeader } from "@/components/admin/page-header";
import { PollingAsaas } from "@/components/admin/polling-asaas";
import { listarClientes } from "@/modules/clientes/actions";
import { listarContratoModelos } from "@/modules/contratos/actions";
import { listarResumoLembretes } from "@/modules/lembretes/actions";
import { listarOrdens } from "@/modules/ordens/actions";
import { listarOrdemModelos } from "@/modules/ordens/modelos-actions";
import { listarPlanos } from "@/modules/planos/actions";

import { OrdensTabela } from "./ordens-tabela";

export const metadata: Metadata = {
  title: "Ordens",
};

/** Request time, read once per render so every row agrees ("aberto há 2 h"). */
function instanteAtual() {
  return Date.now();
}

export default async function OrdensPage() {
  const [ordens, clientes, planos, modelos, contratos, lembretes] = await Promise.all([
    listarOrdens(),
    listarClientes(),
    listarPlanos(),
    listarOrdemModelos(),
    listarContratoModelos(),
    listarResumoLembretes(),
  ]);
  const agora = instanteAtual();
  return (
    <div className="flex flex-col gap-6">
      <AtualizacaoAoVivo intervaloMs={30_000} />
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
        lembretes={lembretes}
        agora={agora}
      />
    </div>
  );
}
