"use client";

import React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";

export default function SectionExpansao() {
  const col1 = [
    { name: "Rio de Janeiro", highlight: true },
    { name: "Cabo Frio", highlight: true },
    { name: "Armação de Búzios", highlight: false },
    { name: "Belford Roxo", highlight: false },
    { name: "Itaboraí", highlight: false },
    { name: "Casimiro de Abreu", highlight: false },
    { name: "Saquarema", highlight: false },
  ];

  const col2 = [
    { name: "Nova Iguaçu", highlight: true },
    { name: "Arraial do Cabo", highlight: false },
    { name: "Niterói", highlight: false },
    { name: "Nilópolis", highlight: false },
    { name: "Maricá", highlight: false },
    { name: "Campos dos Goytaca...", highlight: false },
    { name: "Rio Bonito", highlight: false },
  ];

  const col3 = [
    { name: "Duque de Caxias", highlight: true },
    { name: "São Pedro da Aldeia", highlight: false },
    { name: "São Gonçalo", highlight: false },
    { name: "São João de Meriti", highlight: false },
    { name: "Rio das Ostras", highlight: false },
    { name: "Petrópolis", highlight: false },
    { name: "Iguaba Grande", highlight: false },
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 10 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 200, damping: 20 },
    },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full py-16 md:py-20 bg-white font-sans select-none overflow-hidden will-change-transform"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Text Description (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-start text-left space-y-4 md:space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/10">
            <HugeiconsIcon icon={Location01Icon} className="size-3" />
            <span>A Força Fluminense</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight leading-[1.2]">
            Projeto de Expansão:
            <br />
            Presente em <span className="text-[#3b2dff]">21 Cidades</span>.
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed max-w-md select-text">
            Sua rotina tem vista para o paraíso? Sua saúde também precisa estar à altura. Seja na{" "}
            <strong className="font-semibold text-slate-700">Região dos Lagos</strong> ou no{" "}
            <strong className="font-semibold text-slate-700">Grande Rio</strong>, viver bem também é
            se cuidar com a excelência da Amep Saúde.
          </p>
        </div>

        {/* Right Side: 3-Column List Card (7 cols) */}
        <div className="lg:col-span-7 w-full flex justify-center lg:justify-end">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="w-full max-w-xl bg-slate-50/50 border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-x-4 sm:gap-y-3 relative overflow-hidden"
          >
            {/* Background design elements */}
            <div className="absolute -bottom-10 -right-10 size-32 rounded-full bg-[#3b2dff]/5 blur-3xl pointer-events-none" />

            {/* Column 1 */}
            <div className="flex flex-col gap-3">
              {col1.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs transition-all duration-200 ${
                    item.highlight
                      ? "bg-[#3b2dff] text-white font-extrabold shadow-sm shadow-[#3b2dff]/10"
                      : "text-slate-600 font-medium hover:text-[#3b2dff] hover:bg-slate-100/50"
                  }`}
                >
                  <HugeiconsIcon
                    icon={Location01Icon}
                    className={`size-3.5 shrink-0 ${item.highlight ? "text-white" : "text-slate-400"}`}
                  />
                  <span className="truncate">{item.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-3">
              {col2.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs transition-all duration-200 ${
                    item.highlight
                      ? "bg-[#3b2dff] text-white font-extrabold shadow-sm shadow-[#3b2dff]/10"
                      : "text-slate-600 font-medium hover:text-[#3b2dff] hover:bg-slate-100/50"
                  }`}
                >
                  <HugeiconsIcon
                    icon={Location01Icon}
                    className={`size-3.5 shrink-0 ${item.highlight ? "text-white" : "text-slate-400"}`}
                  />
                  <span className="truncate">{item.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-3">
              {col3.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs transition-all duration-200 ${
                    item.highlight
                      ? "bg-[#3b2dff] text-white font-extrabold shadow-sm shadow-[#3b2dff]/10"
                      : "text-slate-600 font-medium hover:text-[#3b2dff] hover:bg-slate-100/50"
                  }`}
                >
                  <HugeiconsIcon
                    icon={Location01Icon}
                    className={`size-3.5 shrink-0 ${item.highlight ? "text-white" : "text-slate-400"}`}
                  />
                  <span className="truncate">{item.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
