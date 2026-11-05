"use server";

import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { clientes, dependentes, ordens } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { requireAdmin } from "@/lib/require-admin";
import { ErroNegocio, executarAcaoPainel } from "@/lib/resultado-acao";
import { cepSchema } from "@/lib/validators";
import {
  clienteAtualizacaoSchema,
  clienteSchema,
  dependenteAtualizacaoSchema,
  dependenteSchema,
  enderecoViaCepSchema,
  type ClienteAtualizacaoInput,
  type ClienteInput,
  type DependenteAtualizacaoInput,
  type DependenteInput,
} from "./schemas";

async function exigirCpfLivre(cpf: string, exceto?: { clienteId?: string; dependenteId?: string }) {
  const [cliente] = await db
    .select({ id: clientes.id })
    .from(clientes)
    .where(
      exceto?.clienteId
        ? and(eq(clientes.cpf, cpf), ne(clientes.id, exceto.clienteId))
        : eq(clientes.cpf, cpf),
    )
    .limit(1);
  const [dependente] = await db
    .select({ id: dependentes.id })
    .from(dependentes)
    .where(
      exceto?.dependenteId
        ? and(eq(dependentes.cpf, cpf), ne(dependentes.id, exceto.dependenteId))
        : eq(dependentes.cpf, cpf),
    )
    .limit(1);
  if (cliente) throw new ErroNegocio("Já existe um cliente com este CPF. Procure por ele na lista.");
  if (dependente) throw new ErroNegocio("Este CPF já está cadastrado como dependente de outro cliente.");
}

export async function listarClientes() {
  await requireAdmin();
  return db.select().from(clientes);
}

async function criarClienteInterno(input: ClienteInput) {
  const admin = await requireAdmin();
  const data = clienteSchema.parse(input);
  await exigirCpfLivre(data.cpf);
  const [cliente] = await db
    .insert(clientes)
    .values({ ...data, criadoPor: admin.id })
    .returning();
  await registrarAuditoria({
    entidade: "clientes",
    entidadeId: cliente.id,
    acao: "criar",
    ator: `admin:${admin.id}`,
  });
  return cliente;
}

async function atualizarClienteInterno(id: string, input: ClienteAtualizacaoInput) {
  const admin = await requireAdmin();
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
}

async function excluirClienteInterno(id: string) {
  const admin = await requireAdmin();
  const [ordem] = await db
    .select({ id: ordens.id })
    .from(ordens)
    .where(eq(ordens.clienteId, id))
    .limit(1);
  if (ordem) throw new ErroNegocio("Este cliente tem ordem e não pode ser excluído.");
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
}

export async function listarDependentes(clienteId: string) {
  await requireAdmin();
  return db.select().from(dependentes).where(eq(dependentes.clienteId, clienteId));
}

async function criarDependenteInterno(input: DependenteInput) {
  const admin = await requireAdmin();
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
}

async function atualizarDependenteInterno(id: string, input: DependenteAtualizacaoInput) {
  const admin = await requireAdmin();
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
}

async function excluirDependenteInterno(id: string) {
  const admin = await requireAdmin();
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
}

async function buscarCepInterno(input: string) {
  await requireAdmin();
  const cep = cepSchema.parse(input);
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new ErroNegocio("Não foi possível consultar o CEP.");
  const data = (await response.json()) as Record<string, unknown>;
  if (data.erro) throw new ErroNegocio("CEP não encontrado.");
  return enderecoViaCepSchema.parse({
    cep,
    logradouro: data.logradouro,
    complemento: data.complemento,
    bairro: data.bairro,
    cidade: data.localidade,
    uf: data.uf,
  });
}

/**
 * Server actions of the panel (05/11): they return the reason as data instead of throwing, because
 * in production Next hides the message of a thrown error ("Minified React error #441").
 */
export async function criarCliente(input: ClienteInput) {
  return executarAcaoPainel("criar-cliente", () => criarClienteInterno(input));
}

export async function atualizarCliente(id: string, input: ClienteAtualizacaoInput) {
  return executarAcaoPainel("atualizar-cliente", () => atualizarClienteInterno(id, input));
}

export async function excluirCliente(id: string) {
  return executarAcaoPainel("excluir-cliente", () => excluirClienteInterno(id));
}

export async function criarDependente(input: DependenteInput) {
  return executarAcaoPainel("criar-dependente", () => criarDependenteInterno(input));
}

export async function atualizarDependente(id: string, input: DependenteAtualizacaoInput) {
  return executarAcaoPainel("atualizar-dependente", () => atualizarDependenteInterno(id, input));
}

export async function excluirDependente(id: string) {
  return executarAcaoPainel("excluir-dependente", () => excluirDependenteInterno(id));
}

export async function buscarCep(input: string) {
  return executarAcaoPainel("buscar-cep", () => buscarCepInterno(input));
}
