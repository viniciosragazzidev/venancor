"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
  BarcodeIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  QrCodeIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { formatarBRL, formatarData, rotulosMetodo } from "./format";
import type { CobrancaCliente, DadosOrdemCliente, MetodoPagamento } from "./types";

async function copiar(texto: string, mensagem: string) {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success(mensagem);
  } catch {
    toast.error("Não foi possível copiar. Tente novamente.");
  }
}

export function TelaPagamento({
  ordem,
  onIniciarPagamento,
  onBaixarBoleto,
  onSimularPagamento,
}: {
  ordem: DadosOrdemCliente;
  onIniciarPagamento: (metodo: MetodoPagamento, parcelas?: number) => Promise<CobrancaCliente>;
  onBaixarBoleto: (url?: string) => void;
  onSimularPagamento?: (pagamentoId: string) => Promise<void>;
}) {
  const [cobrancas, setCobrancas] = useState<Partial<Record<MetodoPagamento, CobrancaCliente>>>({});
  const [gerando, setGerando] = useState<MetodoPagamento | null>(null);
  const [parcelas, setParcelas] = useState(1);
  const [metodoAtual, setMetodoAtual] = useState<MetodoPagamento>(ordem.formas_pagamento[0]);
  const [simulando, setSimulando] = useState(false);

  const total = ordem.valor_cobrado;
  const vencimento = cobrancas.pix?.vencimento ?? ordem.expira_em;

  async function gerarCobranca(metodo: MetodoPagamento, parcelasAtual?: number) {
    setGerando(metodo);
    try {
      const cobranca = await onIniciarPagamento(metodo, parcelasAtual);
      setCobrancas((atual) => ({ ...atual, [metodo]: cobranca }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível iniciar o pagamento.");
    } finally {
      setGerando(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-3xl">
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">Total a pagar</span>
            <span className="text-2xl font-medium tabular-nums">{formatarBRL(total)}</span>
          </div>
          <p className="text-xs text-pretty text-muted-foreground">
            Contrato assinado com sucesso. Pague até {formatarData(vencimento)} para ativar a
            cobertura do plano.
          </p>
        </CardContent>
      </Card>

      <Tabs
        value={metodoAtual}
        onValueChange={(valor) => setMetodoAtual(valor as MetodoPagamento)}
        className="gap-4"
      >
        <TabsList className="h-auto w-full gap-1.5 rounded-full p-1.5">
          {ordem.formas_pagamento.map((metodo) => (
            <TabsTrigger
              key={metodo}
              value={metodo}
              className="h-10 flex-1 rounded-full border-border text-sm data-active:border-selection data-active:bg-selection-soft data-active:text-selection"
            >
              {metodo === "pix" ? (
                <QrCodeIcon aria-hidden strokeWidth={1.5} />
              ) : metodo === "boleto" ? (
                <BarcodeIcon aria-hidden strokeWidth={1.5} />
              ) : (
                <CreditCardIcon aria-hidden strokeWidth={1.5} />
              )}
              {rotulosMetodo[metodo]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="pix">
          <Card className="rounded-3xl">
            <CardContent className="flex flex-col items-center gap-4">
              {gerando === "pix" ? (
                <div className="grid size-40 place-items-center rounded-2xl border-2 border-dashed border-border">
                  <LoaderCircleIcon
                    aria-hidden
                    className="size-8 animate-spin text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </div>
              ) : cobrancas.pix ? (
                cobrancas.pix.pix_qr_base64 ? (
                  <Image
                    src={`data:image/png;base64,${cobrancas.pix.pix_qr_base64}`}
                    alt="QR Code Pix para pagamento"
                    width={160}
                    height={160}
                    unoptimized
                    className="size-40 rounded-2xl outline outline-1 outline-black/10 dark:outline-white/10"
                  />
                ) : cobrancas.pix.checkout_url ? (
                  // QR indisponível no provedor: a página do Asaas também exibe o Pix.
                  <Button
                    size="lg"
                    className="h-12 rounded-full px-6 text-base"
                    render={
                      <a
                        href={cobrancas.pix.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <QrCodeIcon aria-hidden strokeWidth={1.5} />
                    Pagar Pix na página segura
                  </Button>
                ) : (
                  <div className="grid size-40 place-items-center rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                    <span className="flex flex-col items-center gap-1.5">
                      <QrCodeIcon aria-hidden className="size-10" strokeWidth={1.5} />
                      <span className="text-xs">QR Code Pix</span>
                    </span>
                  </div>
                )
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full px-6 text-base"
                  onClick={() => gerarCobranca("pix")}
                >
                  <QrCodeIcon aria-hidden strokeWidth={1.5} />
                  Gerar QR Code Pix
                </Button>
              )}

              {cobrancas.pix?.pix_payload ? (
                <>
                  <div className="flex w-full items-center gap-2 rounded-full border border-border bg-muted/30 py-1 pr-1 pl-4">
                    <code className="flex-1 truncate font-mono text-xs text-foreground/80">
                      {cobrancas.pix.pix_payload}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full"
                      onClick={() =>
                        copiar(cobrancas.pix?.pix_payload ?? "", "Código Pix copiado.")
                      }
                    >
                      <CopyIcon aria-hidden strokeWidth={1.5} />
                      Copiar
                    </Button>
                  </div>
                  <p className="text-center text-xs text-pretty text-muted-foreground">
                    Aponte a câmera do app do seu banco ou use o copia-e-cola.
                  </p>
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boleto">
          <Card className="rounded-3xl">
            <CardContent className="flex flex-col items-center gap-4">
              {!cobrancas.boleto ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full px-6 text-base"
                  onClick={() => gerarCobranca("boleto")}
                >
                  {gerando === "boleto" ? (
                    <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
                  ) : (
                    <BarcodeIcon aria-hidden strokeWidth={1.5} />
                  )}
                  Gerar boleto
                </Button>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5 self-start">
                    <span className="text-xs tracking-wide text-muted-foreground uppercase">
                      Linha digitável
                    </span>
                    <p className="rounded-2xl border border-border bg-muted/30 p-4 font-mono text-sm break-all tabular-nums">
                      {cobrancas.boleto.boleto_linha}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 rounded-full px-6 text-base"
                      onClick={() =>
                        copiar(cobrancas.boleto?.boleto_linha ?? "", "Linha digitável copiada.")
                      }
                    >
                      <CopyIcon aria-hidden strokeWidth={1.5} />
                      Copiar linha digitável
                    </Button>
                    {cobrancas.boleto.boleto_url ? (
                      <Button
                        variant="ghost"
                        size="lg"
                        className="h-12 rounded-full px-6 text-base text-muted-foreground"
                        onClick={() => onBaixarBoleto(cobrancas.boleto?.boleto_url)}
                      >
                        <DownloadIcon aria-hidden strokeWidth={1.5} />
                        Baixar boleto (PDF)
                      </Button>
                    ) : null}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cartao">
          <Card className="rounded-3xl">
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-normal text-muted-foreground">Parcelas</span>
                <Select
                  value={String(parcelas)}
                  onValueChange={(valor) => setParcelas(Number(valor))}
                >
                  <SelectTrigger className="h-12 w-full rounded-full border-border px-5 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: ordem.max_parcelas }, (_, indice) => indice + 1).map(
                      (quantidade) => (
                        <SelectItem key={quantidade} value={String(quantidade)}>
                          {quantidade}x de {formatarBRL(Math.round(total / quantidade))}
                          {quantidade === 1 ? " (à vista)" : ""}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {!cobrancas.cartao ? (
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full px-6 text-base"
                  onClick={() => gerarCobranca("cartao", parcelas)}
                >
                  {gerando === "cartao" ? (
                    <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
                  ) : (
                    <CreditCardIcon aria-hidden strokeWidth={1.5} />
                  )}
                  Ir para o pagamento
                </Button>
              ) : cobrancas.cartao.checkout_url ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full rounded-full px-6 text-base"
                  render={
                    <a
                      href={cobrancas.cartao.checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ExternalLinkIcon aria-hidden strokeWidth={1.5} />
                  Abrir checkout seguro
                </Button>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Cobrança criada. Aguarde a confirmação.
                </p>
              )}
              <p className="text-center text-xs text-pretty text-muted-foreground">
                Você será direcionado ao ambiente seguro do provedor de pagamento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {onSimularPagamento && cobrancas[metodoAtual] ? (
        <Button
          variant="outline"
          className="w-full rounded-full"
          disabled={simulando}
          onClick={async () => {
            setSimulando(true);
            try {
              await onSimularPagamento(cobrancas[metodoAtual]!.id);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Falha na simulação.");
            } finally {
              setSimulando(false);
            }
          }}
        >
          {simulando ? "Simulando…" : "Simular pagamento"}
        </Button>
      ) : null}
    </div>
  );
}
