import { describe, expect, it } from "vitest";

import { linkWhatsApp, mensagemPropostaWhatsApp } from "./mensagem-whatsapp";

describe("mensagemPropostaWhatsApp", () => {
  it("monta a mensagem com primeiro nome, plano em negrito, formas e link", () => {
    const texto = mensagemPropostaWhatsApp({
      nomeCliente: "Fabiani da Silva Nepomuceno",
      plano: "Bradesco Dental DOC 1",
      valor: "R$ 56,99",
      formasPagamento: ["pix", "boleto", "cartao"],
      link: "https://crm.venacorseguros.com/c/abc",
    });
    expect(texto).toContain("Olá, Fabiani!");
    expect(texto).toContain("*Bradesco Dental DOC 1*");
    expect(texto).toContain("*R$ 56,99*");
    expect(texto).toContain("paga por Pix, boleto ou cartão:");
    expect(texto).toContain("\nhttps://crm.venacorseguros.com/c/abc\n");
  });

  it("gera o link do WhatsApp só com dígitos e texto codificado", () => {
    expect(linkWhatsApp("+55 21 97182-9283", "Olá *x*")).toBe(
      "https://wa.me/5521971829283?text=Ol%C3%A1%20*x*",
    );
  });
});

describe("composição do valor na mensagem", () => {
  const base = { nomeCliente: "Maria das Graças", plano: "Porto Seguro Odonto Ouro", formasPagamento: ["pix"], link: "https://x/y" };

  it("sem desconto, mostra só o valor a pagar", () => {
    const texto = mensagemPropostaWhatsApp({ ...base, valor: "R$ 259,80" });
    expect(texto).toContain("no valor de *R$ 259,80*");
  });

  it("com desconto, mostra de X por Y (total sem desconto e valor a pagar)", () => {
    const texto = mensagemPropostaWhatsApp({ ...base, valor: "R$ 129,90", valorSemDesconto: "R$ 259,80" });
    expect(texto).toContain("de *R$ 259,80* por *R$ 129,90*");
  });
});
