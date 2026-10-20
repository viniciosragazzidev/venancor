import type { metodoPagamento, valorCobradoTipo } from "@/db/schema";

type ValorCobradoTipo = (typeof valorCobradoTipo.enumValues)[number];
type MetodoPagamento = (typeof metodoPagamento.enumValues)[number];

export const VALIDADE_PADRAO_DIAS = 7;

/** The "Criar ordem" fields that a modelo or a duplicated order fills (no client). */
export interface CondicoesOrdem {
  planoId: string | null;
  contratoModeloId: string | null;
  desconto: number;
  descontoObs: string;
  valorCobradoTipo: ValorCobradoTipo;
  valorPersonalizado: number | null;
  formasPagamento: MetodoPagamento[];
  maxParcelas: number;
  validadeDias: number;
}

export interface DuplicacaoOrdem extends CondicoesOrdem {
  clienteId: string;
  dependenteIds: string[];
}

interface ModeloLike {
  planoId: string | null;
  contratoModeloId: string | null;
  desconto: number;
  descontoObs: string | null;
  valorCobradoTipo: ValorCobradoTipo;
  valorPersonalizado: number | null;
  formasPagamento: MetodoPagamento[];
  maxParcelas: number;
  validadeDias: number;
}

interface OrdemLike {
  clienteId: string;
  planoId: string;
  contratoModeloId: string | null;
  desconto: number;
  descontoObs: string | null;
  valorCobradoTipo: ValorCobradoTipo;
  valorCobrado: number;
  formasPagamento: MetodoPagamento[];
  maxParcelas: number;
}

export function modeloParaCondicoes(modelo: ModeloLike): CondicoesOrdem {
  return {
    planoId: modelo.planoId,
    contratoModeloId: modelo.contratoModeloId,
    desconto: modelo.desconto,
    descontoObs: modelo.descontoObs ?? "",
    valorCobradoTipo: modelo.valorCobradoTipo,
    valorPersonalizado:
      modelo.valorCobradoTipo === "personalizado" ? modelo.valorPersonalizado : null,
    formasPagamento: [...modelo.formasPagamento],
    maxParcelas: modelo.maxParcelas,
    validadeDias: modelo.validadeDias,
  };
}

/**
 * An order does not keep the custom value apart: for "personalizado" it is the charged value.
 * Nor does it keep the link validity, so the default is used. Dependents are matched by CPF
 * between the order's beneficiaries (non-holders) and the client's current dependents.
 */
export function ordemParaDuplicacao(
  ordem: OrdemLike,
  beneficiarios: { titular: boolean; cpf: string }[],
  dependentesCliente: { id: string; cpf: string }[],
): DuplicacaoOrdem {
  const soDigitos = (cpf: string) => cpf.replace(/\D/g, "");
  const cpfs = new Set(beneficiarios.filter((b) => !b.titular).map((b) => soDigitos(b.cpf)));
  return {
    clienteId: ordem.clienteId,
    dependenteIds: dependentesCliente
      .filter((dependente) => cpfs.has(soDigitos(dependente.cpf)))
      .map((dependente) => dependente.id),
    planoId: ordem.planoId,
    contratoModeloId: ordem.contratoModeloId,
    desconto: ordem.desconto,
    descontoObs: ordem.descontoObs ?? "",
    valorCobradoTipo: ordem.valorCobradoTipo,
    valorPersonalizado: ordem.valorCobradoTipo === "personalizado" ? ordem.valorCobrado : null,
    formasPagamento: [...ordem.formasPagamento],
    maxParcelas: ordem.maxParcelas,
    validadeDias: VALIDADE_PADRAO_DIAS,
  };
}
