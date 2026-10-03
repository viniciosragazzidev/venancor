"use client";

import { motion } from "motion/react";
import { CircleCheckIcon, CircleXIcon, ClockIcon, DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type VarianteSucesso = "assinatura" | "pagamento";

const conteudos: Record<
  VarianteSucesso,
  { titulo: string; subtitulo: string; textoPrimario: string; textoSecundario: string }
> = {
  assinatura: {
    titulo: "Contrato assinado!",
    subtitulo:
      "Sua assinatura foi registrada com evidências de segurança. Falta só o pagamento para ativar o plano.",
    textoPrimario: "Ir para o pagamento",
    textoSecundario: "Baixar contrato assinado",
  },
  pagamento: {
    titulo: "Pagamento confirmado!",
    subtitulo:
      "Recebemos seu pagamento. Seu plano está sendo ativado e o contrato assinado já está disponível.",
    textoPrimario: "Baixar contrato assinado",
    textoSecundario: "Baixar comprovante",
  },
};

export function TelaSucesso({
  variante,
  onAcaoPrimaria,
  onAcaoSecundaria,
}: {
  variante: VarianteSucesso;
  onAcaoPrimaria: () => void;
  onAcaoSecundaria?: () => void;
}) {
  const conteudo = conteudos[variante];

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <motion.span
        initial={{ opacity: 0, scale: 0.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0 }}
        className="grid size-20 place-items-center rounded-full bg-success/10"
      >
        <CircleCheckIcon aria-hidden className="size-10 text-success" strokeWidth={1.5} />
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0, delay: 0.1 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl leading-tight font-medium text-balance">{conteudo.titulo}</h1>
        <p className="max-w-72 text-sm leading-relaxed text-pretty text-muted-foreground">
          {conteudo.subtitulo}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0, delay: 0.2 }}
        className="flex w-full flex-col gap-2.5"
      >
        {conteudo.textoSecundario && onAcaoSecundaria ? (
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-full px-6 text-base"
            onClick={onAcaoSecundaria}
          >
            <DownloadIcon aria-hidden strokeWidth={1.5} />
            {conteudo.textoSecundario}
          </Button>
        ) : null}
        <Button
          size="lg"
          className="h-12 w-full rounded-full px-6 text-base"
          onClick={onAcaoPrimaria}
        >
          {variante === "pagamento" ? <DownloadIcon aria-hidden strokeWidth={1.5} /> : null}
          {conteudo.textoPrimario}
        </Button>
      </motion.div>
    </div>
  );
}

export function TelaStatus({
  tipo,
  onBaixarContrato,
}: {
  tipo: "expirada" | "cancelada";
  onBaixarContrato?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <span
        className={
          tipo === "expirada"
            ? "grid size-20 place-items-center rounded-full bg-muted"
            : "grid size-20 place-items-center rounded-full bg-destructive/10"
        }
      >
        {tipo === "expirada" ? (
          <ClockIcon aria-hidden className="size-10 text-foreground/70" strokeWidth={1.5} />
        ) : (
          <CircleXIcon aria-hidden className="size-10 text-destructive" strokeWidth={1.5} />
        )}
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl leading-tight font-medium text-balance">
          {tipo === "expirada" ? "Link expirado" : "Proposta cancelada"}
        </h1>
        <p className="max-w-72 text-sm leading-relaxed text-pretty text-muted-foreground">
          {tipo === "expirada"
            ? "Esta proposta perdeu a validade. Peça ao seu corretor um novo link para continuar."
            : "Este link foi cancelado pelo corretor. Fale com ele para entender o motivo."}
        </p>
      </div>
      {tipo === "cancelada" && onBaixarContrato ? (
        <Button
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-full px-6 text-base"
          onClick={onBaixarContrato}
        >
          <DownloadIcon aria-hidden strokeWidth={1.5} />
          Baixar contrato assinado
        </Button>
      ) : null}
    </div>
  );
}
