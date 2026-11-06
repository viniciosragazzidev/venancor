import { describe, expect, it } from "vitest";

import { decidirLinkAtual } from "./link-estavel";

const agora = new Date("2026-11-06T15:00:00Z");
const em = (horas: number) => new Date(agora.getTime() + horas * 3_600_000);

describe("decidirLinkAtual", () => {
  it("ordem vencida antes de assinar não é reaberta ao copiar", () => {
    expect(decidirLinkAtual({ status: "enviada", expiraEm: em(-1), agora })).toBe("vencido");
    expect(decidirLinkAtual({ status: "visualizada", expiraEm: em(-48), agora })).toBe("vencido");
  });

  it("prazo acabando em menos de 24 h renova sem trocar o link; com folga só usa", () => {
    expect(decidirLinkAtual({ status: "enviada", expiraEm: em(5), agora })).toBe("renovar");
    expect(decidirLinkAtual({ status: "rascunho", expiraEm: em(72), agora })).toBe("usar");
  });

  it("assinada aguardando pagamento usa o mesmo link até 30 dias depois do prazo, sem estender", () => {
    expect(decidirLinkAtual({ status: "aguardando_pagamento", expiraEm: em(-24 * 10), agora })).toBe("usar");
    expect(decidirLinkAtual({ status: "aguardando_pagamento", expiraEm: em(-24 * 31), agora })).toBe("vencido");
  });
});
