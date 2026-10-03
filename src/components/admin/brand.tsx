import { HeartPulseIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
        <HeartPulseIcon aria-hidden className="size-4.5" strokeWidth={2} />
      </span>
      <span className="flex flex-col gap-0.5 leading-none">
        <span className="font-heading text-sm font-semibold">MedLink</span>
        <span className="text-[11px] text-muted-foreground">Gestão de planos de saúde</span>
      </span>
    </div>
  );
}
