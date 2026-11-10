import { describe, expect, it } from "vitest";
import { rotuloEventoOrdem } from "./status-ordem";

describe("eventos de recusa de pagamento", () => {
  it("mostra o campo rejeitado e o método, sem incluir dado pessoal", () => {
    expect(rotuloEventoOrdem("pagamento_recusado", {
      codigo: "invalid_cpfCnpj",
      metodo: "pix",
    })).toBe("Pagamento recusado pelo Asaas: CPF inválido (Pix)");
  });

  it("usa um motivo neutro para códigos não mapeados", () => {
    expect(rotuloEventoOrdem("pagamento_recusado", {
      codigo: "novo_codigo",
    })).toBe("Pagamento recusado pelo Asaas: dados do cadastro inválidos");
  });
});
