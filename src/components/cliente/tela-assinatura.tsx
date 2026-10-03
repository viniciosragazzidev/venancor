"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { motion } from "motion/react";
import {
  CheckIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  PenLineIcon,
  RotateCcwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { formatarCpfMascarado, formatarTelefone } from "./format";
import { executarOtpAutomatico } from "./otp-automatico";
import type { OtpErro } from "./types";

const mensagensErroOtp: Record<OtpErro, string> = {
  invalido: "Código incorreto. Confira os 6 dígitos e tente novamente.",
  expirado: "O código expirou. Solicite um novo código.",
  bloqueado: "Muitas tentativas. Peça ao seu corretor um novo código.",
  falha: "Não foi possível concluir agora. Tente novamente.",
};

type Consentimentos = { contrato: boolean; lgpd: boolean };

export function TelaAssinatura({
  cliente,
  otpAutomatico = false,
  consentimentos,
  onEnviarOtp,
  onValidarOtp,
  onConcluirAssinatura,
}: {
  cliente: { nome: string; cpf: string; whatsapp: string };
  otpAutomatico?: boolean;
  consentimentos: Consentimentos;
  onEnviarOtp: (
    telefone: string,
  ) => Promise<{ ok: true; codigoTeste?: string } | { erro: OtpErro }>;
  onValidarOtp: (codigo: string) => Promise<{ ok: true } | { erro: OtpErro }>;
  onConcluirAssinatura: (
    dados: {
      nome: string;
      cpf: string;
      imagemDataUrl: string;
      consentimentos: Consentimentos;
    },
    automatico?: boolean,
  ) => Promise<void>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [nome, setNome] = useState(cliente.nome);
  // CPF nunca pré-preenchido: o cliente digita e o servidor valida contra a ordem (Cofre, F5.3).
  const [cpf, setCpf] = useState("");
  const [temTrazo, setTemTrazo] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoTeste, setCodigoTeste] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [erroOtp, setErroOtp] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [validando, setValidando] = useState(false);

  const nomeOk = nome.trim().length >= 3;
  const cpfOk = cpf.length === 11;
  const cpfTocado = cpf.length > 0;
  const podePedirCodigo = nomeOk && cpfOk && temTrazo;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePad(canvas, {
      backgroundColor: "transparent",
      penColor: getComputedStyle(canvas).color,
      minWidth: 1.2,
      maxWidth: 2.4,
      throttle: 8,
    });
    padRef.current = pad;
    const aoDesenhar = () => setTemTrazo(!pad.isEmpty());
    pad.addEventListener("endStroke", aoDesenhar);

    function ajustarCanvas() {
      if (!canvasRef.current || !padRef.current) return;
      const elemento = canvasRef.current;
      const dados = padRef.current.toData();
      const proporcao = Math.max(window.devicePixelRatio || 1, 1);
      elemento.width = elemento.offsetWidth * proporcao;
      elemento.height = elemento.offsetHeight * proporcao;
      elemento.getContext("2d")?.scale(proporcao, proporcao);
      padRef.current.clear();
      padRef.current.fromData(dados);
      setTemTrazo(!padRef.current.isEmpty());
    }

    ajustarCanvas();
    window.addEventListener("resize", ajustarCanvas);
    return () => {
      window.removeEventListener("resize", ajustarCanvas);
      pad.removeEventListener("endStroke", aoDesenhar);
      pad.off();
    };
  }, []);

  function limparAssinatura() {
    padRef.current?.clear();
    setTemTrazo(false);
  }

  async function pedirCodigo() {
    setEnviando(true);
    setErroOtp(null);
    try {
      const resultado = await onEnviarOtp(cliente.whatsapp);
      if ("ok" in resultado) {
        const codigoRecebido = resultado.codigoTeste;
        setCodigoEnviado(true);
        if (codigoRecebido) setCodigo(codigoRecebido);
        setCodigoTeste(codigoRecebido ?? null);
        const automatico = await executarOtpAutomatico(codigoRecebido, onValidarOtp, () =>
          onConcluirAssinatura(
            {
              nome: nome.trim(),
              cpf,
              imagemDataUrl: padRef.current?.toDataURL("image/png") ?? "",
              consentimentos,
            },
            true,
          ),
        );
        if (automatico.automatico && !automatico.erro) return;
        if (automatico.automatico && automatico.erro) setErroOtp(mensagensErroOtp[automatico.erro]);
      } else setErroOtp(mensagensErroOtp[resultado.erro]);
    } catch (error) {
      setErroOtp(error instanceof Error ? error.message : mensagensErroOtp.falha);
    } finally {
      setEnviando(false);
    }
  }

  async function validarCodigo() {
    setValidando(true);
    setErroOtp(null);
    try {
      const resultado = await onValidarOtp(codigo);
      if ("ok" in resultado) {
        const imagemDataUrl = padRef.current?.toDataURL("image/png") ?? "";
        await onConcluirAssinatura({ nome: nome.trim(), cpf, imagemDataUrl, consentimentos });
      } else setErroOtp(mensagensErroOtp[resultado.erro]);
    } catch (error) {
      setErroOtp(error instanceof Error ? error.message : mensagensErroOtp.falha);
    } finally {
      setValidando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-3xl">
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assinatura-nome" className="font-normal text-muted-foreground">
                Nome completo
              </Label>
              <Input
                id="assinatura-nome"
                className="h-12 rounded-full border-border px-5 text-base md:text-sm"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                autoComplete="name"
                aria-invalid={!nomeOk || undefined}
              />
              {!nomeOk ? (
                <p className="text-xs text-destructive" role="alert">
                  Informe seu nome completo.
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assinatura-cpf" className="font-normal text-muted-foreground">
                CPF
              </Label>
              <Input
                id="assinatura-cpf"
                className="h-12 rounded-full border-border px-5 text-base tabular-nums md:text-sm"
                value={cpf}
                onChange={(evento) => setCpf(evento.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={11}
                placeholder={formatarCpfMascarado(cliente.cpf)}
                autoComplete="off"
                aria-invalid={cpfTocado && !cpfOk ? true : undefined}
              />
              {cpfTocado && !cpfOk ? (
                <p className="text-xs text-destructive" role="alert">
                  Informe os 11 dígitos do seu CPF.
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-normal text-muted-foreground">Sua assinatura</span>
            <div className="relative rounded-2xl border-2 border-dashed border-border bg-muted/20">
              <canvas
                ref={canvasRef}
                className="block h-40 w-full touch-none rounded-2xl text-foreground"
                aria-label="Área de assinatura"
                role="img"
              />
              {!temTrazo ? (
                <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                  <PenLineIcon aria-hidden className="size-5" strokeWidth={1.5} />
                  <span className="text-sm">Assine aqui com o dedo ou o mouse</span>
                </span>
              ) : null}
            </div>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground"
                onClick={limparAssinatura}
                disabled={!temTrazo}
              >
                <RotateCcwIcon aria-hidden strokeWidth={1.5} />
                Limpar assinatura
              </Button>
            </div>
          </div>

          {!codigoEnviado ? (
            <div className="flex flex-col items-center gap-2.5">
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full rounded-full px-6 text-base"
                onClick={pedirCodigo}
                disabled={!podePedirCodigo || enviando}
              >
                {enviando ? (
                  <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
                ) : (
                  <MessageCircleIcon aria-hidden strokeWidth={1.5} />
                )}
                {otpAutomatico ? "Assinar e continuar" : "Enviar código por WhatsApp"}
              </Button>
              <p className="text-center text-xs text-pretty text-muted-foreground">
                {otpAutomatico ? (
                  "Modo teste: o código será gerado e validado automaticamente."
                ) : (
                  <>
                    Enviaremos um código de 6 dígitos para o WhatsApp{" "}
                    {formatarTelefone(cliente.whatsapp)}.
                  </>
                )}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="flex flex-col gap-2.5"
            >
              <Label htmlFor="assinatura-otp" className="font-normal text-muted-foreground">
                Código de verificação (6 dígitos)
              </Label>
              {codigoTeste ? (
                <p
                  className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
                  role="status"
                >
                  Modo teste: seu código é {codigoTeste}
                </p>
              ) : null}
              <div className="flex items-center gap-2.5">
                <Input
                  id="assinatura-otp"
                  className="h-12 rounded-full border-border px-5 text-center text-lg font-medium tracking-[0.4em] tabular-nums md:text-sm"
                  value={codigo}
                  onChange={(evento) =>
                    setCodigo(evento.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  aria-invalid={erroOtp !== null || undefined}
                />
                <Button
                  size="lg"
                  className="h-12 shrink-0 rounded-full px-5"
                  onClick={validarCodigo}
                  disabled={codigo.length !== 6 || validando}
                >
                  {validando ? (
                    <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
                  ) : (
                    <CheckIcon aria-hidden strokeWidth={1.5} />
                  )}
                  Validar
                </Button>
              </div>
              {erroOtp ? (
                <p className="text-xs text-destructive" role="alert">
                  {erroOtp}
                </p>
              ) : null}
              <button
                type="button"
                className="self-center text-xs text-muted-foreground underline underline-offset-4"
                onClick={pedirCodigo}
              >
                Reenviar código
              </button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
