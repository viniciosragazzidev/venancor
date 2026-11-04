import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { clientes, operadoras, ordens, pagamentos, planos } from "@/db/schema";
import { log } from "@/lib/log";
import {
  codigoBarrasValido,
  linhaParaCodigoBarras,
  valorDoCodigoBarras,
} from "@/modules/boleto/febraban";
import { gerarBoletoPdf } from "@/modules/boleto/pdf";
import { resolverToken } from "@/modules/ordens/cliente";
import { getPaymentProvider } from "@/providers/payment";
import { getStorageAdapter } from "@/providers/storage";

/**
 * Boleto próprio com a marca da Venacor (04/11). O cliente baixa pelo link da proposta; a
 * cobrança continua no Asaas. Qualquer dado que não confira devolve 409 e a tela cai no PDF do
 * Asaas: nunca entregar um boleto com linha ou código de barras duvidoso.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const token =
    body && typeof body === "object" && "token" in body && typeof body.token === "string"
      ? body.token
      : "";
  const estado = await resolverToken(token, { registrarAbertura: false });
  if (estado.tipo !== "ativa" || estado.dados.status !== "aguardando_pagamento")
    return new Response(null, { status: 404 });

  const [linha] = await db
    .select({
      pagamento: pagamentos,
      ordem: ordens,
      cliente: clientes,
      plano: planos,
      operadora: operadoras,
    })
    .from(pagamentos)
    .innerJoin(ordens, eq(ordens.id, pagamentos.ordemId))
    .innerJoin(clientes, eq(clientes.id, ordens.clienteId))
    .innerJoin(planos, eq(planos.id, ordens.planoId))
    .innerJoin(operadoras, eq(operadoras.id, planos.operadoraId))
    .where(
      and(
        eq(pagamentos.ordemId, estado.dados.id),
        eq(pagamentos.metodo, "boleto"),
        eq(pagamentos.status, "pendente"),
      ),
    )
    .orderBy(desc(pagamentos.criadoEm))
    .limit(1);
  if (!linha?.pagamento.boletoLinha || !linha.pagamento.vencimento)
    return new Response(null, { status: 404 });
  const { pagamento, ordem, cliente, plano, operadora } = linha;
  const linhaSalva = linha.pagamento.boletoLinha;
  const vencimento = linha.pagamento.vencimento;

  try {
    const provider = getPaymentProvider();
    const detalhes =
      provider.nome === pagamento.provider && provider.detalhesBoleto && pagamento.providerPaymentId
        ? await provider.detalhesBoleto(pagamento.providerPaymentId).catch(() => null)
        : null;
    const linhaDigitavel = detalhes?.linhaDigitavel ?? linhaSalva;
    const codigo = linhaParaCodigoBarras(linhaDigitavel);
    const confere =
      codigo !== null &&
      (!detalhes?.codigoBarras ||
        (codigoBarrasValido(detalhes.codigoBarras) && detalhes.codigoBarras === codigo)) &&
      valorDoCodigoBarras(codigo) === pagamento.valor;
    if (!codigo || !confere) {
      log.warn("boleto_proprio_recusado", { pagamentoId: pagamento.id });
      return new Response(null, { status: 409 });
    }

    const origem = new URL(request.url).origin;
    const logoVenacor = await fetch(`${origem}/logo.webp`)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
    const logoOperadora = operadora.logoPath?.endsWith(".png")
      ? await getStorageAdapter()
          .getSignedUrl(operadora.logoPath)
          .then((url) => fetch(url))
          .then((r) => (r.ok ? r.arrayBuffer() : null))
          .catch(() => null)
      : null;

    const pdf = await gerarBoletoPdf({
      linhaDigitavel,
      codigoBarras: codigo,
      valorCentavos: pagamento.valor,
      vencimento,
      pagador: { nome: cliente.nome, cpf: cliente.cpf },
      beneficiario: detalhes?.beneficiario,
      plano: plano.nome,
      operadora: operadora.nome,
      numeroProposta: ordem.numero,
      nossoNumero: detalhes?.nossoNumero,
      pix: detalhes?.pixPayload
        ? { payload: detalhes.pixPayload, qrPngBase64: detalhes.pixQrBase64 }
        : undefined,
      logoVenacor: logoVenacor ? new Uint8Array(logoVenacor) : undefined,
      logoOperadora: logoOperadora ? new Uint8Array(logoOperadora) : undefined,
    });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=boleto-proposta-${ordem.numero}.pdf`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (erro) {
    log.error("boleto_proprio_falhou", {
      pagamentoId: pagamento.id,
      erro: erro instanceof Error ? erro.message.slice(0, 160) : "desconhecido",
    });
    return new Response(null, { status: 500 });
  }
}
