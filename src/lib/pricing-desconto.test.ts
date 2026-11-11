import { describe, expect, it } from "vitest";
import { baseDoDesconto, calcularOrdem, DescontoAcimaDoTotalError, FAIXAS_ETARIAS } from "./pricing";

// Faixa 0-18 = R$ 129,90 (12990 centavos). Um beneficiário jovem, sem variação de faixa.
const precos = Object.fromEntries(FAIXAS_ETARIAS.map((faixa) => [faixa, 12990])) as Record<
  (typeof FAIXAS_ETARIAS)[number],
  number
>;
const benef = [{ nascimento: new Date("2008-10-03T12:00:00Z") }];
const ADESAO = 12990;

describe("desconto sobre o total cobrado", () => {
  it("só mensalidade: desconto abate a mensalidade e a adesão segue inteira", () => {
    const r = calcularOrdem(benef, precos, ADESAO, 2990, "primeira_mensalidade_adesao");
    expect(r.valorMensal).toBe(12990);
    expect(r.valorCobrado).toBe(12990 + ADESAO - 2990);
  });

  it("adesão + mensalidade: desconto vale sobre o total (print da proposta 1083)", () => {
    // Mensalidade 129,90 + adesão 129,90 - desconto 129,90 = 129,90 a pagar.
    const r = calcularOrdem(benef, precos, ADESAO, 12990, "total_adesao_mensalidade_so");
    expect(r.valorCobrado).toBe(12990);
  });

  it("adesão + mensalidade: desconto maior que a mensalidade é aceito até o total", () => {
    // Antes falhava com 'Desconto maior que a mensalidade' (print de 11/11, 259,80).
    const r = calcularOrdem(benef, precos, ADESAO, 12990 + 1000, "total_adesao_mensalidade_so");
    expect(r.valorCobrado).toBe(12990 + ADESAO - 13990);
  });

  it("zero de desconto: valor cheio do tipo escolhido", () => {
    expect(calcularOrdem(benef, precos, ADESAO, 0, "total_adesao_mensalidade_so").valorCobrado).toBe(25980);
    expect(calcularOrdem(benef, precos, ADESAO, 0, "mensalidade_so").valorCobrado).toBe(12990);
    expect(calcularOrdem(benef, precos, ADESAO, 0, "adesao_so").valorCobrado).toBe(ADESAO);
  });

  it("acima do total: erro de validação claro, não erro interno", () => {
    expect(() => calcularOrdem(benef, precos, ADESAO, 25981, "total_adesao_mensalidade_so")).toThrow(DescontoAcimaDoTotalError);
    try {
      calcularOrdem(benef, precos, ADESAO, 25981, "total_adesao_mensalidade_so");
    } catch (error) {
      expect((error as Error).message).toContain("maior que o total cobrado");
    }
  });

  it("desconto que zera a cobrança é recusado (o Asaas não cobra R$ 0)", () => {
    expect(() => calcularOrdem(benef, precos, ADESAO, 25980, "total_adesao_mensalidade_so")).toThrow(DescontoAcimaDoTotalError);
    expect(() => calcularOrdem(benef, precos, ADESAO, 12990, "mensalidade_so")).toThrow(DescontoAcimaDoTotalError);
  });

  it("base do desconto por tipo", () => {
    expect(baseDoDesconto("total_adesao_mensalidade_so", 12990, ADESAO)).toBe(25980);
    expect(baseDoDesconto("mensalidade_so", 12990, ADESAO)).toBe(12990);
    expect(baseDoDesconto("adesao_so", 12990, ADESAO)).toBe(ADESAO);
    expect(baseDoDesconto("personalizado", 12990, ADESAO, 5000)).toBe(5000);
  });

  it("desconto negativo ou fracionário continua recusado", () => {
    expect(() => calcularOrdem(benef, precos, ADESAO, 1.5, "mensalidade_so")).toThrow();
  });
});
