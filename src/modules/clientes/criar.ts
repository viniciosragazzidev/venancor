import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { auditoria, clientes, dependentes } from "@/db/schema";
import { ErroNegocio } from "@/lib/resultado-acao";
import { clienteSchema, type ClienteInput } from "./schemas";

type TransacaoBanco = Parameters<Parameters<typeof db.transaction>[0]>[0];
type ExecutorBanco = typeof db | TransacaoBanco;

export async function exigirCpfLivre(
  cpf: string,
  exceto?: { clienteId?: string; dependenteId?: string },
  executor: ExecutorBanco = db,
) {
  const [cliente] = await executor
    .select({ id: clientes.id, nome: clientes.nome })
    .from(clientes)
    .where(
      exceto?.clienteId
        ? and(eq(clientes.cpf, cpf), ne(clientes.id, exceto.clienteId))
        : eq(clientes.cpf, cpf),
    )
    .limit(1);
  const [dependente] = await executor
    .select({ id: dependentes.id, nome: dependentes.nome })
    .from(dependentes)
    .where(
      exceto?.dependenteId
        ? and(eq(dependentes.cpf, cpf), ne(dependentes.id, exceto.dependenteId))
        : eq(dependentes.cpf, cpf),
    )
    .limit(1);
  if (cliente) throw new ErroNegocio(`Já existe um cliente com este CPF (${cliente.nome}).`);
  if (dependente) throw new ErroNegocio(`Já existe um dependente com este CPF (${dependente.nome}).`);
}

/** Creates a client and its audit event using the caller's transaction. */
export async function criarClienteNaTransacao(
  tx: TransacaoBanco,
  input: ClienteInput,
  adminId: string,
) {
  const data = clienteSchema.parse(input);
  await exigirCpfLivre(data.cpf, undefined, tx);
  const [cliente] = await tx
    .insert(clientes)
    .values({ ...data, criadoPor: adminId })
    .returning();
  await tx.insert(auditoria).values({
    entidade: "clientes",
    entidadeId: cliente.id,
    acao: "criar",
    ator: `admin:${adminId}`,
  });
  return cliente;
}
