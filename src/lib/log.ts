const cpfPattern = /\b\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[-.\s]?\d{2}\b/g;
const otpPattern = /((?:otp|c[oó]digo)[\s:="']+)(\d{6})/gi;

export function mascararSensivel(valor: unknown): string {
  const texto = typeof valor === "string" ? valor : (JSON.stringify(valor) ?? String(valor));
  return texto.replace(cpfPattern, "###.***.***-##").replace(otpPattern, "$1******");
}

export const log = {
  info: (...valores: unknown[]) => console.info(...valores.map(mascararSensivel)),
  warn: (...valores: unknown[]) => console.warn(...valores.map(mascararSensivel)),
  error: (...valores: unknown[]) => console.error(...valores.map(mascararSensivel)),
};
