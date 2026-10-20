/** Public client link of an order (APP_URL/c/<token>). */
export function urlCliente(token: string) {
  const base = process.env.APP_URL ?? process.env.BETTER_AUTH_URL;
  if (!base) throw new Error("APP_URL não configurada");
  return new URL(`/c/${token}`, base).toString();
}
