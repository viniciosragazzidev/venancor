'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, User, Phone, Building2, ShieldCheck, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const vanessaMessages = [
    "Vanessa está online e tem um desconto exclusivo pra você!",
    "Vanessa liberou tabela PME com 35% de desconto!",
    "Vanessa tem cotações sem carência prontas para você no WhatsApp!",
];

const FloatingChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showToast, setShowToast] = useState(true);
    const [msgIndex, setMsgIndex] = useState(0);

    // Form State
    const [nome, setNome] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [tipo, setTipo] = useState('cnpj');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Rotate text messages every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % vanessaMessages.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, '');
        let formatted = '';
        if (input.length > 0) {
            formatted = `(${input.slice(0, 2)}`;
            if (input.length > 2) {
                formatted += `) ${input.slice(2, 7)}`;
            }
            if (input.length > 7) {
                formatted += `-${input.slice(7, 11)}`;
            }
        }
        setWhatsapp(formatted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleaned = whatsapp.replace(/\D/g, '');
        if (cleaned.length >= 10 && nome) {
            setIsSubmitting(true);
            setTimeout(() => {
                setIsSubmitting(false);
                setIsOpen(false);
                const msg = `Olá Vanessa! Me chamo ${nome} e gostaria de aproveitar o desconto exclusivo via ${tipo.toUpperCase()}.`;
                window.open(`https://wa.me/5521974450263?text=${encodeURIComponent(msg)}`, '_blank');
            }, 600);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-[80] font-sans flex flex-col items-end select-none pointer-events-none">
            
            <div className="relative flex flex-col items-end pointer-events-auto">
                
                {/* 1. CHAT MODAL FLUTUANTE (Posicionado de forma independente acima do botão) */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 320, damping: 26 }}
                            className="absolute bottom-16 right-0 w-[calc(100vw-32px)] max-w-[370px] bg-background/95 dark:bg-background/95 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden z-20"
                        >
                            {/* Internal Top Gradient Glow */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 animate-gradient" />

                            {/* Chat Header */}
                            <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shadow-xs border border-primary/20">
                                            👩‍⚕️
                                        </div>
                                        <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-background" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-foreground leading-tight">
                                                Vanessa
                                            </h4>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                                Online
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-light">
                                            Consultora Venacor Saúde
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                    aria-label="Fechar chat"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            {/* Chat Body & Form */}
                            <div className="p-5 text-left space-y-4">
                                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 text-xs text-foreground font-medium leading-relaxed flex items-start gap-2">
                                    <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span>
                                        Olá! Sou a <strong className="text-primary font-bold">Vanessa</strong>. Preencha abaixo e receba sua cotação com desconto em segundos!
                                    </span>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-3.5">
                                    {/* Nome */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seu Nome</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                            <input
                                                type="text"
                                                required
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)}
                                                placeholder="Nome completo"
                                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border/70 bg-muted/20 text-xs font-medium focus:bg-background focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* WhatsApp */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seu WhatsApp</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                            <input
                                                type="tel"
                                                required
                                                value={whatsapp}
                                                onChange={handlePhoneChange}
                                                placeholder="(21) 99999-9999"
                                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border/70 bg-muted/20 text-xs font-medium focus:bg-background focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Perfil CNPJ/CPF */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Possui CNPJ ou MEI?</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                            <select
                                                value={tipo}
                                                onChange={(e) => setTipo(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border/70 bg-muted/20 text-xs font-medium focus:bg-background focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="cnpj">Sim, quero +35% de desconto</option>
                                                <option value="cpf">Não, plano individual (CPF)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Submit CTA */}
                                    <Button
                                        type="submit"
                                        disabled={!nome || whatsapp.length < 14 || isSubmitting}
                                        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2"
                                    >
                                        {isSubmitting ? (
                                            <span>Conectando...</span>
                                        ) : (
                                            <>
                                                <span>Falar com Vanessa Agora</span>
                                                <Send className="size-3.5" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
                                    <ShieldCheck className="size-3 text-primary shrink-0" />
                                    <span>Atendimento imediato e sem compromisso.</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. TOOLTIP / TOAST DE NOTIFICAÇÃO DO ATENDENTE */}
                <AnimatePresence>
                    {!isOpen && showToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            onClick={() => setIsOpen(true)}
                            className="mb-3 max-w-[280px] sm:max-w-[320px] bg-background/95 dark:bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl p-3.5 shadow-xl cursor-pointer hover:border-primary/40 transition-all flex items-start gap-3 group relative overflow-hidden"
                        >
                            <div className="size-8 rounded-full bg-primary/10 text-base flex items-center justify-center shrink-0 border border-primary/20">
                                👩‍⚕️
                            </div>

                            <div className="flex-1 text-left">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-primary">
                                        Vanessa • Online agora
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowToast(false);
                                        }}
                                        className="p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                                <p className="text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                                    {vanessaMessages[msgIndex]}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. BOTÃO FLUTUANTE DE GATILHO */}
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative size-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl flex items-center justify-center transition-all cursor-pointer border-2 border-white/20 z-30 ${
                        isOpen ? 'rotate-90 bg-slate-900 text-white hover:bg-slate-800' : ''
                    }`}
                    aria-label="Abrir atendimento com Vanessa"
                >
                    {isOpen ? (
                        <X className="size-6" />
                    ) : (
                        <>
                            <MessageCircle className="size-7 fill-white/20" />
                            {/* Online Pulsing Indicator */}
                            <span className="absolute top-0 right-0 flex size-4">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75"></span>
                                <span className="relative inline-flex size-4 rounded-full bg-primary border-2 border-white"></span>
                            </span>
                        </>
                    )}
                </motion.button>

            </div>
        </div>
    );
};

export default FloatingChat;
