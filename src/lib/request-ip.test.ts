import { expect, it } from "vitest";
import { ipDaRequisicao } from "./request-ip";

it("prefere o IP da Vercel e ignora x-forwarded-for fornecido pelo cliente", () => {
  expect(
    ipDaRequisicao(
      new Headers({
        "x-vercel-forwarded-for": "203.0.113.2, 10.0.0.1",
        "x-forwarded-for": "198.51.100.8",
      }),
    ),
  ).toBe("203.0.113.2");
  expect(ipDaRequisicao(new Headers({ "x-forwarded-for": "198.51.100.8" }))).toBe("desconhecido");
});
