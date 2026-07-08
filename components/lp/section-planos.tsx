'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface PlanoItem {
    id: string;
    name: string;
    category: string;
    description: string;
    logo: string;
}

export default function SectionPlanos() {
    const [activeTab, setActiveTab] = useState<'saude' | 'odonto'>('saude');

    const planosSaude: PlanoItem[] = [
        {
            id: 'amil',
            name: 'Amil Saúde',
            category: 'Nacional Premium',
            description: 'Rede própria de excelência e atendimento nos melhores hospitais do Brasil.',
            logo: '/amil_logo.webp'
        },
        {
            id: 'porto',
            name: 'Porto Saúde',
            category: 'Nacional Premium',
            description: 'Medicina diagnóstica diferenciada e programas exclusivos de bem-estar.',
            logo: '/PortoSaude_logo.webp'
        },
        {
            id: 'amep',
            name: 'AMEP Saúde',
            category: 'Carência Zero Amil',
            description: 'Carência zero em atendimentos ambulatoriais na rede própria e hospitais parceiros.',
            logo: '/amep_saude_logo.png'
        },
        {
            id: 'unimed',
            name: 'Unimed Nova Iguaçu',
            category: 'Líder Regional',
            description: 'Atendimento completo e prioritário no Hospital Geral do Centro em Nova Iguaçu.',
            logo: '/unimed_logo.webp'
        },
        {
            id: 'assim',
            name: 'Assim Saúde',
            category: 'Regional RJ',
            description: 'A maior rede própria do Estado do Rio de Janeiro com ótimo custo-benefício.',
            logo: '/assim-saude_logo.png'
        },
        {
            id: 'leve',
            name: 'Leve Saúde',
            category: 'Econômico 45+',
            description: 'Foco em saúde preventiva e valores acessíveis para todas as idades.',
            logo: '/LEVESaude__logo.webp'
        },
        {
            id: 'cemeru',
            name: 'Cemeru Saúde',
            category: 'Econômico Z. Oeste',
            description: 'Tradição na Zona Oeste e Baixada com hospitais e prontos-socorros próprios.',
            logo: '/cemeru_logo.png'
        },
        {
            id: 'notredame',
            name: 'NotreDame Intermédica',
            category: 'Nacional / PME',
            description: 'Planos corporativos e individuais com ampla estrutura de centros médicos.',
            logo: '/NotreDame_logo.webp'
        },
        {
            id: 'sulamerica',
            name: 'SulAmérica Saúde',
            category: 'Nacional Premium',
            description: 'Livre escolha de médicos com sistema de reembolso rápido e aplicativo completo.',
            logo: '/sulamerica_logo.png'
        }
    ];

    const planosOdonto: PlanoItem[] = [
        {
            id: 'amil-dental',
            name: 'Amil Dental',
            category: 'Nacional Total',
            description: 'Cobertura nacional para próteses, ortodontia, limpeza e emergência 24h.',
            logo: '/amil_logo.webp'
        },
        {
            id: 'sulamerica-odonto',
            name: 'SulAmérica Odonto',
            category: 'Reembolso / Premium',
            description: 'Reembolso para tratamentos especializados e mais de 28 mil opções de atendimento.',
            logo: '/sulamerica_logo.png'
        },
        {
            id: 'porto-odonto',
            name: 'Porto Odonto',
            category: 'Benefício Exclusivo',
            description: 'Carência zero para diversos procedimentos e descontos para segurados Porto.',
            logo: '/PortoSaude_logo.webp'
        },
        {
            id: 'unimed-odonto',
            name: 'Unimed Odonto',
            category: 'Econômico Familiar',
            description: 'Planos odonto acessíveis com ampla rede de dentistas credenciados na Baixada.',
            logo: '/unimed_logo.webp'
        }
    ];

    const items = activeTab === 'saude' ? planosSaude : planosOdonto;

    return (
        <section className="w-full bg-white py-20 md:py-28 font-sans select-none">
            <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-12 md:gap-16">

                {/* Cabeçalho da Seção */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col items-start text-left space-y-4 max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-[1.15]">
                            As <span className="relative inline-block text-[#3b2dff]">
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
                            <br />
                            <div className="mt-1 text-slate-900">de Saúde e Odonto em um só lugar.</div>
                        </h2>
                        <p className="text-slate-500 text-sm md:text-base font-light leading-relaxed max-w-xl">
                            Cotação instantânea com tabela oficial de coparticipação e carências.
                        </p>
                    </div>

                    {/* Shadcn-like Tab Pill Switcher */}
                    <div className="flex bg-primary/5 p-1.5 rounded-2xl border border-slate-200/50 shrink-0 self-start md:self-end">
                        <button
                            onClick={() => setActiveTab('saude')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer ${activeTab === 'saude' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Planos de Saúde
                        </button>
                        <button
                            onClick={() => setActiveTab('odonto')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer ${activeTab === 'odonto' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Planos Odontológicos
                        </button>
                    </div>
                </div>

                {/* Grid Grid Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 md:gap-y-16">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 md:gap-5 group text-left">

                            {/* Logo Wrapper Container (Left side) */}
                            <div className="size-14 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center p-2.5 shrink-0 group-hover:scale-105 transition-all duration-300">
                                <Image
                                    src={item.logo}
                                    alt={item.name}
                                    width={120}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Info Container (Right side) */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {item.category}
                                </span>
                                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                                    {item.name}
                                </h3>
                                <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed mt-1 select-text">
                                    {item.description}
                                </p>

                                {/* Link Button CTA */}
                                <button className="inline-flex items-center gap-1 text-xs font-bold text-[#3b2dff] hover:text-[#2d20e0] mt-3 transition-colors cursor-pointer group-hover:underline">
                                    <span>Ver Tabelas</span>
                                    <HugeiconsIcon
                                        icon={ArrowRight01Icon}
                                        className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}