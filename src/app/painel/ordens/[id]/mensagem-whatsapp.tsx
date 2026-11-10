"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, ExternalLinkIcon, LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { valorOuErro } from "@/lib/resultado-acao";
import { copiarLinkOrdem } from "@/modules/ordens/actions";
import { linkWhatsApp, mensagemPropostaWhatsApp } from "@/modules/ordens/mensagem-whatsapp";

const SEM_LINK = "(o link da proposta entra aqui)";

/** Modelo de mensagem com o link da proposta, para mandar pelo WhatsApp do próprio admin. */
export function MensagemWhatsApp({
  ordemId,
  nomeCliente,
  telefone,
  plano,
  valor,
  formasPagamento,
}: {
  ordemId: string;
  nomeCliente: string;
  telefone: string | null;
  plano: string;
  valor: string;
  formasPagamento: readonly string[];
}) {
  const router = useRouter();
  const [link, setLink] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const mensagem = mensagemPropostaWhatsApp({
    nomeCliente,
    plano,
    valor,
    formasPagamento,
    link: link ?? SEM_LINK,
  });

  async function copiarTexto(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Mensagem copiada. É só colar no WhatsApp do cliente.");
    } catch {
      toast.error("O navegador bloqueou a cópia. Selecione o texto e copie manualmente.");
    }
  }

  async function gerar() {
    setOcupado(true);
    const pedido = copiarLinkOrdem(ordemId).then((resultado) => valorOuErro(resultado).link);
    const montar = (novo: string) =>
      mensagemPropostaWhatsApp({ nomeCliente, plano, valor, formasPagamento, link: novo });
    // Safari perde o gesto do clique depois de um await: o ClipboardItem recebe a Promise do
    // texto e copia quando o link chega, ainda dentro do clique. Sem suporte, copia depois.
    const copiaNoGesto =
      typeof ClipboardItem !== "undefined" && navigator.clipboard?.write
        ? navigator.clipboard.write([
            new ClipboardItem({
              "text/plain": pedido.then((novo) => new Blob([montar(novo)], { type: "text/plain" })),
            }),
          ])
        : null;
    try {
      const novo = await pedido;
      setLink(novo);
      if (copiaNoGesto) {
        try {
          await copiaNoGesto;
          toast.success("Mensagem copiada. É só colar no WhatsApp do cliente.");
        } catch {
          await copiarTexto(montar(novo));
        }
      } else await copiarTexto(montar(novo));
      router.refresh();
    } catch (erro) {
      copiaNoGesto?.catch(() => undefined);
      toast.error(erro instanceof Error ? erro.message : "O navegador bloqueou a cópia do link. Copie o endereço manualmente.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Card className="rounded-3xl">
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Mensagem para o WhatsApp</p>
          <p className="text-xs text-pretty text-muted-foreground">
            Copia a mensagem pronta com o link da proposta. O link é sempre o mesmo: o que você já mandou continua valendo.
          </p>
        </div>
        <pre className="rounded-2xl bg-muted/50 p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-pretty select-all">
          {mensagem}
        </pre>
        <div className="flex flex-wrap gap-3">
          {link ? (
            <>
              <Button className="h-11 rounded-full px-5" onClick={() => void copiarTexto(mensagem)}>
                <CopyIcon aria-hidden strokeWidth={1.5} />
                Copiar de novo
              </Button>
              {telefone ? (
                <a
                  href={linkWhatsApp(telefone, mensagem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium hover:bg-muted"
                >
                  <ExternalLinkIcon aria-hidden className="size-4" strokeWidth={1.5} />
                  Abrir no WhatsApp
                </a>
              ) : null}
            </>
          ) : (
            <Button
              className="h-11 rounded-full px-5"
              disabled={ocupado}
              onClick={() => void gerar()}
            >
              {ocupado ? (
                <LoaderCircleIcon aria-hidden className="animate-spin" strokeWidth={1.5} />
              ) : (
                <CopyIcon aria-hidden strokeWidth={1.5} />
              )}
              Copiar mensagem com o link
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
