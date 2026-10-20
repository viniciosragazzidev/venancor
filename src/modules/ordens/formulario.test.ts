import { describe, expect, it } from "vitest";
import { modeloParaCondicoes, ordemParaDuplicacao, VALIDADE_PADRAO_DIAS } from "./formulario";

const PLANO = "11111111-1111-4111-8111-111111111111";
const CONTRATO = "22222222-2222-4222-8222-222222222222";
const CLIENTE = "33333333-3333-4333-8333-333333333333";

describe("modeloParaCondicoes", () => {
  it("copia os campos do modelo", () => {
    expect(
      modeloParaCondicoes({
        planoId: PLANO,
        contratoModeloId: CONTRATO,
        desconto: 1500,
        descontoObs: "campanha",
        valorCobradoTipo: "personalizado",
        valorPersonalizado: 9900,
        formasPagamento: ["pix", "cartao"],
        maxParcelas: 3,
        validadeDias: 10,
      }),
    ).toEqual({
      planoId: PLANO,
      contratoModeloId: CONTRATO,
      desconto: 1500,
      descontoObs: "campanha",
      valorCobradoTipo: "personalizado",
      valorPersonalizado: 9900,
      formasPagamento: ["pix", "cartao"],
      maxParcelas: 3,
      validadeDias: 10,
    });
  });

  it("ignora valor personalizado fora do tipo personalizado e trata observação nula", () => {
    const condicoes = modeloParaCondicoes({
      planoId: null,
      contratoModeloId: null,
      desconto: 0,
      descontoObs: null,
      valorCobradoTipo: "adesao_so",
      valorPersonalizado: 5000,
      formasPagamento: ["boleto"],
      maxParcelas: 1,
      validadeDias: 7,
    });
    expect(condicoes.valorPersonalizado).toBeNull();
    expect(condicoes.descontoObs).toBe("");
    expect(condicoes.planoId).toBeNull();
  });
});

describe("ordemParaDuplicacao", () => {
  const ordem = {
    clienteId: CLIENTE,
    planoId: PLANO,
    contratoModeloId: CONTRATO,
    desconto: 2000,
    descontoObs: null,
    valorCobradoTipo: "personalizado" as const,
    valorCobrado: 45678,
    formasPagamento: ["pix" as const],
    maxParcelas: 6,
  };

  it("usa o valor cobrado como personalizado e a validade padrão", () => {
    const dup = ordemParaDuplicacao(ordem, [], []);
    expect(dup.valorPersonalizado).toBe(45678);
    expect(dup.validadeDias).toBe(VALIDADE_PADRAO_DIAS);
    expect(dup.clienteId).toBe(CLIENTE);
    expect(dup.contratoModeloId).toBe(CONTRATO);
    expect(dup.desconto).toBe(2000);
    expect(dup.descontoObs).toBe("");
    expect(dup.maxParcelas).toBe(6);
    expect(dup.formasPagamento).toEqual(["pix"]);
  });

  it("não define valor personalizado para outros tipos", () => {
    const dup = ordemParaDuplicacao({ ...ordem, valorCobradoTipo: "mensalidade_so" }, [], []);
    expect(dup.valorPersonalizado).toBeNull();
  });

  it("encontra os dependentes da ordem pelo CPF, sem o titular", () => {
    const dup = ordemParaDuplicacao(
      ordem,
      [
        { titular: true, cpf: "111.111.111-11" },
        { titular: false, cpf: "222.222.222-22" },
      ],
      [
        { id: "dep-a", cpf: "22222222222" },
        { id: "dep-b", cpf: "33333333333" },
        { id: "dep-c", cpf: "11111111111" },
      ],
    );
    expect(dup.dependenteIds).toEqual(["dep-a"]);
  });
});
