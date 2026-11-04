import { describe, expect, it } from "vitest";

import {
  barrasItf,
  codigoBarrasParaLinha,
  codigoBarrasValido,
  formatarLinha,
  linhaParaCodigoBarras,
  modulo11CodigoBarras,
  valorDoCodigoBarras,
} from "./febraban";

// Código de barras sintético: banco 461, moeda 9, fator 1234, R$ 56,99, campo livre fixo.
const semDv = "4619" + "1234" + "0000005699" + "1234567890123456789012345";
const codigo = semDv.slice(0, 4) + modulo11CodigoBarras(semDv) + semDv.slice(4);

describe("febraban", () => {
  it("monta um código válido e volta da linha para o mesmo código", () => {
    expect(codigoBarrasValido(codigo)).toBe(true);
    const linha = codigoBarrasParaLinha(codigo);
    expect(linha).toHaveLength(47);
    expect(linhaParaCodigoBarras(linha)).toBe(codigo);
    expect(valorDoCodigoBarras(codigo)).toBe(5699);
  });

  it("recusa linha com dígito trocado", () => {
    const linha = codigoBarrasParaLinha(codigo);
    const trocada = linha.slice(0, 12) + ((Number(linha[12]) + 1) % 10) + linha.slice(13);
    expect(linhaParaCodigoBarras(trocada)).toBeNull();
    expect(linhaParaCodigoBarras("123")).toBeNull();
  });

  it("formata a linha nos 5 blocos do boleto", () => {
    expect(formatarLinha(codigoBarrasParaLinha(codigo))).toMatch(
      /^\d{5}\.\d{5} \d{5}\.\d{6} \d{5}\.\d{6} \d \d{14}$/,
    );
  });

  it("gera o ITF com início, 44 dígitos e fim (405 módulos)", () => {
    const barras = barrasItf(codigo);
    expect(barras.slice(0, 4)).toEqual([1, 1, 1, 1]);
    expect(barras.slice(-3)).toEqual([3, 1, 1]);
    expect(barras.reduce((a, b) => a + b, 0)).toBe(405);
  });
});
