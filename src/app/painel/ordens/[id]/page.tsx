import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { formatarCentavos } from "@/components/admin/format";
import {
  classesStatusOrdem,
  formatarDataHora,
  rotuloMetodoPagamento,
  rotuloStatusOrdem,
  rotuloValorCobrado,
} from "@/components/admin/status-ordem";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listarClientes } from "@/modules/clientes/actions";
import { listarOrdens } from "@/modules/ordens/actions";
import { listarPlanos } from "@/modules/planos/actions";

export const metadata: Metadata = {
  title: "Ordem",
};

function Linha({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-pretty text-muted-foreground">{rotulo}</dt>
      <dd
        className={`tabular-nums ${destaque ? "text-base font-medium" : "text-sm font-medium"} text-right`}
      >
        {valor}
      </dd>
    </div>
  );
}

function Carta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex flex-col gap-3 p-6">
        <p className="text-sm font-medium">{titulo}</p>
        {children}
      </CardContent>
    </Card>
  );
}

export default async function OrdemDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ordens, clientes, planos] = await Promise.all([
    listarOrdens(),
    listarClientes(),
    listarPlanos(),
  ]);
  const ordem = ordens.find((item) => item.id === id);
  if (!ordem) notFound();

  const cliente = clientes.find((item) => item.id === ordem.clienteId);
  const plano = planos.find((item) => item.id === ordem.planoId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={`Ordem de ${cliente?.nome ?? "cliente"}`}
          description={`${plano?.nome ?? "Plano"} · Criada em ${formatarDataHora(ordem.criadoEm)}`}
        />
        <Badge variant="outline" className={classesStatusOrdem(ordem.status)}>
          {rotuloStatusOrdem(ordem.status)}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Carta titulo="Valores">
          <dl className="flex flex-col gap-2.5">
            <Linha rotulo="Mensalidade" valor={formatarCentavos(ordem.valorMensal)} />
            <Linha rotulo="Taxa de adesão" valor={formatarCentavos(ordem.valorAdesao)} />
            <Linha rotulo="Desconto" valor={`- ${formatarCentavos(ordem.desconto)}`} />
            {ordem.descontoObs ? (
              <p className="text-xs text-pretty text-muted-foreground">{ordem.descontoObs}</p>
            ) : null}
            <div className="border-t pt-2.5">
              <Linha rotulo="Total cobrado" valor={formatarCentavos(ordem.valorCobrado)} destaque />
            </div>
            <p className="text-xs text-pretty text-muted-foreground">
              {rotuloValorCobrado(ordem.valorCobradoTipo)}
            </p>
          </dl>
        </Carta>

        <Carta titulo="Condições de pagamento">
          <dl className="flex flex-col gap-2.5">
            <Linha
              rotulo="Formas de pagamento"
              valor={ordem.formasPagamento.map(rotuloMetodoPagamento).join(" · ")}
            />
            <Linha rotulo="Máximo de parcelas" valor={`${ordem.maxParcelas}x`} />
            <Linha rotulo="Link expira em" valor={formatarDataHora(ordem.expiraEm)} />
          </dl>
        </Carta>

        <Carta titulo="Linha do tempo">
          <dl className="flex flex-col gap-2.5">
            <Linha rotulo="Criada" valor={formatarDataHora(ordem.criadoEm)} />
            {ordem.enviadaEm ? (
              <Linha rotulo="Enviada" valor={formatarDataHora(ordem.enviadaEm)} />
            ) : null}
            {ordem.visualizadaEm ? (
              <Linha rotulo="Visualizada" valor={formatarDataHora(ordem.visualizadaEm)} />
            ) : null}
            {ordem.assinadaEm ? (
              <Linha rotulo="Assinada" valor={formatarDataHora(ordem.assinadaEm)} />
            ) : null}
            {ordem.pagaEm ? <Linha rotulo="Paga" valor={formatarDataHora(ordem.pagaEm)} /> : null}
            {ordem.canceladaEm ? (
              <Linha rotulo="Cancelada" valor={formatarDataHora(ordem.canceladaEm)} />
            ) : null}
          </dl>
        </Carta>

        <Carta titulo="Beneficiários">
          {/* TODO (Cofre): action admin de detalhe com beneficiários + snapshot do plano
              (listarOrdens devolve só a linha da ordem). Enquanto isso, placeholder. */}
          <p className="text-sm text-pretty text-muted-foreground">
            O titular e os dependentes aparecem aqui quando o loader de detalhe estiver disponível.
          </p>
          <p className="font-mono text-xs break-all text-muted-foreground">Ordem {ordem.id}</p>
        </Carta>
      </div>
    </div>
  );
}
