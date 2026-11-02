import { z } from "zod";
import { parentesco } from "@/db/schema";
import { cepSchema, cpfSchema, e164Schema } from "@/lib/validators";

const texto = z.string().trim().min(1);
const nascimentoSchema = z.iso
  .date()
  .refine((value) => value <= new Date().toISOString().slice(0, 10), "Nascimento futuro inválido");

/**
 * Optional text: blank becomes null, so the column stays empty instead of holding "". Absent stays
 * undefined, so a partial update does not wipe the field.
 */
const vazioParaNull = (value: string | null | undefined) =>
  value === undefined ? undefined : value || null;
const opcional = (max: number) =>
  z.string().trim().max(max).nullable().optional().transform(vazioParaNull);

export const estadosCivis = [
  "Solteiro(a)",
  "Casado(a)",
  "União estável",
  "Divorciado(a)",
  "Viúvo(a)",
] as const;

export const clienteSchema = z.object({
  nome: texto.max(160),
  cpf: cpfSchema,
  nascimento: nascimentoSchema,
  email: z.email(),
  whatsapp: e164Schema,
  nomeMae: opcional(160),
  rg: opcional(30),
  estadoCivil: opcional(30),
  cep: z
    .string()
    .nullable()
    .optional()
    .transform((value) => vazioParaNull(value?.replace(/\D/g, "")))
    .pipe(cepSchema.nullable().optional()),
  logradouro: opcional(200),
  numero: opcional(30),
  complemento: opcional(120),
  bairro: opcional(100),
  cidade: opcional(100),
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .nullable()
    .optional()
    .transform(vazioParaNull)
    .pipe(
      z
        .string()
        .regex(/^[A-Z]{2}$/, "UF inválida")
        .nullable()
        .optional(),
    ),
});
export type ClienteInput = z.input<typeof clienteSchema>;
export type ClienteData = z.output<typeof clienteSchema>;
export const clienteAtualizacaoSchema = clienteSchema.partial();
export type ClienteAtualizacaoInput = z.input<typeof clienteAtualizacaoSchema>;

export const dependenteSchema = z.object({
  clienteId: z.uuid(),
  nome: texto.max(160),
  cpf: cpfSchema,
  nascimento: nascimentoSchema,
  parentesco: z.enum(parentesco.enumValues),
});
export type DependenteInput = z.input<typeof dependenteSchema>;
export type DependenteData = z.output<typeof dependenteSchema>;
export const dependenteAtualizacaoSchema = dependenteSchema.omit({ clienteId: true }).partial();
export type DependenteAtualizacaoInput = z.input<typeof dependenteAtualizacaoSchema>;

export const enderecoViaCepSchema = z.object({
  cep: z.string(),
  logradouro: z.string(),
  complemento: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  uf: z.string(),
});
export type EnderecoViaCep = z.infer<typeof enderecoViaCepSchema>;
