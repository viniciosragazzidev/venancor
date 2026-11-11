import { z } from "zod";
import { cpfSchema } from "@/lib/validators";

export const concluirAssinaturaSchema = z.object({
  nome: z.string().trim().min(1),
  // Padrão novo (11/11): o CPF já vem na ficha e o cliente só confirma que é o dele. A ficha não recebe o CPF
  // completo: o servidor usa o CPF do titular da ordem. Sem a confirmação, vale o CPF digitado (regra anterior).
  cpf: cpfSchema.optional(),
  cpfConfirmado: z.boolean().optional(),
  imagemBase64: z.string().min(1).max(3_000_000),
  geo: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      precisao: z.number().nonnegative().optional(),
    })
    .optional(),
});
export type ConcluirAssinaturaInput = z.input<typeof concluirAssinaturaSchema>;
