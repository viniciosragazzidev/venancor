import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { clientes, mensagens, ordens } from "@/db/schema";
import type {
  EnviarTemplateInput,
  EnvioResultado,
  MessagingProvider,
  StatusEntrega,
} from "./types";

const CAMPOS: Record<EnviarTemplateInput["template"], string[]> = {
  proposta_enviada: ["nome", "plano", "link"],
  codigo_assinatura: ["codigo"],
  pagamento_confirmado: ["nome", "plano"],
  lembrete_proposta: ["nome", "link"],
};

export class MetaWhatsAppProvider implements MessagingProvider {
  readonly nome = "meta";

  async enviarTemplate(input: EnviarTemplateInput): Promise<EnvioResultado> {
    const token = process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.META_PHONE_NUMBER_ID;
    if (!token || !phoneId) throw new Error("Credenciais Meta não configuradas");
    let resultado: EnvioResultado;
    try {
      const campos = CAMPOS[input.template];
      const valores = campos.map((campo) => {
        const valor = input.variaveis[campo];
        if (!valor) throw new Error(`Variável ${campo} obrigatória`);
        return { type: "text", text: valor };
      });
      const response = await fetch(
        `https://graph.facebook.com/${process.env.META_GRAPH_VERSION ?? "v23.0"}/${encodeURIComponent(phoneId)}/messages`,
        {
          method: "POST",
          signal: AbortSignal.timeout(15000),
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: input.para.replace(/\D/g, ""),
            type: "template",
            template: {
              name: input.template,
              language: { code: "pt_BR" },
              components: [{ type: "body", parameters: valores }],
            },
          }),
        },
      );
      if (!response.ok) throw new Error(`Meta respondeu HTTP ${response.status}`);
      const data = (await response.json()) as { messages?: { id: string }[] };
      if (!data.messages?.[0]?.id) throw new Error("Meta não retornou ID da mensagem");
      resultado = { providerMessageId: data.messages[0].id, status: "enviada" };
      await db
        .insert(mensagens)
        .values({
          ordemId: input.ordemId,
          canal: "whatsapp",
          template: input.template,
          para: input.para,
          providerMessageId: resultado.providerMessageId,
          status: "enviada",
          enviadaEm: new Date(),
        });
      return resultado;
    } catch (error) {
      await db
        .insert(mensagens)
        .values({
          ordemId: input.ordemId,
          canal: "whatsapp",
          template: input.template,
          para: input.para,
          status: "falhou",
          erro: error instanceof Error ? error.message : "Falha Meta",
        });
      const fallback = await this.emailFallback(input);
      if (fallback) return fallback;
      throw error;
    }
  }

  private async emailFallback(input: EnviarTemplateInput): Promise<EnvioResultado | null> {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || !input.ordemId)
      return null;
    const [row] = await db
      .select({ email: clientes.email })
      .from(ordens)
      .innerJoin(clientes, eq(clientes.id, ordens.clienteId))
      .where(eq(ordens.id, input.ordemId))
      .limit(1);
    if (!row?.email) return null;
    const linhas = Object.entries(input.variaveis)
      .map(([chave, valor]) => `${chave}: ${valor}`)
      .join("\n");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [row.email],
        subject: `MedLink: ${input.template.replaceAll("_", " ")}`,
        text: linhas,
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { id?: string };
    if (!data.id) return null;
    await db
      .insert(mensagens)
      .values({
        ordemId: input.ordemId,
        canal: "email",
        template: input.template,
        para: row.email,
        status: "enviada",
        providerMessageId: data.id,
        enviadaEm: new Date(),
      });
    return { providerMessageId: data.id, status: "enviada" };
  }

  validarWebhook(headers: Headers, raw: string): boolean {
    const secret = process.env.META_APP_SECRET;
    const signature = headers.get("x-hub-signature-256");
    if (!secret || !signature?.startsWith("sha256=")) return false;
    const digest = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
    const a = Buffer.from(signature);
    const b = Buffer.from(digest);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  parseStatusWebhook(raw: string): StatusEntrega[] {
    const payload: unknown = JSON.parse(raw);
    if (!payload || typeof payload !== "object") throw new Error("Webhook Meta inválido");
    const entries = (
      payload as {
        entry?: {
          changes?: {
            value?: {
              statuses?: {
                id: string;
                status: string;
                errors?: { message?: string }[];
              }[];
            };
          }[];
        }[];
      }
    ).entry;
    return (entries ?? []).flatMap((entry) =>
      (entry.changes ?? []).flatMap((change) =>
        (change.value?.statuses ?? [])
          .filter((s) => typeof s.id === "string")
          .map((s) => ({
            providerMessageId: s.id,
            status:
              (
                {
                  sent: "enviada",
                  delivered: "entregue",
                  read: "lida",
                  failed: "falhou",
                } as Record<string, StatusEntrega["status"]>
              )[s.status] ?? "enviada",
            erro: s.errors?.[0]?.message,
          })),
      ),
    );
  }
}
