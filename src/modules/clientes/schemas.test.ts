import { describe, expect, it } from "vitest";
import { clienteSchema, dependenteSchema } from "./schemas";

describe("dados de clientes e dependentes", () => {
  const cliente = {
    nome: "Ana",
    cpf: "529.982.247-25",
    nascimento: "1990-01-01",
    email: "ana@exemplo.com",
    whatsapp: "+5511999999999",
    cep: "01310-100",
    logradouro: "Av. Paulista",
    numero: "100",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    uf: "sp",
  };

  it("normaliza CPF, CEP e UF", () => {
    const parsed = clienteSchema.parse(cliente);
    expect(parsed.cpf).toBe("52998224725");
    expect(parsed.cep).toBe("01310100");
    expect(parsed.uf).toBe("SP");
  });

  it("rejeita CPF e telefone inválidos", () => {
    expect(clienteSchema.safeParse({ ...cliente, cpf: "11111111111" }).success).toBe(false);
    expect(clienteSchema.safeParse({ ...cliente, whatsapp: "11999999999" }).success).toBe(false);
    expect(
      dependenteSchema.safeParse({
        clienteId: crypto.randomUUID(),
        nome: "Filho",
        cpf: "12345678900",
        nascimento: "2020-01-01",
        parentesco: "filho",
      }).success,
    ).toBe(false);
  });
});
