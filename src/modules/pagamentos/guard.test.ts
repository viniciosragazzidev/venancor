import { expect, it, vi } from "vitest";
import { criarCobrancaSeAssinada, PagamentoSemAssinaturaError } from "./guard";
import type { PaymentProvider } from "@/providers/payment";

it("pagar sem assinar falha antes de chamar o provedor", async () => {
  const criarCobranca = vi.fn();
  const provider = { criarCobranca } as unknown as PaymentProvider;
  const input = {
    ordemId: "ordem-1",
    cliente: { nome: "Ana", cpf: "52998224725" },
    metodo: "pix" as const,
    valorCentavos: 10000,
    vencimento: new Date(),
    descricao: "Teste",
  };
  await expect(
    criarCobrancaSeAssinada(provider, input, "visualizada", false),
  ).rejects.toBeInstanceOf(PagamentoSemAssinaturaError);
  await expect(criarCobrancaSeAssinada(provider, input, "assinada", false)).rejects.toBeInstanceOf(
    PagamentoSemAssinaturaError,
  );
  await expect(
    criarCobrancaSeAssinada(provider, input, "visualizada", false, true),
  ).rejects.toBeInstanceOf(PagamentoSemAssinaturaError);
  expect(criarCobranca).not.toHaveBeenCalled();
});

it("permite pagamento sem assinatura somente quando a ordem lida exigeAssinatura=false", async () => {
  const criarCobranca = vi.fn().mockResolvedValue({ ok: true });
  const provider = { criarCobranca } as unknown as PaymentProvider;
  const input = {
    ordemId: "ordem-1",
    cliente: { nome: "Ana", cpf: "52998224725" },
    metodo: "pix" as const,
    valorCentavos: 10000,
    vencimento: new Date(),
    descricao: "Teste",
  };

  await expect(
    criarCobrancaSeAssinada(provider, input, "visualizada", false, false),
  ).resolves.toEqual({ ok: true });
  await expect(
    criarCobrancaSeAssinada(provider, input, "enviada", false, false),
  ).rejects.toBeInstanceOf(PagamentoSemAssinaturaError);
  expect(criarCobranca).toHaveBeenCalledTimes(1);
});
