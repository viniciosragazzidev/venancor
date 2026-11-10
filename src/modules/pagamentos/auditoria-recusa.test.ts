import { describe, expect, it } from "vitest";
import { ErroProvedorPagamento } from "@/providers/payment/erros";
import { metadadosRecusaCadastroAsaas } from "./auditoria-recusa";

describe("metadados de recusa do Asaas", () => {
  it("registra código e método sem incluir dados do cadastro", () => {
    const metadados = metadadosRecusaCadastroAsaas(
      new ErroProvedorPagamento({ status: 400, code: "invalid_cpfCnpj" }),
      "pix",
    );
    expect(metadados).toEqual({
      provedor: "asaas",
      codigo: "invalid_cpfCnpj",
      statusHttp: 400,
      metodo: "pix",
    });
    expect(metadados).not.toHaveProperty("cpf");
  });
});
