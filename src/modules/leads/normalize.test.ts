import { describe, expect, it } from "vitest";
import { normalizarLead } from "./normalize";

describe("normalização de leads Venancor", () => {
  it("aceita payload genérico da landing e preserva UTMs", () => {
    expect(
      normalizarLead({
        nome: "Ana Souza",
        whatsapp: "+55 (11) 98888-7777",
        perfil_interesse: "Familiar",
        idades: "35, 8",
        utm_source: "google",
      }),
    ).toMatchObject({
      nome: "Ana Souza",
      whatsapp: "11988887777",
      perfil: "Familiar",
      idades: "35, 8",
      utmSource: "google",
    });
  });
  it("aceita field_data da Meta", () => {
    expect(
      normalizarLead({
        field_data: [
          { name: "full_name", values: ["Bruno Lima"] },
          { name: "phone", values: ["5511999998888"] },
        ],
      }),
    ).toMatchObject({ nome: "Bruno Lima", whatsapp: "11999998888" });
  });
  it("aceita user_column_values do Google", () => {
    expect(
      normalizarLead({
        lead: {
          user_column_values: [
            { column_id: "nome", string_value: "Carla Alves" },
            { column_id: "telefone", string_value: "21987654321" },
          ],
        },
      }),
    ).toMatchObject({ nome: "Carla Alves", whatsapp: "21987654321" });
  });
  it("rejeita nome ou WhatsApp inválido", () => {
    expect(() => normalizarLead({ nome: "A", whatsapp: "123" })).toThrow();
  });
});
