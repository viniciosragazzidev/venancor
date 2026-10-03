"use client";

import { useQueryState } from "nuqs";

function chaveMes(data: Date): string {
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function FiltroPeriodo() {
  const agora = new Date();
  const mesAtual = chaveMes(agora);
  const mesAnterior = chaveMes(
    new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - 1, 1)),
  );
  const [mes, setMes] = useQueryState("mes", { defaultValue: "", scroll: false });

  const ativoAtual = !mes || mes === mesAtual;
  const ativoAnterior = mes === mesAnterior;

  const estiloAtivo = "bg-primary/10 text-primary font-medium";
  const estiloInativo = "text-muted-foreground hover:text-foreground";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label="Período do dashboard"
        className="flex items-center gap-1 rounded-full border bg-muted/40 p-1"
      >
        <button
          type="button"
          aria-pressed={ativoAtual}
          className={`h-9 rounded-full px-4 text-sm transition-colors ${ativoAtual ? estiloAtivo : estiloInativo}`}
          onClick={() => setMes(null)}
        >
          Este mês
        </button>
        <button
          type="button"
          aria-pressed={ativoAnterior}
          className={`h-9 rounded-full px-4 text-sm transition-colors ${ativoAnterior ? estiloAtivo : estiloInativo}`}
          onClick={() => setMes(mesAnterior)}
        >
          Mês anterior
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Escolher mês</span>
        <input
          type="month"
          aria-label="Escolher mês"
          className="h-9 rounded-full border bg-card px-4 text-sm tabular-nums text-foreground"
          value={mes || mesAtual}
          max={mesAtual}
          onChange={(evento) => {
            const valor = evento.target.value;
            if (!valor) return;
            setMes(valor === mesAtual ? null : valor);
          }}
        />
      </label>
    </div>
  );
}
