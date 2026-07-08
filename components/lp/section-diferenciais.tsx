'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';

interface ChecklistItem {
    text: string;
}

interface RightCard {
    label: string;
    value: string;
    hasProgress?: boolean;
    statusBadge?: string;
    statusType?: 'active' | 'success';
}

interface TabContent {
    id: string;
    tag: string;
    title: string;
    checklist: string[];
    image: string;
    testimonial: {
        avatarInitials: string;
        name: string;
        desc: string;
    };
    cards: RightCard[];
    badgeVanessaText?: string;
}

export default function SectionDiferenciais() {
    const [activeTab, setActiveTab] = useState<string>('pme');

    const tabData: TabContent[] = [
        {
            id: 'familia',
            tag: 'Para Você e Família',
            title: 'Proteção Completa para Quem Você Ama',
            checklist: [
                'Atendimento nacional de urgência e emergência',
                'Telemedicina 24 horas inclusa sem custo adicional',
                'Opções de planos com coparticipação inteligente',
                'Ampla rede credenciada nos principais hospitais'
            ],
            image: '/image3.png',
            testimonial: {
                avatarInitials: 'ME',
                name: 'Maria Eduarda',
                desc: 'Plano Familiar (3 Vidas)'
            },
            cards: [
                { label: 'CARÊNCIA REDUZIDA', value: 'Até 0 dias para consultas' },
                { label: 'SUPORTE FAMILIAR', value: 'Atendimento prioritário', statusBadge: 'Liberado', statusType: 'success' },
                { label: 'REEMBOLSO', value: 'Rápido via aplicativo', statusBadge: 'Ativo', statusType: 'active' }
            ],
            badgeVanessaText: 'Juliana liberou tabela Familiar com desconto'
        },
        {
            id: 'pme',
            tag: 'Empresa & PME',
            title: 'Redução Imediata de Custos no CNPJ',
            checklist: [
                'Economia de até 35% com CNPJ ou MEI ativo',
                'A partir de apenas 2 vidas (titular + dependente)',
                'Flexibilidade de planos por nível hierárquico',
                'Dedução fiscal e benefício para colaboradores'
            ],
            image: '/image4.png',
            testimonial: {
                avatarInitials: 'JP',
                name: 'João Paulo',
                desc: 'Plano PME (5 Vidas)'
            },
            cards: [
                { label: 'DESCONTO APLICADO', value: '35% Economia CNPJ', hasProgress: true },
                { label: 'MÍNIMO DE VIDAS', value: 'A partir de 2', statusBadge: 'Liberado', statusType: 'success' },
                { label: 'MIGRAÇÃO MEI', value: 'Zero burocracia', statusBadge: 'Ativo', statusType: 'active' }
            ],
            badgeVanessaText: 'Vanessa liberou tabela PME com 35%'
        },
        {
            id: 'diferencial',
            tag: 'Diferencial Venacor',
            title: 'Assessoria Isenta e Suporte Pós-Venda',
            checklist: [
                'Comparação isenta de mais de 10 operadoras',
                'Gestão ativa de reajustes anuais no plano',
                'Suporte dedicado para reembolsos complexos',
                'Sede física para atendimento humano real'
            ],
            image: '/image5.png',
            testimonial: {
                avatarInitials: 'CA',
                name: 'Carlos Alberto',
                desc: 'Cliente há 4 anos'
            },
            cards: [
                { label: 'SATISFAÇÃO', value: '98% de aprovação' },
                { label: 'SUPORTE VIP', value: 'Canal direto no WhatsApp', statusBadge: 'Liberado', statusType: 'success' },
                { label: 'ECONOMIA MÉDIA', value: 'R$ 2.400 economizados/ano', statusBadge: 'Ativo', statusType: 'active' }
            ],
            badgeVanessaText: 'Especialista disponível para suporte exclusivo'
        }
    ];

    const activeIndex = tabData.findIndex(t => t.id === activeTab);
    const progressPercent = ((activeIndex + 1) / tabData.length) * 100;
    const currentTab = tabData[activeIndex] || tabData[0];

    return (
        <section className="w-full bg-white py-16 md:py-20 font-sans select-none overflow-hidden">
            <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-8 md:gap-10">
                
                {/* 1. Cabeçalho */}
                <div className="w-full text-left space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span className="size-2 rounded-full bg-[#3b2dff]" />
                        <span>Diferenciais Exclusivos</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-[1.15] max-w-2xl">
                        O que você ganha ao contratar com a Venacor Saúde.
                    </h2>
                    <p className="text-slate-500 text-sm md:text-base font-light leading-relaxed max-w-xl">
                        Soluções sob medida para o seu momento com suporte dedicado do início ao fim.
                    </p>
                </div>

                {/* 2. Menu de Abas / Tabs Switcher */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-100 pb-4 w-full">
                    <div className="flex flex-wrap gap-2">
                        {tabData.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                                    activeTab === tab.id 
                                        ? 'bg-[#3b2dff] text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                                }`}
                            >
                                {tab.tag}
                            </button>
                        ))}
                    </div>

                    {/* Progress Slider */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold shrink-0">
                        <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#3b2dff] transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span>{activeIndex + 1}/{tabData.length}</span>
                    </div>
                </div>

                {/* 3. Grid de Conteúdo Dinâmico */}
                <div className="min-h-[500px] w-full relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full"
                        >
                            
                            {/* Esquerda: Textos + Checklist */}
                            <div className="lg:col-span-4 flex flex-col items-start gap-6 text-left w-full">
                                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/15">
                                    {currentTab.tag}
                                </span>
                                
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                                    {currentTab.title}
                                </h3>

                                <ul className="flex flex-col gap-3.5 w-full">
                                    {currentTab.checklist.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 font-normal leading-normal">
                                            <div className="size-5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] flex items-center justify-center shrink-0 mt-0.5">
                                                <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                                            </div>
                                            <span className="select-text">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Centro: Imagem com Testemunho flutuante */}
                            <div className="lg:col-span-4 flex justify-center w-full relative">
                                <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.06)]">
                                    <Image 
                                        src={currentTab.image} 
                                        alt={currentTab.title} 
                                        fill 
                                        className="object-cover"
                                        priority
                                    />
                                    
                                    {/* Testimonial Badge */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200/50 flex items-center gap-3 shadow-md">
                                        <div className="size-10 rounded-full bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/15 font-black text-sm flex items-center justify-center shrink-0">
                                            {currentTab.testimonial.avatarInitials}
                                        </div>
                                        <div className="flex-1 flex flex-col text-left">
                                            <span className="text-xs font-black text-slate-800">{currentTab.testimonial.name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{currentTab.testimonial.desc}</span>
                                        </div>
                                        <div className="size-5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] flex items-center justify-center shrink-0">
                                            <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Direita: Stack de Cards + Vanessa Online Badge */}
                            <div className="lg:col-span-4 flex flex-col gap-4 w-full relative">
                                {currentTab.cards.map((card, idx) => (
                                    <div 
                                        key={idx} 
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-5 flex flex-col gap-2.5 text-left shadow-2xs"
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                {card.label}
                                            </span>
                                            
                                            {card.statusBadge && (
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    card.statusType === 'success' 
                                                        ? 'bg-[#3b2dff]/5 text-[#3b2dff]' 
                                                        : 'bg-emerald-50 text-emerald-600 flex items-center gap-1'
                                                }`}>
                                                    {card.statusType === 'active' && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                    {card.statusBadge}
                                                </span>
                                            )}
                                        </div>

                                        <span className="text-sm font-extrabold text-slate-800">
                                            {card.value}
                                        </span>

                                        {card.hasProgress && (
                                            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                                                <div className="w-[85%] h-full bg-[#3b2dff] rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                ))}


                            </div>

                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
}
