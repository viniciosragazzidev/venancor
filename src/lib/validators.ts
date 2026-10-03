import { z } from "zod";

export function cpfValido(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const tamanho of [9, 10]) {
    const soma = [...cpf.slice(0, tamanho)].reduce(
      (total, digito, indice) => total + Number(digito) * (tamanho + 1 - indice),
      0,
    );
    const verificador = (soma * 10) % 11;
    if (Number(cpf[tamanho]) !== (verificador === 10 ? 0 : verificador)) return false;
  }
  return true;
}

export const cpfSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .refine(cpfValido, "CPF inválido");
export const e164Schema = z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone E.164 inválido");
export const cepSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(z.string().regex(/^\d{8}$/, "CEP inválido"));
