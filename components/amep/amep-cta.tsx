'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageSquare, ShieldCheck, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SplitText from '@/components/split-text';

export default function AmepCta() {
    const handleCtaClick = () => {
        window.open('https://wa.me/5521974450263?text=Olá!%20Gostaria%20de%20falar%20com%20um%20consultor%20para%20garantir%20as%20condições%20especiais%20do%20plano%20Amep%20Saúde.', '_blank');
    };

    return (
        <section className="w-full py-20 sm:py-28 bg-neutral-950 text-white font-sans select-none relative overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 -z-10 bg-[url('/bg_hero.jpg')] bg-cover bg-center bg-no-repeat opacity-15 mix-blend-luminosity grayscale contrast-125 pointer-events-none" />

            {/* Ambient Accent Radial Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/15 blur-[160px] rounded-full pointer-events-none" />

            <div className="w-full max-w-[1150px] mx-auto px-4 sm:px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-3xl bg-neutral-900/90 backdrop-blur-2xl border border-neutral-800/80 p-8 sm:p-14 md:p-16 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] text-center flex flex-col items-center space-y-6 relative overflow-hidden"
                >
                    {/* Top Green Accent Bar */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary/60 via-primary/60 to-primary/60" />

                    {/* Co-Branding Header Pill with Inverted Dark Logos */}
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-neutral-800/90 border border-neutral-700/80 text-xs font-semibold shadow-inner">
                        <Image 
                            src="/logo.webp" 
                            alt="Venacor Saúde" 
                            width={90} 
                            height={26} 
                            className="h-5.5 w-auto object-contain brightness-0 invert drop-shadow-[0_1px_4px_rgba(255,255,255,0.2)]" 
                        />
                        <span className="text-neutral-500 font-bold">×</span>
                        <Image 
                            src="/amep_saude_logo.png" 
                            alt="Amep Saúde" 
                            width={110} 
                            height={32} 
                            className="h-6.5 w-auto object-contain brightness-0 invert drop-shadow-[0_1px_8px_rgba(255,255,255,0.3)]" 
                        />
                    </div>

                    {/* Headline Animated via SplitText */}
                    <SplitText
                        tag="h2"
                        textAlign="center"
                        className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-tighter text-white leading-[1.1] max-w-3xl"
                        delay={15}
                        duration={0.9}
                        ease="power3.out"
                        splitType="words"
                        from={{ opacity: 0, y: 25 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                    >
                        Fale com a Venacor Saúde e garanta as condições do Plano Amep Saúde de Junho.
                    </SplitText>

                    {/* Subheadline */}
                    <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed font-light">
                        Receba o comparativo de carências e prazos de vigência direto no seu celular. Atendimento especializado focado no município do Rio de Janeiro e região de abrangência.
                    </p>

                    {/* Action CTA Button */}
                    <div className="pt-3 w-full max-w-sm">
                        <Button
                            onClick={handleCtaClick}
                            size="lg"
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary text-white font-extrabold text-base shadow-xl shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3"
                        >
                            <MessageSquare className="size-5 fill-white/20" />
                            <span>Falar com Consultor no WhatsApp</span>
                        </Button>
                    </div>

                    {/* Guarantee Footer */}
                    <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-primary" />
                            <span>Atendimento imediato e sem compromisso</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <PhoneCall className="size-4 text-primary" />
                            <span>(21) 97445-0263</span>
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
}
