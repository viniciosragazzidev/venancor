import { mensagemParaCliente } from "@/lib/resultado-acao";

export const MAX_CLIENTES_ORDEM_LOTE = 50;

export interface ClienteOrdemLote {
  id: string;
  nome: string;
}

export interface OrdemCriadaLote {
  ordemId: string;
  numero: number;
}

export interface ResultadoCriacaoOrdensLote {
  criadas: Array<ClienteOrdemLote & OrdemCriadaLote>;
  falhas: Array<ClienteOrdemLote & { erro: string }>;
}

/** Processes in selection order and isolates each client failure. */
export async function executarCriacaoOrdensLote(
  clientes: readonly ClienteOrdemLote[],
  criar: (cliente: ClienteOrdemLote) => Promise<OrdemCriadaLote>,
): Promise<ResultadoCriacaoOrdensLote> {
  const resultado: ResultadoCriacaoOrdensLote = { criadas: [], falhas: [] };
  for (const cliente of clientes) {
    try {
      resultado.criadas.push({ ...cliente, ...(await criar(cliente)) });
    } catch (erro) {
      resultado.falhas.push({
        ...cliente,
        erro: mensagemParaCliente(erro, { validacao: "campo" }),
      });
    }
  }
  return resultado;
}
