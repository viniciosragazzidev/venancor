import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRightIcon, UsersIcon } from "lucide-react";

import type { DadosOrdemCliente } from "./types";
import {
  formatarBRL,
  formatarData,
  formatarTelefone,
  rotulosAbrangencia,
  rotulosAcomodacao,
} from "./format";

export function TelaResumo({
  ordem,
  onAvancar,
}: {
  ordem: DadosOrdemCliente;
  onAvancar: () => void;
}) {
  const { plano, beneficiarios } = ordem;

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-3xl">
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {plano.operadora_nome}
            </p>
            <h2 className="text-lg leading-snug font-medium text-balance">{plano.plano_nome}</h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="secondary" className="rounded-full font-normal">
                {rotulosAcomodacao[plano.acomodacao] ?? plano.acomodacao}
              </Badge>
              <Badge variant="secondary" className="rounded-full font-normal">
                {rotulosAbrangencia[plano.abrangencia] ?? plano.abrangencia}
              </Badge>
              <Badge variant="secondary" className="rounded-full font-normal">
                {plano.coparticipacao ? "Com coparticipação" : "Sem coparticipação"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Beneficiários</p>
            <ul className="flex flex-col gap-3">
              {beneficiarios.map((beneficiario) => (
                <li key={beneficiario.cpf} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <UsersIcon
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm">{beneficiario.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {beneficiario.titular ? "Titular" : "Dependente"} · faixa{" "}
                        {beneficiario.faixa_etaria}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-sm tabular-nums">
                    {formatarBRL(beneficiario.valor)}
                    <span className="text-muted-foreground">/mês</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Mensalidade total</dt>
              <dd className="tabular-nums">{formatarBRL(ordem.valor_mensal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Taxa de adesão</dt>
              <dd className="tabular-nums">{formatarBRL(ordem.valor_adesao)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t pt-2.5">
              <dt className="font-medium">Total a pagar agora</dt>
              <dd className="text-xl font-medium tabular-nums">
                {formatarBRL(ordem.valor_cobrado)}
              </dd>
            </div>
            <p className="text-xs text-pretty text-muted-foreground">
              1ª mensalidade + taxa de adesão. Proposta válida até {formatarData(ordem.expira_em)}.
            </p>
          </dl>
        </CardContent>
      </Card>

      <Button size="lg" className="h-12 w-full rounded-full px-6 text-base" onClick={onAvancar}>
        Ver contrato
        <ChevronRightIcon data-icon="inline-end" aria-hidden strokeWidth={1.5} />
      </Button>

      <Card className="rounded-3xl" size="sm">
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            O que está coberto
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
            {plano.coberturas}
          </p>
          <div className="flex flex-col gap-2 text-xs text-pretty text-muted-foreground">
            <p>
              <span className="text-foreground/80">Carências: </span>
              {plano.carencias}
            </p>
            <p>
              <span className="text-foreground/80">Rede credenciada: </span>
              {plano.rede_credenciada}
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Dúvidas? Fale com seu corretor: {formatarTelefone(ordem.cliente.whatsapp)}
      </p>
    </div>
  );
}
