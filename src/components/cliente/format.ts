// Formatação e rótulos pt-BR para a página do cliente (moeda em centavos, exibição BRL).

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarBRL(centavos: number): string {
  return brl.format(centavos / 100);
}

export function formatarCPF(cpf: string): string {
  const d = cpf.replace(/\D/g, "").padEnd(11, "0").slice(0, 11);
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export function formatarCpfMascarado(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return "000.000.***-**";
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.***-**`;
}

export function formatarTelefone(e164: string): string {
  const d = e164.replace(/\D/g, "");
  if (d.length === 13) {
    return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  if (d.length === 12) {
    return `+${d.slice(0, 2)} ${d.slice(2, 4)} 9${d.slice(4, 8)}-${d.slice(8)}`;
  }
  return e164;
}

export function formatarData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(iso));
}

export function formatarDataHora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export const rotulosSegmentacao: Record<string, string> = {
  ambulatorial: "Ambulatorial",
  hospitalar: "Hospitalar",
  hospitalar_obstetricia: "Hospitalar + Obstetrícia",
  ambulatorial_hospitalar: "Ambulatorial + Hospitalar",
  ambulatorial_hospitalar_obstetricia: "Ambulatorial + Hospitalar + Obstetrícia",
  referencia: "Referência",
};

export const rotulosAcomodacao: Record<string, string> = {
  enfermaria: "Enfermaria",
  apartamento: "Apartamento",
};

export const rotulosAbrangencia: Record<string, string> = {
  municipal: "Municipal",
  estadual: "Estadual",
  nacional: "Nacional",
};

export const rotulosTipoContratacao: Record<string, string> = {
  individual: "Individual",
  familiar: "Familiar",
  pme: "PME",
};

export const rotulosMetodo: Record<string, string> = {
  pix: "Pix",
  boleto: "Boleto",
  cartao: "Cartão",
};
