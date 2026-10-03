export const modoTesteAtivo = () => process.env.NEXT_PUBLIC_MODO_TESTE === "true";

export const fakePermitido = () => process.env.NODE_ENV !== "production" || modoTesteAtivo();

export const codigoOtpDeTeste = (codigo: string, provedor: string) =>
  fakePermitido() && provedor === "fake" ? codigo : undefined;
