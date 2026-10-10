"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  WhatsappIcon,
  Tick02Icon,
  ArrowRight01Icon,
  UserGroupIcon,
  BriefcaseIcon,
  Add01Icon,
  Delete02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";

export default function SectionSimulador() {
  const [step, setStep] = useState(1);
  const [perfil, setPerfil] = useState<"adesao" | "empresarial">("adesao");
  const [titularAge, setTitularAge] = useState("");
  const [dependentes, setDependentes] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const whatsappUrl = "https://wa.me/5521964469750";

  // Floating Labels Validation
  const isStep1Valid = !!perfil;
  const isStep2Valid =
    titularAge !== "" &&
    parseInt(titularAge) > 0 &&
    dependentes.every((d) => d !== "" && parseInt(d) > 0);
  const isStep3Valid = nome.length >= 3 && isPhoneValid;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    let formatted = "";
    if (value.length > 0) formatted += `(${value.slice(0, 2)}`;
    if (value.length > 2) formatted += `) ${value.slice(2, 7)}`;
    if (value.length > 7) formatted += `-${value.slice(7, 11)}`;

    setWhatsapp(formatted);
    setIsPhoneValid(value.length >= 10);
  };

  const addDependente = () => {
    setDependentes([...dependentes, ""]);
  };

  const removeDependente = (index: number) => {
    setDependentes(dependentes.filter((_, idx) => idx !== index));
  };

  const updateDependente = (index: number, val: string) => {
    const updated = [...dependentes];
    updated[index] = val.replace(/\D/g, "");
    setDependentes(updated);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitularAge(e.target.value.replace(/\D/g, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStep3Valid) {
      setIsSubmitted(true);
      setTimeout(() => {
        const text = `Olá! Realizei uma simulação do plano Amep Saúde na Venancor.\n\n*Tipo:* ${perfil === "adesao" ? "Ideal Adesão / Lagos" : "Empresarial (PME/MEI)"}\n*Titular:* ${nome} (${titularAge} anos)\n*Dependentes:* ${dependentes.length > 0 ? dependentes.join(", ") + " anos" : "Nenhum"}\n*WhatsApp:* ${whatsapp}`;
        window.open(`${whatsappUrl}?text=${encodeURIComponent(text)}`, "_blank");
      }, 850);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPerfil("adesao");
    setTitularAge("");
    setDependentes([]);
    setNome("");
    setWhatsapp("");
    setIsPhoneValid(false);
    setIsSubmitted(false);
  };

  return (
    <motion.section
      id="simulador"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full bg-slate-50/30 py-16 md:py-20 font-sans select-none overflow-hidden border-t border-b border-slate-100 will-change-transform"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* COLUNA ESQUERDA: Informações de Contexto */}
        <div className="lg:col-span-5 flex flex-col items-start gap-8 text-left w-full">
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span className="size-2 rounded-full bg-[#3b2dff]" />
              <span>Simulador Inteligente</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-[1.15] max-w-xl">
              <div className="overflow-hidden py-0.5">
                <motion.span
                  initial={{ y: "100%" }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  className="inline-block"
                >
                  Simulador de Preços Amep Saúde
                </motion.span>
              </div>
            </h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-slate-500 text-sm md:text-base font-light leading-relaxed max-w-xl"
            >
              Insira a quantidade de vidas para ver imediatamente quais tabelas e carências da Amep
              Saúde se aplicam à sua família ou empresa.
            </motion.p>
          </div>

          {/* Bullet points */}
          <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
              </div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Cálculo preciso com base nas regras da ANS.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
              </div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Alertas de telemedicina e regras de adesão em tempo real.
              </p>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Card Simulador Elástico */}
        <div className="lg:col-span-7 w-full flex justify-center lg:justify-end">
          <motion.div
            layout
            className="w-full max-w-xl bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col gap-6 overflow-hidden relative"
          >
            {/* Step Header */}
            <div className="flex justify-between items-center w-full border-b border-slate-100 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-[#3b2dff]">
                {isSubmitted ? "Simulação Enviada" : `Passo ${step} de 3`}
              </span>
              {!isSubmitted && (
                <div className="flex gap-1.5">
                  <div
                    className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step >= 1 ? "bg-[#3b2dff]" : "bg-slate-100"}`}
                  />
                  <div
                    className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step >= 2 ? "bg-[#3b2dff]" : "bg-slate-100"}`}
                  />
                  <div
                    className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step >= 3 ? "bg-[#3b2dff]" : "bg-slate-100"}`}
                  />
                </div>
              )}
            </div>

            {/* Steps Container using AnimatePresence */}
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  className="flex flex-col items-center justify-center text-center gap-4 py-8"
                >
                  <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                    <HugeiconsIcon icon={Tick02Icon} className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                    Simulação Gerada!
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-light max-w-sm">
                    Parabéns, os valores foram processados com sucesso. Estamos te redirecionando
                    para abrir a tabela comercial completa no seu WhatsApp.
                  </p>
                  <button
                    onClick={resetForm}
                    className="text-xs font-bold text-[#3b2dff] hover:underline cursor-pointer mt-2"
                  >
                    Fazer outra simulação
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* STEP 1: Perfil */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="flex flex-col gap-5 text-left w-full"
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">
                          Qual perfil de plano você deseja cotar?
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">Selecione o tipo de adesão.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {/* Option 1: Adesao */}
                        <button
                          onClick={() => setPerfil("adesao")}
                          className={`p-5 rounded-2xl border text-left flex flex-col gap-3 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                            perfil === "adesao"
                              ? "border-[#3b2dff] bg-[#3b2dff]/5 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div
                            className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                              perfil === "adesao"
                                ? "bg-[#3b2dff] text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <HugeiconsIcon icon={UserGroupIcon} className="size-5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                              Ideal Adesão
                            </span>
                            <p className="text-slate-500 text-xs font-light mt-0.5">
                              Planos individuais ou familiares (Região dos Lagos e Grande Rio).
                            </p>
                          </div>
                        </button>

                        {/* Option 2: Empresarial */}
                        <button
                          onClick={() => setPerfil("empresarial")}
                          className={`p-5 rounded-2xl border text-left flex flex-col gap-3 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                            perfil === "empresarial"
                              ? "border-[#3b2dff] bg-[#3b2dff]/5 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div
                            className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                              perfil === "empresarial"
                                ? "bg-[#3b2dff] text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <HugeiconsIcon icon={BriefcaseIcon} className="size-5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                              Empresarial
                            </span>
                            <p className="text-slate-500 text-xs font-light mt-0.5">
                              Para empresas (PME/MEI) a partir de 2 vidas com preços reduzidos.
                            </p>
                          </div>
                        </button>
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => setStep(2)}
                          disabled={!isStep1Valid}
                          className="px-6 py-3 rounded-xl bg-[#3b2dff] hover:bg-[#2d20e0] disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-xs shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center gap-1.5"
                        >
                          <span>Próximo Passo</span>
                          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Composição de Idades */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="flex flex-col gap-5 text-left w-full"
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">
                          Quem fará parte do plano de saúde?
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">
                          Informe a idade do titular e eventuais dependentes.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 w-full max-h-[220px] overflow-y-auto pr-1">
                        {/* Titular Input */}
                        <div className="relative w-full shrink-0">
                          <input
                            type="text"
                            required
                            value={titularAge}
                            onChange={handleAgeChange}
                            placeholder="Idade do Titular"
                            className="peer w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff] text-slate-800 font-extrabold text-sm outline-none transition-all placeholder-transparent"
                          />
                          <label className="absolute left-10 top-1 text-[9px] font-black uppercase tracking-wider text-slate-400 transition-all pointer-events-none peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-bold peer-focus:top-1 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-[#3b2dff]">
                            Idade do Titular
                          </label>
                          <HugeiconsIcon
                            icon={UserIcon}
                            className="absolute left-3.5 top-3.5 size-4 text-[#3b2dff]"
                          />
                        </div>

                        {/* Dependentes List */}
                        <AnimatePresence>
                          {dependentes.map((dep, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="relative w-full flex gap-2 items-center shrink-0"
                            >
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  required
                                  value={dep}
                                  onChange={(e) => updateDependente(idx, e.target.value)}
                                  placeholder={`Idade do Dependente ${idx + 1}`}
                                  className="peer w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff] text-slate-800 font-extrabold text-sm outline-none transition-all placeholder-transparent"
                                />
                                <label className="absolute left-10 top-1 text-[9px] font-black uppercase tracking-wider text-slate-400 transition-all pointer-events-none peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-bold peer-focus:top-1 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-[#3b2dff]">
                                  Idade do Dependente {idx + 1}
                                </label>
                                <HugeiconsIcon
                                  icon={UserIcon}
                                  className="absolute left-3.5 top-3.5 size-4 text-slate-400"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDependente(idx)}
                                className="size-11 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                              >
                                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Add Dependente Button */}
                      <button
                        type="button"
                        onClick={addDependente}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-slate-200 hover:border-[#3b2dff]/30 text-slate-600 hover:text-[#3b2dff] hover:bg-[#3b2dff]/2 text-xs font-bold transition-all cursor-pointer self-start"
                      >
                        <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
                        <span>Adicionar Dependente</span>
                      </button>

                      {/* Telemedicine Disclaimer Warning */}
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-start gap-2.5 text-xs font-medium leading-relaxed select-text">
                        <HugeiconsIcon
                          icon={AlertCircleIcon}
                          className="size-4 shrink-0 text-amber-500 mt-0.5"
                        />
                        <p>
                          <strong>Aviso sobre Telemedicina:</strong> Entrevista médica obrigatória
                          via telemedicina para proponentes de 12 a 18 anos e a partir de 49 anos.
                        </p>
                      </div>

                      <div className="flex gap-3 justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs cursor-pointer transition-colors"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          disabled={!isStep2Valid}
                          className="px-6 py-3 rounded-xl bg-[#3b2dff] hover:bg-[#2d20e0] disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-xs shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center gap-1.5"
                        >
                          <span>Próximo Passo</span>
                          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Contato */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="flex flex-col gap-5 text-left w-full"
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">
                          Onde deseja receber a simulação?
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">
                          Informe seu nome e WhatsApp para disparo.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                        {/* Nome */}
                        <div className="relative w-full">
                          <input
                            type="text"
                            required
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Nome Completo"
                            className="peer w-full pl-10 pr-4 py-3.5 pt-6 pb-2 rounded-xl border border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff] text-slate-800 font-extrabold text-sm outline-none transition-all placeholder-transparent"
                          />
                          <label className="absolute left-10 top-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400 transition-all pointer-events-none peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:font-bold peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-[#3b2dff]">
                            Nome Completo
                          </label>
                          <HugeiconsIcon
                            icon={UserIcon}
                            className="absolute left-3.5 top-4.5 size-4 text-slate-400"
                          />
                        </div>

                        {/* WhatsApp */}
                        <div className="relative w-full">
                          <input
                            type="text"
                            required
                            value={whatsapp}
                            onChange={handlePhoneChange}
                            placeholder="(00) 00000-0000"
                            className={`peer w-full pl-10 pr-4 py-3.5 pt-6 pb-2 rounded-xl border text-slate-800 font-extrabold text-sm outline-none transition-all placeholder-transparent ${
                              isPhoneValid
                                ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                : "border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff]"
                            }`}
                          />
                          <label
                            className={`absolute left-10 top-1.5 text-[9px] font-black uppercase tracking-wider transition-all pointer-events-none peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:font-bold peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:font-black ${
                              isPhoneValid
                                ? "text-emerald-500 peer-focus:text-emerald-600"
                                : "text-slate-400 peer-focus:text-[#3b2dff]"
                            }`}
                          >
                            WhatsApp com DDD
                          </label>
                          <HugeiconsIcon
                            icon={WhatsappIcon}
                            className="absolute left-3.5 top-4.5 size-4 text-slate-400"
                          />
                        </div>

                        <div className="flex gap-3 justify-end mt-4">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="px-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs cursor-pointer transition-colors"
                          >
                            Voltar
                          </button>
                          <motion.button
                            type="submit"
                            disabled={!isStep3Valid}
                            whileHover={
                              isStep3Valid
                                ? {
                                    backgroundImage:
                                      "linear-gradient(90deg, #3b2dff, #6356ff, #3b2dff)",
                                    backgroundSize: "200% auto",
                                    backgroundPosition: ["0% 50%", "200% 50%"],
                                    transition: {
                                      backgroundImage: { duration: 0.2 },
                                      backgroundPosition: {
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "linear",
                                      },
                                    },
                                  }
                                : undefined
                            }
                            whileTap={isStep3Valid ? { scale: 0.98 } : undefined}
                            className="flex-1 py-3.5 rounded-xl bg-[#3b2dff] hover:bg-[#2d20e0] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs shadow-sm cursor-pointer hover:shadow-md hover:shadow-[#3b2dff]/10 transition-all flex items-center justify-center will-change-transform"
                          >
                            <span>Gerar Minha Simulação Gratuita</span>
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
