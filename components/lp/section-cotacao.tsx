'use client';

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    CustomerSupportIcon,
    Video01Icon,
    Search01Icon,
    LicenseIcon,
    ArrowRight01Icon,
    Tick02Icon
} from '@hugeicons/core-free-icons';

export default function SectionCotacao() {
    const [nome, setNome] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [tipo, setTipo] = useState('pme');
    const [isFocused, setIsFocused] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

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
        if (nome && whatsapp.length >= 14) {
            setIsSubmitted(true);
            setTimeout(() => {
                window.open(`https://wa.me/5521964469750?text=${encodeURIComponent(`Olá! Quero simular um plano de saúde Tipo: ${tipo.toUpperCase()}. Nome: ${nome}.`)}`, '_blank');
            }, 800);
        }
    };

    return (
        <section className="relative w-full rounded-t-4xl bg-[#3b2dff] text-white pt-10 pb-8 md:pt-14 md:pb-12 mt-24 md:mt-32 font-sans">

            {/* Ambient Background Circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-[32px] border-white" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full border-[32px] border-white" />
            </div>

            <div className="w-full max-w-[1280px] mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* COLUNA ESQUERDA: Atendimento 24/7 & Videoconferência */}
                    <div className="lg:col-span-4 flex flex-col gap-10 md:gap-12 text-left">
                        {/* Bloco 1 */}
                        <div className="flex items-start gap-4 group">
                            <div className="size-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-md group-hover:bg-white group-hover:text-[#3b2dff] transition-all duration-300">
                                <HugeiconsIcon icon={CustomerSupportIcon} className="size-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg md:text-xl font-bold tracking-tight text-white select-text">
                                    Atendimento 24/7
                                </h3>
                                <p className="text-white/80 text-sm md:text-base font-light leading-relaxed max-w-sm select-text">
                                    Telemedicina Amil com Pronto Atendimento 24h por dia, 7 dias por semana. Não importa a hora, a prioridade é você.
                                </p>
                            </div>
                        </div>

                        {/* Bloco 2 */}
                        <div className="flex items-start gap-4 group">
                            <div className="size-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-md group-hover:bg-white group-hover:text-[#3b2dff] transition-all duration-300">
                                <HugeiconsIcon icon={Video01Icon} className="size-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg md:text-xl font-bold tracking-tight text-white select-text">
                                    Videoconferência
                                </h3>
                                <p className="text-white/80 text-sm md:text-base font-light leading-relaxed max-w-sm select-text">
                                    Uma equipe de profissionais da saúde que irá tirar todas as suas dúvidas e te orientar da maneira mais adequada.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* COLUNA CENTRAL: Celular saindo para fora (Overflow) com Formulário */}
                    <div className="lg:col-span-4 flex justify-center relative -mt-40 lg:-mt-56 mb-8 lg:mb-12 z-20">
                        {/* Smartphone Mockup */}
                        <div className="relative w-[290px] sm:w-[325px] aspect-[9/18.2] bg-white rounded-[3.25rem] p-3 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] border-[3px] border-slate-100 flex flex-col justify-start select-none">

                            {/* Notch do Celular */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-slate-100 rounded-b-2xl z-30 flex items-center justify-center">
                                <div className="size-1.5 rounded-full bg-slate-400 mr-2" />
                                <div className="w-8 h-0.5 bg-slate-300 rounded-full" />
                            </div>

                            {/* Conteúdo da Tela do Celular */}
                            <div className="w-full h-full bg-slate-50 rounded-[2.5rem] p-5 sm:p-6 pt-8 flex flex-col justify-start gap-4 overflow-hidden relative">

                                {isSubmitted ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
                                        <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                                            <HugeiconsIcon icon={Tick02Icon} className="size-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-slate-900 font-extrabold text-lg">Simulação Enviada!</h4>
                                            <p className="text-slate-500 text-xs mt-1">Conectando ao WhatsApp do consultor...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Cabeçalho do App */}
                                        <div className="text-left">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#3b2dff]">Simulador Venacor</span>
                                            <h4 className="text-xl font-black tracking-tight text-slate-900 mt-0.5">
                                                Cotação Rápida
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                                                Tabelas oficiais e carências.
                                            </p>
                                        </div>

                                        {/* Elemento de Progresso entre Título e Campos */}
                                        <div className="w-full flex items-center justify-between gap-2 select-none">
                                            <div className="flex-1 flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-[#3b2dff]/5 border border-[#3b2dff]/10 text-[#3b2dff]">
                                                <span className="size-1.5 rounded-full bg-[#3b2dff] animate-pulse" />
                                                <span className="text-[9px] font-extrabold uppercase tracking-wider">Identificação</span>
                                            </div>
                                            <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="w-1/2 h-full bg-[#3b2dff] rounded-full" />
                                            </div>
                                        </div>

                                        {/* Formulário */}
                                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                            {/* Nome */}
                                            <div className="space-y-1 text-left">
                                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Nome Completo</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={nome}
                                                    onChange={(e) => setNome(e.target.value)}
                                                    placeholder="Ex: Carlos Silva"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-[#3b2dff] focus:ring-4 focus:ring-[#3b2dff]/5 outline-none text-xs font-semibold placeholder:font-normal placeholder:text-slate-400 transition-all duration-200 shadow-2xs"
                                                />
                                            </div>

                                            {/* WhatsApp */}
                                            <div className="space-y-1 text-left">
                                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">WhatsApp</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={whatsapp}
                                                    onChange={handlePhoneChange}
                                                    onFocus={() => setIsFocused(true)}
                                                    onBlur={() => setIsFocused(false)}
                                                    placeholder="(21) 99999-9999"
                                                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs font-semibold placeholder:font-normal placeholder:text-slate-400 transition-all duration-200 shadow-2xs ${isFocused ? 'bg-white border-[#3b2dff] ring-4 ring-[#3b2dff]/5' : 'bg-white border-slate-200'}`}
                                                />
                                            </div>

                                            {/* Tipo de Plano */}
                                            <div className="space-y-1 text-left">
                                                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Tipo de Plano</label>
                                                <div className="relative">
                                                    <select
                                                        value={tipo}
                                                        onChange={(e) => setTipo(e.target.value)}
                                                        className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none text-xs font-semibold appearance-none cursor-pointer transition-all duration-200 shadow-2xs focus:border-[#3b2dff] focus:ring-4 focus:ring-[#3b2dff]/5"
                                                    >
                                                        <option value="pme">Empresa (PME / CNPJ)</option>
                                                        <option value="individual">Individual (CPF)</option>
                                                        <option value="familiar">Familiar (CPF)</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                type="submit"
                                                disabled={!nome || whatsapp.length < 14}
                                                className="w-full py-3 mt-1.5 rounded-xl bg-[#3b2dff] hover:bg-[#2d20e0] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs shadow-sm hover:shadow-md hover:shadow-[#3b2dff]/10 hover:scale-[1.01] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                <span>Simular Agora</span>
                                                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                                            </button>
                                        </form>

                                        {/* Status Bar / Safe Badge */}
                                        <div className="text-center pt-2 select-none border-t border-slate-100 flex items-center justify-center gap-1">
                                            <span className="relative flex size-1.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400">Consultores online</span>
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: Tudo em um só lugar & Praticidade */}
                    <div className="lg:col-span-4 flex flex-col gap-10 md:gap-12 text-left">
                        {/* Bloco 3 */}
                        <div className="flex items-start gap-4 group">
                            <div className="size-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-md group-hover:bg-white group-hover:text-[#3b2dff] transition-all duration-300">
                                <HugeiconsIcon icon={Search01Icon} className="size-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg md:text-xl font-bold tracking-tight text-white select-text">
                                    Tudo em um só lugar
                                </h3>
                                <p className="text-white/80 text-sm md:text-base font-light leading-relaxed max-w-sm select-text">
                                    Realize buscas por médicos, clínicas, hospitais e serviços de diagnóstico da rede credenciada do seu plano.
                                </p>
                            </div>
                        </div>

                        {/* Bloco 4 */}
                        <div className="flex items-start gap-4 group">
                            <div className="size-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-md group-hover:bg-white group-hover:text-[#3b2dff] transition-all duration-300">
                                <HugeiconsIcon icon={LicenseIcon} className="size-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg md:text-xl font-bold tracking-tight text-white select-text">
                                    Praticidade
                                </h3>
                                <p className="text-white/80 text-sm md:text-base font-light leading-relaxed max-w-sm select-text">
                                    Acesse tokens e os cartões virtuais de identificação do seu plano e dos seus dependentes.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </section>
    );
}