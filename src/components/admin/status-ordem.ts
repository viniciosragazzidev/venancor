export function rotuloStatusOrdem(status: string): string {
  const rotulos: Record<string, string> = {
    rascunho: "Rascunho",
    enviada: "Enviada",
    visualizada: "Visualizada",
    assinada: "Assinada",
    aguardando_pagamento: "Aguardando pagamento",
    paga: "Paga",
    expirada: "Expirada",
    cancelada: "Cancelada",
  };
  return rotulos[status] ?? status;
}

/** Classes extras para o Badge (passar junto de variant="outline"). */
export function classesStatusOrdem(status: string): string {
  switch (status) {
    case "paga":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "aguardando_pagamento":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "cancelada":
      return "bg-destructive/10 text-destructive dark:bg-destructive/20";
    case "enviada":
    case "visualizada":
    case "assinada":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function rotuloValorCobrado(tipo: string): string {
  const rotulos: Record<string, string> = {
    primeira_mensalidade_adesao: "1ª mensalidade + adesão",
    total_adesao_mensalidade_so: "Adesão + mensalidades",
    adesao_so: "Somente adesão",
    mensalidade_so: "Somente mensalidade",
    personalizado: "Valor personalizado",
  };
  return rotulos[tipo] ?? tipo;
}

export function rotuloMetodoPagamento(metodo: string): string {
  const rotulos: Record<string, string> = {
    pix: "Pix",
    boleto: "Boleto",
    cartao: "Cartão",
  };
  return rotulos[metodo] ?? metodo;
}

export function formatarDataHora(data: Date | string): string {
  const dataJs = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    dataJs,
  );
}
