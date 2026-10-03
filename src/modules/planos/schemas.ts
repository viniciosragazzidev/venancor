import { z } from "zod";
import { abrangencia, acomodacao, faixaEtaria, segmentacao, tipoContratacao } from "@/db/schema";

const uuid = z.uuid();
const texto = z.string().trim().min(1);
const centavos = z.int().nonnegative();
export const faixasEtarias = faixaEtaria.enumValues;
export type FaixaEtaria = (typeof faixasEtarias)[number];

export const operadoraSchema = z.object({
  nome: texto.max(160),
  cnpj: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().regex(/^\d{14}$/, "CNPJ inválido")),
  registroAns: texto.max(30),
  logoPath: z.string().trim().optional().nullable(),
  ativa: z.boolean().default(true),
});
export type OperadoraInput = z.input<typeof operadoraSchema>;
export type OperadoraData = z.output<typeof operadoraSchema>;

export const precoSchema = z.object({ faixaEtaria: z.enum(faixasEtarias), valor: centavos });
export const tabelaPrecosSchema = z
  .array(precoSchema)
  .length(10)
  .superRefine((tabela, ctx) => {
    const faixas = new Set(tabela.map((item) => item.faixaEtaria));
    if (faixas.size !== 10)
      ctx.addIssue({ code: "custom", message: "Informe as 10 faixas ANS sem repetir" });
  });
export type PrecoInput = z.input<typeof precoSchema>;

export const planoSchema = z.object({
  operadoraId: uuid,
  nome: texto.max(160),
  codigo: texto.max(60),
  segmentacao: z.enum(segmentacao.enumValues),
  acomodacao: z.enum(acomodacao.enumValues),
  abrangencia: z.enum(abrangencia.enumValues),
  tipoContratacao: z.enum(tipoContratacao.enumValues),
  coparticipacao: z.boolean().default(false),
  carencias: z.string(),
  coberturas: z.string(),
  redeCredenciada: z.string(),
  taxaAdesao: centavos.default(0),
  ativo: z.boolean().default(true),
  precos: tabelaPrecosSchema,
});
export type PlanoInput = z.input<typeof planoSchema>;
export type PlanoData = z.output<typeof planoSchema>;
export const planoAtualizacaoSchema = planoSchema
  .partial()
  .omit({ precos: true })
  .extend({ precos: tabelaPrecosSchema.optional() });
export type PlanoAtualizacaoInput = z.input<typeof planoAtualizacaoSchema>;
