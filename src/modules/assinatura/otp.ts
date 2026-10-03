import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { auditoria, clientes, ordens, otpCodigos } from "@/db/schema";
import { getMessagingProvider } from "@/providers/messaging";
import { gerarCodigoOtp, hashOtp, verificarOtpHash } from "./otp-crypto";

export type ResultadoOtp =
  { ok: true; validadoEm: Date } | { erro: "expirado" | "invalido" | "bloqueado" };
const segredoOtp = () => {
  const segredo = process.env.OTP_SECRET;
  if (!segredo || segredo.length < 32)
    throw new Error("OTP_SECRET não configurado (mínimo 32 caracteres)");
  return segredo;
};

export async function enviarOtp(ordemId: string): Promise<void> {
  const [ordem] = await db.select().from(ordens).where(eq(ordens.id, ordemId)).limit(1);
  if (!ordem || ordem.status !== "visualizada" || ordem.expiraEm.getTime() < Date.now())
    throw new Error("Ordem indisponível para OTP");
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, ordem.clienteId))
    .limit(1);
  if (!cliente) throw new Error("Cliente não encontrado");
  const codigo = gerarCodigoOtp();
  const codigoHash = hashOtp(codigo, segredoOtp());
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${ordemId}))`);
    const ultimos = await tx
      .select()
      .from(otpCodigos)
      .where(eq(otpCodigos.ordemId, ordemId))
      .orderBy(desc(otpCodigos.enviadoEm))
      .limit(3);
    const agora = Date.now();
    if (ultimos[0]?.tentativas >= 5 && agora - ultimos[0].atualizadoEm.getTime() < 15 * 60_000)
      throw new Error("OTP bloqueado por 15 minutos");
    if (
      ultimos.length === 3 &&
      ultimos[0].enviadoEm.getTime() - ultimos[2].enviadoEm.getTime() < 10 * 60_000 &&
      agora - ultimos[0].enviadoEm.getTime() < 15 * 60_000
    )
      throw new Error("Limite de envios de OTP atingido");
    await tx
      .insert(otpCodigos)
      .values({
        ordemId,
        telefone: cliente.whatsapp,
        codigoHash,
        expiraEm: new Date(agora + 5 * 60_000),
      });
    await tx
      .insert(auditoria)
      .values({ entidade: "ordens", entidadeId: ordemId, acao: "enviar_otp", ator: "cliente" });
  });
  await getMessagingProvider().enviarTemplate({
    para: cliente.whatsapp,
    template: "codigo_assinatura",
    variaveis: { codigo },
    ordemId,
  });
}

export async function validarOtp(ordemId: string, codigo: string): Promise<ResultadoOtp> {
  if (!/^\d{6}$/.test(codigo)) return { erro: "invalido" };
  const segredo = segredoOtp();
  return db.transaction(async (tx) => {
    const [otp] = await tx
      .select()
      .from(otpCodigos)
      .where(eq(otpCodigos.ordemId, ordemId))
      .orderBy(desc(otpCodigos.enviadoEm))
      .limit(1)
      .for("update");
    if (!otp) return { erro: "expirado" } as const;
    if (otp.usadoEm) return { erro: "invalido" } as const;
    if (otp.tentativas >= otp.maxTentativas) return { erro: "bloqueado" } as const;
    if (otp.expiraEm.getTime() < Date.now()) return { erro: "expirado" } as const;
    const valido = verificarOtpHash(codigo, otp.codigoHash, segredo);
    const agora = new Date();
    await tx
      .update(otpCodigos)
      .set({ tentativas: otp.tentativas + 1, usadoEm: valido ? agora : null, atualizadoEm: agora })
      .where(eq(otpCodigos.id, otp.id));
    if (!valido)
      return { erro: otp.tentativas + 1 >= otp.maxTentativas ? "bloqueado" : "invalido" } as const;
    await tx
      .insert(auditoria)
      .values({ entidade: "ordens", entidadeId: ordemId, acao: "validar_otp", ator: "cliente" });
    return { ok: true, validadoEm: agora } as const;
  });
}

export async function otpValidado(ordemId: string) {
  const [otp] = await db
    .select()
    .from(otpCodigos)
    .where(and(eq(otpCodigos.ordemId, ordemId), gte(otpCodigos.expiraEm, new Date())))
    .orderBy(desc(otpCodigos.enviadoEm))
    .limit(1);
  return otp?.usadoEm ? { telefone: otp.telefone, validadoEm: otp.usadoEm } : null;
}
