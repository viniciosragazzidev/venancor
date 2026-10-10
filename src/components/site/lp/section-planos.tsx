"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface PlanoItem {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string;
}

export default function SectionPlanos() {
  const [activeTab, setActiveTab] = useState<"saude" | "odonto">("saude");

  const planosSaude: PlanoItem[] = [
    {
      id: "sulamerica",
      name: "SulAmérica Saúde",
      category: "Premium Corporativo",
      description:
        "Reembolso ágil, rede premium de hospitais como Copa Star e Samaritano, e coparticipação inteligente.",
      logo: "/sulamerica_logo.png",
    },
    {
      id: "assim-saude",
      name: "Assim Saúde",
      category: "Rede Regional Rio",
      description:
        "A maior rede de atendimento médico privado do Rio de Janeiro, com força total na Baixada.",
      logo: "/assim-saude_logo.png",
    },
    {
      id: "amil",
      name: "Amil Saúde",
      category: "Custo-Benefício Integrado",
      description:
        "Rede credenciada robusta na Baixada Fluminense com acesso ao Hospital das Clínicas de Nova Iguaçu.",
      logo: "/amil_logo.webp",
    },
    {
      id: "leve-saude",
      name: "Leve Saúde",
      category: "Foco no Rio & 45+",
      description:
        "Preços altamente competitivos com excelente rede referenciada própria e credenciada no Grande Rio.",
      logo: "/LEVESaude__logo.webp",
    },
    {
      id: "intermedica",
      name: "GNDI NotreDame",
      category: "Mais Vendido PME",
      description:
        "Planos altamente competitivos para pequenas empresas e MEI, com foco em medicina preventiva.",
      logo: "/NotreDame_logo.webp",
    },
    {
      id: "porto",
      name: "Porto Saúde",
      category: "Parceria de Confiança",
      description:
        "Atendimento humanizado com ótimos diferenciais de telemedicina e programas de bem-estar.",
      logo: "/PortoSaude_logo.webp",
    },
  ];

  const planosOdonto: PlanoItem[] = [
    {
      id: "amil-odonto",
      name: "Amil Dental",
      category: "Rede Nacional",
      description:
        "Mais de 40 mil opções de atendimento com aprovação imediata de tratamentos pelo app.",
      logo: "/amil_logo.webp",
    },
    {
      id: "sulamerica-odonto",
      name: "SulAmérica Odonto",
      category: "Premium Estética",
      description:
        "Excelente reembolso para próteses e aparelhos ortodônticos com rede referenciada diferenciada.",
      logo: "/sulamerica_logo.png",
    },
    {
      id: "unimed-odonto",
      name: "Unimed Odonto",
      category: "Foco PME",
      description: "Planos odonto acessíveis com ampla rede de dentistas credenciados na Baixada.",
      logo: "/unimed_logo.webp",
    },
  ];

  const items = activeTab === "saude" ? planosSaude : planosOdonto;

  return (
    <motion.section
      id="planos"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full bg-white py-20 md:py-28 font-sans select-none will-change-transform"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-12 md:gap-16">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col items-start text-left space-y-4 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-[1.15]">
              <div className="overflow-hidden py-0.5">
                <motion.span
                  initial={{ y: "100%" }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  className="inline-block"
                >
                  As{" "}
                  <span className="relative inline-block text-[#3b2dff]">
                    Melhores opções
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-2 text-[#3b2dff]"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 7 C 20 2, 80 2, 98 7"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </span>
                </motion.span>
              </div>
              <div className="overflow-hidden py-0.5 mt-1">
                <motion.span
                  initial={{ y: "100%" }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.05 }}
                  className="inline-block text-slate-900"
                >
                  de Saúde e Odonto em um só lugar.
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
              Cotação instantânea com tabela oficial de coparticipação e carências.
            </motion.p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 shrink-0 self-start md:self-end relative">
            <button
              onClick={() => setActiveTab("saude")}
              className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-colors duration-200 cursor-pointer z-10 ${
                activeTab === "saude" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {activeTab === "saude" && (
                <motion.div
                  layoutId="plansTabIndicator"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <span className="relative z-10">Planos de Saúde</span>
            </button>
            <button
              onClick={() => setActiveTab("odonto")}
              className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-colors duration-200 cursor-pointer z-10 ${
                activeTab === "odonto" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {activeTab === "odonto" && (
                <motion.div
                  layoutId="plansTabIndicator"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <span className="relative z-10">Planos Odontológicos</span>
            </button>
          </div>
        </div>

        {/* Grid Grid Items */}
        <div className="min-h-[350px] w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 md:gap-y-16"
            >
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 md:gap-5 group text-left">
                  {/* Logo Wrapper Container (Left side) */}
                  <div className="size-14 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center p-2.5 shrink-0 group-hover:scale-105 transition-all duration-300">
                    <Image
                      src={item.logo}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>

                  {/* Info Container (Right side) */}
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                      {item.name}
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {item.category}
                    </span>
                    <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed mt-1 select-text">
                      {item.description}
                    </p>

                    {/* Link Button CTA */}
                    <button
                      onClick={() => {
                        window.open(
                          `https://wa.me/5521964469750?text=${encodeURIComponent(`Olá! Vi o plano ${item.name} no site e gostaria de ver as tabelas de preços.`)}`,
                          "_blank",
                        );
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3b2dff] hover:text-[#2d20e0] mt-3 transition-colors cursor-pointer group-hover:underline self-start"
                    >
                      <span>Ver Tabelas</span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
