import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { formatarCentavos } from "@/components/admin/format";
import {
  classesStatusOrdem,
  formatarDataHora,
  rotuloAtor,
  rotuloEventoOrdem,
  rotuloMetodoPagamento,
  rotuloStatusOrdem,
  rotuloValorCobrado,
} from "@/components/admin/status-ordem";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listarClientes } from "@/modules/clientes/actions";
import { listarOrdens } from "@/modules/ordens/actions";
import { listarEventosOrdem, obterDownloadsOrdem } from "@/modules/ordens/queries";
import { listarPlanos } from "@/modules/planos/actions";

import { OrdemAcoes } from "./ordem-acoes";

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
  const [eventos, downloads] = await Promise.all([
    listarEventosOrdem(ordem.id),
    obterDownloadsOrdem(ordem.id),
  ]);

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

      <OrdemAcoes ordemId={ordem.id} status={ordem.status} />

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
          {eventos.length === 0 ? (
            <p className="text-sm text-pretty text-muted-foreground">Nenhum evento registrado.</p>
          ) : (
            <ol className="relative flex flex-col gap-4 border-l pl-5">
              {eventos.map((evento) => (
                <li key={evento.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[26px] size-2.5 rounded-full bg-primary ring-4 ring-background"
                  />
                  <p className="text-sm font-medium text-pretty">
                    {rotuloEventoOrdem(evento.acao, evento.metadados)}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatarDataHora(evento.criadoEm)} · {rotuloAtor(evento.ator)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Carta>

        <Carta titulo="Documentos">
          {downloads ? (
            <div className="flex flex-col gap-3">
              <dl className="flex flex-col gap-2.5">
                <Linha rotulo="Assinado em" valor={formatarDataHora(downloads.assinadoEm)} />
              </dl>
              <p className="font-mono text-xs break-all text-muted-foreground">
                SHA-256: {downloads.hashSha256}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={downloads.contratoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <DownloadIcon aria-hidden strokeWidth={1.5} className="size-4" />
                  Contrato assinado (PDF)
                </a>
                <a
                  href={downloads.evidenciasUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <DownloadIcon aria-hidden strokeWidth={1.5} className="size-4" />
                  Página de evidências (PDF)
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-pretty text-muted-foreground">
              O contrato ainda não foi assinado. Os downloads aparecem aqui depois da assinatura.
            </p>
          )}
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
