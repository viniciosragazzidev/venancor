"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Medicine01Icon, ShoppingBag02Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons";

export default function SectionPrecos() {
  const precos = [
    {
      faixa: "00 a 18 anos",
      adesao: "R$ 138,74",
      mei1: "R$ 93,19",
      pme2: "R$ 82,94",
      premium: "R$ 128,97",
    },
    {
      faixa: "19 a 23 anos",
      adesao: "R$ 145,67",
      mei1: "R$ 97,85",
      pme2: "R$ 87,09",
      premium: "R$ 135,42",
    },
    {
      faixa: "24 a 28 anos",
      adesao: "R$ 160,24",
      mei1: "R$ 107,64",
      pme2: "R$ 95,80",
      premium: "R$ 148,96",
    },
    {
      faixa: "29 a 33 anos",
      adesao: "R$ 176,26",
      mei1: "R$ 118,40",
      pme2: "R$ 105,37",
      premium: "R$ 163,86",
    },
    {
      faixa: "34 a 38 anos",
      adesao: "R$ 197,42",
      mei1: "R$ 132,60",
      pme2: "R$ 118,02",
      premium: "R$ 183,52",
    },
    {
      faixa: "39 a 43 anos",
      adesao: "R$ 221,11",
      mei1: "R$ 148,51",
      pme2: "R$ 132,18",
      premium: "R$ 205,55",
    },
    {
      faixa: "44 a 48 anos",
      adesao: "R$ 276,38",
      mei1: "R$ 185,64",
      pme2: "R$ 165,22",
      premium: "R$ 256,94",
    },
    {
      faixa: "49 a 53 anos",
      adesao: "R$ 317,84",
      mei1: "R$ 213,49",
      pme2: "R$ 190,00",
      premium: "R$ 295,47",
    },
    {
      faixa: "54 a 58 anos",
      adesao: "R$ 365,52",
      mei1: "R$ 245,51",
      pme2: "R$ 218,50",
      premium: "R$ 339,79",
    },
    {
      faixa: "59 ou mais",
      adesao: "R$ 493,45",
      mei1: "R$ 331,44",
      pme2: "R$ 294,98",
      premium: "R$ 458,71",
    },
  ];

  return (
    <motion.section
      id="precos"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full bg-white py-16 md:py-24 font-sans select-none overflow-hidden will-change-transform"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-12">
        {/* Header */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6 text-left">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span className="size-2 rounded-full bg-[#3b2dff]" />
              <span>Tabelas de Preços</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
              <div className="overflow-hidden py-0.5">
                <motion.span
                  initial={{ y: "100%" }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  className="inline-block"
                >
                  Vitrine de Preços Amep Saúde
                </motion.span>
              </div>
            </h2>

            <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed max-w-md">
              Valores regulamentares do plano Amep Saúde organizados por faixa etária e perfil de
              contratação (Adesão ou PME/MEI).
            </p>
          </div>

          <div className="flex items-center justify-center self-start md:self-end py-1">
            <Image
              src="/amep_saude_logo.png"
              alt="Amep Saúde"
              width={180}
              height={56}
              className="object-contain h-12 sm:h-14 md:h-16 w-auto"
            />
          </div>
        </div>

        {/* Tabela de Preços */}
        <div className="flex md:hidden items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
          <span>Deslize para ver todos os planos</span>
          <svg
            className="size-3 animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        <div className="w-full overflow-x-auto border border-slate-100 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] bg-white">
          <table className="w-full border-collapse text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500">
                  Faixa Etária
                </th>
                <th className="py-3 px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500">
                  Ideal Adesão
                </th>
                <th className="py-3 px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500">
                  Smart MEI/PME I (2-29)
                </th>
                <th className="py-3 px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#3b2dff] bg-[#3b2dff]/3">
                  <div className="flex items-center gap-1.5 justify-start">
                    <span>Smart PME II (30-99)</span>
                    <span className="bg-[#3b2dff] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                      Recomendado
                    </span>
                  </div>
                </th>
                <th className="py-3 px-5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500">
                  Premium MEI/PME I
                </th>
              </tr>
            </thead>
            <tbody>
              {precos.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-5 text-xs sm:text-sm font-bold text-slate-800">
                    {row.faixa}
                  </td>
                  <td className="py-3 px-5 text-xs sm:text-sm font-mono tracking-tight text-slate-600">
                    {row.adesao}
                  </td>
                  <td className="py-3 px-5 text-xs sm:text-sm font-mono tracking-tight text-slate-600">
                    {row.mei1}
                  </td>
                  <td className="py-3 px-5 text-xs sm:text-sm font-mono tracking-tight font-black text-[#3b2dff] bg-[#3b2dff]/3">
                    {row.pme2}
                  </td>
                  <td className="py-3 px-5 text-xs sm:text-sm font-mono tracking-tight text-slate-600">
                    {row.premium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards de Vantagens Extras */}
        <div className="flex flex-col gap-6 text-left mt-6">
          <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">
            Benefícios Extras Corporativos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start gap-4 transition-all duration-300"
            >
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HugeiconsIcon icon={Medicine01Icon} className="size-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-base">
                  Parceria Drogarias Pacheco
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed mt-1">
                  Até 30% OFF em medicamentos e itens elegíveis diretamente no caixa com CPF
                  cadastrado.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start gap-4 transition-all duration-300"
            >
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HugeiconsIcon icon={ShoppingBag02Icon} className="size-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-base">
                  Farmácia de Manipulação FARMEP
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed mt-1">
                  15% de desconto especial em produtos manipulados do grupo da operadora.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start gap-4 transition-all duration-300"
            >
              <div className="size-10 rounded-xl bg-[#3b2dff]/5 text-[#3b2dff] flex items-center justify-center">
                <HugeiconsIcon icon={SmartPhone01Icon} className="size-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-base">Ecossistema Digital</h4>
                <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed mt-1">
                  Acesso rápido a laudos de exames diretamente pelo site, carteira virtual e Super
                  App exclusivo.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
