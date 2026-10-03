import { randomUUID } from "node:crypto";
import { fakePermitido } from "@/lib/modo-teste";
import type {
  EnviarTemplateInput,
  EnvioResultado,
  MessagingProvider,
  StatusEntrega,
} from "./types";

export class FakeMessagingProvider implements MessagingProvider {
  readonly nome = "fake";
  readonly envios: Array<{ input: EnviarTemplateInput; resultado: EnvioResultado }> = [];

  constructor(
    private readonly persistir = async (input: EnviarTemplateInput, resultado: EnvioResultado) => {
      const [{ db }, { mensagens }] = await Promise.all([
        import("@/db/client"),
        import("@/db/schema"),
      ]);
      await db.insert(mensagens).values({
        ordemId: input.ordemId,
        canal: "whatsapp",
        template: input.template,
        para: input.para,
        status: resultado.status,
        providerMessageId: resultado.providerMessageId,
      });
    },
  ) {}

  async enviarTemplate(input: EnviarTemplateInput): Promise<EnvioResultado> {
    const resultado: EnvioResultado = { providerMessageId: randomUUID(), status: "enviada" };
    await this.persistir(input, resultado);
    this.envios.push({ input, resultado });
    if (process.env.NODE_ENV !== "production") console.info("Mensagem fake:", input);
    return resultado;
  }

  validarWebhook(_headers: Headers, rawBody: string): boolean {
    if (!fakePermitido()) return false;
    try {
      return JSON.parse(rawBody).provider === "fake";
    } catch {
      return false;
    }
  }

  parseStatusWebhook(rawBody: string): StatusEntrega[] {
    const evento = JSON.parse(rawBody) as { provider?: string; statuses?: StatusEntrega[] };
    if (evento.provider !== "fake" || !Array.isArray(evento.statuses))
      throw new Error("Webhook fake inválido");
    return evento.statuses;
  }
}
