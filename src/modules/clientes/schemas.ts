import { z } from "zod";
import { parentesco } from "@/db/schema";
import { cepSchema, cpfSchema, e164Schema } from "@/lib/validators";

const texto = z.string().trim().min(1);
const nascimentoSchema = z.iso
  .date()
  .refine((value) => value <= new Date().toISOString().slice(0, 10), "Nascimento futuro inválido");

export const clienteSchema = z.object({
  nome: texto.max(160),
  cpf: cpfSchema,
  nascimento: nascimentoSchema,
  email: z.email(),
  whatsapp: e164Schema,
  cep: cepSchema,
  logradouro: texto.max(200),
  numero: texto.max(30),
  complemento: z.string().trim().nullable().optional(),
  bairro: texto.max(100),
  cidade: texto.max(100),
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "UF inválida"),
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
