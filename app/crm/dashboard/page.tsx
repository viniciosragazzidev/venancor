import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, TrendingUp, HandCoins } from 'lucide-react';

export default function CrmDashboard() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard CRM</h1>
                    <p className="text-sm text-slate-500 font-light">Visão analítica de leads e performance da corretora.</p>
                </div>
                
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-bold">
                    <ArrowLeft className="size-4" />
                    <span>Voltar para o Início</span>
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Leads</span>
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                            <Users className="size-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">1.284</h3>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">+12.4% este mês</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversão de Vendas</span>
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <TrendingUp className="size-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">24,3%</h3>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">+1.8% vs mês passado</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Vendas Fechadas</span>
                        <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600">
                            <HandCoins className="size-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">R$ 48.920</h3>
                        <p className="text-[11px] text-muted-foreground font-light mt-1">Meta: R$ 60.000 (81.5%)</p>
                    </div>
                </div>
            </div>

            {/* Leads Table Placeholder */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Leads Recentes da Campanha AMEP Saúde</h3>
                    <span className="text-xs text-primary font-bold">Ver todos</span>
                </div>
                <div className="p-8 text-center text-sm text-slate-400 font-light">
                    Sem leads pendentes no momento. Toda a fila de cotação foi integrada ao painel principal do WhatsApp.
                </div>
            </div>
        </div>
    );
}
