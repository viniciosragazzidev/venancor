export interface DadosAssinatura {
  ordemId: string;
  nome: string;
  cpf: string;
  telefoneOtp: string;
  otpValidadoEm: Date;
  imagemPng: Uint8Array;
  ip: string;
  userAgent: string;
  geo?: { lat: number; lng: number; precisao?: number };
  contratoHtmlOuTexto: string;
  anexoPdf?: Uint8Array;
  modoTeste?: boolean;
}
export interface AssinaturaConcluida {
  providerRef?: string;
  pdfAssinado: Uint8Array;
  paginaEvidencias: Uint8Array;
  hashSha256: string;
  assinadoEm: Date;
}
export interface SignatureProvider {
  readonly nome: string;
  assinar(dados: DadosAssinatura): Promise<AssinaturaConcluida>;
  verificar(pdf: Uint8Array, hashEsperado: string): Promise<boolean>;
}
