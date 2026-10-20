import {
  etapaFunil,
  formatarDataHoraBrasilia,
  passosFunil,
  resumoEtapa,
  tempoRelativo,
  type OrdemFunil,
} from "@/modules/ordens/funil";

/**
 * Progress of the client link (Enviado -> Aberto -> Assinado -> Pago) with the time of each step
 * on hover and the latest step written under the bar.
 */
export function FunilOrdem({
  ordem,
  agora,
  lembretes = 0,
}: {
  ordem: OrdemFunil;
  agora: number;
  lembretes?: number;
}) {
  const etapa = etapaFunil(ordem, agora);
  const encerrada = etapa === "cancelado" || etapa === "expirado";
  const passos = passosFunil(ordem);
  const resumo = resumoEtapa(ordem, agora);
  const textoLembretes =
    lembretes > 0 ? ` · ${lembretes} ${lembretes === 1 ? "lembrete" : "lembretes"}` : "";

  return (
    <div className="flex w-56 flex-col gap-1.5">
      <ol aria-label="Progresso do link" className="grid grid-cols-4 gap-1">
        {passos.map((passo) => {
          const feito = passo.em !== null;
          const cor = !feito
            ? "bg-muted"
            : encerrada
              ? "bg-muted-foreground/40"
              : etapa === "pago"
                ? "bg-emerald-500"
                : "bg-primary";
          const detalhe = passo.em
            ? `${passo.rotulo} em ${formatarDataHoraBrasilia(passo.em)} (${tempoRelativo(passo.em, agora)})`
            : `${passo.rotulo}: ainda não`;
          return (
            <li key={passo.chave} title={detalhe} className="flex flex-col gap-1">
              <span aria-hidden className={`block h-1.5 rounded-full transition-colors ${cor}`} />
              <span
                aria-hidden
                className={`text-[10px] leading-none ${feito ? "text-foreground" : "text-muted-foreground/70"}`}
              >
                {passo.rotulo}
              </span>
              <span className="sr-only">{detalhe}</span>
            </li>
          );
        })}
      </ol>
      <p
        className={`text-xs tabular-nums ${etapa === "cancelado" ? "text-destructive" : "text-muted-foreground"}`}
      >
        {resumo}
        {textoLembretes}
      </p>
    </div>
  );
}
