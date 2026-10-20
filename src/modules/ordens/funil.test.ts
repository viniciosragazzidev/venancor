import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));

import { ehRoboDePreview } from "./acesso-cliente";
import {
  contarPorFiltro,
  etapaFunil,
  filtrarPorEtapa,
  formatarDataHoraBrasilia,
  passosFunil,
  resumoEtapa,
  tempoRelativo,
  type OrdemFunil,
} from "./funil";

const AGORA = new Date("2026-10-20T17:00:00Z").getTime();
const antes = (horas: number) => new Date(AGORA - horas * 3_600_000);

function ordem(parcial: Partial<OrdemFunil> = {}): OrdemFunil {
  return {
    status: "enviada",
    expiraEm: new Date(AGORA + 5 * 86_400_000),
    enviadaEm: antes(3),
    visualizadaEm: null,
    assinadaEm: null,
    pagaEm: null,
    canceladaEm: null,
    ...parcial,
  };
}

describe("etapa do funil", () => {
  it("segue o status da ordem", () => {
    expect(etapaFunil(ordem({ status: "rascunho", enviadaEm: null }), AGORA)).toBe("rascunho");
    expect(etapaFunil(ordem(), AGORA)).toBe("aguardando_abertura");
    expect(etapaFunil(ordem({ status: "visualizada" }), AGORA)).toBe("aberto");
    expect(etapaFunil(ordem({ status: "assinada" }), AGORA)).toBe("assinado");
    expect(etapaFunil(ordem({ status: "aguardando_pagamento" }), AGORA)).toBe("assinado");
    expect(etapaFunil(ordem({ status: "paga" }), AGORA)).toBe("pago");
    expect(etapaFunil(ordem({ status: "cancelada" }), AGORA)).toBe("cancelado");
    expect(etapaFunil(ordem({ status: "expirada" }), AGORA)).toBe("expirado");
  });

  it("trata link vencido antes da assinatura como expirado", () => {
    expect(etapaFunil(ordem({ status: "visualizada", expiraEm: antes(1) }), AGORA)).toBe(
      "expirado",
    );
    expect(etapaFunil(ordem({ status: "aguardando_pagamento", expiraEm: antes(1) }), AGORA)).toBe(
      "assinado",
    );
  });

  it("aceita datas serializadas como texto", () => {
    const passos = passosFunil(ordem({ visualizadaEm: antes(2).toISOString() }));
    expect(passos.map((passo) => passo.em !== null)).toEqual([true, true, false, false]);
  });
});

describe("filtros", () => {
  const ordens = [
    ordem(),
    ordem({ status: "visualizada" }),
    ordem({ status: "visualizada", expiraEm: antes(1) }),
    ordem({ status: "aguardando_pagamento" }),
    ordem({ status: "paga" }),
    ordem({ status: "cancelada" }),
  ];

  it("conta cada etapa", () => {
    expect(contarPorFiltro(ordens, AGORA)).toEqual({
      todos: 6,
      aguardando_abertura: 1,
      aberto: 1,
      assinado: 1,
      pago: 1,
    });
  });

  it("filtra pela etapa escolhida", () => {
    expect(filtrarPorEtapa(ordens, "aberto", AGORA)).toHaveLength(1);
    expect(filtrarPorEtapa(ordens, "todos", AGORA)).toHaveLength(6);
  });
});

describe("tempo relativo e resumo", () => {
  it("formata em min, h e dias", () => {
    expect(tempoRelativo(new Date(AGORA - 20_000), AGORA)).toBe("agora");
    expect(tempoRelativo(new Date(AGORA - 5 * 60_000), AGORA)).toBe("há 5 min");
    expect(tempoRelativo(antes(2), AGORA)).toBe("há 2 h");
    expect(tempoRelativo(antes(24), AGORA)).toBe("há 1 dia");
    expect(tempoRelativo(antes(80), AGORA)).toBe("há 3 dias");
    expect(tempoRelativo(new Date(AGORA + 3 * 3_600_000), AGORA)).toBe("em 3 h");
  });

  it("descreve a última etapa", () => {
    expect(resumoEtapa(ordem(), AGORA)).toBe("Enviado há 3 h, não aberto");
    expect(resumoEtapa(ordem({ status: "visualizada", visualizadaEm: antes(2) }), AGORA)).toBe(
      "Aberto há 2 h",
    );
    expect(resumoEtapa(ordem({ status: "paga", pagaEm: antes(1) }), AGORA)).toBe("Pago há 1 h");
  });

  it("formata a data no horário de Brasília", () => {
    expect(formatarDataHoraBrasilia(new Date("2026-10-20T17:05:00Z"))).toBe("20/10/2026, 14:05");
  });
});

describe("abertura do link", () => {
  it("ignora robôs de pré-visualização e aceita navegadores", () => {
    expect(ehRoboDePreview("WhatsApp/2.23.20.0 A")).toBe(true);
    expect(ehRoboDePreview("facebookexternalhit/1.1")).toBe(true);
    expect(ehRoboDePreview("TelegramBot (like TwitterBot)")).toBe(true);
    expect(
      ehRoboDePreview(
        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36",
      ),
    ).toBe(false);
    expect(ehRoboDePreview(null)).toBe(false);
  });
});
