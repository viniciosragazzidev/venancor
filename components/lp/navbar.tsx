"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, MessageSquare } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from '@/components/ui/button';

const navItems = [
    {
        title: "Coberturas",
        items: [
            { title: "Planos de Saúde Premium", href: "#planos" },
            { title: "Planos de Saúde Regionais", href: "#planos" },
            { title: "Planos Odontológicos", href: "#planos" },
            { title: "Planos Coletivos por Adesão", href: "#planos" },
        ],
    },
    {
        title: "Empresarial",
        items: [
            { title: "Saúde para MEI (a partir de 2 vidas)", href: "#planos" },
            { title: "Saúde PME (até 99 vidas)", href: "#planos" },
            { title: "Corporate (acima de 100 vidas)", href: "#planos" },
            { title: "Odonto Empresa", href: "#planos" },
        ],
    },
    {
        title: "Sobre",
        items: [
            { title: "Nossa Corretora", href: "#sobre" },
            { title: "Por que Multimarcas?", href: "#diferenciais" },
            { title: "Simulador Gratuito", href: "#simulador" },
            { title: "Dúvidas Frequentes", href: "#faq" },
        ],
    },
];

const NavbarLp: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [showMain, setShowMain] = useState(true);
    const [showReduced, setShowReduced] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

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
        setExpandedGroup(null);
    };

    const toggleGroup = (groupTitle: string) => {
        setExpandedGroup(expandedGroup === groupTitle ? null : groupTitle);
    };

    const handleCotarClick = () => {
        const input = document.querySelector('input[type="tel"]') as HTMLInputElement;
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            window.open('https://wa.me/5521974450263?text=Ol%C3%A1!%20Gostaria%20de%20uma%20cota%C3%A7%C3%A3o%20r%C3%A1pida.', '_blank');
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
                        <div className="hidden md:flex justify-center">
                            <NavigationMenu>
                                <NavigationMenuList>
                                    {navItems.map((group) => (
                                        <NavigationMenuItem key={group.title}>
                                            <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm">
                                                {group.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid gap-1 p-2 w-[220px] bg-popover rounded-xl shadow-lg border border-border/50">
                                                    {group.items.map((item) => (
                                                        <li key={item.title}>
                                                            <NavigationMenuLink
                                                                href={item.href}
                                                                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                                                            >
                                                                {item.title}
                                                            </NavigationMenuLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    ))}
                                    <NavigationMenuItem>
                                        <NavigationMenuLink
                                            href="#contatos"
                                            className="inline-flex h-9 items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-muted/60"
                                        >
                                            Contatos
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
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
                    {/* Logo */}
                    <Link className="flex items-center shrink-0 pl-1" href="/">
                        <Image src="/logo.webp" alt="Venacor Saúde" width={130} height={42} className="h-7 sm:h-8 w-auto object-contain" />
                    </Link>

                    {/* Divisor Desktop */}
                    <div className="hidden lg:block w-px h-4 bg-border/60 mx-1" />

                    {/* Links Desktop */}
                    <div className="hidden lg:flex items-center gap-1">
                        <Link href="/" className="px-3 py-1 text-xs sm:text-sm font-medium text-foreground rounded-full hover:bg-muted transition-colors">
                            Início
                        </Link>
                        {navItems.map((group) => (
                            <NavigationMenu key={group.title}>
                                <NavigationMenuList>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="h-7 px-2.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground">
                                            {group.title}
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid gap-1 p-2 w-[200px] bg-popover rounded-xl shadow-lg border border-border/50">
                                                {group.items.map((item) => (
                                                    <li key={item.href}>
                                                        <NavigationMenuLink href={item.href} className="block rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200">
                                                            {item.title}
                                                        </NavigationMenuLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        ))}
                    </div>

                    {/* Divisor Desktop */}
                    <div className="hidden lg:block w-px h-4 bg-border/60 mx-1" />

                    {/* Ações Mobile & Desktop */}
                    <div className="flex items-center gap-1.5">
                        <Button 
                            onClick={handleCotarClick}
                            size="sm" 
                            className="rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-1.5"
                        >
                            <MessageSquare className="size-3.5 sm:hidden" />
                            <span>Cotar Agora</span>
                        </Button>

                        {/* Hamburger extra para Mobile quando a pill está visível */}
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
                        {navItems.map((group) => {
                            const isExpanded = expandedGroup === group.title;
                            return (
                                <div key={group.title} className="border-b border-border/30 pb-3">
                                    <button
                                        onClick={() => toggleGroup(group.title)}
                                        className="w-full flex items-center justify-between text-base font-semibold text-foreground py-2"
                                    >
                                        <span>{group.title}</span>
                                        <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isExpanded && (
                                        <ul className="mt-2 pl-4 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                                            {group.items.map((item) => (
                                                <li key={item.href}>
                                                    <Link href={item.href} onClick={toggleMobileMenu} className="block py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                                        {item.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
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
