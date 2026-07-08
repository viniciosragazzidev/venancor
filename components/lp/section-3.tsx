'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { }

const Counter = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });

    useEffect(() => {
        if (inView) {
            let startTime: number | null = null;
            const duration = 1200; // animation duration in milliseconds

            const step = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                setCount(Math.floor(progress * value));
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };
            requestAnimationFrame(step);
        }
    }, [inView, value]);

    return <span ref={ref}>{count}</span>;
};

const SectionThree: React.FC<Props> = () => {
    const tagList = [
        "Hospital Samaritano",
        "Casa de Saúde São José",
        "Hospital Geral Nova Iguaçu",
        "Pronto-Socorro 24h",
        "Maternidade",
        "Pediatria",
        "Rede D'Or",
    ];

    return (
        <section id="hospitais" className="w-full bg-background py-16 md:py-24 font-sans overflow-hidden border-t border-border/20">
            <div className="w-full max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

                {/* COLUNA DA ESQUERDA (Visual com Tags Embutidas) */}
                <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-[550px] mx-auto md:max-w-none"
                >
                    <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] shadow-2xl border border-border/40 group">
                        <Image
                            src="/image2.png"
                            alt="Infraestrutura moderna e ampla rede de atendimento"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-102"
                            priority
                        />
                        {/* Gradient overlay for readability of elements */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                        {/* Tag Superior Esquerda: Nota ANS */}
                        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/30 bg-background/95 backdrop-blur-md shadow-md select-none transition-transform duration-300 hover:scale-[1.02]">
                            <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0 animate-pulse" />
                            <span className="text-[10px] sm:text-xs font-bold text-foreground">
                                Nota 4.8 na ANS
                            </span>
                        </div>

                        {/* Barra de Tags Inferior */}
                        <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 select-none">
                            <div className="flex gap-2 flex-nowrap">
                                {tagList.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/20 bg-background/90 backdrop-blur-sm shadow-sm whitespace-nowrap text-[9px] sm:text-[10px] font-bold text-foreground hover:bg-background transition-colors duration-200"
                                    >
                                        <span className="size-1 rounded-full bg-primary shrink-0" />
                                        <span>{tag}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* COLUNA DA DIREITA (Conteúdo e Conversão) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    className="flex flex-col justify-center items-start text-left md:pl-8"
                >
                    {/* Headline */}
                    <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-foreground leading-tight max-w-md select-text">
                        Os melhores hospitais e clínicas perto de você.
                    </h2>

                    {/* Parágrafo */}
                    <p className="text-muted-foreground/90 text-sm sm:text-base leading-relaxed mt-4 max-w-md font-light select-text">
                        Opções de referência nacional e clínicas eficientes na sua região. Planos de Saúde e Odonto para o seu momento.
                    </p>

                    {/* Botão CTA */}
                    <Button
                        onClick={() => {
                            const input = document.querySelector('input[type="tel"]') as HTMLInputElement;
                            if (input) {
                                input.focus();
                                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }}
                        size="lg"
                        className="mt-6 rounded-full px-6 font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-md active:scale-[0.98]"
                    >
                        <span>Consultar Minha Rede Credenciada</span>
                        <ArrowRight className="size-4" />
                    </Button>

                    {/* Bloco Estatístico */}
                    <div className="mt-10 flex flex-col items-start select-none">
                        <span className="text-5xl sm:text-6xl font-bold text-foreground tracking-tighter">
                            <Counter value={1000} />+
                        </span>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-1.5 font-bold">
                            Locais de atendimento
                        </span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default SectionThree;