'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SplitText from '@/components/split-text';

interface ProductCard {
    id: string;
    name: string;
    logo: string;
    category: 'saude' | 'odonto';
    badge: string;
    badgeVariant: 'premium' | 'regional' | 'economico';
    description: string;
    startingPrice?: string;
}

const saudeProducts: ProductCard[] = [
    {
        id: 'amil',
        name: 'Amil Saúde',
        logo: '/amil_logo.webp',
        category: 'saude',
        badge: 'Nacional Premium',
        badgeVariant: 'premium',
        description: 'Rede própria de excelência e atendimento nos melhores hospitais do Brasil.',
        startingPrice: 'R$ 189,90'
    },
    {
        id: 'porto',
        name: 'Porto Saúde',
        logo: '/PortoSaude_logo.webp',
        category: 'saude',
        badge: 'Nacional Premium',
        badgeVariant: 'premium',
        description: 'Medicina diagnóstica diferenciada e programas exclusivos de bem-estar.',
        startingPrice: 'R$ 210,00'
    },
    {
        id: 'amep',
        name: 'AMEP Saúde',
        logo: '/amep_saude_logo.png',
        category: 'saude',
        badge: 'Carência Zero Amil',
        badgeVariant: 'regional',
        description: 'Carência zero em atendimentos ambulatoriais na rede própria e hospitais parceiros.',
        startingPrice: 'R$ 82,94'
    },
    {
        id: 'unimed',
        name: 'Unimed Nova Iguaçu',
        logo: '/unimed_logo.webp',
        category: 'saude',
        badge: 'Líder Regional',
        badgeVariant: 'regional',
        description: 'Atendimento completo e prioritário no Hospital Geral do Centro em Nova Iguaçu.',
        startingPrice: 'R$ 149,90'
    },
    {
        id: 'assim',
        name: 'Assim Saúde',
        logo: '/assim-saude_logo.png',
        category: 'saude',
        badge: 'Regional RJ',
        badgeVariant: 'regional',
        description: 'A maior rede própria do Estado do Rio de Janeiro com ótimo custo-benefício.',
        startingPrice: 'R$ 119,90'
    },
    {
        id: 'leve',
        name: 'Leve Saúde',
        logo: '/LEVESaude__logo.webp',
        category: 'saude',
        badge: 'Econômico 45+',
        badgeVariant: 'economico',
        description: 'Foco em saúde preventiva e valores acessíveis para todas as idades.',
        startingPrice: 'R$ 89,90'
    },
    {
        id: 'cemeru',
        name: 'Cemeru Saúde',
        logo: '/cemeru_logo.png',
        category: 'saude',
        badge: 'Econômico Z. Oeste',
        badgeVariant: 'economico',
        description: 'Tradição na Zona Oeste e Baixada com hospitais e prontos-socorros próprios.',
        startingPrice: 'R$ 99,90'
    },
    {
        id: 'notredame',
        name: 'NotreDame Intermédica',
        logo: '/NotreDame_logo.webp',
        category: 'saude',
        badge: 'Nacional / PME',
        badgeVariant: 'regional',
        description: 'Planos corporativos e individuais com ampla estrutura de centros médicos.',
        startingPrice: 'R$ 129,90'
    },
    {
        id: 'sulamerica',
        name: 'SulAmérica Saúde',
        logo: '/sulamerica_logo.png',
        category: 'saude',
        badge: 'Nacional Premium',
        badgeVariant: 'premium',
        description: 'Livre escolha de médicos com sistema de reembolso rápido e aplicativo completo.',
        startingPrice: 'R$ 229,90'
    }
];

const odontoProducts: ProductCard[] = [
    {
        id: 'amil-dental',
        name: 'Amil Dental',
        logo: '/amil_logo.webp',
        category: 'odonto',
        badge: 'Nacional Total',
        badgeVariant: 'premium',
        description: 'Cobertura nacional para próteses, ortodontia, limpeza e emergência 24h.',
        startingPrice: 'R$ 23,90'
    },
    {
        id: 'sulamerica-odonto',
        name: 'SulAmérica Odonto',
        logo: '/sulamerica_logo.png',
        category: 'odonto',
        badge: 'Reembolso / Premium',
        badgeVariant: 'premium',
        description: 'Reembolso para tratamentos especializados e mais de 28 mil opções de atendimento.',
        startingPrice: 'R$ 29,90'
    },
    {
        id: 'porto-odonto',
        name: 'Porto Odonto',
        logo: '/PortoSaude_logo.webp',
        category: 'odonto',
        badge: 'Benefício Exclusivo',
        badgeVariant: 'regional',
        description: 'Carência zero para diversos procedimentos e descontos para segurados Porto.',
        startingPrice: 'R$ 19,90'
    },
    {
        id: 'unimed-odonto',
        name: 'Unimed Odonto',
        logo: '/unimed_logo.webp',
        category: 'odonto',
        badge: 'Econômico Familiar',
        badgeVariant: 'economico',
        description: 'Planos odonto acessíveis com ampla rede de dentistas credenciados na Baixada.',
        startingPrice: 'R$ 15,00'
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 },
    }
};

const SectionTwo: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'saude' | 'odonto'>('saude');

    const products = activeTab === 'saude' ? saudeProducts : odontoProducts;

    const handleSelectCard = (productName: string) => {
        const heroInput = document.querySelector('input[type="tel"]') as HTMLInputElement;
        if (heroInput) {
            heroInput.focus();
            heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            window.open(`https://wa.me/5521964469750?text=${encodeURIComponent(`Olá! Gostaria de receber a tabela de preços do plano ${productName}.`)}`, '_blank');
        }
    };

    const getBadgeStyle = (variant: ProductCard['badgeVariant']) => {
        switch (variant) {
            case 'premium':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20';
            case 'regional':
                return 'bg-primary/10 text-primary border border-primary/20';
            case 'economico':
                return 'bg-primary/10 text-primary border border-primary/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <section id="planos" className="w-full bg-slate-50/60 dark:bg-background/90 py-20 md:py-28 font-sans border-y border-border/30 relative overflow-hidden">
            {/* Elemento decorativo sutil */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-border/60 to-transparent pointer-events-none" />

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start">
                
                {/* 1. CABEÇALHO DA SEÇÃO */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-2xl flex flex-col items-start text-left mb-10 select-none"
                >
                    <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        <span className="size-1.5 rounded-full bg-primary shrink-0" />
                        <span>Nossos Produtos</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-foreground leading-tight mb-2">
                        As Melhores Opções de Saúde e Odonto em Um Só Lugar.
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base font-light">
                        Cotação instantânea com tabela oficial de coparticipação e carências.
                    </p>
                </motion.div>

                {/* 2. MENU DE ABAS / TABS */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-border/10 pb-6">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveTab('saude')}
                            className="relative px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 focus-visible:outline-none cursor-pointer"
                        >
                            {activeTab === 'saude' && (
                                <motion.div
                                    layoutId="activeTabSection2"
                                    className="absolute inset-0 bg-foreground rounded-full"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span className={`relative z-10 ${activeTab === 'saude' ? 'text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                                Planos de Saúde
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('odonto')}
                            className="relative px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 focus-visible:outline-none cursor-pointer"
                        >
                            {activeTab === 'odonto' && (
                                <motion.div
                                    layoutId="activeTabSection2"
                                    className="absolute inset-0 bg-foreground rounded-full"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span className={`relative z-10 ${activeTab === 'odonto' ? 'text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                                Planos Odontológicos
                            </span>
                        </button>
                    </div>

                    {/* Progress Slider */}
                    <div className="flex items-center gap-3 select-none text-xs text-muted-foreground font-semibold shrink-0">
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: '50%' }}
                                animate={{ width: activeTab === 'saude' ? '50%' : '100%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <span>{activeTab === 'saude' ? '1' : '2'}/2</span>
                    </div>
                </div>

                {/* 4. Vitrine de Produtos (Grid) */}
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
                        >
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    variants={cardVariants}
                                    whileHover={{ y: -4 }}
                                    onClick={() => handleSelectCard(product.name)}
                                    className="bg-card dark:bg-card/90 border border-border/60 hover:border-primary/40 rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between items-center text-center group cursor-pointer relative overflow-hidden"
                                >
                                    {/* Linha decorativa de topo no hover */}
                                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Topo: Logo da Operadora */}
                                    <div className="w-full h-16 flex items-center justify-center p-2 mb-3 bg-muted/20 rounded-xl group-hover:bg-muted/40 transition-colors">
                                        <Image
                                            src={product.logo}
                                            alt={product.name}
                                            width={140}
                                            height={48}
                                            className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                            priority
                                        />
                                    </div>

                                    {/* Pílula de Perfil */}
                                    <div className="mb-4">
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(product.badgeVariant)}`}>
                                            {product.badge}
                                        </span>
                                    </div>

                                    {/* Resumo do Benefício */}
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal mb-6 min-h-[44px] flex items-center justify-center">
                                        {product.description}
                                    </p>

                                    {/* Botão/Link de Ação */}
                                    <div className="w-full pt-2 border-t border-border/30">
                                        <div className="w-full py-2.5 px-4 rounded-xl bg-muted/40 dark:bg-muted/20 group-hover:bg-primary group-hover:text-primary-foreground font-semibold text-xs sm:text-sm text-foreground flex items-center justify-center gap-1.5 transition-all duration-300">
                                            <span>Ver Tabelas</span>
                                            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
};

export default SectionTwo;