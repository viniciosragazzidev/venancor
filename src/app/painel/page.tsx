import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { PollingAsaas } from "@/components/admin/polling-asaas";
import { formatarCentavos } from "@/components/admin/format";
import {
  classesStatusOrdem,
  formatarDataHora,
  rotuloStatusOrdem,
} from "@/components/admin/status-ordem";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { carregarDashboard } from "@/modules/dashboard/queries";

import { FiltroPeriodo } from "./filtro-periodo";

export const metadata: Metadata = {
  title: "Dashboard",
};

function Estatistica({
  rotulo,
  valor,
  legenda,
}: {
  rotulo: string;
  valor: string;
  legenda: string;
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="flex flex-col gap-1 p-6">
        <p className="text-sm text-pretty text-muted-foreground">{rotulo}</p>
        <p className="text-2xl font-semibold tabular-nums text-balance">{valor}</p>
        <p className="text-xs text-pretty text-muted-foreground">{legenda}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const params = await searchParams;
  const mes =
    typeof params.mes === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.mes)
      ? params.mes
      : null;
  const agora = mes ? new Date(`${mes}-01T12:00:00Z`) : new Date();
  const resumo = await carregarDashboard(agora);

  const rotuloPeriodo = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(resumo.periodo.inicio));

  const temPendencias = resumo.pagamentosEstornados > 0 || resumo.pagamentosOrfaos > 0;

  return (
    <div className="flex flex-col gap-6">
      <PollingAsaas
        ativo={
          (process.env.PAYMENT_PROVIDER ?? "fake") === "asaas" &&
          process.env.ASAAS_ENV === "sandbox"
        }
      />
      <div className="flex flex-col gap-4">
        <PageHeader title="Dashboard" description="Acompanhe suas vendas e as ordens recentes." />
        <FiltroPeriodo />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Estatistica
          rotulo="Receita confirmada"
          valor={formatarCentavos(resumo.receitaConfirmadaCentavos)}
          legenda={`Pagamentos confirmados em ${rotuloPeriodo}`}
        />
        <Estatistica
          rotulo="Ordens pagas"
          valor={String(resumo.ordens.pagas)}
          legenda={`${resumo.ordens.total} ordem(ns) no total`}
        />
        <Estatistica
          rotulo="Ordens abertas"
          valor={String(resumo.ordens.abertas)}
          legenda={`${resumo.ordens.assinadas} assinadas · ${resumo.ordens.expiradas} expiradas`}
        />
        <Card className="rounded-3xl">
          <CardContent className="flex flex-col gap-2 p-6">
            <p className="text-sm text-pretty text-muted-foreground">Pendências</p>
            {temPendencias ? (
              <div className="flex flex-col gap-1.5 text-sm tabular-nums">
                <p
                  className={
                    resumo.pagamentosEstornados > 0
                      ? "font-medium text-amber-600 dark:text-amber-400"
                      : ""
                  }
                >
                  Estornos: {resumo.pagamentosEstornados}
                </p>
                <p
                  className={
                    resumo.pagamentosOrfaos > 0
                      ? "font-medium text-amber-600 dark:text-amber-400"
                      : ""
                  }
                >
                  Pagamentos órfãos: {resumo.pagamentosOrfaos}
                </p>
              </div>
            ) : (
              <p className="text-sm text-pretty text-muted-foreground">
                Nenhum estorno ou pagamento órfão. Tudo certo por aqui.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Ordens recentes</p>
        <Link
          href="/painel/ordens"
          className="text-sm text-primary transition-colors hover:text-primary/80"
        >
          Ver todas
        </Link>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {resumo.recentes.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma ordem criada ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cobrado</TableHead>
                    <TableHead>Criada</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumo.recentes.map((ordem) => (
                    <TableRow key={ordem.id}>
                      <TableCell className="font-medium">{ordem.cliente}</TableCell>
                      <TableCell>{ordem.plano}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={classesStatusOrdem(ordem.status)}>
                          {rotuloStatusOrdem(ordem.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatarCentavos(ordem.valorCobrado)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatarDataHora(ordem.criadaEm)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Link
                            href={`/painel/ordens/${ordem.id}`}
                            aria-label={`Ver ordem de ${ordem.cliente}`}
                            className="inline-flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                          >
                            <ChevronRightIcon aria-hidden strokeWidth={1.5} className="size-4" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
