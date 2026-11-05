import { describe, expect, it, vi } from "vitest";
import { ErroNegocio } from "@/lib/resultado-acao";
import { executarCriacaoOrdensLote, MAX_CLIENTES_ORDEM_LOTE } from "./lote";

describe("criação de ordens em lote", () => {
  it("continua nos demais clientes e devolve sucesso ou motivo por cliente", async () => {
    const criar = vi.fn(async ({ id }: { id: string }) => {
      if (id === "2") throw new ErroNegocio("Plano não disponível para este cliente.");
      return { ordemId: `ordem-${id}`, numero: 1000 + Number(id) };
    });
    const resultado = await executarCriacaoOrdensLote(
      [
        { id: "1", nome: "Ana" },
        { id: "2", nome: "Bia" },
        { id: "3", nome: "Caio" },
      ],
      criar,
    );

    expect(resultado.criadas).toEqual([
      { id: "1", nome: "Ana", ordemId: "ordem-1", numero: 1001 },
      { id: "3", nome: "Caio", ordemId: "ordem-3", numero: 1003 },
    ]);
    expect(resultado.falhas).toEqual([
      { id: "2", nome: "Bia", erro: "Plano não disponível para este cliente." },
    ]);
    expect(criar).toHaveBeenCalledTimes(3);
  });

  it("fixa o limite operacional em 50 clientes por lote", () => {
    expect(MAX_CLIENTES_ORDEM_LOTE).toBe(50);
  });
});
