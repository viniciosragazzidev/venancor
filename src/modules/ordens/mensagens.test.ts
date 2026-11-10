import { describe, expect, it } from "vitest";
import { mensagemPropostaIndisponivel } from "./mensagens";

describe("mensagens de proposta indisponível", () => {
  it.each([
    ["invalido", "pagamento", "Este link não é válido."],
    ["expirada", "assinatura", "Este link venceu."],
    ["cancelada", "aceite", "Esta proposta foi cancelada."],
    ["paga", "pagamento", "Esta proposta já foi paga."],
  ] as const)("identifica %s ao tentar %s", (tipo, contexto, mensagem) => {
    expect(mensagemPropostaIndisponivel(tipo, contexto)).toContain(mensagem);
  });
});
