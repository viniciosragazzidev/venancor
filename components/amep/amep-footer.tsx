'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export default function AmepFooter() {
    return (
        <footer className="w-full bg-neutral-950 text-neutral-400 pt-16 pb-8 border-t border-neutral-900 font-sans select-none">
            <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6">
                
                {/* 4 Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 pb-12 w-full text-left">
                    
                    {/* Column 1: Branding (4 cols) */}
                    <div className="md:col-span-4 flex flex-col space-y-5">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="inline-block">
                                <Image 
                                    src="/logo.webp" 
                                    alt="Venacor Saúde" 
                                    width={140} 
                                    height={40} 
                                    className="h-8.5 w-auto object-contain brightness-0 invert" 
                                    priority
                                />
                            </Link>
                            <span className="text-neutral-600 font-bold text-sm">×</span>
                            <Image 
                                src="/amep_saude_logo.png" 
                                alt="Amep Saúde" 
                                width={120} 
                                height={36} 
                                className="h-8 w-auto object-contain brightness-0 invert drop-shadow-[0_1px_8px_rgba(255,255,255,0.3)]" 
                                priority
                            />
                        </div>

                        <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed max-w-sm">
                            Corretora Autorizada AMEP Saúde na Baixada Fluminense. Transparência, cotações imbatíveis e suporte humanizado do primeiro contato ao pós-venda.
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 w-fit">
                            <ShieldCheck className="size-4 shrink-0 text-primary" />
                            <span>Registro ANS nº 413330</span>
                        </div>
                    </div>

                    {/* Column 2: Quick Links (2 cols) */}
                    <div className="md:col-span-2 flex flex-col space-y-3.5">
                        <h4 className="text-white text-sm font-semibold tracking-wide">
                            Planos AMEP
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-sm font-light">
                            <li>
                                <a href="#simulador" className="hover:text-white transition-colors duration-200">
                                    Smart PME / MEI
                                </a>
                            </li>
                            <li>
                                <a href="#simulador" className="hover:text-white transition-colors duration-200">
                                    Ideal Adesão Individual
                                </a>
                            </li>
                            <li>
                                <a href="#simulador" className="hover:text-white transition-colors duration-200">
                                    Simulador Instantâneo
                                </a>
                            </li>
                            <li>
                                <a href="https://wa.me/5521974450263" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200">
                                    Tabela Promocional
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Sede & Horários (3 cols) */}
                    <div className="md:col-span-3 flex flex-col space-y-3.5">
                        <h4 className="text-white text-sm font-semibold tracking-wide">
                            Sede Nova Iguaçu
                        </h4>
                        <ul className="space-y-3 text-xs sm:text-sm font-light">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>R. Athaide Pimenta de Morais, 381 - Centro, Nova Iguaçu - RJ, 26210-190</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-neutral-500 font-medium whitespace-nowrap mt-0.5">Horário:</span>
                                <span>Seg a Sex: 09h às 18h<br/>Sáb: 08h às 18h<br/>Domingo: Fechado</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Central de Vendas (3 cols) */}
                    <div className="md:col-span-3 flex flex-col space-y-3.5">
                        <h4 className="text-white text-sm font-semibold tracking-wide">
                            Central de Vendas
                        </h4>
                        <ul className="space-y-3 text-xs sm:text-sm font-light">
                            <li>
                                <a 
                                    href="https://wa.me/5521974450263" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 hover:text-white transition-colors duration-200 text-primary font-semibold"
                                >
                                    <Phone className="size-4 text-primary shrink-0" />
                                    <span>(21) 97445-0263</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="mailto:contato@Venacorsaude.com.br"
                                    className="flex items-center gap-2.5 hover:text-white transition-colors duration-200"
                                >
                                    <Mail className="size-4 text-primary shrink-0" />
                                    <span className="truncate">contato@Venacorsaude.com.br</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Sub-footer Line */}
                <div className="mt-8 pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] sm:text-xs text-neutral-500 font-light text-center md:text-left leading-relaxed">
                        © 2026 Venacor Saúde. Registro ANS nº 413330 (AMEP Saúde). Todos os direitos reservados.
                    </p>
                    <div className="flex gap-4 text-[10px] sm:text-xs text-neutral-500 font-light shrink-0">
                        <Link href="/privacidade" className="hover:text-white transition-colors duration-200">
                            Políticas de Privacidade
                        </Link>
                        <span className="text-neutral-800" aria-hidden="true">|</span>
                        <Link href="/termos" className="hover:text-white transition-colors duration-200">
                            Termos de Uso
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
