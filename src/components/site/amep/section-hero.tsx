"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, LicenseIcon, UserIcon, WhatsappIcon } from "@hugeicons/core-free-icons";

export default function SectionHero() {
  const [nome, setNome] = useState("");
  const [phone, setPhone] = useState("");
  const [tipo, setTipo] = useState("empresa");
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 20,
      },
    },
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    // Format: (XX) XXXXX-XXXX
    let formatted = "";
    if (value.length > 0) {
      formatted += `(${value.slice(0, 2)}`;
    }
    if (value.length > 2) {
      formatted += `) ${value.slice(2, 7)}`;
    }
    if (value.length > 7) {
      formatted += `-${value.slice(7, 11)}`;
    }
    setPhone(formatted);
    setIsPhoneValid(value.length >= 10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tipoLabel =
      tipo === "adesao" ? "Individual / Adesão (Ideal Lagos)" : "Empresa / MEI (Smart PME)";
    const msg = `Olá! Gostaria de uma cotação do plano Amep Saúde.\n\nNome: ${nome}\nTipo: ${tipoLabel}`;
    window.open(`https://wa.me/5521964469750?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-slate-50/50 py-16 md:py-24 font-sans select-none overflow-hidden relative"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Text & Floating Cards (55%) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col items-start text-left space-y-6 md:space-y-8"
        >
          {/* Logo & Campaign Badge Row */}
          <motion.div variants={childVariants} className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center justify-center py-1">
              <Image
                src="/amep_saude_logo.png"
                alt="Amep Saúde"
                width={180}
                height={56}
                className="object-contain h-12 sm:h-14 md:h-16 w-auto"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <span>Campanha Comercial Ativa</span>
            </div>
          </motion.div>

          {/* Heading */}
          <div className="overflow-hidden w-full py-1">
            <motion.h1
              variants={childVariants}
              className="text-3xl sm:text-4xl md:text-[40px] font-extrabold text-slate-900 tracking-tight leading-[1.15] select-text"
            >
              O Plano Ambulatorial{" "}
              <span className="relative inline-block text-[#3b2dff] mt-1.5">
                Amep Saúde
                <svg
                  className="absolute -bottom-2 left-0 w-full h-2.5 text-[#3b2dff]"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 7 C 20 2, 80 2, 98 7"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>{" "}
              com o Valor Ideal para Você.
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
            }}
            className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed max-w-md select-text"
          >
            Consultas, exames e acompanhamento médico no dia a dia com a qualidade da operadora Amep
            Saúde. Funcional. Acessível. Presente.
          </motion.p>

          {/* Floating Anchor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-2">
            {/* Card 1: Individual */}
            <motion.div
              variants={childVariants}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col items-start gap-0.5 cursor-default"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                Ideal Adesão (Individual)
              </span>
              <span className="text-xl font-bold font-mono tracking-tight text-slate-900 mt-0.5">
                R$ 138,74
              </span>
              <span className="text-[9px] font-medium text-slate-500 mt-0.5">
                Mensalidade inicial sugerida
              </span>
            </motion.div>

            {/* Card 2: Corporate */}
            <motion.div
              variants={childVariants}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-4 rounded-2xl bg-[#3b2dff] text-white flex flex-col items-start gap-0.5 cursor-default shadow-md shadow-[#3b2dff]/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-white/5 rounded-full blur-md" />
              <span className="text-[9px] font-black uppercase tracking-wider text-white/70">
                Smart PME II (CNPJ / MEI)
              </span>
              <span className="text-xl font-bold font-mono tracking-tight text-white mt-0.5">
                R$ 82,94
              </span>
              <span className="text-[9px] font-medium text-white/80 mt-0.5">
                Para grupos a partir de 30 vidas
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column: Capture Form (45%) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          className="lg:col-span-5 w-full flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-6 text-left">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Consulte as Tabelas
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Preencha os dados abaixo para visualizar os valores regulamentares.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Nome */}
              <div className="relative w-full">
                <input
                  type="text"
                  id="nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome Completo"
                  className="peer w-full pl-10 pr-4 py-3.5 pt-6 pb-2 rounded-xl border border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff] text-slate-800 font-extrabold text-sm outline-none transition-all placeholder-transparent"
                />
                <label
                  htmlFor="nome"
                  className="absolute left-10 top-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400 transition-all pointer-events-none peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:font-bold peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-[#3b2dff]"
                >
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
                  type="tel"
                  id="phone"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className={`peer w-full pl-10 pr-4 py-3.5 pt-6 pb-2 rounded-xl border text-slate-800 font-extrabold text-sm outline-none transition-all placeholder-transparent ${
                    isPhoneValid
                      ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      : "border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff]"
                  }`}
                />
                <label
                  htmlFor="phone"
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

              {/* Tipo de Contratação */}
              <div className="relative w-full">
                <select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="peer w-full pl-10 pr-4 py-3.5 pt-6 pb-2 rounded-xl border border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff] text-slate-800 font-extrabold text-sm outline-none transition-all bg-white cursor-pointer appearance-none"
                >
                  <option value="adesao">Individual / Adesão (Ideal Lagos)</option>
                  <option value="empresa">Empresa / MEI (Smart PME)</option>
                </select>
                <label
                  htmlFor="tipo"
                  className="absolute left-10 top-1.5 text-[9px] font-black uppercase tracking-wider text-[#3b2dff] transition-all pointer-events-none"
                >
                  Tipo de Contratação
                </label>
                <HugeiconsIcon
                  icon={LicenseIcon}
                  className="absolute left-3.5 top-4.5 size-4 text-slate-400"
                />
                <div className="absolute right-4 top-5 pointer-events-none text-slate-400">
                  <svg className="size-4 fill-none stroke-current" viewBox="0 0 24 24">
                    <path
                      d="m6 9 6 6 6-6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full py-4 rounded-xl bg-[#3b2dff] hover:bg-[#2d20e0] text-white font-extrabold text-xs shadow-md shadow-[#3b2dff]/20 cursor-pointer flex items-center justify-center gap-2 will-change-transform mt-2"
              >
                <span>Ver Tabela de Preços</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
