export const variaveisContrato = [
  "cliente.nome",
  "cliente.cpf",
  "cliente.rg",
  "cliente.nascimento",
  "cliente.mae",
  "cliente.estado_civil",
  "cliente.email",
  "cliente.telefone",
  "cliente.endereco",
  "operadora.nome",
  "plano.nome",
  "plano.rede",
  "plano.abrangencia",
  "plano.carencias",
  "plano.coberturas",
  "proposta.numero",
  "vigencia.inicio",
  "pagamento.vencimento",
  "pagamento.formas",
  "valor.total",
  "valor.mensal",
  "valor.adesao",
  "beneficiarios.quantidade",
  "beneficiarios.tabela",
  "dependentes.lista",
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
