'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Quote, ShieldCheck, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SplitText from '@/components/split-text';

const depoimentos = [
    {
        name: "Mariana Souza",
        local: "Nova Iguaçu - RJ",
        text: "Fechei o plano Amep para mim e meus 2 filhos pelo WhatsApp da Venacor Saúde. No mesmo mês precisei levar meu filho ao Hospital Prontonil e o atendimento foi rápido, sem pagar nada a mais!",
        rating: 5,
        badge: "Cliente Individual",
        avatar: "/image1.png"
    },
    {
        name: "Roberto Mendes",
        local: "Duque de Caxias - RJ",
        text: "Tenho MEI e consegui incluir minha esposa e funcionários na tabela Amep PME. A economia no final do mês foi gigantesca e não tem surpresa de coparticipação.",
        rating: 5,
        badge: "Cliente MEI / PME",
        avatar: "/image3.png"
    },
    {
        name: "Camila Ribeiro",
        local: "Nova Iguaçu - RJ",
        text: "Fui muito bem atendida na sede da Venacor Saúde no Centro de Nova Iguaçu. A carência zero para consultas salvou minha rotina médica. Recomendo demais!",
        rating: 5,
        badge: "Cliente Amep Saúde",
        avatar: "/image4.png"
    }
];

export default function AmepTestimonials() {
    return (
        <section className="w-full py-16 sm:py-24 bg-background border-b border-border/40 font-sans select-none">
            <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6">
                
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-3 mb-12">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary dark:text-primary text-xs font-semibold tracking-wide">
                        <Quote className="size-3.5" />
                        <span>Depoimentos do Plano Amep Saúde</span>
                    </div>

                    <SplitText
                        tag="h2"
                        textAlign="center"
                        className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-tighter text-foreground leading-[1.1] max-w-3xl"
                        delay={15}
                        duration={0.9}
                        ease="power3.out"
                        splitType="words"
                        from={{ opacity: 0, y: 25 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                    >
                        O que Nossos Clientes Dizem Sobre o Plano Amep Saúde
                    </SplitText>

                    <p className="text-muted-foreground text-base sm:text-lg max-w-xl font-light leading-relaxed">
                        Famílias e empresas na Baixada Fluminense que já garantiram o plano Amep Saúde.
                    </p>
                </div>

                {/* Testimonials Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {depoimentos.map((item, idx) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="rounded-3xl p-6 bg-card border border-border/70 hover:border-primary/40 transition-all flex flex-col justify-between text-left shadow-xs space-y-6"
                        >
                            <div className="space-y-4">
                                {/* Stars & Badge */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {[...Array(item.rating)].map((_, i) => (
                                            <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                                        {item.badge}
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                                    "{item.text}"
                                </p>
                            </div>

                            {/* User Profile */}
                            <div className="pt-4 border-t border-border/40 flex items-center gap-3">
                                <div className="relative size-10 rounded-full overflow-hidden border border-border shrink-0">
                                    <Image src={item.avatar} alt={item.name} fill className="object-cover object-center" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground leading-tight">{item.name}</h4>
                                    <span className="text-[11px] text-muted-foreground font-medium">{item.local}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Special Bonus Banner (Checklist Requirement #5: Bônus) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-3xl bg-gradient-to-r from-primary via-primary/60 to-primary p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-left relative overflow-hidden"
                >
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            <Gift className="size-3.5" />
                            <span>Bônus Exclusivo da Campanha</span>
                        </div>
                        <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                            Carência ZERO Imediata + Estudo de Custos Gratuito
                        </h3>
                        <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                            Contratando hoje com a Venacor Saúde, você não paga nenhuma taxa de adesão extra e garante liberação imediata para consultas na rede própria Amep Saúde.
                        </p>
                    </div>

                    <Button
                        onClick={() => {
                            window.open('https://wa.me/5521974450263?text=Olá!%20Quero%20aproveitar%20o%20bônus%20exclusivo%20de%20Carência%20Zero%20na%20Amep%20Saúde.', '_blank');
                        }}
                        size="lg"
                        className="h-13 px-6 rounded-2xl bg-white text-primary hover:bg-primary/10 font-extrabold text-sm shadow-lg shrink-0 cursor-pointer flex items-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <span>Garantir Meus Bônus Agora</span>
                        <ArrowRight className="size-4" />
                    </Button>
                </motion.div>

            </div>
        </section>
    );
}
