import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { pagamentos } from "@/db/schema";
import { log } from "@/lib/log";
import { AsaasProvider } from "@/providers/payment/asaas";
import { processarEventoPagamento } from "./webhook";

export async function sincronizarPagamentoAsaas(providerPaymentId: string) {
  const cobranca = await new AsaasProvider().consultarCobranca(providerPaymentId);
  if (cobranca.status !== "confirmado" && cobranca.status !== "recebido") return cobranca.status;
  await processarEventoPagamento("asaas", {
    eventId: `consulta:${providerPaymentId}:${cobranca.status}`,
    providerPaymentId,
    tipo: cobranca.status,
    bruto: { fonte: "consulta_asaas", status: cobranca.status },
  });
  return cobranca.status;
}

export async function sincronizarPendentesAsaas(ordemId?: string): Promise<void> {
  if ((process.env.PAYMENT_PROVIDER ?? "fake") !== "asaas") return;
  const filtros = [eq(pagamentos.provider, "asaas"), eq(pagamentos.status, "pendente")];
  if (ordemId) filtros.push(eq(pagamentos.ordemId, ordemId));
  const pendentes = await db
    .select({ id: pagamentos.providerPaymentId })
    .from(pagamentos)
    .where(and(...filtros))
    .limit(ordemId ? 5 : 10);
  const resultados = await Promise.allSettled(
    pendentes
      .filter((item): item is { id: string } => Boolean(item.id))
      .map((item) => sincronizarPagamentoAsaas(item.id)),
  );
  for (const resultado of resultados) {
    if (resultado.status === "rejected")
      log.warn(
        "Falha ao consultar cobrança no Asaas",
        resultado.reason instanceof Error ? resultado.reason.name : "erro_desconhecido",
      );
  }
}
