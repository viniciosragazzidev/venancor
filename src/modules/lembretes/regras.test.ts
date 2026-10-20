import { describe, expect, it } from "vitest";
import {
  avaliarLembrete,
  emHorarioSilencioso,
  fimDoVencimento,
  formatarPrazo,
  horaSaoPaulo,
  lembreteDisponivel,
  type LembreteRegistrado,
  type OrdemLembrete,
} from "./regras";

const HORA = 3_600_000;
// 2026-10-20 14:00 in São Paulo (17:00 UTC): inside the sending window.
const AGORA = new Date("2026-10-20T17:00:00Z");
const antes = (horas: number) => new Date(AGORA.getTime() - horas * HORA);
const depois = (horas: number) => new Date(AGORA.getTime() + horas * HORA);

function ordem(parcial: Partial<OrdemLembrete> = {}): OrdemLembrete {
  return {
    status: "enviada",
    expiraEm: depois(5 * 24),
    enviadaEm: antes(30),
    visualizadaEm: null,
    assinadaEm: null,
    vencimentoCobranca: null,
    ...parcial,
  };
}

const lembrete = (tipo: LembreteRegistrado["tipo"], horasAtras: number): LembreteRegistrado => ({
  tipo,
  enviadoEm: antes(horasAtras),
});

describe("horário silencioso (America/Sao_Paulo)", () => {
  it("bloqueia entre 20h e 8h e libera entre 8h e 20h", () => {
    expect(horaSaoPaulo(new Date("2026-10-20T11:00:00Z"))).toBe(8);
    expect(emHorarioSilencioso(new Date("2026-10-20T10:59:00Z"))).toBe(true); // 07:59
    expect(emHorarioSilencioso(new Date("2026-10-20T11:00:00Z"))).toBe(false); // 08:00
    expect(emHorarioSilencioso(new Date("2026-10-20T22:59:00Z"))).toBe(false); // 19:59
    expect(emHorarioSilencioso(new Date("2026-10-20T23:00:00Z"))).toBe(true); // 20:00
    expect(emHorarioSilencioso(new Date("2026-10-21T03:00:00Z"))).toBe(true); // 00:00
  });

  it("vale também para o envio manual", () => {
    const noite = new Date("2026-10-21T01:00:00Z");
    expect(avaliarLembrete(ordem(), [], noite, "manual")).toEqual({
      enviar: false,
      motivo: "horario_silencioso",
    });
  });
});

describe("sem assinatura", () => {
  it("lembra 24h depois do envio quando o cliente não abriu", () => {
    expect(avaliarLembrete(ordem({ enviadaEm: antes(25) }), [], AGORA, "automatico")).toMatchObject(
      { enviar: true, tipo: "sem_assinatura" },
    );
  });

  it("conta as 24h a partir da abertura, que é a última etapa", () => {
    const aberta = ordem({ status: "visualizada", enviadaEm: antes(40), visualizadaEm: antes(10) });
    expect(avaliarLembrete(aberta, [], AGORA, "automatico")).toEqual({
      enviar: false,
      motivo: "aguardando",
    });
    expect(
      avaliarLembrete({ ...aberta, visualizadaEm: antes(24) }, [], AGORA, "automatico"),
    ).toMatchObject({ enviar: true, tipo: "sem_assinatura" });
  });

  it("não repete o mesmo tipo de lembrete", () => {
    expect(
      avaliarLembrete(
        ordem({ enviadaEm: antes(80) }),
        [lembrete("sem_assinatura", 50)],
        AGORA,
        "automatico",
      ),
    ).toEqual({ enviar: false, motivo: "ja_lembrado" });
  });

  it("usa a validade do link como prazo", () => {
    const resultado = avaliarLembrete(ordem(), [], AGORA, "automatico");
    expect(resultado).toMatchObject({ enviar: true, prazo: depois(5 * 24) });
  });

  it("bloqueia link já expirado", () => {
    expect(avaliarLembrete(ordem({ expiraEm: antes(1) }), [], AGORA, "manual")).toEqual({
      enviar: false,
      motivo: "link_expirado",
    });
  });
});

describe("sem pagamento", () => {
  const assinada = (horas: number, parcial: Partial<OrdemLembrete> = {}) =>
    ordem({
      status: "aguardando_pagamento",
      enviadaEm: antes(100),
      visualizadaEm: antes(90),
      assinadaEm: antes(horas),
      ...parcial,
    });

  it("lembra 24h depois da assinatura, mesmo já tendo lembrado da assinatura", () => {
    expect(avaliarLembrete(assinada(23), [], AGORA, "automatico")).toEqual({
      enviar: false,
      motivo: "aguardando",
    });
    expect(
      avaliarLembrete(assinada(24), [lembrete("sem_assinatura", 60)], AGORA, "automatico"),
    ).toMatchObject({ enviar: true, tipo: "sem_pagamento" });
  });

  it("para assim que a ordem é paga", () => {
    expect(avaliarLembrete(assinada(48, { status: "paga" }), [], AGORA, "automatico")).toEqual({
      enviar: false,
      motivo: "finalizada",
    });
  });

  it("usa o vencimento do Pix/boleto como prazo", () => {
    const resultado = avaliarLembrete(
      assinada(30, { vencimentoCobranca: "2026-10-23" }),
      [],
      AGORA,
      "automatico",
    );
    expect(resultado).toMatchObject({ enviar: true, prazo: fimDoVencimento("2026-10-23") });
    if (resultado.enviar) expect(formatarPrazo(resultado.prazo)).toBe("23/10/2026");
  });
});

describe("vencimento próximo", () => {
  it("lembra uma vez quando o Pix/boleto vence em até 24h", () => {
    const vencendo = ordem({
      status: "aguardando_pagamento",
      assinadaEm: antes(8),
      vencimentoCobranca: "2026-10-20",
    });
    expect(avaliarLembrete(vencendo, [], AGORA, "automatico")).toMatchObject({
      enviar: true,
      tipo: "vencimento",
    });
    expect(
      avaliarLembrete(vencendo, [lembrete("vencimento", 30)], AGORA, "automatico"),
    ).toMatchObject({ enviar: false });
  });

  it("lembra quando o link expira em até 24h, mas não logo depois do envio", () => {
    const expirando = ordem({ enviadaEm: antes(8), expiraEm: depois(10) });
    expect(avaliarLembrete(expirando, [], AGORA, "automatico")).toMatchObject({
      enviar: true,
      tipo: "vencimento",
    });
    expect(avaliarLembrete({ ...expirando, enviadaEm: antes(2) }, [], AGORA, "automatico")).toEqual(
      { enviar: false, motivo: "aguardando" },
    );
  });

  it("respeita 24h desde o último lembrete automático", () => {
    const expirando = ordem({ enviadaEm: antes(40), expiraEm: depois(10) });
    expect(
      avaliarLembrete(expirando, [lembrete("sem_assinatura", 5)], AGORA, "automatico"),
    ).toEqual({ enviar: false, motivo: "aguardando" });
  });
});

describe("limite e status", () => {
  it("nunca passa de 2 lembretes, nem no manual", () => {
    const historico = [lembrete("sem_assinatura", 60), lembrete("vencimento", 30)];
    expect(avaliarLembrete(ordem({ enviadaEm: antes(100) }), historico, AGORA, "manual")).toEqual({
      enviar: false,
      motivo: "limite",
    });
  });

  it("nunca para ordem paga, cancelada, expirada ou rascunho", () => {
    for (const status of ["paga", "cancelada", "expirada"])
      expect(avaliarLembrete(ordem({ status }), [], AGORA, "manual")).toEqual({
        enviar: false,
        motivo: "finalizada",
      });
    expect(avaliarLembrete(ordem({ status: "rascunho" }), [], AGORA, "manual")).toEqual({
      enviar: false,
      motivo: "nao_enviada",
    });
  });

  it("o manual pula a espera de 24h", () => {
    const recente = ordem({ enviadaEm: antes(1) });
    expect(avaliarLembrete(recente, [], AGORA, "automatico")).toMatchObject({ enviar: false });
    expect(avaliarLembrete(recente, [], AGORA, "manual")).toMatchObject({
      enviar: true,
      tipo: "sem_assinatura",
    });
    expect(
      avaliarLembrete(recente, [lembrete("sem_assinatura", 1)], AGORA, "manual"),
    ).toMatchObject({ enviar: true });
  });

  it("o botão só aparece quando a ordem ainda pode ser lembrada", () => {
    const agora = AGORA.getTime();
    expect(lembreteDisponivel({ status: "visualizada", expiraEm: depois(5) }, 0, agora)).toBe(true);
    expect(lembreteDisponivel({ status: "visualizada", expiraEm: antes(5) }, 0, agora)).toBe(false);
    expect(
      lembreteDisponivel({ status: "aguardando_pagamento", expiraEm: antes(5) }, 1, agora),
    ).toBe(true);
    expect(lembreteDisponivel({ status: "enviada", expiraEm: depois(5) }, 2, agora)).toBe(false);
    expect(lembreteDisponivel({ status: "paga", expiraEm: depois(5) }, 0, agora)).toBe(false);
  });
});
