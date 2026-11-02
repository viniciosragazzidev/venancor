"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { BlocoContrato, ContratoEstruturado, SecaoContrato } from "./contrato-blocos";

/**
 * The contract laid out as a document: section headings, "label: value" fields in a grid,
 * lettered items and paragraphs. Each section fades in the first time it scrolls into view.
 */
export const DocumentoContrato = forwardRef<
  HTMLDivElement,
  {
    contrato: ContratoEstruturado;
    planoNome: string;
    prefixoId: string;
    raiz: React.RefObject<HTMLElement | null>;
  }
>(function DocumentoContrato({ contrato, planoNome, prefixoId, raiz }, ref) {
  const reduzir = useReducedMotion();

  return (
    <div ref={ref} className="flex flex-col gap-8">
      {contrato.titulo.length ? (
        <header className="flex flex-col gap-2 border-b border-border/70 pb-6">
          <h2 className="text-lg leading-snug font-medium text-balance">{contrato.titulo[0]}</h2>
          <p className="text-sm text-muted-foreground">{planoNome}</p>
          {contrato.meta.length ? (
            <p className="text-xs text-muted-foreground tabular-nums">
              {contrato.meta.join(" · ")}
            </p>
          ) : null}
        </header>
      ) : null}

      {contrato.secoes.map((secao) => (
        <motion.section
          key={secao.id}
          id={`${prefixoId}-${secao.id}`}
          data-secao={secao.id}
          className="scroll-mt-4"
          initial={reduzir ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ root: raiz, once: true, amount: 0.15 }}
          transition={{ type: "spring", duration: 0.45, bounce: 0 }}
        >
          <CabecalhoSecao secao={secao} />
          <ConteudoSecao blocos={secao.blocos} />
        </motion.section>
      ))}
    </div>
  );
});

function CabecalhoSecao({ secao }: { secao: SecaoContrato }) {
  return (
    <div className="mb-3 flex items-baseline gap-2.5">
      {secao.rotulo ? (
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary tabular-nums">
          {secao.rotulo}
        </span>
      ) : null}
      <h3 className="text-[15px] leading-snug font-medium text-pretty">{secao.titulo}</h3>
    </div>
  );
}

/** Consecutive fields become one grid; consecutive items one list. */
function agrupar(blocos: BlocoContrato[]) {
  const grupos: (
    | { tipo: "campos"; itens: Extract<BlocoContrato, { tipo: "campo" }>[] }
    | { tipo: "itens"; itens: Extract<BlocoContrato, { tipo: "item" }>[] }
    | Extract<BlocoContrato, { tipo: "paragrafo" | "subtitulo" }>
  )[] = [];
  for (const bloco of blocos) {
    const ultimo = grupos.at(-1);
    if (bloco.tipo === "campo") {
      if (ultimo?.tipo === "campos") ultimo.itens.push(bloco);
      else grupos.push({ tipo: "campos", itens: [bloco] });
    } else if (bloco.tipo === "item") {
      if (ultimo?.tipo === "itens") ultimo.itens.push(bloco);
      else grupos.push({ tipo: "itens", itens: [bloco] });
    } else grupos.push(bloco);
  }
  return grupos;
}

function ConteudoSecao({ blocos }: { blocos: BlocoContrato[] }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground/85">
      {agrupar(blocos).map((grupo, indice) => {
        switch (grupo.tipo) {
          case "campos":
            return (
              <dl
                key={indice}
                className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/60 sm:grid-cols-2"
              >
                {grupo.itens.map((campo, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 bg-background px-4 py-3 sm:last:odd:col-span-2"
                  >
                    <dt className="text-xs text-muted-foreground">{campo.rotulo}</dt>
                    <dd
                      className={`text-sm text-pretty break-words ${
                        campo.valor === "Não informado" ? "text-muted-foreground/70 italic" : ""
                      }`}
                    >
                      {campo.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            );
          case "itens":
            return (
              <ol key={indice} className="flex flex-col gap-2">
                {grupo.itens.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] text-muted-foreground">
                      {item.marcador}
                    </span>
                    <span className="text-pretty">{item.texto}</span>
                  </li>
                ))}
              </ol>
            );
          case "subtitulo":
            return (
              <p key={indice} className="pt-1 text-xs text-muted-foreground">
                {grupo.texto}
              </p>
            );
          default:
            return (
              <p key={indice} className="text-pretty">
                {grupo.texto}
              </p>
            );
        }
      })}
    </div>
  );
}
