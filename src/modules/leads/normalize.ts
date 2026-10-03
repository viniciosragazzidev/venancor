import { z } from "zod";

const objeto = z.record(z.string(), z.unknown());
const texto = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const primeiro = (items: unknown[], ...names: string[]) => {
  for (const name of names) {
    const value = items.find(
      (item) => objeto.safeParse(item).success && (item as Record<string, unknown>).name === name,
    ) as Record<string, unknown> | undefined;
    if (value && Array.isArray(value.values)) {
      const result = texto(value.values[0]);
      if (result) return result;
    }
  }
  return "";
};
const coluna = (items: unknown[], ...names: string[]) => {
  for (const name of names) {
    const value = items.find(
      (item) =>
        objeto.safeParse(item).success && (item as Record<string, unknown>).column_id === name,
    ) as Record<string, unknown> | undefined;
    const result = texto(value?.string_value);
    if (result) return result;
  }
  return "";
};
const campo = (payload: Record<string, unknown>, ...names: string[]) => {
  for (const name of names) {
    const result = texto(payload[name]);
    if (result) return result;
  }
  return "";
};

export function normalizarTelefoneLead(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("55") && (digits.length === 12 || digits.length === 13)
    ? digits.slice(2)
    : digits;
}

export const leadNormalizadoSchema = z.object({
  nome: z.string().trim().min(2).max(160),
  whatsapp: z.string().regex(/^\d{10,11}$/, "WhatsApp inválido"),
  perfil: z.string().trim().min(1).max(120),
  idades: z.string().trim().max(500).nullable(),
  utmSource: z.string().trim().max(200).nullable(),
  utmMedium: z.string().trim().max(200).nullable(),
  utmCampaign: z.string().trim().max(200).nullable(),
});
export type LeadNormalizado = z.infer<typeof leadNormalizadoSchema>;

export function normalizarLead(input: unknown): LeadNormalizado {
  const payload = objeto.parse(input);
  let nome = "",
    whatsapp = "",
    perfil = "Adesão",
    idades = "";
  let utmSource = "",
    utmMedium = "",
    utmCampaign = "";
  if (Array.isArray(payload.field_data)) {
    const fields = payload.field_data;
    nome = primeiro(fields, "nome_completo", "full_name", "nome");
    whatsapp = primeiro(fields, "telefone", "phone", "whatsapp");
    perfil = primeiro(fields, "perfil_interesse") || perfil;
    utmSource = primeiro(fields, "utm_source");
    utmMedium = primeiro(fields, "utm_medium");
    utmCampaign = primeiro(fields, "utm_campaign");
  } else if (objeto.safeParse(payload.lead).success) {
    const columns = (payload.lead as Record<string, unknown>).user_column_values;
    const values = Array.isArray(columns) ? columns : [];
    nome = coluna(values, "nome_completo", "nome");
    whatsapp = coluna(values, "telefone", "phone", "whatsapp");
    perfil = coluna(values, "perfil_interesse") || perfil;
    utmSource = coluna(values, "utm_source", "source");
    utmMedium = coluna(values, "utm_medium");
    utmCampaign = coluna(values, "utm_campaign");
  } else {
    nome = campo(payload, "nome", "name", "full_name");
    whatsapp = campo(payload, "whatsapp", "phone", "telefone");
    perfil = campo(payload, "perfil_interesse", "perfil", "plan_type") || perfil;
    idades = campo(payload, "idades");
    utmSource = campo(payload, "utm_source");
    utmMedium = campo(payload, "utm_medium");
    utmCampaign = campo(payload, "utm_campaign");
  }
  return leadNormalizadoSchema.parse({
    nome,
    whatsapp: normalizarTelefoneLead(whatsapp),
    perfil,
    idades: idades || null,
    utmSource: utmSource || null,
    utmMedium: utmMedium || null,
    utmCampaign: utmCampaign || null,
  });
}
