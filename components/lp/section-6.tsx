'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SplitText from '@/components/split-text';

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "Posso contratar com MEI ou CNPJ?",
        answer: "Sim! Com um CNPJ ativo (incluindo MEI), você garante até 35% de desconto. A maioria das operadoras exige apenas 2 ou 3 vidas (você + dependentes diretos)."
    },
    {
        question: "Aproveito minhas carências se mudar de plano?",
        answer: "Sim. Fazemos a portabilidade e analisamos seu plano atual para que você não precise cumprir novos prazos para consultas e exames na nova operadora."
    },
    {
        question: "Qual a diferença entre plano Nacional e Regional?",
        answer: "Planos Nacionais cobrem todo o Brasil, ideais para quem viaja. Os Regionais focam no seu estado e costumam ter um custo-benefício muito mais atrativo."
    },
    {
        question: "A contratação é demorada?",
        answer: "Não. Nosso processo é 100% online, rápido e seguro. Ainda assim, você conta com suporte humano no WhatsApp e nossa loja física em Nova Iguaçu."
    },
    {
        question: "Pago alguma taxa pela consultoria?",
        answer: "Não! A consultoria é 100% gratuita para você. Somos remunerados diretamente pelas operadoras."
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' } as const
    }
};

const SectionSix: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="w-full bg-background py-16 md:py-24 font-sans border-t border-border/20">
            <div className="w-full max-w-3xl mx-auto px-6">
                
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-center mb-12 select-none"
                >
                    <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        <span className="size-1.5 rounded-full bg-primary shrink-0" />
                        <span>Dúvidas Frequentes</span>
                    </div>
                    
                    {/* SplitText Headline */}
                    <div className="w-full text-center">
                        <SplitText
                            tag="h2"
                            className="text-2xl sm:text-4xl font-medium tracking-tight text-foreground leading-tight mb-3"
                            delay={25}
                        >
                            Tudo o que você precisa saber
                        </SplitText>
                    </div>

                    <p className="text-muted-foreground text-sm sm:text-base font-light">
                        Esclareça as principais dúvidas sobre carências, contratação e modelos de planos.
                    </p>
                </motion.div>

                {/* FAQ Accordion List with Stagger reveal */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="space-y-4 w-full"
                >
                    {faqData.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <motion.div 
                                variants={itemVariants}
                                key={index} 
                                className="border-b border-border/50 pb-3"
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full py-4 flex items-center justify-between text-left gap-4 group cursor-pointer focus-visible:outline-none"
                                >
                                    <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                                        {item.question}
                                    </span>
                                    <motion.span
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        className="text-muted-foreground shrink-0 size-5 flex items-center justify-center bg-muted/40 rounded-full group-hover:bg-muted transition-colors duration-200"
                                    >
                                        <ChevronDown className="size-3.5" />
                                    </motion.span>
                                </button>
                                
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-4 pt-1 pr-6">
                                                <SplitText 
                                                    text={item.answer}
                                                    className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light"
                                                    splitType="words"
                                                    delay={10}
                                                    duration={0.5}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.div>

            </div>
        </section>
    );
};

export default SectionSix;
