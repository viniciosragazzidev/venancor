"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "motion/react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronRightIcon,
  FileTextIcon,
  Maximize2Icon,
  ShieldCheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { estruturarContrato } from "./contrato-blocos";
import { DocumentoContrato } from "./documento-contrato";
import type { DadosOrdemCliente } from "./types";

type Leitura = {
  areaRef: React.RefObject<HTMLDivElement | null>;
  ref: (no: HTMLDivElement | null) => void;
  progresso: number;
  ativa: string | null;
  medir: () => void;
};

/** Reading state of one scroll area: progress 0..1, section on top, and "reached the end". */
function useLeitura(onFim: () => void): Leitura {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [ativa, setAtiva] = useState<string | null>(null);

  const medir = useCallback(() => {
    const area = areaRef.current;
    if (!area) return;
    const rolavel = area.scrollHeight - area.clientHeight;
    const valor = rolavel <= 4 ? 1 : Math.min(1, area.scrollTop / rolavel);
    setProgresso(valor);
    if (valor >= 0.97) onFim();
    const topo = area.getBoundingClientRect().top;
    let atual: string | null = null;
    for (const secao of area.querySelectorAll<HTMLElement>("[data-secao]")) {
      if (secao.getBoundingClientRect().top - topo <= 56) atual = secao.dataset.secao ?? null;
    }
    setAtiva(atual);
  }, [onFim]);

  const ref = useCallback(
    (no: HTMLDivElement | null) => {
      areaRef.current = no;
      if (!no) return;
      // The full-screen sheet mounts fresh each time: always start at the top.
      no.scrollTop = 0;
      requestAnimationFrame(medir);
    },
    [medir],
  );

  return { areaRef, ref, progresso, ativa, medir };
}

function BarraProgresso({ progresso }: { progresso: number }) {
  const reduzir = useReducedMotion();
  const escala = useSpring(progresso, { stiffness: 260, damping: 40 });
  useEffect(() => {
    if (reduzir) escala.jump(progresso);
    else escala.set(progresso);
  }, [escala, progresso, reduzir]);
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
      <motion.div
        className="h-full origin-left rounded-full bg-primary"
        style={{ scaleX: escala }}
      />
    </div>
  );
}

function IndiceSecoes({
  secoes,
  ativa,
  grupo,
  onIr,
}: {
  secoes: { id: string; curto: string }[];
  ativa: string | null;
  grupo: string;
  onIr: (id: string) => void;
}) {
  const navRef = useRef<HTMLElement | null>(null);
  // Keeps the active chip in view as the reader scrolls (horizontal only, never moves the page).
  useEffect(() => {
    const nav = navRef.current;
    const chip = nav?.querySelector<HTMLElement>(`[data-chip="${ativa}"]`);
    if (!nav || !chip) return;
    nav.scrollTo({
      left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2,
      behavior: "smooth",
    });
  }, [ativa]);
  if (secoes.length < 3) return null;
  return (
    <nav
      ref={navRef}
      aria-label="Seções do contrato"
      className="relative -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {secoes.map((secao) => {
        const selecionada = secao.id === ativa;
        return (
          <button
            key={secao.id}
            data-chip={secao.id}
            type="button"
            onClick={() => onIr(secao.id)}
            className={`relative shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              selecionada
                ? "border-primary/40 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            aria-current={selecionada ? "true" : undefined}
          >
            {selecionada ? (
              <motion.span
                layoutId={`secao-ativa-${grupo}`}
                className="absolute inset-0 rounded-full bg-primary/10"
                transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
              />
            ) : null}
            <span className="relative">{secao.curto}</span>
          </button>
        );
      })}
    </nav>
  );
}

function FimDoContrato() {
  return (
    <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span className="flex items-center gap-1.5">
        <CheckIcon aria-hidden className="size-3.5" strokeWidth={1.5} />
        Fim do contrato
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function rolarAte(areaRef: React.RefObject<HTMLDivElement | null>, prefixo: string, id: string) {
  const area = areaRef.current;
  const alvo = area?.querySelector<HTMLElement>(`#${prefixo}-${id}`);
  if (!area || !alvo) return;
  const destino =
    alvo.getBoundingClientRect().top - area.getBoundingClientRect().top + area.scrollTop - 12;
  area.scrollTo({
    top: destino,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}

export function TelaContrato({
  ordem,
  consentimentos,
  onConsentimentos,
  onAvancar,
}: {
  ordem: DadosOrdemCliente;
  consentimentos: { contrato: boolean; lgpd: boolean };
  onConsentimentos: (valor: { contrato: boolean; lgpd: boolean }) => void;
  onAvancar: () => void;
}) {
  const contrato = useMemo(() => estruturarContrato(ordem.contrato_corpo), [ordem.contrato_corpo]);
  const indice = contrato.secoes.map(({ id, curto }) => ({ id, curto }));
  // Accepting the contract unlocks once the client has scrolled to its end (in the card or in
  // full screen). Short templates that fit without scrolling count as read.
  const [lido, setLido] = useState(consentimentos.contrato);
  const [telaCheia, setTelaCheia] = useState(false);
  const marcarLido = useCallback(() => setLido(true), []);
  // Destructured: the React compiler forbids reading fields of an object that holds a ref.
  const {
    areaRef: cardArea,
    ref: cardRef,
    medir: cardMedir,
    progresso: cardProgresso,
    ativa: cardAtiva,
  } = useLeitura(marcarLido);
  const {
    areaRef: cheiaArea,
    ref: cheiaRef,
    medir: cheiaMedir,
    progresso: cheiaProgresso,
    ativa: cheiaAtiva,
  } = useLeitura(marcarLido);
  const podeAssinar = consentimentos.contrato && consentimentos.lgpd;

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 overflow-hidden rounded-3xl py-0">
        <div className="flex flex-col gap-3 border-b border-border/70 px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileTextIcon aria-hidden className="size-[18px]" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Contrato de adesão</p>
              <p className="truncate text-xs text-muted-foreground">
                {ordem.plano.operadora_nome} · {ordem.plano.plano_nome}
              </p>
            </div>
            <Sheet open={telaCheia} onOpenChange={setTelaCheia}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0 rounded-full"
                    aria-label="Ler em tela cheia"
                  />
                }
              >
                <Maximize2Icon aria-hidden strokeWidth={1.5} />
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="mx-auto h-[94dvh] max-w-2xl gap-0 rounded-t-3xl p-0"
              >
                <SheetHeader className="gap-3 border-b border-border/70 px-5 pt-5 pb-4">
                  <SheetTitle className="pr-10">Contrato de adesão</SheetTitle>
                  <SheetDescription className="sr-only">
                    Texto completo do contrato da sua proposta
                  </SheetDescription>
                  <BarraProgresso progresso={cheiaProgresso} />
                  <IndiceSecoes
                    secoes={indice}
                    ativa={cheiaAtiva}
                    grupo="cheia"
                    onIr={(id) => rolarAte(cheiaArea, "cheia", id)}
                  />
                </SheetHeader>
                <div
                  ref={cheiaRef}
                  onScroll={cheiaMedir}
                  className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8"
                  tabIndex={0}
                  aria-label="Contrato completo em tela cheia"
                >
                  <DocumentoContrato
                    contrato={contrato}
                    planoNome={ordem.plano.plano_nome}
                    prefixoId="cheia"
                    raiz={cheiaArea}
                  />
                  <FimDoContrato />
                </div>
                <div className="border-t border-border/70 p-4">
                  <Button
                    className="h-12 w-full rounded-full text-base"
                    onClick={() => setTelaCheia(false)}
                  >
                    {lido ? "Voltar e aceitar" : "Voltar"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <BarraProgresso progresso={cardProgresso} />
          <IndiceSecoes
            secoes={indice}
            ativa={cardAtiva}
            grupo="card"
            onIr={(id) => rolarAte(cardArea, "card", id)}
          />
        </div>

        <div className="relative">
          <div
            ref={cardRef}
            onScroll={cardMedir}
            className="max-h-[58vh] overflow-y-auto overscroll-contain bg-muted/20 px-5 py-6"
            tabIndex={0}
            aria-label="Contrato completo"
          >
            <DocumentoContrato
              contrato={contrato}
              planoNome={ordem.plano.plano_nome}
              prefixoId="card"
              raiz={cardArea}
            />
            <FimDoContrato />
          </div>
          <AnimatePresence>
            {cardProgresso < 0.97 ? (
              <motion.div
                key="esmaecer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent"
              />
            ) : null}
          </AnimatePresence>
        </div>

        <CardContent className="flex flex-col gap-3.5 border-t border-border/70 py-5">
          <AnimatePresence initial={false}>
            {!lido ? (
              <motion.p
                key="dica"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 overflow-hidden text-xs text-muted-foreground"
              >
                <motion.span
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ArrowDownIcon aria-hidden className="size-3.5" strokeWidth={1.5} />
                </motion.span>
                Role o contrato até o fim para liberar o aceite.
              </motion.p>
            ) : null}
          </AnimatePresence>

          <motion.div
            className="flex items-start gap-2.5"
            animate={lido && !consentimentos.contrato ? { scale: [1, 1.02, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Checkbox
              id="concordo-contrato"
              className="mt-0.5"
              disabled={!lido}
              checked={consentimentos.contrato}
              onCheckedChange={(checked) =>
                onConsentimentos({ ...consentimentos, contrato: checked === true })
              }
            />
            <Label
              htmlFor="concordo-contrato"
              className={`block text-sm leading-snug font-normal transition-opacity ${
                lido ? "" : "opacity-50"
              }`}
            >
              Li e concordo com o contrato e seus termos.
            </Label>
          </motion.div>
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="concordo-lgpd"
              className="mt-0.5"
              checked={consentimentos.lgpd}
              onCheckedChange={(checked) =>
                onConsentimentos({ ...consentimentos, lgpd: checked === true })
              }
            />
            <Label htmlFor="concordo-lgpd" className="block text-sm leading-snug font-normal">
              Concordo com o tratamento dos meus dados pessoais para a contratação do plano,
              conforme a LGPD.{" "}
              <Sheet>
                <SheetTrigger
                  render={
                    <button className="text-left text-primary underline underline-offset-4" />
                  }
                >
                  Política de privacidade
                </SheetTrigger>
                <SheetContent side="bottom" className="gap-0 rounded-t-3xl p-0">
                  <SheetHeader className="px-5 pt-5 pb-2">
                    <SheetTitle className="text-balance">Política de privacidade</SheetTitle>
                    <SheetDescription className="sr-only">
                      Como seus dados pessoais são tratados
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-5 pb-6 text-sm leading-relaxed text-pretty text-muted-foreground">
                    Seus dados pessoais (nome, CPF, contato e beneficiários) são usados
                    exclusivamente para a contratação do plano e a comunicação sobre esta proposta.
                    O contrato assinado e as evidências da assinatura ficam em armazenamento
                    privado, com acesso restrito ao seu corretor. Você pode solicitar acesso,
                    correção ou exclusão dos seus dados a qualquer momento.
                  </div>
                </SheetContent>
              </Sheet>
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10">
        <Button
          size="lg"
          className="h-12 w-full rounded-full px-6 text-base shadow-lg shadow-primary/20"
          disabled={!podeAssinar}
          onClick={onAvancar}
        >
          Assinar contrato
          <ChevronRightIcon data-icon="inline-end" aria-hidden strokeWidth={1.5} />
        </Button>
      </div>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheckIcon aria-hidden className="size-3.5" strokeWidth={1.5} />
        Assinatura eletrônica com evidências, conforme a Lei 14.063/2020.
      </p>
    </div>
  );
}
