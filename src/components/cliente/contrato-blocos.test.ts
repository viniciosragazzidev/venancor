import { describe, expect, it } from "vitest";
import { capitalizar, estruturarContrato } from "./contrato-blocos";

const texto = `CONTRATO DE ADESÃO E PROPOSTA DE CONTRATAÇÃO DE PLANO ODONTOLÓGICO
PORTO ODONTO - PORTO ODONTO BRONZE

Proposta nº 1021 - emitida em 02/11/2026

1. DADOS DA PROPOSTA
Operadora: Porto Odonto
Início da vigência: Imediata, a partir da confirmação do pagamento

4. VALORES E PAGAMENTO
Valor por beneficiário:
Tassia &amp; Cia (39-43): R$ 39,99

TERMOS E CONDIÇÕES CONTRATUAIS

CLÁUSULA 1ª - DO OBJETO
O presente instrumento tem por objeto a adesão do BENEFICIÁRIO ao plano, nos termos da RN nº 195/2009 da ANS.

CLÁUSULA 6ª - DA INADIMPLÊNCIA
O não pagamento poderá acarretar:
a) negativação do CPF nos órgãos de proteção ao crédito;
b) suspensão do plano após 60 dias.`;

describe("contrato estruturado", () => {
  const contrato = estruturarContrato(texto);

  it("separa título, meta e seções", () => {
    expect(contrato.titulo[0]).toBe(
      "Contrato de adesão e proposta de contratação de plano odontológico",
    );
    expect(contrato.meta).toEqual(["Proposta nº 1021 - emitida em 02/11/2026"]);
    expect(contrato.secoes.map((s) => s.titulo)).toEqual([
      "Dados da proposta",
      "Valores e pagamento",
      "Do objeto",
      "Da inadimplência",
    ]);
    expect(contrato.secoes[2].rotulo).toBe("Cláusula 1ª");
  });

  it("reconhece campos, subtítulos, itens e parágrafos", () => {
    expect(contrato.secoes[0].blocos[1]).toEqual({
      tipo: "campo",
      rotulo: "Início da vigência",
      valor: "Imediata, a partir da confirmação do pagamento",
    });
    expect(contrato.secoes[1].blocos[0]).toEqual({
      tipo: "subtitulo",
      texto: "Valor por beneficiário",
    });
    expect(contrato.secoes[1].blocos[1]).toMatchObject({
      tipo: "campo",
      rotulo: "Tassia & Cia (39-43)",
    });
    expect(contrato.secoes[2].blocos[0].tipo).toBe("paragrafo");
    expect(contrato.secoes[3].blocos.slice(1).map((b) => b.tipo)).toEqual(["item", "item"]);
  });

  it("modelo simples sem títulos vira uma seção só", () => {
    const simples = estruturarContrato("Eu, Ana, aceito os termos.\nAssinado em 01/01/2026.");
    expect(simples.secoes).toHaveLength(1);
    expect(simples.secoes[0].blocos).toHaveLength(2);
  });

  it("linha longa em caixa alta é parágrafo, não título", () => {
    const longa =
      "O BENEFICIÁRIO DECLARA QUE LEU E ENTENDEU TODAS AS CONDIÇÕES DESTE CONTRATO E QUE ESTÁ DE ACORDO COM ELAS";
    const r = estruturarContrato(`1. DADOS
Campo: valor
${longa}`);
    expect(r.secoes).toHaveLength(1);
    expect(r.secoes[0].blocos.at(-1)).toEqual({ tipo: "paragrafo", texto: longa });
  });

  it("mantém siglas ao capitalizar", () => {
    expect(capitalizar("DADOS DO TITULAR / CONTRATANTE")).toBe("Dados do titular / contratante");
    expect(capitalizar("TRATAMENTO CONFORME A LGPD")).toBe("Tratamento conforme a LGPD");
  });
});
