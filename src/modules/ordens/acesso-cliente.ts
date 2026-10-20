import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/** Link-preview fetchers (WhatsApp, Facebook, Telegram...) and crawlers: they are not the client. */
const ROBOS =
  /^WhatsApp\/|facebookexternalhit|facebot|telegrambot|slackbot|twitterbot|linkedinbot|discordbot|skypeuripreview|googlebot|bingbot|\bbot\b|crawler|spider/i;

export function ehRoboDePreview(userAgent: string | null): boolean {
  return !!userAgent && ROBOS.test(userAgent);
}

/**
 * Whether this request on /c/[token] counts as the client opening the link. A logged-in panel
 * user (the admin checking the proposal) and link-preview robots do not.
 */
export async function acessoContaComoAbertura(): Promise<boolean> {
  let requestHeaders: Headers;
  try {
    requestHeaders = await headers();
  } catch {
    return true;
  }
  if (ehRoboDePreview(requestHeaders.get("user-agent"))) return false;
  try {
    return !(await auth.api.getSession({ headers: requestHeaders }));
  } catch {
    return true;
  }
}
