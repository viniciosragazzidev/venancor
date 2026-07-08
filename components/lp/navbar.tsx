"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Menu, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavbarLp: React.FC = () => {
    const pathname = usePathname();
    const isAmepPage = pathname?.startsWith('/amep');

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMain, setShowMain] = useState(true);
    const [showReduced, setShowReduced] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Links específicos para cada página (Home vs AMEP)
    const currentNavItems = isAmepPage 
        ? [
            { title: "Rede Própria", href: "#unidades" },
            { title: "Expansão Regional", href: "#expansao" },
            { title: "Simulador AMEP", href: "#simulador" },
            { title: "Tabela de Preços", href: "#precos" },
          ]
        : [
            { title: "Planos", href: "#planos" },
            { title: "Rede de Hospitais", href: "#hospitais" },
            { title: "Simulador Gratuito", href: "#simulador" },
            { title: "Dúvidas Frequentes", href: "#faq" },
          ];

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;

            setIsScrolled(currentY > 0);

            if (currentY <= 50) {
                setShowMain(true);
                setShowReduced(false);
            } else if (currentY > 80) {
                setShowMain(false);
                setShowReduced(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleCotarClick = () => {
        const input = document.querySelector('input[type="tel"]') as HTMLInputElement;
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            window.open('https://wa.me/5521964469750?text=Ol%C3%A1!%20Gostaria%20de%20uma%20cota%C3%A7%C3%A3o%20r%C3%A1pida.', '_blank');
        }
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            {/* 1. Navbar Principal (Topo da Página) */}
            <div
                className={`fixed top-0 left-0 right-0 z-50 font-sans transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    showMain ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
                }`}
            >
                <section className={`w-full border-b border-border/20 transition-all duration-300 ${isScrolled ? 'bg-background/85 backdrop-blur-md' : 'bg-transparent'}`}>
                    <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between md:grid md:grid-cols-[auto_1fr_auto] h-20 md:h-24">
                        <Link className="flex items-center z-50 shrink-0 py-2" href="/">
                            <Image src="/logo.webp" alt="Venacor Saúde" width={180} height={60} priority className="h-11 sm:h-13 md:h-15 w-auto object-contain" />
                        </Link>

                        {/* Navigation Menu Desktop */}
                        <div className="hidden md:flex justify-center items-center gap-6">
                            {currentNavItems.map((item) => (
                                <Link 
                                    key={item.title} 
                                    href={item.href} 
                                    className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm"
                                >
                                    {item.title}
                                </Link>
                            ))}
                            <Link 
                                href="#contatos" 
                                className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm"
                            >
                                Contatos
                            </Link>
                        </div>

                        {/* CTA Desktop */}
                        <div className="hidden md:flex items-center">
                            <Button 
                                onClick={handleCotarClick}
                                className="font-semibold px-5 py-2 rounded-full shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                            >
                                Cotar no WhatsApp
                            </Button>
                        </div>

                        {/* Mobile Toggle Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="flex md:hidden p-2 rounded-lg text-foreground hover:bg-muted/80 transition-colors z-50"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </nav>
                </section>
            </div>

            {/* 2. Navbar Flutuante no Scroll (Pill Bar - Mobile & Desktop Refinada) */}
            <div
                className={`fixed top-3 left-1/2 -translate-x-1/2 z-[60] font-sans w-[calc(100%-24px)] max-w-fit transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    showReduced ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95 pointer-events-none'
                }`}
            >
                <div className="flex items-center justify-between gap-2.5 px-3.5 py-2 bg-background/85 dark:bg-background/90 backdrop-blur-xl border border-border/50 rounded-full shadow-xl shadow-black/10 select-none">
                    <Link className="flex items-center shrink-0 pl-1" href="/">
                        <Image src="/logo.webp" alt="Venacor Saúde" width={130} height={42} className="h-7 sm:h-8 w-auto object-contain" />
                    </Link>

                    <div className="hidden lg:block w-px h-4 bg-border/60 mx-1" />

                    <div className="hidden lg:flex items-center gap-3">
                        <Link href="/" className="px-3 py-1 text-xs sm:text-sm font-medium text-foreground rounded-full hover:bg-muted transition-colors">
                            Início
                        </Link>
                        {currentNavItems.map((item) => (
                            <Link 
                                key={item.title} 
                                href={item.href} 
                                className="px-3 py-1 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:block w-px h-4 bg-border/60 mx-1" />

                    <div className="flex items-center gap-1.5">
                        <Button 
                            onClick={handleCotarClick}
                            size="sm" 
                            className="rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-1.5"
                        >
                            <MessageSquare className="size-3.5 sm:hidden" />
                            <span>Cotar Agora</span>
                        </Button>

                        <button
                            onClick={toggleMobileMenu}
                            className="flex md:hidden p-1.5 rounded-full text-foreground hover:bg-muted/80 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Overlay do Menu Mobile */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-0 bg-background/95 backdrop-blur-2xl z-[70] md:hidden flex flex-col p-6 animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between pb-4 border-b border-border/40">
                        <Image src="/logo.webp" alt="Venacor Saúde" width={150} height={50} className="h-9 sm:h-10 w-auto object-contain" />
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-full bg-muted/60 text-foreground hover:bg-muted transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pt-6">
                        {currentNavItems.map((item) => (
                            <div key={item.title} className="border-b border-border/30 pb-3">
                                <Link 
                                    href={item.href} 
                                    onClick={toggleMobileMenu} 
                                    className="block w-full text-base font-semibold text-foreground py-2"
                                >
                                    {item.title}
                                </Link>
                            </div>
                        ))}
                        <div className="border-b border-border/30 pb-3">
                            <Link 
                                href="#contatos" 
                                onClick={toggleMobileMenu} 
                                className="block w-full text-base font-semibold text-foreground py-2"
                            >
                                Contatos
                            </Link>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border/40 flex flex-col gap-3">
                        <Button 
                            onClick={handleCotarClick} 
                            size="lg" 
                            className="w-full rounded-full justify-center bg-primary text-primary-foreground font-bold py-3.5 text-base shadow-lg"
                        >
                            Cotar no WhatsApp
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavbarLp;
