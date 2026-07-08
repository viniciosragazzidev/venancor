'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface TabContent {
    id: string;
    label: string;
    title: string;
    description: string;
    ctaText: string;
    image: string;
}

export default function SectionDiferenciais() {
    const [activeTab, setActiveTab] = useState<string>('isenta');

    const tabData: TabContent[] = [
        {
            id: 'isenta',
            label: 'Consultoria Isenta',
            title: 'Comparação neutra focada no seu bolso.',
            description: 'Nós não somos uma operadora ligada a uma única marca. A Venacor analisa e compara mais de 10 opções de saúde e odontologia (como Amil, Bradesco, SulAmérica e Unimed) de forma totalmente isenta. Nosso único objetivo é encontrar a melhor cobertura com o menor preço para o seu perfil.',
            ctaText: 'Comparar Operadoras Agora',
            image: 'https://picsum.photos/seed/consulting/800/600'
        },
        {
            id: 'posvenda',
            label: 'Pós-Venda Ativo',
            title: 'Suporte real quando você mais precisa.',
            description: 'Nosso trabalho não termina quando o contrato é assinado. Você conta com um canal VIP exclusivo via WhatsApp para auxiliar em reembolsos, autorização de exames complexos, inclusão de dependentes e gestão de reajustes. Chega de brigar com robôs ou call centers.',
            ctaText: 'Conhecer o Suporte VIP',
            image: 'https://picsum.photos/seed/support/800/600'
        },
        {
            id: 'estrutura',
            label: 'Estrutura e Presença',
            title: 'A segurança de uma corretora física perto de você.',
            description: 'Enquanto o mercado está cheio de páginas genéricas e sem endereço, a Venacor oferece o equilíbrio perfeito entre agilidade digital e suporte humano real. Temos sede física estruturada para receber você e dar total tranquilidade no atendimento pós-venda.',
            ctaText: 'Ver Nossos Endereços',
            image: 'https://picsum.photos/seed/office/800/600'
        }
    ];

    const currentTab = tabData.find(tab => tab.id === activeTab) || tabData[0];

    return (
        <section className="w-full bg-[#faf9f7] py-20 md:py-28 font-sans select-none overflow-hidden">
            <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-12 md:gap-16">
                
                {/* Cabeçalho do Componente */}
                <div className="w-full max-w-3xl text-left space-y-4">
                    {/* Badge/Tag Superior */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] text-xs font-bold uppercase tracking-wider">
                        <span>O Padrão Venacor</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                        Por que escolher a Venacor para cuidar da sua saúde?
                    </h2>

                    <p className="text-slate-500 text-sm md:text-base font-light leading-relaxed max-w-2xl select-text">
                        Muito mais do que vender contratos, nós acompanhamos você do momento da contratação ao pós-venda, garantindo uma escolha inteligente.
                    </p>
                </div>

                {/* Abas e Conteúdo */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* Barra Lateral de Abas */}
                    <div className="lg:col-span-4 flex flex-col gap-2 w-full">
                        {tabData.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative w-full text-left px-6 py-4.5 rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden border ${
                                    activeTab === tab.id 
                                        ? 'bg-white border-slate-200 shadow-sm' 
                                        : 'bg-transparent border-transparent hover:bg-slate-100/50'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b2dff]"
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}
                                <span className={`text-sm font-bold tracking-tight block ${
                                    activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'
                                }`}>
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Conteúdo Renderizado Dinamicamente */}
                    <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] overflow-hidden min-h-[380px] flex flex-col justify-between">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full w-full"
                            >
                                
                                {/* Info text */}
                                <div className="md:col-span-7 flex flex-col items-start gap-5 text-left h-full justify-center">
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                                        {currentTab.title}
                                    </h3>
                                    
                                    <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed select-text">
                                        {currentTab.description}
                                    </p>

                                    <button className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3b2dff] hover:text-[#2d20e0] mt-2 transition-colors cursor-pointer group hover:underline">
                                        <span>{currentTab.ctaText}</span>
                                        <HugeiconsIcon 
                                            icon={ArrowRight01Icon} 
                                            className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" 
                                        />
                                    </button>
                                </div>

                                {/* Refined Grayscale Image */}
                                <div className="md:col-span-5 relative w-full aspect-video md:aspect-[4/3] rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm shrink-0">
                                    <Image
                                        src={currentTab.image}
                                        alt={currentTab.title}
                                        fill
                                        className="object-cover grayscale contrast-110 opacity-90 transition-all duration-700 hover:scale-105 hover:grayscale-0"
                                        sizes="(max-w-700px) 100vw, 400px"
                                    />
                                </div>

                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>

            </div>
        </section>
    );
}
