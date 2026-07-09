'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { Hospital02Icon, LicenseIcon, HeartIcon, Tick02Icon, Location01Icon } from '@hugeicons/core-free-icons';

interface TabItem {
  id: string;
  tag: string;
  support: string;
  content: React.ReactNode;
}

export default function SectionDiferenciais() {
  const [activeTab, setActiveTab] = useState<'unidades' | 'empresarial' | 'viver-mais'>('unidades');

  const tabData: TabItem[] = [
    {
      id: 'unidades',
      tag: 'Unidades Próprias',
      support: 'Estrutura planejada pela Amep Saúde para oferecer conforto, tecnologia e atendimento humanizado.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left pt-6">
          {/* Card 1: Highlighted - Hospital CHAJ Jacarepaguá */}
          <div className="p-6 rounded-3xl bg-[#3b2dff]/5 border border-[#3b2dff]/30 shadow-md shadow-[#3b2dff]/5 flex flex-col items-start gap-4 relative mt-3 cursor-default">
            {/* Top Overlapping Badge */}
            <div className="absolute top-0 left-6 -translate-y-1/2 bg-[#3b2dff] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              Unidade Principal AMEP
            </div>
            
            <div className="flex items-center justify-between w-full">
              <div className="size-10 rounded-xl bg-[#3b2dff]/15 flex items-center justify-center text-[#3b2dff] shadow-sm">
                <HugeiconsIcon icon={Hospital02Icon} className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3b2dff] bg-[#3b2dff]/10 px-2 py-0.5 rounded-md">
                Zona Oeste RJ
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">Hospital CHAJ Jacarepaguá</h4>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5 shrink-0 text-slate-400" />
                <span>Jacarepaguá</span>
              </div>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed select-text">
              Unidade própria com urgência 24h, atendimento ambulatorial, exames e cirurgias.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Urgência 24h</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Ambulatorial</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Exames</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Cirurgias</span>
            </div>
          </div>

          {/* Card 2: Unidade Freguesia */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/60 hover:border-slate-300 transition-all duration-300 flex flex-col items-start gap-4 mt-3 cursor-default">
            <div className="flex items-center justify-between w-full">
              <div className="size-10 rounded-xl bg-[#3b2dff]/5 flex items-center justify-center text-[#3b2dff] shadow-sm">
                <HugeiconsIcon icon={Hospital02Icon} className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3b2dff] bg-[#3b2dff]/5 px-2 py-0.5 rounded-md">
                Zona Oeste RJ
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">Unidade Freguesia</h4>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5 shrink-0 text-slate-400" />
                <span>Freguesia</span>
              </div>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed select-text">
              Unidade própria com atendimento ambulatorial e exames especializados.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Ambulatorial</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Exames</span>
            </div>
          </div>

          {/* Card 3: Unidade Madureira */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/60 hover:border-slate-300 transition-all duration-300 flex flex-col items-start gap-4 mt-3 cursor-default">
            <div className="flex items-center justify-between w-full">
              <div className="size-10 rounded-xl bg-[#3b2dff]/5 flex items-center justify-center text-[#3b2dff] shadow-sm">
                <HugeiconsIcon icon={Hospital02Icon} className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3b2dff] bg-[#3b2dff]/5 px-2 py-0.5 rounded-md">
                Zona Norte RJ
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">Unidade Madureira</h4>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5 shrink-0 text-slate-400" />
                <span>Madureira</span>
              </div>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed select-text">
              Unidade própria com atendimento ambulatorial, exames e terapias integradas.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Ambulatorial</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Exames</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Terapias</span>
            </div>
          </div>

          {/* Card 4: Unidade Taquara */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/60 hover:border-slate-300 transition-all duration-300 flex flex-col items-start gap-4 mt-3 cursor-default">
            <div className="flex items-center justify-between w-full">
              <div className="size-10 rounded-xl bg-[#3b2dff]/5 flex items-center justify-center text-[#3b2dff] shadow-sm">
                <HugeiconsIcon icon={Hospital02Icon} className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3b2dff] bg-[#3b2dff]/5 px-2 py-0.5 rounded-md">
                Zona Oeste RJ
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">Unidade Taquara</h4>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5 shrink-0 text-slate-400" />
                <span>Taquara</span>
              </div>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed select-text">
              Unidade própria com atendimento ambulatorial e exames de rotina rápida.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Ambulatorial</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Exames</span>
            </div>
          </div>

          {/* Card 5: CIM */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/60 hover:border-slate-300 transition-all duration-300 flex flex-col items-start gap-4 mt-3 cursor-default">
            <div className="flex items-center justify-between w-full">
              <div className="size-10 rounded-xl bg-[#3b2dff]/5 flex items-center justify-center text-[#3b2dff] shadow-sm">
                <HugeiconsIcon icon={Hospital02Icon} className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3b2dff] bg-[#3b2dff]/5 px-2 py-0.5 rounded-md">
                Zona Oeste RJ
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">CIM - Centro Infantil</h4>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5 shrink-0 text-slate-400" />
                <span>Jacarepaguá</span>
              </div>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed select-text">
              Centro Infantil Multiterapêutico Amep Saúde com fonoaudiologia e terapias especializadas.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Terapias</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">Pediátrico</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'empresarial',
      tag: 'Plano Empresarial',
      support: 'Benefício bom é aquele que o colaborador realmente valoriza e pode usar com a Amep Saúde!',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end w-full text-left">
          <div className="lg:col-span-6 space-y-5">
            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">Proteja sua equipe com facilidade e baixo custo</h4>
            <p className="text-slate-500 text-sm sm:text-base font-light leading-relaxed">
              Proteja sua equipe com um plano empresarial com atendimento humanizado, rede própria, credenciada e benefícios reais para a rotina do dia a dia.
            </p>
            <ul className="flex flex-col gap-3 w-full">
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 font-normal">
                <div className="size-5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                </div>
                <span>Contratação facilitada via CNPJ ou MEI a partir de R$ 82,94.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 font-normal">
                <div className="size-5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                </div>
                <span>Inclusão simplificada de sócios, colaboradores e dependentes.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 font-normal">
                <div className="size-5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                </div>
                <span>Uso imediato na rede de clínicas próprias após a carência regulamentar.</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 flex justify-center w-full relative">
            <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.06)]">
              <Image
                src="/image4.png"
                alt="Plano Empresarial Amep Saúde"
                fill
                className="object-cover"
                priority
              />

              {/* Testimonial Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 22 }}
                className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200/50 flex items-center gap-3 shadow-md"
              >
                <div className="size-10 rounded-full bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/15 font-black text-sm flex items-center justify-center shrink-0">
                  AC
                </div>
                <div className="flex-1 flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800">Ana Clara</span>
                  <span className="text-[10px] text-slate-400 font-medium">RH da TecnoSoluções (12 vidas)</span>
                </div>
                <div className="size-5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'viver-mais',
      tag: 'Viver Mais e Melhor',
      support: 'Investir em você não tem idade!',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end w-full text-left">
          <div className="lg:col-span-6 space-y-5">
            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">Qualidade de vida e segurança em todas as fases</h4>
            <p className="text-slate-500 text-sm sm:text-base font-light leading-relaxed">
              Aqui na Amep tem saúde de verdade para quem deseja viver mais e melhor, oferecendo a segurança necessária em todas as fases da vida.
            </p>
            <ul className="flex flex-col gap-3 w-full">
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 font-normal">
                <div className="size-5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                </div>
                <span>Programas de medicina preventiva integrados na rede própria.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 font-normal">
                <div className="size-5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                </div>
                <span>Acompanhamento continuado para controle de pressão, diabetes e taxas.</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 flex justify-center w-full relative">
            <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.06)]">
              <Image
                src="/image3.png"
                alt="Viver Mais e Melhor Amep Saúde"
                fill
                className="object-cover"
                priority
              />

              {/* Testimonial Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 22 }}
                className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200/50 flex items-center gap-3 shadow-md"
              >
                <div className="size-10 rounded-full bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/15 font-black text-sm flex items-center justify-center shrink-0">
                  RS
                </div>
                <div className="flex-1 flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800">Ricardo Souza</span>
                  <span className="text-[10px] text-slate-400 font-medium">Plano Viver Mais (Individual)</span>
                </div>
                <div className="size-5 rounded-full bg-[#3b2dff]/5 border border-[#3b2dff]/15 text-[#3b2dff] flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const activeIndex = tabData.findIndex((t) => t.id === activeTab);
  const progressPercent = ((activeIndex + 1) / tabData.length) * 100;
  const currentTab = tabData[activeIndex] || tabData[0];

  return (
    <motion.section
      id="diferenciais"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-full bg-white py-16 md:py-20 font-sans select-none overflow-hidden will-change-transform"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-8 md:gap-10">
        
        {/* 1. Cabeçalho */}
        <div className="w-full text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="size-2 rounded-full bg-[#3b2dff]" />
            <span>Estrutura e Diferenciais</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.2] max-w-2xl">
            <div className="overflow-hidden py-0.5">
              <motion.span
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                className="inline-block"
              >
                Muito mais que um plano. Seu ecossistema de saúde.
              </motion.span>
            </div>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed max-w-lg"
          >
            A Amep Saúde oferece soluções integradas para você, sua família ou empresa.
          </motion.p>
        </div>

        {/* 2. Menu de Abas / Tabs Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-100 pb-4 w-full">
          <div className="flex flex-wrap gap-2">
            {tabData.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-colors duration-200 cursor-pointer z-10 ${
                    isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="amepTabIndicator"
                      className="absolute inset-0 bg-[#3b2dff]/5 border border-[#3b2dff]/15 rounded-xl z-0"
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  )}
                  <span className="relative z-10">{tab.tag}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Slider */}
          <div className="flex items-center gap-3 text-xs text-slate-400 font-bold shrink-0">
            <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#3b2dff]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
            <span>{activeIndex + 1}/{tabData.length}</span>
          </div>
        </div>

        {/* 3. Grid de Conteúdo Dinâmico */}
        <div className="min-h-[350px] w-full relative pt-8 md:pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="text-left max-w-2xl">
                <p className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-wider text-[#3b2dff]">{activeTab === 'unidades' ? 'Rede Própria de Qualidade' : 'Benefícios Exclusivos'}</p>
                <p className="text-slate-600 text-sm sm:text-base font-light mt-1">{currentTab.support}</p>
              </div>

              <div className="w-full mt-2">
                {currentTab.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </motion.section>
  );
}
