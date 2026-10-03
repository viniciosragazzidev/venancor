import { describe, expect, it } from "vitest";
import { faixasEtarias, tabelaPrecosSchema } from "./schemas";

describe("tabela de preços ANS", () => {
  it("exige exatamente as 10 faixas, sem repetição", () => {
    const tabela = faixasEtarias.map((faixaEtaria) => ({ faixaEtaria, valor: 10000 }));
    expect(tabelaPrecosSchema.safeParse(tabela).success).toBe(true);
    expect(tabelaPrecosSchema.safeParse([...tabela.slice(0, 9), tabela[0]]).success).toBe(false);
    expect(tabelaPrecosSchema.safeParse(tabela.slice(0, 9)).success).toBe(false);
  });
});
