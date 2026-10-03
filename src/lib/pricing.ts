export const FAIXAS_ETARIAS = [
  "0-18",
  "19-23",
  "24-28",
  "29-33",
  "34-38",
  "39-43",
  "44-48",
  "49-53",
  "54-58",
  "59+",
] as const;
export type FaixaEtaria = (typeof FAIXAS_ETARIAS)[number];
export type ValorCobradoTipo =
  | "primeira_mensalidade_adesao"
  | "total_adesao_mensalidade_so"
  | "adesao_so"
  | "mensalidade_so"
  | "personalizado";

function centavosValidos(valor: number, nome: string) {
  if (!Number.isSafeInteger(valor) || valor < 0)
    throw new Error(`${nome} deve ser inteiro não negativo em centavos`);
}

export function faixaPorIdade(nascimento: Date, ref = new Date()): FaixaEtaria {
  if (Number.isNaN(nascimento.getTime()) || Number.isNaN(ref.getTime()))
    throw new Error("Data inválida");
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(ref);
  const parte = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value);
  const ano = parte("year");
  const mes = parte("month") - 1;
  const dia = parte("day");
  let idade = ano - nascimento.getUTCFullYear();
  if (
    mes < nascimento.getUTCMonth() ||
    (mes === nascimento.getUTCMonth() && dia < nascimento.getUTCDate())
  )
    idade--;
  if (idade < 0) throw new Error("Nascimento posterior à data da ordem");
  if (idade <= 18) return "0-18";
  if (idade <= 23) return "19-23";
  if (idade <= 28) return "24-28";
  if (idade <= 33) return "29-33";
  if (idade <= 38) return "34-38";
  if (idade <= 43) return "39-43";
  if (idade <= 48) return "44-48";
  if (idade <= 53) return "49-53";
  if (idade <= 58) return "54-58";
  return "59+";
}

export function calcularOrdem(
  benef: { nascimento: Date }[],
  precos: Record<FaixaEtaria, number>,
  adesao: number,
  desconto: number,
  tipo: ValorCobradoTipo,
  custom?: number,
) {
  if (benef.length === 0) throw new Error("Informe pelo menos um beneficiário");
  centavosValidos(adesao, "Adesão");
  centavosValidos(desconto, "Desconto");
  const itens = benef.map(({ nascimento }) => {
    const faixa = faixaPorIdade(nascimento);
    const valor = precos[faixa];
    centavosValidos(valor, `Preço da faixa ${faixa}`);
    return { faixa, valor };
  });
  const valorMensal = itens.reduce((total, item) => total + item.valor, 0);
  if (!Number.isSafeInteger(valorMensal)) throw new Error("Valor mensal excede o limite seguro");
  if (desconto > valorMensal) throw new Error("Desconto maior que a mensalidade");
  const mensalidadeLiquida = valorMensal - desconto;
  let valorCobrado: number;
  switch (tipo) {
    case "primeira_mensalidade_adesao":
    case "total_adesao_mensalidade_so": // Sem prazo contratual no MVP: ambos representam 1 mensalidade + adesão.
      valorCobrado = mensalidadeLiquida + adesao;
      break;
    case "adesao_so":
      valorCobrado = adesao;
      break;
    case "mensalidade_so":
      valorCobrado = mensalidadeLiquida;
      break;
    case "personalizado":
      if (custom === undefined) throw new Error("Informe o valor personalizado");
      centavosValidos(custom, "Valor personalizado");
      valorCobrado = custom;
      break;
  }
  if (!Number.isSafeInteger(valorCobrado)) throw new Error("Valor cobrado excede o limite seguro");
  return { itens, valorMensal, valorAdesao: adesao, desconto, valorCobrado };
}
