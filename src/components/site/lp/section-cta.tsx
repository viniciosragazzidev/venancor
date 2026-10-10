"use client";

import React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon, ArrowRight01Icon, ZapIcon } from "@hugeicons/core-free-icons";

interface SectionCtaProps {
  variant?: "middle" | "bottom";
  title?: React.ReactNode;
  description?: string;
}

export default function SectionCta({ variant = "middle", title, description }: SectionCtaProps) {
  const isBottom = variant === "bottom";

  const whatsappCotacaoUrl = `https://wa.me/5521964469750?text=${encodeURIComponent(
    "Olá! Gostaria de fazer uma cotação rápida de plano de saúde pela Venacor.",
  )}`;

  const whatsappConsultorUrl = `https://wa.me/5521964469750?text=${encodeURIComponent(
    "Olá! Estava navegando no site da Venacor e gostaria de falar com um consultor sobre os planos de saúde.",
  )}`;

  // Default content based on variant
  const defaultTitle = isBottom ? (
    <>
      Tome a melhor decisão para sua{" "}
      <span className="relative inline-block">
        saúde
        <svg
          className="absolute -bottom-1.5 left-0 w-full h-1.5 text-white/80"
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
      e bolso.
    </>
  ) : (
    <>
      Simule seu plano em{" "}
      <span className="relative inline-block text-[#3b2dff]">
        segundos
        <svg
          className="absolute -bottom-1.5 left-0 w-full h-1.5 text-[#3b2dff]/80"
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
      </span>
    </>
  );

  const defaultDesc = isBottom
    ? "Nossos consultores analisam seu perfil para propor o melhor custo-benefício de forma personalizada."
    : "Compare preços online e receba suporte dedicado de quem é especialista na Baixada.";

  const displayTitle = title || defaultTitle;
  const displayDesc = description || defaultDesc;

  return (
    <section className="w-full py-10 md:py-14 font-sans select-none overflow-hidden bg-white">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`relative rounded-[2.2rem] p-6 md:p-12 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 ${
            isBottom
              ? "bg-[#3b2dff] border border-[#3b2dff]/20 text-white shadow-[0_25px_50px_-20px_rgba(59,45,255,0.2)]"
              : "bg-slate-50/60 border border-slate-100 text-slate-900 shadow-[0_15px_40px_-20px_rgba(59,45,255,0.04)]"
          }`}
        >
          {/* Background decorative glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {isBottom ? (
              <>
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-[100px]" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-[100px]" />
              </>
            ) : (
              <>
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#3b2dff]/3 blur-[80px]" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-slate-100/50 blur-[80px]" />
              </>
            )}
          </div>

          {/* Left Column: Text */}
          <div className="relative z-10 flex flex-col items-start text-left max-w-xl space-y-3.5">
            {/* Standard tag badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isBottom
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-[#3b2dff]/5 text-[#3b2dff] border-[#3b2dff]/10"
              }`}
            >
              <span className={`size-1.5 rounded-full ${isBottom ? "bg-white" : "bg-[#3b2dff]"}`} />
              <span>{isBottom ? "Atendimento Exclusivo" : "Cotação Imediata"}</span>
            </div>

            <h3
              className={`text-2xl md:text-3xl font-bold tracking-tight leading-[1.2] ${
                isBottom ? "text-white" : "text-slate-900"
              }`}
            >
              <div className="overflow-hidden py-0.5">
                <motion.span
                  initial={{ y: "100%" }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  className="inline-block"
                >
                  {displayTitle}
                </motion.span>
              </div>
            </h3>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className={`text-xs md:text-sm font-light leading-relaxed max-w-[48ch] ${
                isBottom ? "text-white/85" : "text-slate-500"
              }`}
            >
              {displayDesc}
            </motion.p>
          </div>

          {/* Right Column: CTA Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            {/* Button 1: Quotation */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => window.open(whatsappCotacaoUrl, "_blank")}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs cursor-pointer transition-shadow duration-200 w-full sm:w-auto will-change-transform ${
                isBottom
                  ? "bg-white text-[#3b2dff] hover:bg-slate-50 shadow-md shadow-white/5"
                  : "bg-[#3b2dff] text-white hover:bg-[#2d20e0] shadow-md shadow-[#3b2dff]/20"
              }`}
            >
              <span>Fazer Cotação Rápida</span>
              <HugeiconsIcon icon={ZapIcon} className="size-3.5 shrink-0" />
            </motion.button>

            {/* Button 2: Consultant */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => window.open(whatsappConsultorUrl, "_blank")}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs cursor-pointer transition-all duration-200 w-full sm:w-auto border will-change-transform ${
                isBottom
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <HugeiconsIcon icon={WhatsappIcon} className="size-3.5 shrink-0 text-emerald-300" />
              <span>Falar com Consultores</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 shrink-0 opacity-40" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
