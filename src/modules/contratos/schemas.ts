import { z } from "zod";

const texto = z.string().trim().min(1);
export const contratoModeloSchema = z.object({
  nome: texto.max(160),
  planoId: z.uuid().nullable().optional(),
  corpo: texto,
  pdfAnexoPath: z.string().trim().nullable().optional(),
  ativo: z.boolean().default(true),
});
export type ContratoModeloInput = z.input<typeof contratoModeloSchema>;
export type ContratoModeloData = z.output<typeof contratoModeloSchema>;
export const contratoModeloAtualizacaoSchema = contratoModeloSchema.partial();
