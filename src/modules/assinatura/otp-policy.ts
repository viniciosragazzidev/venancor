import { ErroNegocio } from "@/lib/resultado-acao";

export const assinaturaExigeOtp = () => process.env.ASSINATURA_EXIGE_OTP === "true";

export async function obterOtpParaAssinatura<T>(
  buscarOtp: () => Promise<T | null>,
): Promise<T | null> {
  if (!assinaturaExigeOtp()) return null;
  const otp = await buscarOtp();
  if (!otp) throw new ErroNegocio("Código de confirmação não validado. Peça um novo código.");
  return otp;
}
