import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/schema";

function sanitizePhone(raw: string): string {
  return raw.replace(/[\s\-\(\)\.\+]/g, "").replace(/^55/, "");
}

function detectPlatform(payload: Record<string, unknown>): "meta" | "google" | "generic" {
  if ("field_data" in payload && Array.isArray(payload.field_data)) return "meta";
  if ("lead" in payload && typeof payload.lead === "object") return "google";
  return "generic";
}

function getField(fields: Array<{ name: string; values: string[] }>, name: string): string | undefined {
  return fields.find((f) => f.name === name)?.values?.[0];
}

function getColumnValue(
  columns: Array<{ column_id: string; string_value?: string }>,
  id: string
): string | undefined {
  return columns.find((c) => c.column_id === id)?.string_value;
}

type NormalizedLead = {
  nome: string;
  whatsapp: string;
  perfil: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  idades?: string | null;
};

function normalizeMeta(payload: Record<string, unknown>): NormalizedLead {
  const fields = (payload as any).field_data as Array<{ name: string; values: string[] }>;
  return {
    nome: getField(fields, "nome_completo") || getField(fields, "full_name") || getField(fields, "nome") || "",
    whatsapp: sanitizePhone(getField(fields, "telefone") || getField(fields, "phone") || getField(fields, "whatsapp") || ""),
    perfil: getField(fields, "perfil_interesse") || "Adesão",
    utm_source: getField(fields, "utm_source") || null,
    utm_medium: getField(fields, "utm_medium") || null,
    utm_campaign: getField(fields, "utm_campaign") || null,
  };
}

function normalizeGoogle(payload: Record<string, unknown>): NormalizedLead {
  const columns = ((payload as any).lead as { user_column_values: Array<{ column_id: string; string_value?: string }> })?.user_column_values || [];
  return {
    nome: getColumnValue(columns, "nome_completo") || getColumnValue(columns, "nome") || "",
    whatsapp: sanitizePhone(getColumnValue(columns, "telefone") || getColumnValue(columns, "phone") || getColumnValue(columns, "whatsapp") || ""),
    perfil: getColumnValue(columns, "perfil_interesse") || "Adesão",
    utm_source: getColumnValue(columns, "utm_source") || getColumnValue(columns, "source") || null,
    utm_medium: getColumnValue(columns, "utm_medium") || null,
    utm_campaign: getColumnValue(columns, "utm_campaign") || null,
  };
}

function normalizeGeneric(payload: Record<string, unknown>): NormalizedLead {
  const p = payload as any;
  return {
    nome: p.nome || p.name || p.full_name || "",
    whatsapp: sanitizePhone(p.whatsapp || p.phone || p.telefone || ""),
    perfil: p.perfil_interesse || p.perfil || p.plan_type || "Adesão",
    utm_source: p.utm_source || null,
    utm_medium: p.utm_medium || null,
    utm_campaign: p.utm_campaign || null,
    idades: p.idades || null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token || token !== process.env.WEBHOOK_SECRET_TOKEN) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload: Record<string, unknown> = await request.json();
    const platform = detectPlatform(payload);

    let lead: NormalizedLead;
    switch (platform) {
      case "meta":
        lead = normalizeMeta(payload);
        break;
      case "google":
        lead = normalizeGoogle(payload);
        break;
      default:
        lead = normalizeGeneric(payload);
        break;
    }

    if (!lead.nome || lead.nome.length < 2) {
      return NextResponse.json({ success: false, error: "Invalid payload: nome is required" }, { status: 400 });
    }
    if (!lead.whatsapp || lead.whatsapp.length < 8) {
      return NextResponse.json({ success: false, error: "Invalid payload: whatsapp is required" }, { status: 400 });
    }

    await db.insert(leads).values({
      nome: lead.nome,
      whatsapp: lead.whatsapp,
      perfil: lead.perfil,
      idades: lead.idades || null,
      status: "Aguardando",
      utmSource: lead.utm_source,
      utmMedium: lead.utm_medium,
      utmCampaign: lead.utm_campaign,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("[webhook/leads] Error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
}
