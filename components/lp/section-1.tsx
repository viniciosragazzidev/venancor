'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, ShieldCheck, AlertTriangle, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LogoLoop from '@/components/ui/logo-loop';

const partnerLogos = [
    { src: '/amil_logo.webp', alt: 'Amil' },
    { src: '/sulamerica_logo.png', alt: 'SulAmérica' },
    { src: '/PortoSaude_logo.webp', alt: 'Porto Saúde' },
    { src: '/unimed_logo.webp', alt: 'Unimed Nova Iguaçu' },
    { src: '/NotreDame_logo.webp', alt: 'NotreDame Intermédica' },
    { src: '/assim-saude_logo.png', alt: 'Assim Saúde' },
    { src: '/cemeru_logo.png', alt: 'Cemeru' },
    { src: '/LEVESaude__logo.webp', alt: 'Leve Saúde' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (delay: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
    }),
};

const SectionOne: React.FC = () => {
    return (
        <>
        <section className="w-full bg-background py-16 md:py-24 font-sans overflow-hidden">
            <div className="w-full max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                
                {/* COLUNA DA ESQUERDA (Foto Humanizada da Equipe/Atendimento com Badges de Sede) */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0.2}
                    className="relative w-full max-w-[500px] mx-auto md:max-w-none"
                >
                    <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl border border-border/40 group">
                        <Image
                            src="/image1.png"
                            alt="Atendimento presencial Venacor Saúde Nova Iguaçu"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-102"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/30 pointer-events-none" />

                        {/* Tag Superior (Nossa Sede Física em Nova Iguaçu) */}
                        <div
                            className="absolute bottom-[68px] left-4 right-4 sm:right-auto sm:left-5 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-border/30 bg-background/95 backdrop-blur-md shadow-lg transition-transform duration-300 hover:scale-[1.02] select-none"
                        >
                            <span className="p-1 rounded-md bg-primary/10 text-primary shrink-0">
                                <MapPin className="size-3.5 sm:size-4" />
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-foreground leading-tight">
                                Sede Física: R. Athaide Pimenta de Morais, 381 - Nova Iguaçu
                            </span>
                        </div>

                        {/* Tag Inferior (Consultoria Isenta & Multimarcas) */}
                        <div
                            className="absolute bottom-4 left-4 right-4 sm:right-auto sm:left-5 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-border/30 bg-background/95 backdrop-blur-md shadow-lg transition-transform duration-300 hover:scale-[1.02] select-none"
                        >
                            <span className="p-1 rounded-md bg-primary/10 text-primary shrink-0">
                                <ShieldCheck className="size-3.5 sm:size-4" />
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-foreground leading-tight">
                                Consultoria 100% Isenta e Multimarcas na Baixada
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* COLUNA DA DIREITA (Autoridade & Transparência) */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0.5}
                    className="flex flex-col justify-center text-left"
                >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-muted/40 text-[10px] sm:text-xs font-semibold text-muted-foreground mb-4 w-fit select-none">
                        <span className="size-1.5 rounded-full bg-primary shrink-0" />
                        <span>• Conheça a nossa corretora</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-[1.2] mb-5">
                        Tradição e Segurança para Escolher o Seu Plano.
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 font-light">
                        Não somos um robô de vendas sem suporte. A <strong className="text-foreground font-semibold">Venacor Saúde</strong> possui sede própria no Centro de Nova Iguaçu e atende clientes em todo o Rio de Janeiro com suporte humano do primeiro atendimento ao pós-venda.
                    </p>

                    {/* Card de Informações da Corretora */}
                    <div className="w-full bg-gradient-to-tr from-blue-50/50 to-indigo-50/20 dark:from-slate-900/50 dark:to-blue-950/10 rounded-[2rem] p-6 border border-border/40 flex justify-center items-center overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full bg-primary/5 blur-[40px] pointer-events-none" />

                        <div className="bg-background border border-border/60 rounded-2xl p-5 shadow-[0_12px_24px_rgba(0,0,0,0.03)] w-full relative z-10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg space-y-4">
                            
                            {/* Bloco 1: Sede Física */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <Building2 className="size-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                                        Nossa Sede Física em Nova Iguaçu
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-light mt-0.5">
                                        Rua Athaide Pimenta de Morais, 381 - Centro, Nova Iguaçu - RJ
                                    </p>
                                </div>
                            </div>

                            {/* Bloco 2: Atividade Multimarcas */}
                            <div className="flex items-start gap-3 pt-3 border-t border-border/40">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <ShieldCheck className="size-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                                        Consultoria Isenta e Multimarcas
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-light mt-0.5">
                                        Analisamos imparcialmente todas as operadoras para encontrar o menor valor sem taxas de consultoria.
                                    </p>
                                </div>
                            </div>

                            {/* Alerta de transparência */}
                            <div className="flex items-start gap-2 text-[10px] text-amber-600 dark:text-amber-500/90 bg-amber-500/5 border border-amber-500/10 rounded-xl p-2.5 mt-2">
                                <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="leading-normal font-light">
                                    Atendimento presencial ou 100% digital via WhatsApp com envio de contrato oficial.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Logo Loop - Partners */}
        <div className="w-full bg-background py-8 md:py-12 font-sans flex items-center justify-center border-t border-border/20">
            <div className="w-full max-w-5xl mx-auto px-6 opacity-75">
                <p className="text-xs text-muted-foreground/60 mb-6 uppercase tracking-widest font-semibold text-center">Trabalhamos com as maiores operadoras do mercado</p>
                <LogoLoop
                    logos={partnerLogos}
                    speed={40}
                    gap={64}
                    logoHeight={40}
                    fadeOut={true}
                    fadeOutColor="#ffffff"
                    pauseOnHover={true}
                />
            </div>
        </div>
        </>
    );
};

export default SectionOne;
