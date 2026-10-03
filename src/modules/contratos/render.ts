export const variaveisContrato = [
  "cliente.nome",
  "cliente.cpf",
  "plano.nome",
  "valor.total",
  "valor.mensal",
  "valor.adesao",
  "beneficiarios.tabela",
  "data.hoje",
] as const;
export type VariavelContrato = (typeof variaveisContrato)[number];

const whitelist = new Set<string>(variaveisContrato);
const escapar = (valor: string) =>
  valor.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] ?? char,
  );

export function renderizarContrato(
  modelo: string,
  dados: Record<VariavelContrato, string>,
): string {
  return modelo.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, nome: string) => {
    if (!whitelist.has(nome)) throw new Error(`Variável de contrato não permitida: ${nome}`);
    return escapar(dados[nome as VariavelContrato]);
  });
}
