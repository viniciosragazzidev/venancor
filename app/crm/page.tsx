import React from 'react';
import Link from 'next/link';
import { ArrowRight, KeyRound, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CrmHome() {
    return (
        <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6">
            <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-2xs border border-primary/20">
                <KeyRound className="size-7" />
            </div>
            
            <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Login no CRM Venacor</h1>
                <p className="text-sm text-slate-500 font-light">Acesse o painel integrado de controle de vendas e leads.</p>
            </div>

            <div className="space-y-4 pt-2">
                <div className="text-left space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Usuário ou E-mail</label>
                    <input 
                        type="text" 
                        placeholder="Ex: consultor@venacor.com.br"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none text-sm transition-all shadow-2xs"
                    />
                </div>
                <div className="text-left space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Senha de Acesso</label>
                    <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none text-sm transition-all shadow-2xs"
                    />
                </div>
            </div>

            <Button className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                <span>Entrar no Sistema</span>
                <ArrowRight className="size-4" />
            </Button>

            <div className="pt-2 border-t border-slate-100 flex justify-center">
                <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline">
                    <LayoutDashboard className="size-3.5" />
                    <span>Visão Geral do Dashboard (Demonstração)</span>
                </Link>
            </div>
        </div>
    );
}
