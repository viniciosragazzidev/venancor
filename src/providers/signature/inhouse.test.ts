import { expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { InHouseSignatureProvider, linhasVerificacaoOtp } from "./inhouse";

const png = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==",
    "base64",
  ),
);

it("gera contrato assinado e evidências, verificando SHA-256", async () => {
  const provider = new InHouseSignatureProvider();
  const resultado = await provider.assinar({
    ordemId: "ordem-1",
    nome: "Ana Silva",
    cpf: "52998224725",
    telefoneOtp: "+5511999999999",
    otpValidadoEm: new Date(),
    imagemPng: png,
    ip: "127.0.0.1",
    userAgent: "Vitest",
    contratoHtmlOuTexto: "Contrato de prestação de serviços\nAna Silva aceita os termos.",
  });
  expect((await PDFDocument.load(resultado.pdfAssinado)).getPageCount()).toBeGreaterThan(0);
  expect((await PDFDocument.load(resultado.paginaEvidencias)).getPageCount()).toBeGreaterThan(0);
  expect(await provider.verificar(resultado.pdfAssinado, resultado.hashSha256)).toBe(true);
  expect(await provider.verificar(new Uint8Array([1, 2, 3]), resultado.hashSha256)).toBe(false);
});

it("gera evidências sem OTP quando a verificação por código está desligada", async () => {
  const dados = {
    ordemId: "ordem-2",
    nome: "Ana Silva",
    cpf: "52998224725",
    imagemPng: png,
    ip: "127.0.0.1",
    userAgent: "Vitest",
    contratoHtmlOuTexto: "Contrato aceito.",
  };
  expect(linhasVerificacaoOtp(dados)).toEqual(["Verificação por código: não utilizada"]);
  const resultado = await new InHouseSignatureProvider().assinar(dados);
  expect((await PDFDocument.load(resultado.paginaEvidencias)).getPageCount()).toBeGreaterThan(0);
});
