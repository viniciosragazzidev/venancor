"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatQuestionIcon } from "@hugeicons/core-free-icons";

interface AccordionItem {
  question: string;
  answer: string;
}

export default function SectionCoberturas() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const data: AccordionItem[] = [
    {
      question: "Urgência e Emergência (24 Horas)",
      answer:
        "Cobertura completa para atendimentos imediatos pós-acidentes ou mal súbitos com até 12 horas de observação em enfermaria.",
    },
    {
      question: "Consultas Ambulatoriais (30 Dias)",
      answer:
        "Acesso a consultas médicas em clínicas, consultórios credenciados e de especialidades básicas (sujeito a Carência Zero conforme vigência de campanhas internas na rede própria).",
    },
    {
      question: "Serviços Auxiliares Simples (30 Dias)",
      answer:
        "Nebulizações, lavagem auricular, suturas, drenagem de abscessos, imobilizações, engessamento, curativos, exames laboratoriais básicos, urina/fezes e eletrocardiografia convencional.",
    },
    {
      question: "Exames Complexos (120 a 180 Dias)",
      answer:
        "Eletroencefalografia, raio-X (simples e contrastado), ultrassonografia, colposcopia, preventivo, fisioterapia, endoscopia, ecocardiografia, holter, teste ergométrico, ecodoppler, mamografia e exames de anatomopatologia.",
    },
    {
      question: "Alta Complexidade (180 Dias)",
      answer:
        "Cirurgia oftalmológica ambulatorial, ressonância magnética, tomografia computadorizada, densitometria óssea, cintilografia, mapeamento cerebral, quimioterapia, radioterapia e hemodiálise.",
    },
    {
      question: "Doenças ou Lesões Preexistentes (720 Dias)",
      answer:
        "Cobertura parcial temporária conforme as regras vigentes da Agência Nacional de Saúde Suplementar (ANS) para patologias preexistentes antes da contratação.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.section
      id="coberturas"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full py-20 md:py-32 font-sans bg-white relative will-change-transform"
    >
      <div className="w-full max-w-[800px] mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Tag Superior */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          <HugeiconsIcon icon={BubbleChatQuestionIcon} className="size-4 text-[#3b2dff]" />
          <span>Carências e Coberturas</span>
        </div>

        {/* Headlines */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.2] mb-3 text-center select-text">
            <div className="overflow-hidden py-0.5 inline-block">
              <motion.span
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                className="inline-block"
              >
                Prazos Regulamentares de Carência
              </motion.span>
            </div>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed max-w-lg text-center select-text"
          >
            Confira detalhadamente as coberturas ambulatoriais e o cronograma oficial de carências
            do plano Amep Saúde.
          </motion.p>
        </div>

        {/* Accordions */}
        <div className="w-full flex flex-col">
          {data.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`w-full border-b border-slate-200/65 transition-all duration-500 overflow-hidden ${
                  isOpen ? "bg-slate-50/50" : "bg-transparent hover:bg-slate-50/20"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between py-4 px-4 md:px-5 text-left cursor-pointer focus:outline-none group active:scale-[0.99] transition-transform duration-200"
                >
                  <span
                    className={`text-sm md:text-base font-semibold pr-6 transition-colors duration-300 ${
                      isOpen ? "text-[#3b2dff]" : "text-slate-900 group-hover:text-slate-700"
                    }`}
                  >
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`size-5.5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                      isOpen
                        ? "border-[#3b2dff] bg-[#3b2dff] text-white"
                        : "border-slate-200 text-slate-400 group-hover:border-slate-300"
                    }`}
                  >
                    <svg
                      className="size-3 fill-none stroke-current"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-4.5 pt-1 text-xs md:text-sm font-light text-slate-500 leading-relaxed">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
