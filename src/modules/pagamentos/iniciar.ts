import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { assinaturas, auditoria, clientes, ordens, pagamentos } from "@/db/schema";
import { resolverToken } from "@/modules/ordens/cliente";
import { getPaymentProvider, type Metodo } from "@/providers/payment";
import { assertPodeIniciarPagamento, criarCobrancaSeAssinada } from "./guard";

export interface PagamentoIniciado {
  id: string;
  metodo: Metodo;
  valor: number;
  parcelas: number;
  vencimento: string;
  pix_payload?: string;
  pix_qr_base64?: string | null;
  boleto_linha?: string;
  boleto_url?: string;
  checkout_url?: string;
}

const toCliente = (p: typeof pagamentos.$inferSelect): PagamentoIniciado => ({
  id: p.id,
  metodo: p.metodo,
  valor: p.valor,
  parcelas: p.parcelas,
  vencimento: p.vencimento ?? "",
  pix_payload: p.pixPayload ?? undefined,
  pix_qr_base64: p.pixQrBase64,
  boleto_linha: p.boletoLinha ?? undefined,
  boleto_url: p.boletoUrl ?? undefined,
  checkout_url: p.checkoutUrl ?? undefined,
});

export async function iniciarPagamento(
  token: string,
  metodo: Metodo,
  parcelas = 1,
): Promise<PagamentoIniciado> {
  const resolucao = await resolverToken(token);
  if (resolucao.tipo !== "ativa") throw new Error("Link indisponível para pagamento");
  const [ordem] = await db.select().from(ordens).where(eq(ordens.id, resolucao.dados.id)).limit(1);
  const [assinatura] = await db
    .select({ id: assinaturas.id })
    .from(assinaturas)
    .where(eq(assinaturas.ordemId, resolucao.dados.id))
    .limit(1);
  if (!ordem) throw new Error("Ordem não encontrada");
  assertPodeIniciarPagamento(ordem.status, Boolean(assinatura));
  if (!ordem.formasPagamento.includes(metodo)) throw new Error("Forma de pagamento indisponível");
  if (
    !Number.isInteger(parcelas) ||
    parcelas < 1 ||
    parcelas > ordem.maxParcelas ||
    (metodo !== "cartao" && parcelas !== 1)
  )
    throw new Error("Parcelamento inválido");
  const [existente] = await db
    .select()
    .from(pagamentos)
    .where(
      and(
        eq(pagamentos.ordemId, ordem.id),
        eq(pagamentos.metodo, metodo),
        eq(pagamentos.status, "pendente"),
      ),
    )
    .limit(1);
  if (existente) return toCliente(existente);
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, ordem.clienteId))
    .limit(1);
  if (!cliente) throw new Error("Cliente não encontrado");
  const vencimento = new Date(Date.now() + 3 * 86_400_000);
  const provider = getPaymentProvider();
  const cobranca = await criarCobrancaSeAssinada(
    provider,
    {
      ordemId: ordem.id,
      cliente: {
        nome: cliente.nome,
        cpf: cliente.cpf,
        email: cliente.email,
        whatsapp: cliente.whatsapp,
      },
      metodo,
      valorCentavos: ordem.valorCobrado,
      parcelas,
      vencimento,
      descricao: `Primeira cobrança do plano de saúde - ordem ${ordem.id}`,
    },
    ordem.status,
    Boolean(assinatura),
  );
  try {
    const pagamento = await db.transaction(async (tx) => {
      const [atual] = await tx
        .select({ status: ordens.status })
        .from(ordens)
        .where(eq(ordens.id, ordem.id))
        .limit(1)
        .for("update");
      const [assinaturaAtual] = await tx
        .select({ id: assinaturas.id })
        .from(assinaturas)
        .where(eq(assinaturas.ordemId, ordem.id))
        .limit(1);
      if (!atual) throw new Error("Ordem não encontrada");
      assertPodeIniciarPagamento(atual.status, Boolean(assinaturaAtual));
      const [novo] = await tx
        .insert(pagamentos)
        .values({
          ordemId: ordem.id,
          provider: provider.nome,
          providerCustomerId: cobranca.providerCustomerId,
          providerPaymentId: cobranca.providerPaymentId,
          metodo,
          valor: ordem.valorCobrado,
          parcelas,
          status: cobranca.status,
          pixPayload: cobranca.pixPayload,
          pixQrBase64: cobranca.pixQrBase64,
          boletoUrl: cobranca.boletoUrl,
          boletoLinha: cobranca.boletoLinha,
          checkoutUrl: cobranca.checkoutUrl,
          vencimento: vencimento.toISOString().slice(0, 10),
        })
        .returning();
      if (atual.status === "assinada")
        await tx
          .update(ordens)
          .set({ status: "aguardando_pagamento", atualizadoEm: new Date() })
          .where(eq(ordens.id, ordem.id));
      await tx
        .insert(auditoria)
        .values({
          entidade: "ordens",
          entidadeId: ordem.id,
          acao: "criar_pagamento",
          ator: "cliente",
          metadados: { pagamentoId: novo.id, metodo },
        });
      return novo;
    });
    return toCliente(pagamento);
  } catch (error) {
    await provider.cancelarCobranca(cobranca.providerPaymentId).catch(() => undefined);
    throw error;
  }
}
