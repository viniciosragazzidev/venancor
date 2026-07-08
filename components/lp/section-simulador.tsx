'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
    PlusSignIcon, 
    Cancel01Icon, 
    WhatsappIcon, 
    UserIcon 
} from '@hugeicons/core-free-icons';

type PlanType = 'saude' | 'odonto' | 'ambos' | null;
type ProfileType = 'individual' | 'corporate' | null;

export default function SectionSimulador() {
    const [step, setStep] = useState<number>(1);
    const [planType, setPlanType] = useState<PlanType>(null);
    const [profileType, setProfileType] = useState<ProfileType>(null);
    const [titularAge, setTitularAge] = useState<string>('');
    const [dependents, setDependents] = useState<string[]>([]);
    const [nome, setNome] = useState<string>('');
    const [whatsapp, setWhatsapp] = useState<string>('');
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    // Format WhatsApp phone mask: (XX) XXXXX-XXXX
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        let formatted = '';
        if (value.length > 0) {
            formatted = `(${value.slice(0, 2)}`;
        }
        if (value.length > 2) {
            formatted += `) ${value.slice(2, 7)}`;
        }
        if (value.length > 7) {
            formatted += `-${value.slice(7)}`;
        }
        setWhatsapp(formatted);
    };

    // Calculate progress (out of 4 steps)
    const progressPercent = (step / 4) * 100;

    const isStep3Valid = titularAge.trim() !== '' && Number(titularAge) > 0;
    const rawPhoneDigits = whatsapp.replace(/\D/g, '');
    const isPhoneValid = rawPhoneDigits.length === 11;
    const isStep4Valid = nome.trim().length > 2 && isPhoneValid;

    // Fast-select step 1
    const handleSelectPlan = (type: PlanType) => {
        setPlanType(type);
        setTimeout(() => setStep(2), 200);
    };

    // Fast-select step 2
    const handleSelectProfile = (type: ProfileType) => {
        setProfileType(type);
        setTimeout(() => setStep(3), 200);
    };

    // Form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    // Reset simulator
    const handleReset = (e: React.MouseEvent) => {
        e.preventDefault();
        setStep(1);
        setPlanType(null);
        setProfileType(null);
        setTitularAge('');
        setDependents([]);
        setNome('');
        setWhatsapp('');
        setIsSubmitted(false);
    };

    return (
        <section className="w-full bg-white py-16 md:py-20 font-sans select-none overflow-hidden border-t border-slate-100">
            <div className="w-full max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* COLUNA ESQUERDA: Textos + Recursos */}
                <div className="lg:col-span-5 flex flex-col items-start gap-8 text-left w-full">
                    
                    <div className="space-y-4 w-full">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <span className="size-2 rounded-full bg-[#3b2dff]" />
                            <span>Simulação Rápida</span>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-[1.15] max-w-xl">
                            Receba sua cotação na hora
                        </h2>
                        
                        <p className="text-slate-500 text-sm md:text-base font-light leading-relaxed max-w-xl">
                            Simule preços e carências em poucos cliques. Nosso sistema analisa as melhores operadoras para o seu perfil.
                        </p>
                    </div>

                    {/* Lista de Diferenciais / Recursos */}
                    <div className="flex flex-col gap-6 w-full">
                        
                        {/* Item 1 */}
                        <div className="flex items-start gap-3 text-left">
                            <span className="size-1.5 rounded-full bg-[#3b2dff] shrink-0 mt-2" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-extrabold text-slate-900 leading-none">
                                    Desconto CNPJ Automático
                                </h4>
                                <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed select-text">
                                    Use seu CNPJ ou MEI e garanta até 35% de desconto no valor final.
                                </p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex items-start gap-3 text-left">
                            <span className="size-1.5 rounded-full bg-[#3b2dff] shrink-0 mt-2" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-extrabold text-slate-900 leading-none">
                                    Cálculo Exato
                                </h4>
                                <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed select-text">
                                    Adicione familiares ou a média de idade da sua equipe para valores consolidados.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* COLUNA DIREITA: Card de Formulário / Simulador */}
                <div className="lg:col-span-7 flex justify-center lg:justify-end w-full">
                    <div className="w-full max-w-[560px] bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-1.5 shadow-[0_20px_50px_-25px_rgba(59,45,255,0.06)] relative overflow-hidden">
                        
                        <div className="bg-white border border-slate-200/50 rounded-[2.2rem] p-8 sm:p-10 relative">
                            
                            {/* Top Step Counter & Progress bar */}
                            {!isSubmitted && (
                                <div className="flex items-center justify-between mb-8">
                                    {/* Progress Line */}
                                    <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#3b2dff] transition-all duration-300"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Passo {step} de 4
                                    </span>
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {isSubmitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        className="flex flex-col gap-6 text-center py-4 items-center"
                                    >
                                        <div className="size-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-xs">
                                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                                                <motion.path 
                                                    d="M20 6L9 17L4 12" 
                                                    stroke="currentColor" 
                                                    strokeWidth="3.5" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                />
                                            </svg>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                                Simulação gerada com sucesso!
                                            </h3>
                                            <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed max-w-sm mx-auto select-text">
                                                Olá! Nós já começamos a processar as tabelas para o seu perfil. Um especialista da Venancor entrará em contato em instantes no seu WhatsApp.
                                            </p>
                                        </div>

                                        <button 
                                            onClick={handleReset}
                                            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer mt-4 underline underline-offset-4"
                                        >
                                            Fazer nova simulação
                                        </button>
                                    </motion.div>
                                ) : (
                                    <>
                                        {step === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ x: 30, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -30, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                className="flex flex-col gap-6 text-left"
                                            >
                                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                                                    Qual plano você deseja simular?
                                                </h3>

                                                <div className="flex flex-col gap-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <motion.button
                                                            whileHover={{ y: -3 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleSelectPlan('saude')}
                                                            className={`py-4 px-5 rounded-2xl border text-center font-bold text-sm cursor-pointer transition-all duration-200 ${
                                                                planType === 'saude'
                                                                    ? 'border-[#3b2dff] bg-[#3b2dff]/5 text-slate-800'
                                                                    : 'border-slate-100 hover:border-[#3b2dff]/30 bg-slate-50/50 text-slate-700'
                                                            }`}
                                                        >
                                                            Planos de Saúde
                                                        </motion.button>

                                                        <motion.button
                                                            whileHover={{ y: -3 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleSelectPlan('odonto')}
                                                            className={`py-4 px-5 rounded-2xl border text-center font-bold text-sm cursor-pointer transition-all duration-200 ${
                                                                planType === 'odonto'
                                                                    ? 'border-[#3b2dff] bg-[#3b2dff]/5 text-slate-800'
                                                                    : 'border-slate-100 hover:border-[#3b2dff]/30 bg-slate-50/50 text-slate-700'
                                                            }`}
                                                        >
                                                            Planos Odonto
                                                        </motion.button>
                                                    </div>

                                                    <motion.button
                                                        whileHover={{ y: -3 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleSelectPlan('ambos')}
                                                        className={`w-full py-4.5 rounded-2xl border text-center font-bold text-sm cursor-pointer transition-all duration-200 ${
                                                            planType === 'ambos'
                                                                ? 'border-[#3b2dff] bg-[#3b2dff]/5 text-slate-800'
                                                                : 'border-slate-100 hover:border-[#3b2dff]/30 bg-slate-50/50 text-slate-700'
                                                        }`}
                                                    >
                                                        Quero cotar ambos
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ x: 30, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -30, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                className="flex flex-col gap-6 text-left"
                                            >
                                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                                                    Qual o seu perfil de contratação?
                                                </h3>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <motion.button
                                                        whileHover={{ y: -3 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleSelectProfile('individual')}
                                                        className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col gap-2.5 ${
                                                            profileType === 'individual'
                                                                ? 'border-[#3b2dff] bg-[#3b2dff]/5 text-slate-850'
                                                                : 'border-slate-100 hover:border-[#3b2dff]/30 bg-slate-50/50 text-slate-700'
                                                        }`}
                                                    >
                                                        <h4 className="text-sm font-extrabold">Para Mim ou Família</h4>
                                                        <span className="text-[10px] text-slate-400 font-medium leading-tight">Contratação rápida via CPF</span>
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ y: -3 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleSelectProfile('corporate')}
                                                        className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col gap-2.5 ${
                                                            profileType === 'corporate'
                                                                ? 'border-[#3b2dff] bg-[#3b2dff]/5 text-slate-850'
                                                                : 'border-slate-100 hover:border-[#3b2dff]/30 bg-slate-50/50 text-slate-700'
                                                        }`}
                                                    >
                                                        <h4 className="text-sm font-extrabold">Para Minha Empresa</h4>
                                                        <span className="text-[10px] text-slate-400 font-medium leading-tight">Economia via CNPJ ou MEI</span>
                                                    </motion.button>
                                                </div>

                                                <button
                                                    onClick={() => setStep(1)}
                                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors self-start cursor-pointer mt-2"
                                                >
                                                    ← Voltar
                                                </button>
                                            </motion.div>
                                        )}

                                        {step === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ x: 30, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -30, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                className="flex flex-col gap-6 text-left"
                                            >
                                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                                                    Quem será incluído no plano?
                                                </h3>

                                                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Sua Idade
                                                        </label>
                                                        <input 
                                                            type="number"
                                                            placeholder="Ex: 34"
                                                            value={titularAge}
                                                            onChange={(e) => setTitularAge(e.target.value)}
                                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff] text-slate-800 font-extrabold text-sm outline-none transition-colors"
                                                        />
                                                    </div>

                                                    <AnimatePresence>
                                                        {dependents.map((dep, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                                                                className="flex flex-col gap-1.5 overflow-hidden"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                                        Idade do Dependente {idx + 1}
                                                                    </label>
                                                                    <button 
                                                                        onClick={() => {
                                                                            const updated = [...dependents];
                                                                            updated.splice(idx, 1);
                                                                            setDependents(updated);
                                                                        }}
                                                                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                                                    >
                                                                        <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                                                                    </button>
                                                                </div>
                                                                <input 
                                                                    type="number"
                                                                    placeholder="Ex: 28"
                                                                    value={dep}
                                                                    onChange={(e) => {
                                                                        const updated = [...dependents];
                                                                        updated[idx] = e.target.value;
                                                                        setDependents(updated);
                                                                    }}
                                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff] text-slate-800 font-extrabold text-sm outline-none transition-colors"
                                                                />
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>

                                                <button
                                                    onClick={() => setDependents([...dependents, ''])}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3b2dff] hover:text-[#2d20e0] transition-colors cursor-pointer self-start"
                                                >
                                                    <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                                                    <span>Adicionar Dependente</span>
                                                </button>

                                                <div className="flex gap-3 mt-2">
                                                    <button
                                                        onClick={() => setStep(2)}
                                                        className="px-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs cursor-pointer transition-colors"
                                                    >
                                                        Voltar
                                                    </button>
                                                    <button
                                                        onClick={() => setStep(4)}
                                                        disabled={!isStep3Valid}
                                                        className="flex-1 py-3.5 rounded-xl bg-[#3b2dff] hover:bg-[#2d20e0] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs shadow-sm cursor-pointer transition-all flex items-center justify-center"
                                                    >
                                                        <span>Continuar para o Resultado</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 4 && (
                                            <motion.div
                                                key="step4"
                                                initial={{ x: 30, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -30, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                className="flex flex-col gap-6 text-left"
                                            >
                                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                                                    Onde quer receber o seu estudo personalizado?
                                                </h3>

                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                    <div className="flex flex-col gap-1.5 relative">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            Seu Nome Completo
                                                        </label>
                                                        <div className="relative">
                                                            <input 
                                                                type="text"
                                                                placeholder="Digite seu nome"
                                                                value={nome}
                                                                onChange={(e) => setNome(e.target.value)}
                                                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff] text-slate-800 font-extrabold text-sm outline-none transition-colors"
                                                            />
                                                            <HugeiconsIcon icon={UserIcon} className="absolute left-3.5 top-4 size-4 text-slate-400" />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1.5 relative">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                            WhatsApp com DDD
                                                        </label>
                                                        <div className="relative">
                                                            <input 
                                                                type="text"
                                                                placeholder="(00) 00000-0000"
                                                                value={whatsapp}
                                                                onChange={handlePhoneChange}
                                                                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-slate-800 font-extrabold text-sm outline-none transition-colors ${
                                                                    isPhoneValid 
                                                                        ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                                                                        : 'border-slate-200 focus:border-[#3b2dff] focus:ring-1 focus:ring-[#3b2dff]'
                                                                }`}
                                                            />
                                                            <HugeiconsIcon icon={WhatsappIcon} className="absolute left-3.5 top-4 size-4 text-slate-400" />
                                                        </div>
                                                    </div>

                                                    {/* Online Badge Validator */}
                                                    <AnimatePresence>
                                                        {isPhoneValid && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 5 }}
                                                                className="flex items-center gap-1.5 justify-center py-1 select-none"
                                                            >
                                                                <span className="relative flex size-2">
                                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-400">Consultores Online</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div className="flex gap-3 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setStep(3)}
                                                            className="px-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs cursor-pointer transition-colors"
                                                        >
                                                            Voltar
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={!isStep4Valid}
                                                            className="flex-1 py-3.5 rounded-xl bg-[#3b2dff] hover:bg-[#2d20e0] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs shadow-sm cursor-pointer hover:shadow-md hover:shadow-[#3b2dff]/10 hover:scale-[1.01] transition-all flex items-center justify-center"
                                                        >
                                                            <span>Gerar Minha Simulação Gratuita</span>
                                                        </button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
