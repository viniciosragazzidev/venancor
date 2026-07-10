"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createLeadAction, type ClientLead } from "./actions";

const OPERADORAS = [
  "Amil",
  "Bradesco Saúde",
  "SulAmérica",
  "UnitedHealth",
  "NotreDame Intermédica",
  "Hapvida",
  "Cassi",
  "Geo",
  "Outra",
];

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface AddClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded: (client: ClientLead) => void;
  sessionUserId: string;
}

export function AddClientSheet({
  open,
  onOpenChange,
  onClientAdded,
  sessionUserId,
}: AddClientSheetProps) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tipoContratacao, setTipoContratacao] = useState<"Adesao" | "CNPJ">("Adesao");
  const [operadora, setOperadora] = useState("");
  const [idades, setIdades] = useState<string[]>([""]);
  const [destino, setDestino] = useState<"Aguardando" | "Em Atendimento">("Aguardando");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addDependente = useCallback(() => {
    setIdades((prev) => [...prev, ""]);
  }, []);

  const removeDependente = useCallback((index: number) => {
    setIdades((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateIdade = useCallback((index: number, value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 2);
    setIdades((prev) => prev.map((v, i) => (i === index ? digits : v)));
  }, []);

  const resetForm = () => {
    setNome("");
    setWhatsapp("");
    setTipoContratacao("Adesao");
    setOperadora("");
    setIdades([""]);
    setDestino("Aguardando");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nome.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }
    if (!whatsapp.replace(/\D/g, "")) {
      setError("Informe o WhatsApp do cliente.");
      return;
    }
    if (!operadora) {
      setError("Selecione a operadora.");
      return;
    }

    const validIdades = idades.filter((i) => i.trim());
    if (validIdades.length === 0) {
      setError("Adicione pelo menos uma idade.");
      return;
    }

    setIsSubmitting(true);

    const perfil = tipoContratacao === "CNPJ" ? `CNPJ/MEI - ${operadora}` : `Adesão - ${operadora}`;
    const idadesStr = validIdades.join(",");

    const res = await createLeadAction({
      nome: nome.trim(),
      whatsapp: whatsapp.replace(/\D/g, ""),
      perfil,
      idades: idadesStr,
      destino,
      corretorId: destino === "Em Atendimento" ? sessionUserId : undefined,
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    const newClient: ClientLead = {
      id: Date.now(),
      nome: nome.trim(),
      whatsapp: whatsapp.replace(/\D/g, ""),
      perfil,
      idades: idadesStr,
      status: destino,
      corretorId: destino === "Em Atendimento" ? sessionUserId : null,
    };

    onClientAdded(newClient);
    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[400px] max-w-[400px] p-0 gap-0 bg-white shadow-2xl border-l border-neutral-200/60"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-base font-extrabold text-neutral-900 tracking-tight">
                Novo Cliente
              </SheetTitle>
              <SheetDescription className="text-[10px] font-semibold text-neutral-400 mt-0.5">
                Preencha os dados para registrar um cliente manualmente.
              </SheetDescription>
            </div>
            <button
              onClick={() => handleOpenChange(false)}
              className="p-1.5 rounded-xl border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 transition-all cursor-pointer"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100dvh-88px)]">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* ── Grupo 1: Contato ── */}
            <div className="space-y-3">
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.15em]">
                Contato
              </span>
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Nome completo
                </Label>
                <Input
                  id="nome"
                  placeholder="João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-9 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white focus:border-[#3b2dff] text-xs font-semibold outline-none transition-all placeholder:text-neutral-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhoneInput(e.target.value))}
                  className="h-9 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white focus:border-[#3b2dff] text-xs font-semibold outline-none transition-all placeholder:text-neutral-300"
                />
              </div>
            </div>

            {/* ── Grupo 2: Perfil ── */}
            <div className="space-y-3">
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.15em]">
                Perfil
              </span>
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Tipo de contratação
                </Label>
                <div className="flex gap-2">
                  {(["Adesao", "CNPJ"] as const).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoContratacao(tipo)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        tipoContratacao === tipo
                          ? "bg-[#3b2dff] text-white border-[#3b2dff]"
                          : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      {tipo === "Adesao" ? "Adesão" : "CNPJ / MEI"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Operadora
                </Label>
                <Select value={operadora} onValueChange={(v) => setOperadora(v ?? "")}>
                  <SelectTrigger className="w-full h-9 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white focus:border-[#3b2dff] text-xs font-semibold outline-none transition-all">
                    <SelectValue placeholder="Selecione a operadora" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-neutral-200">
                    {OPERADORAS.map((op) => (
                      <SelectItem key={op} value={op} className="text-xs font-semibold rounded-lg">
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Grupo 3: Idades Dinâmicas ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.15em]">
                  Idades / Vidas
                </span>
                <span className="text-[10px] font-bold text-[#3b2dff]">
                  {idades.filter((i) => i.trim()).length} {idades.filter((i) => i.trim()).length === 1 ? "vida" : "vidas"}
                </span>
              </div>
              <motion.div layout className="space-y-2">
                <AnimatePresence initial={false}>
                  {idades.map((idade, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -10, scaleY: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex-1 relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={index === 0 ? "Idade do titular" : `Idade do dependente ${index}`}
                          value={idade}
                          onChange={(e) => updateIdade(index, e.target.value)}
                          className="h-9 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white focus:border-[#3b2dff] text-xs font-semibold outline-none transition-all placeholder:text-neutral-300"
                        />
                        {idade && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral-300">
                            anos
                          </span>
                        )}
                      </div>
                      {index > 0 && (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeDependente(index)}
                          className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shrink-0"
                        >
                          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={addDependente}
                className="w-full py-2 rounded-xl border border-dashed border-[#3b2dff]/30 text-[#3b2dff] text-[10px] font-bold uppercase tracking-wider hover:bg-[#3b2dff]/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Adicionar Dependente
              </motion.button>
            </div>

            {/* ── Grupo 4: Destino ── */}
            <div className="space-y-3">
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.15em]">
                Destino do Registro
              </span>
              <RadioGroup
                value={destino}
                onValueChange={(val) => setDestino(val as "Aguardando" | "Em Atendimento")}
                className="gap-2"
              >
                <label
                  htmlFor="destino-aguardando"
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    destino === "Aguardando"
                      ? "border-violet-200 bg-violet-50/50"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <RadioGroupItem value="Aguardando" id="destino-aguardando" className="mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-neutral-800 block">Aguardando</span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Na fila de leads sem corretor vinculado
                    </span>
                  </div>
                  <span className="size-2 rounded-full bg-violet-400 mt-1 shrink-0" />
                </label>
                <label
                  htmlFor="destino-atendimento"
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    destino === "Em Atendimento"
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <RadioGroupItem value="Em Atendimento" id="destino-atendimento" className="mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-neutral-800 block">Em Atendimento</span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Vinculado automaticamente a você
                    </span>
                  </div>
                  <span className="size-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                </label>
              </RadioGroup>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-neutral-100 space-y-3">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-2"
                >
                  <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#3b2dff] hover:bg-[#2d20e0] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-sm transition-all cursor-pointer select-none active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin size-4 text-neutral-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Salvar e Registrar Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
