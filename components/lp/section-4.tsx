'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface Props { }

interface TabContent {
    id: string;
    stepLabel: string;
    title: string;
    bullets: string[];
    imageSrc: string;
    overlayText: {
        title: string;
        subtitle: string;
        avatarInitials: string;
    };
    metricsCard: {
        scoreTitle: string;
        scoreValue: string;
        scoreLabel: string;
        sliderValue: number;
        card2Title: string;
        card2Value: string;
        card2Status: string;
        card2StatusColor: 'success' | 'warning' | 'primary';
        card3Title: string;
        card3Value: string;
        card3Status: string;
        card3StatusColor: 'success' | 'warning' | 'primary';
    };
}

const tabData: TabContent[] = [
    {
        id: 'familia',
        stepLabel: 'Para Você e Família',
        title: 'Atendimento Ágil e Proteção Total',
        bullets: [
            'Hospitais de excelência e prontos-socorros 24h',
            'Carência reduzida na portabilidade de plano',
            'Opções com ou sem coparticipação',
            'Cobertura infantil e emergência nacional'
        ],
        imageSrc: '/image3.png',
        overlayText: {
            title: 'Maria Silva & Família',
            subtitle: 'Plano Saúde Ativo',
            avatarInitials: 'MS'
        },
        metricsCard: {
            scoreTitle: 'Nível de Proteção',
            scoreValue: '100%',
            scoreLabel: 'Completo',
            sliderValue: 100,
            card2Title: 'Hospitais de Referência',
            card2Value: "Rede D'Or e +",
            card2Status: 'Incluso',
            card2StatusColor: 'success',
            card3Title: 'Telemedicina 24h',
            card3Value: 'Disponível',
            card3Status: 'Ativo',
            card3StatusColor: 'primary'
        }
    },
    {
        id: 'empresa',
        stepLabel: 'Empresa & PME',
        title: 'Redução Imadiata de Custos no CNPJ',
        bullets: [
            'Economia de até 35% com CNPJ ou MEI ativo',
            'A partir de apenas 2 vidas (titular + dependente)',
            'Flexibilidade de planos por nível hierárquico',
            'Dedução fiscal e benefício para colaboradores'
        ],
        imageSrc: '/image4.png',
        overlayText: {
            title: 'João Paulo',
            subtitle: 'Plano PME (5 Vidas)',
            avatarInitials: 'JP'
        },
        metricsCard: {
            scoreTitle: 'Desconto Aplicado',
            scoreValue: '35%',
            scoreLabel: 'Economia CNPJ',
            sliderValue: 85,
            card2Title: 'Mínimo de Vidas',
            card2Value: 'A partir de 2',
            card2Status: 'Liberado',
            card2StatusColor: 'success',
            card3Title: 'Migração MEI',
            card3Value: 'Zero burocracia',
            card3Status: 'Ativo',
            card3StatusColor: 'primary'
        }
    },
    {
        id: 'posvenda',
        stepLabel: 'Diferencial Venacor',
        title: 'Suporte Pós-Venda Especializado',
        bullets: [
            'Gestão de reembolsos e inclusão de dependentes',
            'Acompanhamento preventivo contra reajustes abusivos',
            'Emissão rápida de guias e autorizações',
            'Atendimento humano via WhatsApp sempre disponível'
        ],
        imageSrc: '/image2.png',
        overlayText: {
            title: 'Equipe de Suporte Venacor Saúde',
            subtitle: 'Atendimento Ativo',
            avatarInitials: 'AC'
        },
        metricsCard: {
            scoreTitle: 'Satisfação do Cliente',
            scoreValue: '4.9/5',
            scoreLabel: 'Nota Média',
            sliderValue: 98,
            card2Title: 'Tempo de Resposta',
            card2Value: '< 5 minutos',
            card2Status: 'Garantido',
            card2StatusColor: 'success',
            card3Title: 'Gestão de Guias',
            card3Value: 'Suporte Direto',
            card3Status: 'Incluso',
            card3StatusColor: 'primary'
        }
    }
];

const SectionFour: React.FC = () => {
    const [activeTab, setActiveTab] = useState('familia');
    const currentContent = tabData.find(t => t.id === activeTab) || tabData[0];
    const activeIndex = tabData.findIndex(t => t.id === activeTab) + 1;
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setActiveTab(prev => {
                const idx = tabData.findIndex(t => t.id === prev);
                return tabData[(idx + 1) % tabData.length].id;
            });
        }, 5000);
    }, []);

    useEffect(() => {
        startTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [startTimer]);

    const handleTabClick = (id: string) => {
        setActiveTab(id);
        startTimer();
    };

    return (
        <section className="w-full bg-background py-16 md:py-24 font-sans overflow-hidden border-t border-border/20">
            <div className="w-full max-w-[1200px] mx-auto px-6">

                {/* A. CABEÇALHO DA SEÇÃO */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-2xl flex flex-col items-start text-left mb-10 select-none"
                >
                    <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        <span className="size-1.5 rounded-full bg-primary shrink-0" />
                        <span>Diferenciais Exclusivos</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-foreground leading-tight mb-2">
                        O que você ganha ao contratar com a Venacor Saúde.
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base font-light">
                        Soluções sob medida para o seu momento com suporte dedicado do início ao fim.
                    </p>
                </motion.div>

                {/* B. MENU DE ABAS / TABS E PROGRESSO */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-border/10 pb-6">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {tabData.map(tab => {
                            const isActive = tab.id === activeTab;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className="relative px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 focus-visible:outline-none cursor-pointer"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabSection4"
                                            className="absolute inset-0 bg-foreground rounded-full"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <span className={`relative z-10 ${isActive ? 'text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                                        {tab.stepLabel}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Progress Slider (Visual Indicator) */}
                    <div className="flex items-center gap-3 select-none text-xs text-muted-foreground font-semibold shrink-0">
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: '33%' }}
                                animate={{ width: `${(activeIndex / 3) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <span>{activeIndex}/3</span>
                    </div>
                </div>

                {/* C. CONTEÚDO DINÂMICO DA ABA (LAYOUT 3 COLUNAS) */}
                <div className="min-h-[420px] w-full relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch w-full"
                        >

                            {/* COLUNA 1: TEXTO E BENEFÍCIOS */}
                            <div className="flex flex-col justify-center items-start text-left space-y-5">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-muted/40 text-[9px] font-bold text-primary uppercase tracking-wider">
                                    <span className="size-1 rounded-full bg-primary" />
                                    <span>{currentContent.stepLabel}</span>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight leading-tight">
                                    {currentContent.title}
                                </h3>

                                <div className="space-y-3.5 mt-2 w-full">
                                    {currentContent.bullets.map((bullet, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5">
                                            <CheckCircle2 className="size-4.5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-xs sm:text-sm font-medium text-foreground/90 leading-tight">
                                                {bullet}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* COLUNA 2: IMAGEM CENTRAL COM FLOAT CARD */}
                            <div className="relative w-full max-w-[400px] mx-auto md:max-w-none flex items-center">
                                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] w-full shadow-xl border border-border/40 group">
                                    <Image
                                        src={currentContent.imageSrc}
                                        alt={currentContent.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-102"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                                    <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl p-3 shadow-lg flex items-center gap-3 select-none">
                                        <div className="size-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                            {currentContent.overlayText.avatarInitials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs font-bold text-foreground truncate">
                                                {currentContent.overlayText.title}
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {currentContent.overlayText.subtitle}
                                            </p>
                                        </div>
                                        <div className="size-4.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="size-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUNA 3: CONTAINER AZUL COM CARDS DE METRICAS */}
                            <div className="bg-gradient-to-tr from-blue-50/50 to-indigo-50/20 dark:from-slate-900/60 dark:to-blue-950/20 border border-border/30 rounded-[2rem] p-5 flex flex-col justify-center gap-4 aspect-[4/5] w-full">

                                <div className="bg-background border border-border/60 rounded-2xl p-4 shadow-[0_6px_12px_rgba(0,0,0,0.01)]">
                                    <div className="flex justify-between items-start mb-2.5">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                                            {currentContent.metricsCard.scoreTitle}
                                        </span>
                                        <span className="text-xs font-bold text-primary">
                                            {currentContent.metricsCard.scoreValue} {currentContent.metricsCard.scoreLabel}
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1 relative">
                                        <motion.div
                                            className="h-full bg-primary rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${currentContent.metricsCard.sliderValue}%` }}
                                            transition={{ duration: 0.6, delay: 0.2 }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-background border border-border/60 rounded-2xl p-4 shadow-[0_6px_12px_rgba(0,0,0,0.01)] flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">
                                            {currentContent.metricsCard.card2Title}
                                        </span>
                                        <span className="text-xs sm:text-sm font-semibold text-foreground">
                                            {currentContent.metricsCard.card2Value}
                                        </span>
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary">
                                        <span className="relative flex size-1.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75"></span>
                                            <span className="relative inline-flex size-1.5 rounded-full bg-primary"></span>
                                        </span>
                                        <span>{currentContent.metricsCard.card2Status}</span>
                                    </div>
                                </div>

                                <div className="bg-background border border-border/60 rounded-2xl p-4 shadow-[0_6px_12px_rgba(0,0,0,0.01)] flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">
                                            {currentContent.metricsCard.card3Title}
                                        </span>
                                        <span className="text-xs sm:text-sm font-semibold text-foreground">
                                            {currentContent.metricsCard.card3Value}
                                        </span>
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary">
                                        <span className="relative flex size-1.5">
                                            <span className="relative inline-flex size-1.5 rounded-full bg-primary"></span>
                                        </span>
                                        <span>{currentContent.metricsCard.card3Status}</span>
                                    </div>
                                </div>

                            </div>

                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
};

export default SectionFour;