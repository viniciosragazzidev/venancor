import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

import { barrasItf, formatarLinha } from "./febraban";

/** Boleto com a cara da Venacor (04/11). Linha e código de barras vêm do Asaas e já conferidos. */
export type DadosBoletoPdf = {
  linhaDigitavel: string;
  codigoBarras: string;
  valorCentavos: number;
  vencimento: string; // AAAA-MM-DD
  pagador: { nome: string; cpf: string };
  beneficiario?: { nome: string; documento?: string };
  plano: string;
  operadora: string;
  numeroProposta: number;
  nossoNumero?: string;
  pix?: { payload: string; qrPngBase64?: string };
  logoVenacor?: Uint8Array;
  logoOperadora?: Uint8Array;
};

const A4 = { largura: 595.28, altura: 841.89 };
const M = 40;
const azul = rgb(0.31, 0.56, 0.87);
const azulClaro = rgb(0.93, 0.96, 1);
const tinta = rgb(0.09, 0.11, 0.16);
const cinza = rgb(0.42, 0.45, 0.5);
const linhaCor = rgb(0.88, 0.9, 0.93);
const branco = rgb(1, 1, 1);
const preto = rgb(0, 0, 0);

const brl = (centavos: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(centavos / 100)
    .replace(/ /g, " ");
const dataBr = (iso: string) => {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
};
const cpfFormatado = (cpf: string) => {
  const d = cpf.replace(/\D/g, "");
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : cpf;
};
const docFormatado = (doc: string) => {
  const d = doc.replace(/\D/g, "");
  if (d.length === 14)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return cpfFormatado(d);
};
/** Só caracteres que a fonte padrão do PDF (WinAnsi) desenha. */
const seguro = (texto: string) => texto.replace(/[–—]/g, "-").replace(/[^\x20-\x7e -ÿ]/g, "?");

function quebrar(texto: string, fonte: PDFFont, tamanho: number, largura: number) {
  const linhas: string[] = [];
  let atual = "";
  for (const char of seguro(texto)) {
    if (fonte.widthOfTextAtSize(atual + char, tamanho) > largura) {
      linhas.push(atual);
      atual = char;
    } else atual += char;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function desenharLogo(
  pagina: PDFPage,
  imagem: PDFImage,
  x: number,
  yTopo: number,
  maxL: number,
  maxA: number,
  alinharDireita = false,
) {
  const escala = Math.min(maxL / imagem.width, maxA / imagem.height);
  const l = imagem.width * escala;
  const a = imagem.height * escala;
  pagina.drawImage(imagem, {
    x: alinharDireita ? x - l : x,
    y: yTopo - a - (maxA - a) / 2,
    width: l,
    height: a,
  });
}

export async function gerarBoletoPdf(dados: DadosBoletoPdf): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Boleto - Proposta ${dados.numeroProposta}`);
  doc.setAuthor("Venacor Corretora");
  const pagina = doc.addPage([A4.largura, A4.altura]);
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const negrito = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.CourierBold);
  const largura = A4.largura - 2 * M;
  const texto = (t: string, x: number, y: number, tamanho: number, fonte = normal, cor = tinta) =>
    pagina.drawText(seguro(t), { x, y, size: tamanho, font: fonte, color: cor });
  const separador = (y: number) =>
    pagina.drawLine({
      start: { x: M, y },
      end: { x: A4.largura - M, y },
      thickness: 1,
      color: linhaCor,
    });

  // Cabeçalho: Venacor à esquerda, operadora do plano à direita.
  let y = A4.altura - M;
  const logoVenacor = dados.logoVenacor
    ? await doc.embedPng(dados.logoVenacor).catch(() => null)
    : null;
  if (logoVenacor) desenharLogo(pagina, logoVenacor, M, y, 150, 44);
  else texto("Venacor", M, y - 30, 24, negrito, azul);
  const logoOperadora = dados.logoOperadora
    ? await doc.embedPng(dados.logoOperadora).catch(() => null)
    : null;
  if (logoOperadora) desenharLogo(pagina, logoOperadora, A4.largura - M, y, 130, 44, true);
  else {
    const t = seguro(dados.operadora);
    texto(t, A4.largura - M - negrito.widthOfTextAtSize(t, 12), y - 28, 12, negrito, cinza);
  }
  y -= 64;
  separador(y);

  // Destaque: valor e vencimento.
  y -= 22;
  texto("Boleto de pagamento", M, y - 4, 20, negrito);
  texto(`${dados.plano} · Proposta nº ${dados.numeroProposta}`, M, y - 24, 11, normal, cinza);
  y -= 46;
  const alturaCartao = 86;
  pagina.drawRectangle({
    x: M,
    y: y - alturaCartao,
    width: largura,
    height: alturaCartao,
    color: azulClaro,
  });
  texto("Valor", M + 20, y - 26, 10, normal, cinza);
  texto(brl(dados.valorCentavos), M + 20, y - 62, 30, negrito, azul);
  const xVenc = M + largura / 2 + 20;
  texto("Vencimento", xVenc, y - 26, 10, normal, cinza);
  texto(dataBr(dados.vencimento), xVenc, y - 62, 30, negrito);
  y -= alturaCartao + 26;

  // Pagador e beneficiário.
  const coluna = (titulo: string, linhas: string[], x: number, topo: number) => {
    texto(titulo, x, topo, 9, negrito, cinza);
    linhas.forEach((l, i) => texto(l, x, topo - 16 - i * 14, 11, i === 0 ? negrito : normal));
  };
  coluna("Pagador", [dados.pagador.nome, `CPF ${cpfFormatado(dados.pagador.cpf)}`], M, y);
  const benef = dados.beneficiario
    ? [
        dados.beneficiario.nome,
        ...(dados.beneficiario.documento ? [docFormatado(dados.beneficiario.documento)] : []),
      ]
    : ["Venacor Corretora"];
  coluna("Beneficiário", benef, M + largura / 2 + 20, y);
  y -= 56;
  const extras = [
    `Banco ${dados.codigoBarras.slice(0, 3)}`,
    ...(dados.nossoNumero ? [`Nosso número ${dados.nossoNumero}`] : []),
    `Operadora ${dados.operadora}`,
  ].join("   ·   ");
  texto(extras, M, y, 9, normal, cinza);
  y -= 22;
  separador(y);

  // Linha digitável e código de barras.
  y -= 26;
  texto("Pague no app do banco ou na lotérica", M, y, 12, negrito);
  y -= 22;
  texto("Linha digitável", M, y, 9, normal, cinza);
  y -= 20;
  const linhaFmt = formatarLinha(dados.linhaDigitavel);
  let tamanhoLinha = 13;
  while (mono.widthOfTextAtSize(linhaFmt, tamanhoLinha) > largura && tamanhoLinha > 8)
    tamanhoLinha -= 0.5;
  texto(linhaFmt, M, y, tamanhoLinha, mono);
  y -= 22;
  // ITF no tamanho Febraban: fina 0,254 mm (0,72 pt), larga 3x, altura 13 mm, com zona branca.
  const fina = 0.72;
  const alturaBarras = 36.85;
  const barras = barrasItf(dados.codigoBarras);
  const larguraBarras = barras.reduce((a, b) => a + b, 0) * fina;
  pagina.drawRectangle({
    x: M - 2,
    y: y - alturaBarras - 8,
    width: larguraBarras + 22,
    height: alturaBarras + 16,
    color: branco,
  });
  let x = M + 8;
  barras.forEach((modulos, i) => {
    const w = modulos * fina;
    if (i % 2 === 0)
      pagina.drawRectangle({
        x,
        y: y - alturaBarras,
        width: w,
        height: alturaBarras,
        color: preto,
      });
    x += w;
  });
  y -= alturaBarras + 30;

  // Pix do mesmo boleto, quando o Asaas devolve.
  if (dados.pix?.payload) {
    separador(y + 8);
    y -= 18;
    texto("Ou pague com Pix", M, y, 12, negrito);
    const lado = 120;
    let xTexto = M;
    if (dados.pix.qrPngBase64) {
      const qr = await doc.embedPng(Buffer.from(dados.pix.qrPngBase64, "base64")).catch(() => null);
      if (qr) {
        pagina.drawImage(qr, { x: M, y: y - 12 - lado, width: lado, height: lado });
        xTexto = M + lado + 20;
      }
    }
    texto("Pix copia e cola", xTexto, y - 26, 9, normal, cinza);
    quebrar(dados.pix.payload, normal, 8, A4.largura - M - xTexto)
      .slice(0, 8)
      .forEach((l, i) => texto(l, xTexto, y - 42 - i * 11, 8));
  }

  // Rodapé.
  const rodape = [
    "Pagamento processado pelo Asaas. Pix é confirmado na hora; boleto em até 3 dias úteis.",
    "Confira o valor e o beneficiário antes de pagar. Dúvidas: fale com a Venacor pelo WhatsApp.",
  ];
  rodape.forEach((l, i) => texto(l, M, M + 14 - i * 12, 8, normal, cinza));

  return doc.save();
}
