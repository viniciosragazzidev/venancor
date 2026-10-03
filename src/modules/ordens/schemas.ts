import { z } from "zod";
import { metodoPagamento, valorCobradoTipo } from "@/db/schema";

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
});
export type CriarOrdemInput = z.input<typeof criarOrdemSchema>;
export type CriarOrdemData = z.output<typeof criarOrdemSchema>;
