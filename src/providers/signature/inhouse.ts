import { createHash, timingSafeEqual } from "node:crypto";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { AssinaturaConcluida, DadosAssinatura, SignatureProvider } from "./types";

const A4 = { largura: 595.28, altura: 841.89 };
const margem = 48;
const cor = rgb(0.12, 0.15, 0.2);
const dataBr = (data: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  }).format(data);

function textoSeguro(texto: string): string {
  return texto
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7e\u00a0-\u00ff\n]/g, "?");
}

function quebrarLinha(texto: string, fonte: PDFFont, tamanho: number, largura: number): string[] {
  const palavras = texto.split(/\s+/);
  const linhas: string[] = [];
  let atual = "";
  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (fonte.widthOfTextAtSize(tentativa, tamanho) > largura && atual) {
      linhas.push(atual);
      atual = palavra;
    } else atual = tentativa;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function linhasNaPagina(doc: PDFDocument, fonte: PDFFont, texto: string, tamanho = 11) {
  let pagina = doc.addPage([A4.largura, A4.altura]);
  let y = A4.altura - margem;
  for (const paragrafo of textoSeguro(texto).split("\n")) {
    const linhas = paragrafo
      ? quebrarLinha(paragrafo, fonte, tamanho, A4.largura - 2 * margem)
      : [""];
    for (const linha of linhas) {
      if (y < margem + 55) {
        pagina = doc.addPage([A4.largura, A4.altura]);
        y = A4.altura - margem;
      }
      if (linha) pagina.drawText(linha, { x: margem, y, size: tamanho, font: fonte, color: cor });
      y -= 16;
    }
    y -= 7;
  }
  return { pagina, y };
}

export class InHouseSignatureProvider implements SignatureProvider {
  readonly nome = "inhouse";

  async assinar(dados: DadosAssinatura): Promise<AssinaturaConcluida> {
    const assinadoEm = new Date();
    const contrato = await PDFDocument.create();
    const fonte = await contrato.embedFont(StandardFonts.Helvetica);
    let { pagina, y } = linhasNaPagina(contrato, fonte, dados.contratoHtmlOuTexto);
    if (dados.anexoPdf) {
      const anexo = await PDFDocument.load(dados.anexoPdf);
      const paginas = await contrato.copyPages(anexo, anexo.getPageIndices());
      for (const folha of paginas) contrato.addPage(folha);
      pagina = contrato.addPage([A4.largura, A4.altura]);
      y = A4.altura - margem;
    }
    if (y < 180) {
      pagina = contrato.addPage([A4.largura, A4.altura]);
      y = A4.altura - margem;
    }
    pagina.drawText("Assinatura do contratante", {
      x: margem,
      y: y - 10,
      size: 12,
      font: fonte,
      color: cor,
    });
    const imagem = await contrato.embedPng(dados.imagemPng);
    const escala = Math.min(240 / imagem.width, 90 / imagem.height, 1);
    pagina.drawImage(imagem, {
      x: margem,
      y: y - 115,
      width: imagem.width * escala,
      height: imagem.height * escala,
    });
    pagina.drawText(textoSeguro(`${dados.nome} - CPF ${dados.cpf} - ${dataBr(assinadoEm)}`), {
      x: margem,
      y: y - 132,
      size: 9,
      font: fonte,
      color: cor,
    });
    const pdfAssinado = await contrato.save();
    const hashSha256 = createHash("sha256").update(pdfAssinado).digest("hex");

    const evidencia = await PDFDocument.create();
    const fonteEvidencia = await evidencia.embedFont(StandardFonts.Helvetica);
    linhasNaPagina(
      evidencia,
      fonteEvidencia,
      [
        "EVIDÊNCIAS DA ASSINATURA ELETRÔNICA",
        "",
        `Ordem: ${dados.ordemId}`,
        `Signatário: ${dados.nome}`,
        `CPF: ${dados.cpf}`,
        `Data e hora: ${dataBr(assinadoEm)} (America/Sao_Paulo)`,
        `IP: ${dados.ip}`,
        `User-Agent: ${dados.userAgent}`,
        `Telefone do código: ${dados.telefoneOtp}`,
        `Código validado em: ${dataBr(dados.otpValidadoEm)}`,
        dados.geo
          ? `Geolocalização consentida: ${dados.geo.lat}, ${dados.geo.lng}; precisão ${dados.geo.precisao ?? "não informada"}`
          : "Geolocalização: não compartilhada",
        `SHA-256 do contrato assinado: ${hashSha256}`,
      ].join("\n"),
      10,
    );
    return { pdfAssinado, paginaEvidencias: await evidencia.save(), hashSha256, assinadoEm };
  }

  async verificar(pdf: Uint8Array, hashEsperado: string): Promise<boolean> {
    if (!/^[a-f0-9]{64}$/i.test(hashEsperado)) return false;
    const atual = createHash("sha256").update(pdf).digest();
    return timingSafeEqual(atual, Buffer.from(hashEsperado, "hex"));
  }
}
