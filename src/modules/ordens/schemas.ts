import { z } from "zod";
import { metodoPagamento, valorCobradoTipo } from "@/db/schema";
import { MAX_CLIENTES_ORDEM_LOTE } from "./lote";

export const criarOrdemSchema = z.object({
  clienteId: z.uuid(),
  planoId: z.uuid(),
  dependenteIds: z.array(z.uuid()).default([]),
  contratoModeloId: z.uuid().optional(),
  desconto: z.int().nonnegative().default(0),
  descontoObs: z.string().trim().optional(),
  valorCobradoTipo: z.enum(valorCobradoTipo.enumValues).default("primeira_mensalidade_adesao"),
  valorPersonalizado: z.int().nonnegative().optional(),
  formasPagamento: z
    .array(z.enum(metodoPagamento.enumValues))
    .min(1)
    .default(["pix", "boleto", "cartao"]),
  maxParcelas: z.int().min(1).max(12).default(1),
  validadeDias: z.int().min(1).max(30).default(7),
  exigeAssinatura: z.boolean().default(true),
  /** Start of coverage; empty means immediate (from the payment). */
  vigenciaInicio: z.iso.date().nullable().optional(),
  diaVencimento: z.int().min(1).max(28).nullable().optional(),
});
export type CriarOrdemInput = z.input<typeof criarOrdemSchema>;
export type CriarOrdemData = z.output<typeof criarOrdemSchema>;

/** A saved preset of the "Criar ordem" form: everything except the client and dependents. */
export const ordemModeloSchema = criarOrdemSchema
  .omit({ clienteId: true, dependenteIds: true, vigenciaInicio: true, diaVencimento: true })
  .extend({
    nome: z.string().trim().min(1, "Informe o nome do modelo").max(120),
    planoId: z.uuid().nullable().optional(),
    contratoModeloId: z.uuid().nullable().optional(),
    descontoObs: z.string().trim().nullable().optional(),
    valorPersonalizado: z.int().nonnegative().nullable().optional(),
  });
export type OrdemModeloInput = z.input<typeof ordemModeloSchema>;
export type OrdemModeloData = z.output<typeof ordemModeloSchema>;
export const ordemModeloAtualizacaoSchema = ordemModeloSchema.partial();

export const criarOrdensLoteSchema = criarOrdemSchema
  .omit({ clienteId: true, dependenteIds: true })
  .extend({
    clienteIds: z
      .array(z.uuid())
      .min(1, "Selecione ao menos um cliente")
      .max(MAX_CLIENTES_ORDEM_LOTE, `Selecione no máximo ${MAX_CLIENTES_ORDEM_LOTE} clientes`),
    incluirDependentes: z.boolean().default(false),
  })
  .superRefine((dados, contexto) => {
    if (new Set(dados.clienteIds).size !== dados.clienteIds.length) {
      contexto.addIssue({
        code: "custom",
        path: ["clienteIds"],
        message: "Há clientes repetidos na seleção",
      });
    }
  });
export type CriarOrdensLoteInput = z.input<typeof criarOrdensLoteSchema>;
