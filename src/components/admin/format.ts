const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarCPF(cpf: string): string {
  const d = cpf.replace(/\D/g, "").padEnd(11, "0").slice(0, 11);
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export function mascaraCPF(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

export function mascaraCNPJ(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatarCNPJ(cnpj: string): string {
  return mascaraCNPJ(cnpj);
}

export function mascaraTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export function formatarCentavos(centavos: number): string {
  return brl.format(centavos / 100);
}

/** Aceita "1234,56", "1234.56", "1.234,56" e "1.234" → centavos. */
export function parseMoeda(entrada: string): number | null {
  const limpo = entrada
    .trim()
    .replace(/^R\$\s?/, "")
    .replace(/\s/g, "");
  if (!limpo) return null;
  let normal: string;
  if (limpo.includes(",")) {
    normal = limpo.replace(/\./g, "").replace(",", ".");
  } else if ((limpo.match(/\./g) || []).length > 1) {
    normal = limpo.replace(/\./g, "");
  } else if (/^\d+\.\d{1,2}$/.test(limpo)) {
    normal = limpo;
  } else {
    normal = limpo.replace(/\./g, "");
  }
  const n = Number(normal);
  if (!Number.isFinite(n) || n < 0) return null;
  const centavos = Math.round(n * 100);
  if (!Number.isSafeInteger(centavos)) return null;
  return centavos;
}
