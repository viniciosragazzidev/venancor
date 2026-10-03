import { expect, it } from "vitest";
import { renderizarContrato, variaveisContrato } from "./render";

it("substitui apenas variáveis permitidas e escapa valores", () => {
  const dados = Object.fromEntries(
    variaveisContrato.map((nome) => [nome, "Ana & Cia <script>"]),
  ) as Record<(typeof variaveisContrato)[number], string>;
  expect(renderizarContrato("{{cliente.nome}}", dados)).toBe("Ana &amp; Cia &lt;script&gt;");
  expect(() => renderizarContrato("{{segredo.chave}}", dados)).toThrow("não permitida");
});
