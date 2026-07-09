'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Icons matching high-agency design guidelines
const ChatIcon = () => (
  <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BellIcon = () => (
  <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const CloudIcon = () => (
  <svg className="size-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58" />
  </svg>
);

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exclude navbar/breadcrumbs layout for the login page (handles both main domain and CRM subdomain)
  if (pathname === '/crm/login' || pathname === '/login') {
    return <>{children}</>;
  }

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/crm/resume', label: 'Dashboard' },
    { href: '/crm/leeds', label: 'Leeds' },
    { href: '/crm/chat', label: 'Chat' },
    { href: '/crm/corretores', label: 'Corretores' },
    { href: '/crm/settings', label: 'Configurações' },
  ];

  const getPageLabel = () => {
    switch (pathname) {
      case '/crm/resume': return 'Dashboard';
      case '/crm/leeds': return 'Leeds';
      case '/crm/chat': return 'Chat';
      case '/crm/corretores': return 'Corretores';
      case '/crm/settings': return 'Configurações';
      default: return 'Geral';
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] font-sans text-neutral-800 flex flex-col overflow-x-hidden select-none">
      
      {/* 1. Horizontal Navbar on Top */}
      <nav className="h-16 bg-white border-b border-neutral-200/50 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40 shrink-0 w-full shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center pt-0.5">
            <img 
              src="/logo.svg" 
              alt="Venacor Saúde" 
              className="h-6.5 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-bold transition-all py-1.5 relative ${
                    isActive ? 'text-neutral-900 font-extrabold' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="topNavUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b2dff]"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden lg:flex items-center w-80 relative">
          <input
            type="text"
            placeholder="Buscar leads, corretores..."
            className="w-full pl-8 pr-4 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-[#3b2dff] text-xs font-semibold outline-none transition-colors"
          />
          <svg className="absolute left-2.5 top-2.5 size-3.5 text-neutral-450" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-xl border border-neutral-200 text-neutral-550 hover:text-neutral-800 cursor-pointer"
          >
            <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>

          {/* Action Icons */}
          <div className="hidden sm:flex items-center gap-3.5 text-neutral-405">
            <button className="p-1 rounded-lg hover:bg-neutral-50 hover:text-neutral-700 cursor-pointer">
              <ChatIcon />
            </button>
            <button className="p-1 rounded-lg hover:bg-neutral-50 hover:text-neutral-700 relative cursor-pointer">
              <BellIcon />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#3b2dff]" />
            </button>
            <button className="p-1 rounded-lg hover:bg-neutral-50 hover:text-neutral-700 cursor-pointer">
              <SettingsIcon />
            </button>
          </div>

          {/* New Lead Button (primary color `#3b2dff`) */}
          <button className="bg-[#3b2dff] hover:bg-[#2d20e0] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer select-none active:scale-[0.98]">
            + Novo Lead
          </button>

          {/* Avatar bubble */}
          <div className="size-8 rounded-full bg-[#3b2dff] text-white border border-[#3b2dff]/10 font-black text-xs flex items-center justify-center shadow-3xs cursor-pointer select-none">
            VR
          </div>
        </div>
      </nav>

      {/* 2. Secondary breadcrumbs bar */}
      <div className="bg-white border-b border-neutral-200/50 py-2.5 px-6 lg:px-10 flex items-center justify-between w-full shadow-[0_1px_2px_rgba(0,0,0,0.005)]">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          <span>Painel</span>
          <span className="text-neutral-300">/</span>
          <span>CRM</span>
          <span className="text-neutral-300">/</span>
          <span className="text-[#3b2dff] font-extrabold">{getPageLabel()}</span>
        </div>

        <div className="flex items-center text-[10px] font-bold text-neutral-400">
          <CloudIcon />
          <span>Sincronizado há 2 minutos</span>
        </div>
      </div>

      {/* 3. Main content area */}
      <main className="flex-1 w-full bg-[#fafafa]">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-neutral-900 cursor-pointer"
            />
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full bg-white max-h-[60vh] flex flex-col p-6 shadow-2xl z-10 text-left rounded-b-3xl border-b border-neutral-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <img 
                  src="/logo.svg" 
                  alt="Venacor Saúde" 
                  className="h-6.5 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 cursor-pointer"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Mobile links */}
              <nav className="flex flex-col py-4 gap-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/10'
                          : 'text-neutral-555 hover:text-neutral-800'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
                <Link
                  href="/"
                  className="w-full py-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 text-neutral-500 hover:text-neutral-850 text-center text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer block"
                >
                  Voltar ao Site
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
