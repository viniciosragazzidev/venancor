/**
 * Boleto bancário no padrão Febraban (04/11): o MedLink desenha o próprio boleto com a marca da
 * Venacor a partir da linha digitável do Asaas. Tudo aqui é conferência: se a linha ou o código
 * não fecharem os dígitos verificadores, o boleto próprio não é gerado (vale o PDF do Asaas).
 */

const soDigitos = (valor: string) => valor.replace(/\D/g, "");

/** Módulo 10 dos campos da linha digitável (pesos 2 e 1 da direita para a esquerda). */
export function modulo10(numero: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = numero.length - 1; i >= 0; i--) {
    let produto = Number(numero[i]) * peso;
    if (produto > 9) produto = Math.floor(produto / 10) + (produto % 10);
    soma += produto;
    peso = peso === 2 ? 1 : 2;
  }
  return (10 - (soma % 10)) % 10;
}

/** Dígito geral do código de barras (módulo 11, pesos 2 a 9; 0, 10 e 11 viram 1). */
export function modulo11CodigoBarras(numero43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = numero43.length - 1; i >= 0; i--) {
    soma += Number(numero43[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const dv = 11 - (soma % 11);
  return dv === 0 || dv === 10 || dv === 11 ? 1 : dv;
}

export function codigoBarrasValido(codigo: string): boolean {
  const digitos = soDigitos(codigo);
  if (digitos.length !== 44) return false;
  const semDv = digitos.slice(0, 4) + digitos.slice(5);
  return modulo11CodigoBarras(semDv) === Number(digitos[4]);
}

/** Converte a linha digitável (47 dígitos) no código de barras (44), conferindo todos os DVs. */
export function linhaParaCodigoBarras(linha: string): string | null {
  const l = soDigitos(linha);
  if (l.length !== 47) return null;
  const campos: [string, number][] = [
    [l.slice(0, 9), Number(l[9])],
    [l.slice(10, 20), Number(l[20])],
    [l.slice(21, 31), Number(l[31])],
  ];
  if (campos.some(([campo, dv]) => modulo10(campo) !== dv)) return null;
  const codigo =
    l.slice(0, 4) + l[32] + l.slice(33, 47) + l.slice(4, 9) + l.slice(10, 20) + l.slice(21, 31);
  return codigoBarrasValido(codigo) ? codigo : null;
}

/** Linha digitável a partir do código de barras (usada nos testes e para formatar). */
export function codigoBarrasParaLinha(codigo: string): string {
  const c = soDigitos(codigo);
  const campo1 = c.slice(0, 4) + c.slice(19, 24);
  const campo2 = c.slice(24, 34);
  const campo3 = c.slice(34, 44);
  return `${campo1}${modulo10(campo1)}${campo2}${modulo10(campo2)}${campo3}${modulo10(campo3)}${c[4]}${c.slice(5, 19)}`;
}

/**
 * Fator de vencimento Febraban: dias desde 07/10/1997. Chegou a 9999 em 21/02/2025 e reiniciou
 * em 1000 no dia 22/02/2025 (ciclos de 9000 dias).
 */
export function fatorVencimento(vencimentoIso: string): number {
  const dias = Math.round(
    (Date.parse(`${vencimentoIso.slice(0, 10)}T00:00:00Z`) - Date.parse("1997-10-07T00:00:00Z")) /
      86_400_000,
  );
  return dias > 9999 ? ((dias - 10_000) % 9000) + 1000 : dias;
}

export function fatorDoCodigoBarras(codigo: string): number {
  return Number(soDigitos(codigo).slice(5, 9));
}

/** Valor em centavos gravado no código de barras (posições 10 a 19). */
export function valorDoCodigoBarras(codigo: string): number {
  return Number(soDigitos(codigo).slice(9, 19));
}

/** 00000.00000 00000.000000 00000.000000 0 00000000000000 */
export function formatarLinha(linha: string): string {
  const l = soDigitos(linha);
  return `${l.slice(0, 5)}.${l.slice(5, 10)} ${l.slice(10, 15)}.${l.slice(15, 21)} ${l.slice(21, 26)}.${l.slice(26, 32)} ${l[32]} ${l.slice(33)}`;
}

const PADROES_ITF = [
  "nnwwn",
  "wnnnw",
  "nwnnw",
  "wwnnn",
  "nnwnw",
  "wnwnn",
  "nwwnn",
  "nnnww",
  "wnnwn",
  "nwnwn",
];

/**
 * Intercalado 2 de 5 (ITF) do boleto: sequência de larguras em módulos finos, alternando barra e
 * espaço, começando por barra. Fina = 1, larga = 3. Início "nnnn", fim "wnn".
 */
export function barrasItf(codigo: string): number[] {
  const digitos = soDigitos(codigo);
  if (digitos.length % 2 !== 0) throw new Error("ITF exige quantidade par de dígitos");
  const largura = (c: string) => (c === "w" ? 3 : 1);
  const sequencia = [1, 1, 1, 1];
  for (let i = 0; i < digitos.length; i += 2) {
    const barras = PADROES_ITF[Number(digitos[i])];
    const espacos = PADROES_ITF[Number(digitos[i + 1])];
    for (let j = 0; j < 5; j++) sequencia.push(largura(barras[j]), largura(espacos[j]));
  }
  sequencia.push(3, 1, 1);
  return sequencia;
}
