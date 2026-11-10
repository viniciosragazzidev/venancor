"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { clientes, dependentes, ordens } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { ErroNegocio, executarAcaoPainel, type ResultadoAcao } from "@/lib/resultado-acao";
import { requireAdmin } from "@/lib/require-admin";
import { cepSchema } from "@/lib/validators";
import { criarClienteNaTransacao, exigirCpfLivre } from "./criar";
import {
  clienteAtualizacaoSchema,
  dependenteAtualizacaoSchema,
  dependenteSchema,
  enderecoViaCepSchema,
  type ClienteAtualizacaoInput,
  type ClienteInput,
  type DependenteAtualizacaoInput,
  type DependenteInput,
} from "./schemas";

export async function listarClientes() {
  await requireAdmin();
  return db.select().from(clientes);
}

export async function criarCliente(
  input: ClienteInput,
): Promise<ResultadoAcao<typeof clientes.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel(
    "painel.cliente.criar",
    () => db.transaction((tx) => criarClienteNaTransacao(tx, input, admin.id)),
  );
}

export async function atualizarCliente(
  id: string,
  input: ClienteAtualizacaoInput,
): Promise<ResultadoAcao<typeof clientes.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel(
    "painel.cliente.atualizar",
    async () => {
      const data = clienteAtualizacaoSchema.parse(input);
      if (data.cpf) await exigirCpfLivre(data.cpf, { clienteId: id });
      const [cliente] = await db
        .update(clientes)
        .set({ ...data, atualizadoEm: new Date() })
        .where(eq(clientes.id, id))
        .returning();
      if (!cliente) throw new ErroNegocio("Cliente não encontrado.");
      await registrarAuditoria({
        entidade: "clientes",
        entidadeId: id,
        acao: "atualizar",
        ator: `admin:${admin.id}`,
      });
      return cliente;
    },
  );
}

export async function excluirCliente(id: string): Promise<ResultadoAcao<void>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.cliente.excluir", async () => {
    const [ordem] = await db
      .select({ id: ordens.id })
      .from(ordens)
      .where(eq(ordens.clienteId, id))
      .limit(1);
    if (ordem)
      throw new ErroNegocio("Este cliente tem uma ordem vinculada e não pode ser excluído.");
    const [cliente] = await db
      .delete(clientes)
      .where(eq(clientes.id, id))
      .returning({ id: clientes.id });
    if (!cliente) throw new ErroNegocio("Cliente não encontrado.");
    await registrarAuditoria({
      entidade: "clientes",
      entidadeId: id,
      acao: "excluir",
      ator: `admin:${admin.id}`,
    });
  });
}

export async function listarDependentes(clienteId: string): Promise<ResultadoAcao<(typeof dependentes.$inferSelect)[]>> {
  await requireAdmin();
  return executarAcaoPainel("painel.dependente.listar", () =>
    db.select().from(dependentes).where(eq(dependentes.clienteId, clienteId)),
  );
}

export async function criarDependente(
  input: DependenteInput,
): Promise<ResultadoAcao<typeof dependentes.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel(
    "painel.dependente.criar",
    async () => {
      const data = dependenteSchema.parse(input);
      await exigirCpfLivre(data.cpf);
      const [dependente] = await db.insert(dependentes).values(data).returning();
      await registrarAuditoria({
        entidade: "dependentes",
        entidadeId: dependente.id,
        acao: "criar",
        ator: `admin:${admin.id}`,
      });
      return dependente;
    },
  );
}

export async function atualizarDependente(
  id: string,
  input: DependenteAtualizacaoInput,
): Promise<ResultadoAcao<typeof dependentes.$inferSelect>> {
  const admin = await requireAdmin();
  return executarAcaoPainel(
    "painel.dependente.atualizar",
    async () => {
      const data = dependenteAtualizacaoSchema.parse(input);
      if (data.cpf) await exigirCpfLivre(data.cpf, { dependenteId: id });
      const [dependente] = await db
        .update(dependentes)
        .set({ ...data, atualizadoEm: new Date() })
        .where(eq(dependentes.id, id))
        .returning();
      if (!dependente) throw new ErroNegocio("Dependente não encontrado.");
      await registrarAuditoria({
        entidade: "dependentes",
        entidadeId: id,
        acao: "atualizar",
        ator: `admin:${admin.id}`,
      });
      return dependente;
    },
  );
}

export async function excluirDependente(id: string): Promise<ResultadoAcao<void>> {
  const admin = await requireAdmin();
  return executarAcaoPainel("painel.dependente.excluir", async () => {
    const [dependente] = await db
      .delete(dependentes)
      .where(eq(dependentes.id, id))
      .returning({ id: dependentes.id });
    if (!dependente) throw new ErroNegocio("Dependente não encontrado.");
    await registrarAuditoria({
      entidade: "dependentes",
      entidadeId: id,
      acao: "excluir",
      ator: `admin:${admin.id}`,
    });
  });
}

export async function buscarCep(input: string): Promise<ResultadoAcao<ReturnType<typeof enderecoViaCepSchema.parse>>> {
  await requireAdmin();
  return executarAcaoPainel("painel.cliente.buscar_cep", async () => {
    const validacao = cepSchema.safeParse(input);
    if (!validacao.success) throw new ErroNegocio("Informe um CEP válido com 8 dígitos.");
    const cep = validacao.data;
    let response: Response;
    try {
      response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ErroNegocio("A consulta de CEP está indisponível. Tente novamente em alguns minutos.");
    }
    if (!response.ok) throw new ErroNegocio("A consulta de CEP está indisponível. Tente novamente em alguns minutos.");
    const data = (await response.json()) as Record<string, unknown>;
    if (data.erro) throw new ErroNegocio("CEP não encontrado. Confira os números informados.");
    return enderecoViaCepSchema.parse({
      cep,
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
    });
  });
}
