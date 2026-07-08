'use client';

import React from 'react';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Leaf01Icon, HeartIcon } from '@hugeicons/core-free-icons';

export default function SectionHero() {
    return (
        <section className="relative mb-30 w-full min-h-[90dvh] flex items-center justify-center   py-16 md:py-24 overflow-hidden font-sans">
            <div className="w-full max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                {/* COLUNA ESQUERDA: Textos e CTA */}
                <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6 md:space-y-8">
                    <h1 className="text-4xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-[1.1] select-text">
                        <span className="relative inline-block">
                            Planos de Saúde
                            <svg
                                className="absolute -bottom-2 left-0 w-full h-2.5 text-[#3b2dff]"
                                viewBox="0 0 100 10"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M2 7 C 20 2, 80 2, 98 7"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            </svg>
                        </span>
                        <br />
                        <div className="mt-2">líderes na região com o menor preço do mercado.</div>
                    </h1>

                    <p className="text-slate-500 text-base sm:text-lg md:text-lg font-normal leading-relaxed max-w-xl select-text">
                        Compare tabelas exclusivas para você, sua família ou empresa em minutos. Economize até 35% utilizando seu CNPJ ou MEI com consultoria isenta na Baixada.
                    </p>

                    <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3b2dff] hover:bg-[#2d20e0] text-white font-bold text-base shadow-lg shadow-[#3b2dff]/25 hover:shadow-xl hover:shadow-[#3b2dff]/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer">
                        <span>Faça uma cotação já!</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                    </button>
                </div>

                {/* COLUNA DIREITA: Collage de Imagens Assimétrica */}
                <div className="lg:col-span-6 flex items-start justify-center gap-6 md:gap-8 relative select-none">

                    {/* Imagem da Esquerda: Médico e Criança */}
                    <div className="relative">
                        {/* Badge de Folha Flutuante */}
                        <div className="absolute -left-5 top-1/4 z-20 flex size-11 items-center justify-center rounded-2xl bg-white text-[#3b2dff] shadow-md border border-slate-100">
                            <HugeiconsIcon icon={Leaf01Icon} className="size-5" />
                        </div>

                        <div className="relative w-[220px] sm:w-[260px] md:w-[300px] aspect-[3/4] rounded-md overflow-hidden border border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.06)]">
                            <Image
                                src="/image2.png"
                                alt="Médico atendendo criança"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Card Estatístico Azul (Sobrepõe o canto inferior direito da imagem esquerda) */}
                        <div className="absolute -right-10 -bottom-8 sm:-right-30 outline-9 outline-white sm:-bottom-7 z-20 w-[160px] sm:w-[180px] bg-[#3b2dff] text-white p-4 sm:px-6 sm:py-4 rounded-md shadow-xl shadow-[#3b2dff]/20 text-center flex flex-col justify-center items-center gap-1 select-none">
                            <span className="text-4xl sm:text-5xl font-black tracking-tight">+10</span>
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/90">Marcas</span>
                            <p className="text-[9px] sm:text-[11px] text-white/70 font-medium leading-tight mt-1">
                                de saúde e odonto comparadas em um só lugar.
                            </p>
                        </div>
                    </div>

                    {/* Imagem da Direita: Senhora sorrindo */}
                    <div className="relative -translate-y-8 sm:-translate-y-12">
                        <div className="relative w-[180px] sm:w-[220px] md:w-[260px] aspect-[3/4] rounded-md overflow-hidden border border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.06)]">
                            <Image
                                src="/image1.png"
                                alt="Paciente idosa sorrindo"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Badge de Coração Flutuante */}
                        <div className="absolute -right-3 bottom-12 z-20 flex size-11 items-center justify-center rounded-2xl bg-white text-[#3b2dff] shadow-md border border-slate-100">
                            <HugeiconsIcon icon={HeartIcon} className="size-5 text-primary" />
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}