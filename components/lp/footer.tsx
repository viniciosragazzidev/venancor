'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

const footerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const footerColumnVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' } as const
    }
};

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-neutral-950 text-neutral-400 pt-16 pb-8 border-t border-neutral-900 font-sans select-none">
            <div className="w-full max-w-[1200px] mx-auto px-6">
                
                {/* 4 Column Grid */}
                <motion.div 
                    variants={footerContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 pb-12 w-full"
                >
                    {/* Column 1: Branding (4 cols) */}
                    <motion.div 
                        variants={footerColumnVariants}
                        className="md:col-span-4 flex flex-col space-y-4 text-left"
                    >
                        <Link href="/" className="inline-block">
                            <Image 
                                src="/logo.webp" 
                                alt="Venacor Saúde" 
                                width={140} 
                                height={40} 
                                className="h-8 w-auto object-contain brightness-0 invert" 
                                priority
                            />
                        </Link>
                        <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed max-w-sm">
                            Especialistas em encontrar a cobertura de saúde perfeita na Baixada Fluminense. Cuidado, economia e transparência da contratação ao pós-venda.
                        </p>
                    </motion.div>

                    {/* Column 2: Solutions (2 cols) */}
                    <motion.div 
                        variants={footerColumnVariants}
                        className="md:col-span-2 flex flex-col space-y-3.5 text-left"
                    >
                        <h4 className="text-white text-sm font-semibold tracking-wide">
                            Nossas Linhas
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-sm font-light">
                            <li>
                                <Link href="#planos" className="hover:text-white transition-colors duration-200">
                                    Nacionais Premium
                                </Link>
                            </li>
                            <li>
                                <Link href="#planos" className="hover:text-white transition-colors duration-200">
                                    Custo-Benefício Regional
                                </Link>
                            </li>
                            <li>
                                <Link href="#planos" className="hover:text-white transition-colors duration-200">
                                    Planos Odontológicos
                                </Link>
                            </li>
                            <li>
                                <Link href="#simulador" className="hover:text-white transition-colors duration-200">
                                    Simulador Gratuito
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Column 3: Offices (3 cols) */}
                    <motion.div 
                        variants={footerColumnVariants}
                        className="md:col-span-3 flex flex-col space-y-3.5 text-left"
                    >
                        <h4 className="text-white text-sm font-semibold tracking-wide">
                            Atendimento
                        </h4>
                        <ul className="space-y-3 text-xs sm:text-sm font-light">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                                <span>R. Athaide Pimenta de Morais, 381 - Centro, Nova Iguaçu - RJ, 26210-190</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-neutral-500 font-medium whitespace-nowrap mt-0.5">Horário:</span>
                                <span>Seg a Sex: 09h às 18h<br/>Sáb: 08h às 18h</span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Column 4: Contact (3 cols) */}
                    <motion.div 
                        variants={footerColumnVariants}
                        className="md:col-span-3 flex flex-col space-y-3.5 text-left"
                    >
                        <h4 className="text-white text-sm font-semibold tracking-wide">
                            Fale Conosco
                        </h4>
                        <ul className="space-y-3 text-xs sm:text-sm font-light">
                            <li>
                                <a 
                                    href="mailto:contato@Venacorsaude.com.br"
                                    className="flex items-center gap-2.5 hover:text-white transition-colors duration-200"
                                >
                                    <Mail className="size-4 text-primary shrink-0" />
                                    <span className="truncate">contato@Venacorsaude.com.br</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://wa.me/5521974450263" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 hover:text-white transition-colors duration-200"
                                >
                                    <Phone className="size-4 text-primary shrink-0" />
                                    <span>(21) 97445-0263</span>
                                </a>
                            </li>
                        </ul>
                    </motion.div>
                </motion.div>

                {/* Sub-footer Line */}
                <div className="mt-8 pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] sm:text-xs text-neutral-500 font-light text-center md:text-left leading-relaxed">
                        © 2026 Venacor Saúde. CNPJ: 00.000.000/0001-00. Registro ANS nº 000000. Todos os direitos reservados.
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
};

export default Footer;
