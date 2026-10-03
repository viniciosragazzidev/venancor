"use client";

import { CheckIcon, LockIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type PassoStepper = { id: string; label: string };

export function Stepper({
  passos,
  atual,
  bloqueadoApos,
  className,
}: {
  passos: PassoStepper[];
  atual: number;
  bloqueadoApos?: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex w-full items-start", className)} aria-label="Progresso">
      {passos.map((passo, indice) => {
        const concluido = indice < atual;
        const corrente = indice === atual;
        const bloqueado = bloqueadoApos !== undefined && indice > bloqueadoApos;
        return (
          <li
            key={passo.id}
            aria-current={corrente ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-1.5"
          >
            {indice > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-3.5 right-1/2 left-[-50%] h-0.5",
                  indice <= atual ? "bg-foreground" : "bg-border",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 grid size-7 place-items-center rounded-full border text-xs font-medium transition-colors",
                concluido && "border-foreground bg-foreground text-background",
                corrente && "border-foreground bg-foreground text-background",
                !concluido && !corrente && "border-border bg-card text-muted-foreground",
              )}
            >
              {concluido ? (
                <CheckIcon aria-hidden className="size-3.5" strokeWidth={1.5} />
              ) : bloqueado ? (
                <LockIcon aria-hidden className="size-3" strokeWidth={1.5} />
              ) : (
                indice + 1
              )}
            </span>
            <span
              className={cn(
                "text-center text-[11px] leading-tight",
                corrente ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {passo.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
