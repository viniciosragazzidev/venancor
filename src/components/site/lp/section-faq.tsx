"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatQuestionIcon } from "@hugeicons/core-free-icons";

const faqData = [
  {
    question: "Eu tenho apenas um MEI ou CNPJ pequeno. Consigo contratar com desconto?",
    answer:
      "Com certeza. Para garantir o menor preço através da tabela empresarial (com descontos de até 35%), basta possuir um CNPJ ou MEI ativo. Na modalidade MEI (de 2 a 29 vidas), o titular entra obrigatoriamente no contrato, mas os demais dependentes não precisam ter vínculo empregatício — você pode incluir parentes, colaboradores ou qualquer outra pessoa de sua escolha. Esta é a forma mais inteligente de pagar menos pelo mesmo atendimento.",
  },
  {
    question: "Como funciona o processo de contratação? Preciso ir até uma agência física?",
    answer:
      "Não há necessidade. Todo o processo de análise de documentos, preenchimento de propostas e assinatura do contrato é feito de forma 100% digital e segura para poupar o seu tempo. No entanto, como a Venacor é uma corretora consolidada com sede física estruturada no Centro de Nova Iguaçu, você tem a segurança extra de contar com suporte humano e presencial sempre que precisar no pós-venda, sem ficar preso a robôs de atendimento.",
  },
  {
    question: "O plano cobre consultas e tratamentos fora da minha região?",
    answer:
      "Isso depende estritamente do modelo e da abrangência que você escolher. Nós trabalhamos tanto com planos de abrangência regional (focados no atendimento de excelência na Baixada Fluminense e Grande Rio) quanto com planos de abrangência nacional premium. Além disso, opções como a Amep Saúde contam com projetos de expansão cobrindo mais de 21 cidades do estado, incluindo a Região dos Lagos. Nossa consultoria isenta avalia a rotina da sua família ou da sua equipe para indicar o modelo com o melhor custo-benefício.",
  },
  {
    question: "Já tenho outro plano de saúde. Consigo migrar aproveitando minhas carências?",
    answer:
      "Sim, é perfeitamente possível através do processo de compra ou redução de carência. Nós analisamos detalhadamente o tempo que você permaneceu no seu plano de saúde anterior (exigindo-se a permanência a partir de 6 meses no convênio anterior para determinadas operadoras) e a categoria dele para reduzir ou zerar os prazos de espera regulamentares na sua nova escolha.",
  },
  {
    question: "O que está incluso em um plano de saúde ambulatorial e quais são as carências?",
    answer:
      "O plano ambulatorial garante o direito completo a consultas nas especialidades médicas, exames complementares e atendimentos de urgência e emergência com repouso de até 12 horas em enfermaria, funcionando inteiramente sem franquia e sem coparticipação. Prazos regulamentares de carência incluem 24 horas para urgência/emergência, 30 dias para consultas e exames simples, e 180 dias para exames de alta complexidade — contudo, promovemos campanhas comerciais frequentes com o benefício de Carência ZERO para consultas nas redes próprias.",
  },
];

export default function SectionFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.section
      id="faq"
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
          <span>Dúvidas Frequentes</span>
        </div>

        {/* Headlines */}
        <div className="text-center">
          {/* Título */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-[1.15] mb-4 text-center select-text">
            <div className="overflow-hidden py-0.5 inline-block">
              <motion.span
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                className="inline-block"
              >
                Tudo o que você precisa saber.
              </motion.span>
            </div>
          </h2>

          {/* Descrição */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-slate-500 text-sm md:text-base font-light leading-relaxed max-w-xl mb-12 md:mb-16 text-center select-text"
          >
            Respostas diretas e transparentes sobre coberturas, carências, reajustes e
            portabilidade.
          </motion.p>
        </div>

        {/* Accordions */}
        <div className="w-full flex flex-col">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`w-full border-b border-slate-200/60 transition-all duration-500 overflow-hidden ${
                  isOpen ? "bg-slate-50/50" : "bg-transparent hover:bg-slate-50/30"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between py-4 px-4 md:px-5 text-left cursor-pointer focus:outline-none group active:scale-[0.99] transition-transform duration-200"
                >
                  <span
                    className={`text-sm md:text-base font-semibold pr-6 transition-colors duration-300 ${isOpen ? "text-[#3b2dff]" : "text-slate-900 group-hover:text-slate-700"}`}
                  >
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-[#3b2dff] text-white shadow-md shadow-[#3b2dff]/20"
                        : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
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
                      <div className="px-4 md:px-5 pb-4 pt-1 text-xs md:text-sm font-light text-slate-500 leading-relaxed">
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
