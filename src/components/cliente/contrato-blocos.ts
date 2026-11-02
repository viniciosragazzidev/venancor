/**
 * Turns the rendered contract (plain text, one statement per line) into blocks the client page can
 * lay out as a document: title, sections, "label: value" fields, lettered items and paragraphs.
 * Any template works; lines that match no pattern are plain paragraphs.
 */

export type BlocoContrato =
  | { tipo: "campo"; rotulo: string; valor: string }
  | { tipo: "item"; marcador: string; texto: string }
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "paragrafo"; texto: string };

export type SecaoContrato = {
  id: string;
  /** "Cláusula 1ª", "1" or null for untitled parts. */
  rotulo: string | null;
  titulo: string;
  /** Short name for the index chips. */
  curto: string;
  blocos: BlocoContrato[];
};

export type ContratoEstruturado = {
  titulo: string[];
  meta: string[];
  secoes: SecaoContrato[];
};

const SIGLAS = new Set([
  "ANS",
  "LGPD",
  "CDC",
  "CPF",
  "RG",
  "CNPJ",
  "CEP",
  "PIX",
  "SPC",
  "MP",
  "RN",
]);

const decodificar = (texto: string) =>
  texto
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

const temLetras = (texto: string) => /\p{L}/u.test(texto);
const emCaixaAlta = (texto: string) =>
  temLetras(texto) && texto === texto.toLocaleUpperCase("pt-BR");

/** "DADOS DA PROPOSTA" -> "Dados da proposta", keeping acronyms. */
export function capitalizar(texto: string): string {
  const palavras = texto.toLocaleLowerCase("pt-BR").split(/(\s+|\/|-)/);
  const resultado = palavras
    .map((palavra) => {
      const sigla = palavra.toLocaleUpperCase("pt-BR");
      return SIGLAS.has(sigla.replace(/[^\p{L}]/gu, "")) ? sigla : palavra;
    })
    .join("");
  return resultado.charAt(0).toLocaleUpperCase("pt-BR") + resultado.slice(1);
}

const idSecao = (indice: number) => `secao-${indice + 1}`;

export function estruturarContrato(texto: string): ContratoEstruturado {
  const linhas = decodificar(texto)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((linha) => linha.trim());
  const contrato: ContratoEstruturado = { titulo: [], meta: [], secoes: [] };
  let atual: SecaoContrato | null = null;

  const abrirSecao = (rotulo: string | null, titulo: string, curto: string) => {
    atual = { id: idSecao(contrato.secoes.length), rotulo, titulo, curto, blocos: [] };
    contrato.secoes.push(atual);
  };
  const adicionar = (bloco: BlocoContrato) => {
    if (!atual) abrirSecao(null, "Contrato", "Contrato");
    atual!.blocos.push(bloco);
  };

  for (const linha of linhas) {
    if (!linha) continue;

    const clausula = linha.match(/^(CL[ÁA]USULA\s+\S+)\s*[-–—:]\s*(.+)$/iu);
    if (clausula) {
      const titulo = capitalizar(clausula[2]);
      abrirSecao(capitalizar(clausula[1]), titulo, capitalizar(clausula[1]));
      continue;
    }

    const numerada = linha.match(/^(\d{1,2})\.\s+(.+)$/);
    if (numerada && emCaixaAlta(numerada[2])) {
      const titulo = capitalizar(numerada[2]);
      abrirSecao(numerada[1], titulo, titulo.split(/\s+\/\s+|\s+e\s+/)[0]);
      continue;
    }

    if (emCaixaAlta(linha) && linha.length >= 6 && linha.length <= 90 && !linha.includes(":")) {
      if (!contrato.secoes.length) contrato.titulo.push(capitalizar(linha));
      else abrirSecao(null, capitalizar(linha), capitalizar(linha));
      continue;
    }

    if (!contrato.secoes.length && /^proposta\s/i.test(linha)) {
      contrato.meta.push(linha);
      continue;
    }

    const item = linha.match(/^([a-z]|\d{1,2})\)\s+(.+)$/);
    if (item) {
      adicionar({ tipo: "item", marcador: item[1], texto: item[2] });
      continue;
    }

    if (linha.endsWith(":") && linha.length <= 80) {
      adicionar({ tipo: "subtitulo", texto: linha.slice(0, -1) });
      continue;
    }

    const campo = linha.match(/^([^:.]{2,60}):\s+(.+)$/);
    if (campo) {
      adicionar({ tipo: "campo", rotulo: campo[1], valor: campo[2] });
      continue;
    }

    adicionar({ tipo: "paragrafo", texto: linha });
  }

  // A heading followed directly by another (e.g. "TERMOS E CONDIÇÕES" before clause 1) is a divider
  // with no text of its own: drop it and renumber.
  contrato.secoes = contrato.secoes
    .filter((secao) => secao.blocos.length > 0)
    .map((secao, indice) => ({ ...secao, id: idSecao(indice) }));
  return contrato;
}
