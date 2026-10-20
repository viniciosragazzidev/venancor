/**
 * Funnel of a client link (Enviado -> Aberto -> Assinado -> Pago), shown live in the orders list.
 * Pure: no database, so the list (client component) and the tests share it.
 */

type Instante = Date | string | null | undefined;

export interface OrdemFunil {
  status: string;
  expiraEm: Instante;
  enviadaEm: Instante;
  visualizadaEm: Instante;
  assinadaEm: Instante;
  pagaEm: Instante;
  canceladaEm: Instante;
}

export type EtapaFunil =
  "rascunho" | "aguardando_abertura" | "aberto" | "assinado" | "pago" | "expirado" | "cancelado";

export type FiltroEtapa = "todos" | "aguardando_abertura" | "aberto" | "assinado" | "pago";

export const FILTROS_ETAPA: readonly { valor: FiltroEtapa; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "aguardando_abertura", rotulo: "Aguardando abertura" },
  { valor: "aberto", rotulo: "Abertos sem assinatura" },
  { valor: "assinado", rotulo: "Assinados sem pagamento" },
  { valor: "pago", rotulo: "Pagos" },
];

export type ChavePasso = "enviado" | "aberto" | "assinado" | "pago";

export interface PassoFunil {
  chave: ChavePasso;
  rotulo: string;
  em: Date | null;
}

const ROTULOS_PASSO: Record<ChavePasso, string> = {
  enviado: "Enviado",
  aberto: "Aberto",
  assinado: "Assinado",
  pago: "Pago",
};

export function paraData(valor: Instante): Date | null {
  if (!valor) return null;
  const data = typeof valor === "string" ? new Date(valor) : valor;
  return Number.isNaN(data.getTime()) ? null : data;
}

/** Stage of the order in the funnel. A link past its deadline before signing counts as expired. */
export function etapaFunil(ordem: OrdemFunil, agora: number): EtapaFunil {
  const expira = paraData(ordem.expiraEm);
  const venceu = expira !== null && expira.getTime() < agora;
  switch (ordem.status) {
    case "cancelada":
      return "cancelado";
    case "paga":
      return "pago";
    case "expirada":
      return "expirado";
    case "assinada":
    case "aguardando_pagamento":
      return "assinado";
    case "visualizada":
      return venceu ? "expirado" : "aberto";
    case "enviada":
      return venceu ? "expirado" : "aguardando_abertura";
    default:
      return venceu ? "expirado" : "rascunho";
  }
}

export function passosFunil(ordem: OrdemFunil): PassoFunil[] {
  const datas: Record<ChavePasso, Date | null> = {
    enviado: paraData(ordem.enviadaEm),
    aberto: paraData(ordem.visualizadaEm),
    assinado: paraData(ordem.assinadaEm),
    pago: paraData(ordem.pagaEm),
  };
  return (Object.keys(ROTULOS_PASSO) as ChavePasso[]).map((chave) => ({
    chave,
    rotulo: ROTULOS_PASSO[chave],
    em: datas[chave],
  }));
}

export function filtrarPorEtapa<T extends OrdemFunil>(
  ordens: readonly T[],
  filtro: FiltroEtapa,
  agora: number,
): T[] {
  if (filtro === "todos") return [...ordens];
  return ordens.filter((ordem) => etapaFunil(ordem, agora) === filtro);
}

export function contarPorFiltro(
  ordens: readonly OrdemFunil[],
  agora: number,
): Record<FiltroEtapa, number> {
  const contagem: Record<FiltroEtapa, number> = {
    todos: ordens.length,
    aguardando_abertura: 0,
    aberto: 0,
    assinado: 0,
    pago: 0,
  };
  for (const ordem of ordens) {
    const etapa = etapaFunil(ordem, agora);
    if (etapa in contagem) contagem[etapa as FiltroEtapa] += 1;
  }
  return contagem;
}

/** "agora", "há 5 min", "há 2 h", "há 3 dias" (or "em 2 h" for a future instant). */
export function tempoRelativo(data: Date, agora: number): string {
  const diferenca = agora - data.getTime();
  const futuro = diferenca < 0;
  const minutos = Math.floor(Math.abs(diferenca) / 60_000);
  if (minutos < 1) return "agora";
  let texto: string;
  if (minutos < 60) texto = `${minutos} min`;
  else if (minutos < 24 * 60) texto = `${Math.floor(minutos / 60)} h`;
  else {
    const dias = Math.floor(minutos / (24 * 60));
    texto = `${dias} ${dias === 1 ? "dia" : "dias"}`;
  }
  return futuro ? `em ${texto}` : `há ${texto}`;
}

/** One line under the progress bar: the latest thing that happened, e.g. "Aberto há 2 h". */
export function resumoEtapa(ordem: OrdemFunil, agora: number): string {
  const etapa = etapaFunil(ordem, agora);
  const quando = (valor: Instante) => {
    const data = paraData(valor);
    return data ? ` ${tempoRelativo(data, agora)}` : "";
  };
  switch (etapa) {
    case "rascunho":
      return "Ainda não enviado";
    case "aguardando_abertura":
      return `Enviado${quando(ordem.enviadaEm)}, não aberto`;
    case "aberto":
      return `Aberto${quando(ordem.visualizadaEm)}`;
    case "assinado":
      return `Assinado${quando(ordem.assinadaEm)}, aguardando pagamento`;
    case "pago":
      return `Pago${quando(ordem.pagaEm)}`;
    case "expirado":
      return `Expirou${quando(ordem.expiraEm)}`;
    case "cancelado":
      return `Cancelado${quando(ordem.canceladaEm)}`;
  }
}

const dataHoraBrasilia = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

/** Fixed time zone so the server render and the browser agree (no hydration mismatch). */
export function formatarDataHoraBrasilia(data: Date): string {
  return dataHoraBrasilia.format(data);
}
