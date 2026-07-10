'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useDemoMode } from '@/lib/demo-mode';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GridViewIcon,
  UserGroupIcon,
  BubbleChatIcon,
  Briefcase01Icon,
  Task01Icon,
  CodeIcon,
  Settings02Icon,
  Search01Icon,
  BellIcon,
  Logout01Icon,
  ArrowDown01Icon,
  Menu01Icon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exclude layout for login page
  if (pathname === '/crm/login' || pathname === '/login') {
    return <>{children}</>;
  }

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const { data: session } = useSession();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const isUserAdmin = session && (session.user as any).role === 'ADMIN';

  // Categorized navigation items matching the visual design
  const navGroups = [
    {
      title: 'Visão Geral',
      items: [
        { href: '/crm/resume', label: 'Resumo', icon: GridViewIcon }
      ]
    },
    {
      title: 'Comercial',
      items: [
        { href: '/crm/clients', label: 'Clientes', icon: UserGroupIcon },
        ...(isUserAdmin ? [{ href: '/crm/planos', label: 'Planos', icon: Task01Icon }] : [])
      ]
    },
    {
      title: 'Equipe',
      items: [
        ...(isUserAdmin ? [{ href: '/crm/corretores', label: 'Corretores', icon: Briefcase01Icon }] : []),
        { href: '/crm/chat', label: 'Conversas', icon: BubbleChatIcon }
      ]
    },
    {
      title: 'Gestão',
      items: [
        ...(isUserAdmin ? [{ href: '/crm/dev-roadmap', label: 'Dev Roadmap', icon: CodeIcon }] : []),
        { href: '/crm/settings', label: 'Configurações', icon: Settings02Icon }
      ]
    }
  ];

  const getPageLabel = () => {
    switch (pathname) {
      case '/crm/resume': return 'Resumo';
      case '/crm/clients': return 'Clientes';
      case '/crm/chat': return 'Conversas';
      case '/crm/corretores': return 'Corretores';
      case '/crm/planos': return 'Planos';
      case '/crm/dev-roadmap': return 'Dev Roadmap';
      case '/crm/settings': return 'Configurações';
      default: return 'Geral';
    }
  };

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'VR';

  return (
    <div className="min-h-[100dvh] bg-white font-sans text-neutral-800 flex overflow-hidden select-none">

      {/* ─── DESKTOP SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-68 h-screen bg-white border-r border-slate-100 sticky top-0 left-0 overflow-y-auto shrink-0 select-none z-30">

        {/* Brand & Dropdown */}
        <div className="p-6 border-b border-slate-100/50 flex flex-col gap-4">
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="Venacor Saúde"
              className="h-8.5 w-auto object-contain"
            />
            <span className="bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/15 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider select-none">
              CRM
            </span>
          </Link>

          {/* Filial / Context selector styled exactly like Salte */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 cursor-pointer transition-colors">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Filial</span>
              <span className="text-xs font-bold text-neutral-850">Venacor Saúde</span>
            </div>
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 text-neutral-400" />
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-4 py-6 space-y-6 text-left">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <span className="px-4 text-[9px] font-semibold uppercase tracking-widest text-neutral-400 select-none block">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all ${isActive
                        ? 'text-neutral-900 font-semibold bg-slate-50/60'
                        : 'text-neutral-700 font-normal hover:text-neutral-600 hover:bg-slate-50/20'
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSideNavIndicator"
                          className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#3b2dff] rounded-r-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                        />
                      )}
                      <HugeiconsIcon icon={item.icon} className={`size-4.5 transition-colors ${isActive ? 'text-[#3b2dff]' : 'text-neutral-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Demo Mode Toggle */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50/40 border border-amber-200/30">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-amber-700">Modo Demonstração</span>
              <span className="text-[8px] font-medium text-amber-500 uppercase tracking-wider">
                {isDemoMode ? 'Ativado' : 'Desativado'}
              </span>
            </div>
            <button
              onClick={toggleDemoMode}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDemoMode ? 'bg-amber-500' : 'bg-slate-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isDemoMode ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Profile / Account Panel */}
        <div className="p-4 border-t border-slate-100/50">
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8.5 rounded-full bg-[#3b2dff] text-white border border-[#3b2dff]/10 font-bold text-xs flex items-center justify-center shadow-3xs shrink-0">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-semibold text-neutral-850 truncate">
                  {session?.user?.name || 'Corretor'}
                </span>
                <span className="text-[9px] font-normal text-neutral-400 uppercase tracking-wider">
                  {isUserAdmin ? 'Administrador' : 'Corretor'}
                </span>
              </div>
            </div>
            {/* Minimal Logout Button */}
            <Link
              href="/crm/login"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-neutral-400 hover:text-red-500 cursor-pointer transition-colors"
              title="Sair"
            >
              <HugeiconsIcon icon={Logout01Icon} className="size-4" />
            </Link>
          </div>

          <div className="mt-3 text-[9px] text-neutral-350 text-center font-normal">
            Venacor Saúde © 2026
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* MOBILE TOP BAR */}
        <header className="md:hidden h-14 bg-white border-b border-slate-200/50 px-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-xl border border-slate-200 text-neutral-550 hover:text-neutral-800 cursor-pointer"
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-5" />
          </button>

          <Link href="/" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <img
              src="/logo.svg"
              alt="Venacor Saúde"
              className="h-7 w-auto object-contain"
            />
            <span className="bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/15 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider select-none">
              CRM
            </span>
          </Link>

          <div className="size-7.5 rounded-full bg-[#3b2dff] text-white border border-[#3b2dff]/10 font-bold text-xs flex items-center justify-center shadow-3xs shrink-0">
            {userInitials}
          </div>
        </header>

        {/* DESKTOP CONTENT TOP BAR (Action Header) */}
        <header className="hidden md:flex h-16 border-b border-slate-100 bg-white px-8 lg:px-10 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-neutral-900 tracking-tight">{getPageLabel()}</h1>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Painel / CRM</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative w-64 flex items-center">
              <input
                type="text"
                placeholder="Buscar clientes, propostas..."
                className="w-full pl-8 pr-4 py-1.5 rounded-xl border border-slate-200/50 bg-white focus:border-[#3b2dff]/30 focus:ring-1 focus:ring-[#3b2dff]/10 text-xs font-normal text-neutral-700 placeholder:text-neutral-400 outline-none transition-all shadow-none h-8.5"
              />
              <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 text-neutral-400">
              <Link
                href="/crm/chat"
                className="p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 hover:text-neutral-700 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.015)] transition-colors relative"
              >
                <HugeiconsIcon icon={BubbleChatIcon} className="size-4.5" />
              </Link>

              <button
                className="p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 hover:text-neutral-700 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.015)] transition-colors relative"
              >
                <HugeiconsIcon icon={BellIcon} className="size-4.5" />
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#3b2dff]" />
              </button>

              <Link
                href="/crm/settings"
                className="p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 hover:text-neutral-700 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.015)] transition-colors"
              >
                <HugeiconsIcon icon={Settings02Icon} className="size-4.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN PANEL */}
        <main className="flex-1 overflow-y-auto w-full bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ─── MOBILE DRAWER MENU ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-neutral-900 cursor-pointer"
            />
            {/* Slide menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-72 max-w-[80vw] h-full bg-white flex flex-col p-6 shadow-2xl z-10 text-left border-r border-slate-100"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <img
                    src="/logo.svg"
                    alt="Venacor Saúde"
                    className="h-7.5 w-auto object-contain"
                  />
                  <span className="bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/15 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider select-none">
                    CRM
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-50 text-neutral-400 cursor-pointer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4.5" />
                </button>
              </div>

              {/* Mobile scroll nav items */}
              <nav className="flex-1 py-6 overflow-y-auto space-y-6">
                {navGroups.map((group) => (
                  <div key={group.title} className="space-y-1.5">
                    <span className="px-3 text-[9px] font-semibold uppercase tracking-wider text-neutral-450">
                      {group.title}
                    </span>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${isActive
                              ? 'bg-[#3b2dff]/5 text-[#3b2dff] border border-[#3b2dff]/10 font-semibold'
                              : 'text-neutral-700 hover:text-neutral-800 font-normal'
                              }`}
                          >
                            <HugeiconsIcon icon={item.icon} className="size-4.5" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-100 mb-4">
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50/40 border border-amber-200/30">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-amber-700">Modo Demonstração</span>
                    <span className="text-[8px] font-medium text-amber-500 uppercase tracking-wider">
                      {isDemoMode ? 'Ativado' : 'Desativado'}
                    </span>
                  </div>
                  <button
                    onClick={toggleDemoMode}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDemoMode ? 'bg-amber-500' : 'bg-slate-200'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isDemoMode ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/"
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-neutral-500 hover:text-neutral-850 text-center text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer block"
                >
                  Voltar ao Site
                </Link>
                <Link
                  href="/crm/login"
                  className="w-full py-2.5 rounded-xl bg-red-50 text-red-650 hover:bg-red-100 text-center text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer block"
                >
                  Sair
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
