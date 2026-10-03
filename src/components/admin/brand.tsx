import { Logo } from "@/components/logo";

import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return <Logo className={cn("h-9 w-auto", className)} />;
}
