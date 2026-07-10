"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { operadoras, planos, precos } from "@/lib/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, sql, asc } from "drizzle-orm";

export interface Operadora {
  id: number;
  nome: string;
  logo_url: string | null;
  planosCount?: number;
}

export interface Plano {
  id: number;
  operadoraId: number;
  nome: string;
  tipoContratacao: "ADESAO" | "CNPJ";
  segmentacao: "AMBULATORIAL" | "HOSPITALAR" | "GLOBAL";
  abrangencia: "REGIONAL" | "NACIONAL";
  beneficios: string | null;
  coparticipacao: boolean;
  cidades: string | null;
  carenciaUrgencia: number;
  carenciaConsultas: number;
  carenciaExamesSimples: number;
  carenciaAltaComplexidade: number;
  carenciaPreexistencias: number;
}

export interface Precos {
  id?: number;
  planoId: number;
  faixa0a18: number;
  faixa19a23: number;
  faixa24a28: number;
  faixa29a33: number;
  faixa34a38: number;
  faixa39a43: number;
  faixa44a48: number;
  faixa49a53: number;
  faixa54a58: number;
  faixa59mais: number;
}

async function checkAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Não autenticado" };
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    return { error: "Acesso restrito. Apenas administradores podem acessar as configurações de planos." };
  }

  return { session };
}

export async function getOperadorasWithPlansCountAction() {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const result = await db
      .select({
        id: operadoras.id,
        nome: operadoras.nome,
        logo_url: operadoras.logoUrl,
        planosCount: sql<number>`count(${planos.id})::int`,
      })
      .from(operadoras)
      .leftJoin(planos, eq(operadoras.id, planos.operadoraId))
      .groupBy(operadoras.id, operadoras.nome, operadoras.logoUrl)
      .orderBy(asc(operadoras.nome));

    return { data: result };
  } catch (error: any) {
    console.error("Error in getOperadorasAction:", error);
    return { error: error.message || "Erro ao buscar marcas operadoras" };
  }
}

export async function getPlanosForOperadoraAction(operadoraId: number) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const result = await db
      .select({
        id: planos.id,
        operadoraId: planos.operadoraId,
        nome: planos.nome,
        tipoContratacao: sql<Plano["tipoContratacao"]>`COALESCE(${planos.tipoContratacao}, 'ADESAO')`,
        segmentacao: sql<Plano["segmentacao"]>`COALESCE(${planos.segmentacao}, 'AMBULATORIAL')`,
        abrangencia: sql<Plano["abrangencia"]>`COALESCE(${planos.abrangencia}, 'REGIONAL')`,
        beneficios: planos.beneficios,
        coparticipacao: sql<Plano["coparticipacao"]>`CASE WHEN COALESCE(${planos.coparticipacao}, 'false') = 'true' THEN true ELSE false END`,
        cidades: planos.cidades,
        carenciaUrgencia: sql<Plano["carenciaUrgencia"]>`CAST(COALESCE(${planos.carenciaUrgencia}, '0') AS INTEGER)`,
        carenciaConsultas: sql<Plano["carenciaConsultas"]>`CAST(COALESCE(${planos.carenciaConsultas}, '0') AS INTEGER)`,
        carenciaExamesSimples: sql<Plano["carenciaExamesSimples"]>`CAST(COALESCE(${planos.carenciaExamesSimples}, '0') AS INTEGER)`,
        carenciaAltaComplexidade: sql<Plano["carenciaAltaComplexidade"]>`CAST(COALESCE(${planos.carenciaAltaComplexidade}, '0') AS INTEGER)`,
        carenciaPreexistencias: sql<Plano["carenciaPreexistencias"]>`CAST(COALESCE(${planos.carenciaPreexistencias}, '0') AS INTEGER)`,
      })
      .from(planos)
      .where(eq(planos.operadoraId, operadoraId))
      .orderBy(asc(planos.nome));

    return { data: result };
  } catch (error: any) {
    console.error("Error in getPlanosForOperadoraAction:", error);
    return { error: error.message || "Erro ao buscar planos da operadora" };
  }
}

export async function getPlanoDetailsAction(planoId: number) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const [planoRes] = await db
      .select({
        id: planos.id,
        operadoraId: planos.operadoraId,
        nome: planos.nome,
        tipoContratacao: sql<Plano["tipoContratacao"]>`COALESCE(${planos.tipoContratacao}, 'ADESAO')`,
        segmentacao: sql<Plano["segmentacao"]>`COALESCE(${planos.segmentacao}, 'AMBULATORIAL')`,
        abrangencia: sql<Plano["abrangencia"]>`COALESCE(${planos.abrangencia}, 'REGIONAL')`,
        beneficios: planos.beneficios,
        coparticipacao: sql<Plano["coparticipacao"]>`CASE WHEN COALESCE(${planos.coparticipacao}, 'false') = 'true' THEN true ELSE false END`,
        cidades: planos.cidades,
        carenciaUrgencia: sql<Plano["carenciaUrgencia"]>`CAST(COALESCE(${planos.carenciaUrgencia}, '0') AS INTEGER)`,
        carenciaConsultas: sql<Plano["carenciaConsultas"]>`CAST(COALESCE(${planos.carenciaConsultas}, '0') AS INTEGER)`,
        carenciaExamesSimples: sql<Plano["carenciaExamesSimples"]>`CAST(COALESCE(${planos.carenciaExamesSimples}, '0') AS INTEGER)`,
        carenciaAltaComplexidade: sql<Plano["carenciaAltaComplexidade"]>`CAST(COALESCE(${planos.carenciaAltaComplexidade}, '0') AS INTEGER)`,
        carenciaPreexistencias: sql<Plano["carenciaPreexistencias"]>`CAST(COALESCE(${planos.carenciaPreexistencias}, '0') AS INTEGER)`,
      })
      .from(planos)
      .where(eq(planos.id, planoId));

    if (!planoRes) {
      return { error: "Plano não encontrado" };
    }

    const [precosRes] = await db
      .select({
        id: precos.id,
        planoId: precos.planoId,
        faixa0a18: sql<Precos["faixa0a18"]>`CAST(COALESCE(${precos.faixa0a18}, '0') AS NUMERIC)`,
        faixa19a23: sql<Precos["faixa19a23"]>`CAST(COALESCE(${precos.faixa19a23}, '0') AS NUMERIC)`,
        faixa24a28: sql<Precos["faixa24a28"]>`CAST(COALESCE(${precos.faixa24a28}, '0') AS NUMERIC)`,
        faixa29a33: sql<Precos["faixa29a33"]>`CAST(COALESCE(${precos.faixa29a33}, '0') AS NUMERIC)`,
        faixa34a38: sql<Precos["faixa34a38"]>`CAST(COALESCE(${precos.faixa34a38}, '0') AS NUMERIC)`,
        faixa39a43: sql<Precos["faixa39a43"]>`CAST(COALESCE(${precos.faixa39a43}, '0') AS NUMERIC)`,
        faixa44a48: sql<Precos["faixa44a48"]>`CAST(COALESCE(${precos.faixa44a48}, '0') AS NUMERIC)`,
        faixa49a53: sql<Precos["faixa49a53"]>`CAST(COALESCE(${precos.faixa49a53}, '0') AS NUMERIC)`,
        faixa54a58: sql<Precos["faixa54a58"]>`CAST(COALESCE(${precos.faixa54a58}, '0') AS NUMERIC)`,
        faixa59mais: sql<Precos["faixa59mais"]>`CAST(COALESCE(${precos.faixa59mais}, '0') AS NUMERIC)`,
      })
      .from(precos)
      .where(eq(precos.planoId, planoId));

    return {
      plano: planoRes,
      precos: precosRes || null,
    };
  } catch (error: any) {
    console.error("Error in getPlanoDetailsAction:", error);
    return { error: error.message || "Erro ao carregar detalhes do plano" };
  }
}

export async function savePlanoAction(
  planoData: Omit<Plano, "id"> & { id?: number },
  precosData: Omit<Precos, "id" | "planoId">
) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    const {
      id,
      operadoraId,
      nome,
      tipoContratacao,
      segmentacao,
      abrangencia,
      beneficios,
      coparticipacao,
      cidades,
      carenciaUrgencia,
      carenciaConsultas,
      carenciaExamesSimples,
      carenciaAltaComplexidade,
      carenciaPreexistencias,
    } = planoData;

    let planoId = id;

    if (id) {
      await db
        .update(planos)
        .set({
          nome,
          tipoContratacao,
          segmentacao,
          abrangencia,
          beneficios,
          coparticipacao: coparticipacao ? "true" : "false",
          cidades,
          carenciaUrgencia: String(carenciaUrgencia),
          carenciaConsultas: String(carenciaConsultas),
          carenciaExamesSimples: String(carenciaExamesSimples),
          carenciaAltaComplexidade: String(carenciaAltaComplexidade),
          carenciaPreexistencias: String(carenciaPreexistencias),
        })
        .where(eq(planos.id, id));

      await db
        .update(precos)
        .set({
          faixa0a18: String(precosData.faixa0a18),
          faixa19a23: String(precosData.faixa19a23),
          faixa24a28: String(precosData.faixa24a28),
          faixa29a33: String(precosData.faixa29a33),
          faixa34a38: String(precosData.faixa34a38),
          faixa39a43: String(precosData.faixa39a43),
          faixa44a48: String(precosData.faixa44a48),
          faixa49a53: String(precosData.faixa49a53),
          faixa54a58: String(precosData.faixa54a58),
          faixa59mais: String(precosData.faixa59mais),
        })
        .where(eq(precos.planoId, id));
    } else {
      const [inserted] = await db
        .insert(planos)
        .values({
          operadoraId,
          nome,
          tipoContratacao,
          segmentacao,
          abrangencia,
          beneficios,
          coparticipacao: coparticipacao ? "true" : "false",
          cidades,
          carenciaUrgencia: String(carenciaUrgencia),
          carenciaConsultas: String(carenciaConsultas),
          carenciaExamesSimples: String(carenciaExamesSimples),
          carenciaAltaComplexidade: String(carenciaAltaComplexidade),
          carenciaPreexistencias: String(carenciaPreexistencias),
        })
        .returning({ id: planos.id });

      planoId = inserted.id;

      await db.insert(precos).values({
        planoId: planoId,
        faixa0a18: String(precosData.faixa0a18),
        faixa19a23: String(precosData.faixa19a23),
        faixa24a28: String(precosData.faixa24a28),
        faixa29a33: String(precosData.faixa29a33),
        faixa34a38: String(precosData.faixa34a38),
        faixa39a43: String(precosData.faixa39a43),
        faixa44a48: String(precosData.faixa44a48),
        faixa49a53: String(precosData.faixa49a53),
        faixa54a58: String(precosData.faixa54a58),
        faixa59mais: String(precosData.faixa59mais),
      });
    }

    revalidatePath("/crm/planos");
    return { success: true, planoId };
  } catch (error: any) {
    console.error("Error in savePlanoAction:", error);
    return { error: error.message || "Erro ao salvar informações do plano" };
  }
}

export async function createOperadoraAction(nome: string, logoUrl: string | null) {
  try {
    const authCheck = await checkAdminSession();
    if (authCheck.error) {
      return { error: authCheck.error };
    }

    if (!nome) {
      return { error: "O nome da operadora é obrigatório." };
    }

    await db.insert(operadoras).values({ nome, logoUrl });

    revalidatePath("/crm/planos");
    return { success: true };
  } catch (error: any) {
    console.error("Error in createOperadoraAction:", error);
    if (error.code === "23505") {
      return { error: "Esta operadora já está cadastrada." };
    }
    return { error: error.message || "Erro ao cadastrar operadora." };
  }
}
