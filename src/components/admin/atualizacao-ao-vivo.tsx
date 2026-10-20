"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Refreshes the server data of the page every `intervaloMs` while the tab is visible (and right
 * away when the tab comes back). router.refresh keeps client state, so open dialogs and forms
 * are not lost.
 */
export function AtualizacaoAoVivo({ intervaloMs = 30_000 }: { intervaloMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) router.refresh();
    }, intervaloMs);
    const aoVoltar = () => {
      if (!document.hidden) router.refresh();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [intervaloMs, router]);
  return null;
}
