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

  it("mostra referência curta e registra o erro inesperado no log", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const resultado = await executarCriacaoOrdensLote(
        [{ id: "1", nome: "Ana" }],
        async () => {
          throw new TypeError("falha interna de teste");
        },
      );
      const mensagem = resultado.falhas[0]?.erro ?? "";
      const referencia = mensagem.match(/ref\. ([A-F0-9]{6})/)?.[1];
      expect(referencia).toBeDefined();
      expect(mensagem).toContain("Erro inesperado ao criar as ordens");
      // Painel: mostra o erro real (sem dados pessoais) junto da referência.
      expect(mensagem).toContain("falha interna de teste");
      // O log leva só o resumo seguro, nunca o objeto de erro inteiro.
      expect(log).toHaveBeenCalledWith(expect.stringContaining(`ref=${referencia} TypeError: falha interna de teste`));
    } finally {
      log.mockRestore();
    }
  });
});
