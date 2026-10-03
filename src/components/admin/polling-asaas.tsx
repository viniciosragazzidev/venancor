"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PollingAsaas({ ativo }: { ativo: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!ativo) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) router.refresh();
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [ativo, router]);
  return null;
}
