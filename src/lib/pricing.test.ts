import { describe, expect, it, vi } from "vitest";
import { calcularOrdem, faixaPorIdade, FAIXAS_ETARIAS } from "./pricing";

const ref = new Date("2026-10-03T12:00:00Z");
const precos = Object.fromEntries(
  FAIXAS_ETARIAS.map((faixa, i) => [faixa, (i + 1) * 10000]),
) as Record<(typeof FAIXAS_ETARIAS)[number], number>;

describe("faixas etárias ANS", () => {
  it("respeita aniversário e os limites 18/19 e 58/59", () => {
    expect(faixaPorIdade(new Date("2008-10-03T00:00:00Z"), ref)).toBe("0-18");
    expect(faixaPorIdade(new Date("2007-10-03T00:00:00Z"), ref)).toBe("19-23");
    expect(faixaPorIdade(new Date("1968-10-03T00:00:00Z"), ref)).toBe("54-58");
    expect(faixaPorIdade(new Date("1967-10-03T00:00:00Z"), ref)).toBe("59+");
    expect(faixaPorIdade(new Date("2007-10-04T00:00:00Z"), ref)).toBe("0-18");
    expect(faixaPorIdade(new Date("2007-10-04T00:00:00Z"), new Date("2026-10-04T01:00:00Z"))).toBe(
      "0-18",
    );
  });
});

describe("cálculo da ordem em centavos", () => {
  it("soma beneficiários, aplica desconto só na mensalidade e adiciona adesão", () => {
    vi.useFakeTimers();
    vi.setSystemTime(ref);
    try {
      const result = calcularOrdem(
        [
          { nascimento: new Date("2008-10-03T00:00:00Z") },
          { nascimento: new Date("1967-10-03T00:00:00Z") },
        ],
        precos,
        5000,
        10000,
        "primeira_mensalidade_adesao",
      );
      expect(result).toMatchObject({
        valorMensal: 110000,
        valorAdesao: 5000,
        desconto: 10000,
        valorCobrado: 105000,
      });
      expect(result.itens.map((item) => item.faixa)).toEqual(["0-18", "59+"]);
      expect(
        calcularOrdem([{ nascimento: new Date("2008-10-03") }], precos, 5000, 0, "adesao_so")
          .valorCobrado,
      ).toBe(5000);
      expect(
        calcularOrdem([{ nascimento: new Date("2008-10-03") }], precos, 5000, 0, "mensalidade_so")
          .valorCobrado,
      ).toBe(10000);
      expect(
        calcularOrdem(
          [{ nascimento: new Date("2008-10-03") }],
          precos,
          5000,
          0,
          "personalizado",
          12345,
        ).valorCobrado,
      ).toBe(12345);
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejeita desconto excessivo e valores fracionários", () => {
    vi.useFakeTimers();
    vi.setSystemTime(ref);
    try {
      const benef = [{ nascimento: new Date("2008-10-03") }];
      expect(() => calcularOrdem(benef, precos, 0, 10001, "mensalidade_so")).toThrow();
      expect(() => calcularOrdem(benef, precos, 1.5, 0, "adesao_so")).toThrow();
    } finally {
      vi.useRealTimers();
    }
  });
});
