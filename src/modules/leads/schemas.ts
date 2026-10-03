import { z } from "zod";
import { clienteSchema } from "@/modules/clientes/schemas";
import { criarOrdemSchema } from "@/modules/ordens/schemas";

const base = z.object({
  leadId: z.uuid(),
  planoId: z.uuid(),
  ordem: criarOrdemSchema.omit({ clienteId: true, planoId: true }).partial().optional(),
});
export const gerarOrdemLeadSchema = z.discriminatedUnion("origemCliente", [
  base.extend({ origemCliente: z.literal("existente"), clienteId: z.uuid() }),
  base.extend({
    origemCliente: z.literal("novo"),
    cliente: clienteSchema.omit({ nome: true, whatsapp: true }),
  }),
]);
export type GerarOrdemLeadInput = z.input<typeof gerarOrdemLeadSchema>;
