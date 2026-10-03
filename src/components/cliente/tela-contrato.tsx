"use client";

import { ChevronRightIcon, ShieldCheckIcon } from "lucide-react";

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

import type { DadosOrdemCliente } from "./types";

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
  const podeAssinar = consentimentos.contrato && consentimentos.lgpd;

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-3xl">
        <CardContent className="flex flex-col gap-4">
          <div
            className="max-h-72 overflow-y-auto rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-line"
            tabIndex={0}
            aria-label="Contrato completo"
          >
            {ordem.contrato_corpo}
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="concordo-contrato"
                className="mt-0.5"
                checked={consentimentos.contrato}
                onCheckedChange={(checked) =>
                  onConsentimentos({ ...consentimentos, contrato: checked === true })
                }
              />
              <Label
                htmlFor="concordo-contrato"
                className="items-start text-sm leading-snug font-normal"
              >
                Li e concordo com o contrato e seus termos.
              </Label>
            </div>
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="concordo-lgpd"
                className="mt-0.5"
                checked={consentimentos.lgpd}
                onCheckedChange={(checked) =>
                  onConsentimentos({ ...consentimentos, lgpd: checked === true })
                }
              />
              <Label
                htmlFor="concordo-lgpd"
                className="items-start text-sm leading-snug font-normal"
              >
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
                  <SheetContent side="bottom" className="rounded-t-3xl gap-0 p-0">
                    <SheetHeader className="px-5 pt-5 pb-2">
                      <SheetTitle className="text-balance">Política de privacidade</SheetTitle>
                      <SheetDescription className="sr-only">
                        Como seus dados pessoais são tratados
                      </SheetDescription>
                    </SheetHeader>
                    <div className="px-5 pb-6 text-sm leading-relaxed text-pretty text-muted-foreground">
                      Seus dados pessoais (nome, CPF, contato e beneficiários) são usados
                      exclusivamente para a contratação do plano de saúde e a comunicação sobre esta
                      proposta. O contrato assinado e as evidências da assinatura ficam em
                      armazenamento privado, com acesso restrito ao seu corretor. Você pode
                      solicitar acesso, correção ou exclusão dos seus dados a qualquer momento.
                    </div>
                  </SheetContent>
                </Sheet>
              </Label>
            </div>
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
