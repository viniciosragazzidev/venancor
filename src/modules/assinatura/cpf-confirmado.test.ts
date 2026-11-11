import { describe, expect, it } from "vitest";
import { concluirAssinaturaSchema } from "./schema";

const base = { nome: "Maria das Graças Xavier da Silva", imagemBase64: "iVBORw0KGgo=" };

describe("CPF na assinatura", () => {
  it("aceita a confirmação do CPF da ficha, sem digitar o CPF", () => {
    const dados = concluirAssinaturaSchema.parse({ ...base, cpfConfirmado: true });
    expect(dados.cpf).toBeUndefined();
    expect(dados.cpfConfirmado).toBe(true);
  });

  it("continua aceitando o CPF digitado (regra anterior) com CPF válido", () => {
    const dados = concluirAssinaturaSchema.parse({ ...base, cpf: "52998224725" });
    expect(dados.cpf).toBe("52998224725");
  });

  it("recusa CPF digitado inválido", () => {
    expect(() => concluirAssinaturaSchema.parse({ ...base, cpf: "123" })).toThrow();
  });
});
