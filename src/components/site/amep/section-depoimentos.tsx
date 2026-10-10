"use client";

import React from "react";
import { motion } from "framer-motion";

interface Testimonial {
  name: string;
  age: number;
  location: string;
  savings: string;
  text: string;
  role: string;
}

export default function SectionDepoimentos() {
  const testimonials: Testimonial[] = [
    {
      name: "Vitor Mendonça",
      age: 38,
      location: "Jacarepaguá, RJ",
      savings: "Economia de R$ 340/mês",
      text: "O Hospital CHAJ Jacarepaguá é excelente. Precisei de consulta de rotina e exames de sangue urgentes e o plano Amep Saúde cobriu tudo rápido, sem burocracia ou filas longas.",
      role: "Microempreendedor (MEI)",
    },
    {
      name: "Mariana Azevedo",
      age: 29,
      location: "Madureira, RJ",
      savings: "Economia de R$ 220/mês",
      text: "Estava pagando muito caro em planos nacionais e mal usava. Com a Amep Saúde tenho atendimento de rotina excelente na unidade própria de Madureira e economizo mais da metade todo mês.",
      role: "Profissional Autônoma",
    },
    {
      name: "Aline de Souza",
      age: 45,
      location: "Freguesia, RJ",
      savings: "Economia de R$ 410/mês",
      text: "Contratei o plano Amep Saúde para a família e estamos surpresos com o carinho do atendimento. A clínica própria da Freguesia é impecável e o agendamento de consultas é feito em poucos cliques no celular.",
      role: "Mãe de 2 filhos",
    },
  ];

  return (
    <motion.section
      id="depoimentos"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full py-16 md:py-24 bg-white font-sans select-none overflow-hidden will-change-transform"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
        {/* Header */}
        <div className="w-full text-center space-y-3 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="size-2 rounded-full bg-[#3b2dff]" />
            <span>Depoimentos Reais</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-[1.15]">
            Quem Escolheu a Amep Saúde Aprova
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-light leading-relaxed">
            Depoimentos de clientes do Rio de Janeiro que uniram economia familiar ou empresarial
            com atendimento ágil de consultas e exames.
          </p>
        </div>

        {/* Testimonials Grid (Asymmetric Bento style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-6 rounded-3xl border border-slate-200/60 bg-white hover:border-[#3b2dff]/30 shadow-[0_12px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between text-left"
            >
              <div className="space-y-4">
                {/* Stars Row (SVG Star - clean and customizable) */}
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Quote */}
                <p className="text-slate-600 text-sm font-light leading-relaxed select-text italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              {/* Author details */}
              <div className="border-t border-slate-100 pt-4 mt-6 flex flex-col">
                <span className="text-sm font-black text-slate-800 tracking-tight">
                  {t.name}, {t.age} anos
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {t.role} &bull; {t.location}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 self-start px-2 py-0.5 rounded-md mt-2 border border-emerald-100/50">
                  {t.savings}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
