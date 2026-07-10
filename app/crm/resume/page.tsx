'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useDemoMode } from '@/lib/demo-mode';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  RefreshIcon,
  UserIcon,
  CircleDotIcon,
} from '@hugeicons/core-free-icons';
import { getDashboardAction, DashboardData } from './actions';
import { getDemoDashboardData } from '@/lib/demo-data';

const STATUS_STYLES = {
  Aguardando: 'bg-neutral-100 text-neutral-600',
  'Em Atendimento': 'bg-blue-50 text-blue-700',
  'Proposta Enviada': 'bg-amber-50 text-amber-700',
  'Venda Concluída': 'bg-emerald-50 text-emerald-700',
} as Record<string, string>;

const STATUS_LABELS = {
  Aguardando: 'Aguardando',
  'Em Atendimento': 'Em Atendimento',
  'Proposta Enviada': 'Proposta',
  'Venda Concluída': 'Concluído',
} as Record<string, string>;

export default function ResumePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { isDemoMode } = useDemoMode();

  const [selectedMonth, setSelectedMonth] = useState('Janeiro 2026');
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState<'corretores' | 'operadoras'>('corretores');

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push('/crm/login');
      return;
    }
    loadData();
  }, [session, isPending, router, isDemoMode]);

  useEffect(() => {
    if (data) loadData();
  }, [isDemoMode]);

  async function loadData() {
    setIsLoading(true);
    setError(null);

    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 400));
      setData(getDemoDashboardData());
      setIsLoading(false);
      return;
    }

    const res = await getDashboardAction();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setData(res.data);
    }
    setIsLoading(false);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `há ${mins}min`;
    const hours = Math.floor(mins / 60);
    return `há ${hours}h`;
  }

  if (isPending || isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 select-none text-left h-full bg-white">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-8 w-40 bg-slate-100 rounded-lg" />
          <div className="h-8 w-32 bg-slate-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-28 bg-slate-50 rounded-3xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-50 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-50 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 select-none text-left flex flex-col min-w-0 w-full bg-white">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 tracking-tight">Resumo</h1>
          <p className="text-[11px] font-semibold text-neutral-400 mt-0.5">
            {isDemoMode ? 'Exibindo dados de demonstração' : 'Visão geral do pipeline comercial'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 bg-neutral-50 hover:bg-slate-100 text-xs font-medium text-neutral-700 cursor-pointer outline-none appearance-none transition-colors"
          >
            <option value="Janeiro 2026">Janeiro 2026</option>
            <option value="Fevereiro 2026">Fevereiro 2026</option>
            <option value="Março 2026">Março 2026</option>
          </select>
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-neutral-400 hover:text-neutral-600 transition-all cursor-pointer"
            title="Recarregar"
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
          <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total de Leads', value: data.totalLeads, color: 'text-neutral-800', bg: 'bg-neutral-50/30' },
            { label: 'Aguardando', value: data.aguardando, color: 'text-neutral-600', bg: 'bg-neutral-50/30' },
            { label: 'Em Atendimento', value: data.emAtendimento, color: 'text-blue-700', bg: 'bg-blue-50/30' },
            { label: 'Propostas', value: data.propostasEnviadas, color: 'text-amber-700', bg: 'bg-amber-50/30' },
            { label: 'Vendas', value: data.vendasConcluidas, color: 'text-emerald-700', bg: 'bg-emerald-50/30' },
          ].map((metric) => (
            <div
              key={metric.label}
              className={`p-5 rounded-3xl border border-slate-100 ${metric.bg} transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.005)]`}
            >
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{metric.label}</span>
              <div className={`mt-3 text-3xl font-semibold tracking-tight ${metric.color}`}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Leads */}
      {data && (
        <div className="p-5 rounded-3xl border border-slate-100 bg-[#f8f9fa73]/40">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100/50">
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-medium text-neutral-450 uppercase tracking-wider">Pipeline</span>
              <span className="text-sm font-semibold text-neutral-700 mt-0.5">Últimos Leads</span>
            </div>
            <span className="text-[10px] font-medium text-neutral-400">{data.ultimosLeads.length} registros</span>
          </div>
          <div className="mt-4 space-y-2">
            {data.ultimosLeads.length === 0 ? (
              <p className="text-xs text-neutral-400 font-medium py-8 text-center">Nenhum lead registrado.</p>
            ) : (
              data.ultimosLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.003)] transition-all hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/50 shrink-0">
                      <HugeiconsIcon icon={UserIcon} className="size-4 text-neutral-500" />
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-sm font-semibold text-neutral-800 truncate">{lead.nome}</span>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                        <span>{lead.perfil}</span>
                        <span className="size-1 rounded-full bg-neutral-300" />
                        <span>{timeAgo(lead.created_at)}</span>
                        {lead.corretorNome && (
                          <>
                            <span className="size-1 rounded-full bg-neutral-300" />
                            <span>{lead.corretorNome}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border ${STATUS_STYLES[lead.status] || 'bg-neutral-100 text-neutral-600'} border-transparent shrink-0`}>
                    {STATUS_LABELS[lead.status] || lead.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Performance Tables */}
      {data && (
        <div className="p-6 rounded-3xl border border-slate-100 bg-[#f8f9fa73]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100/50">
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-medium text-neutral-450 uppercase tracking-wider">Desempenho</span>
              <span className="text-sm font-semibold text-neutral-700 mt-0.5">Distribuição Operacional</span>
            </div>
            <div className="inline-flex rounded-xl bg-white border border-slate-200/40 p-0.5 self-start sm:self-center">
              <button
                onClick={() => setTableFilter('corretores')}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer ${tableFilter === 'corretores'
                  ? 'bg-slate-100 text-neutral-800 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-600 font-normal'
                  }`}
              >
                Corretores
              </button>
              <button
                onClick={() => setTableFilter('operadoras')}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer ${tableFilter === 'operadoras'
                  ? 'bg-slate-100 text-neutral-800 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-600 font-normal'
                  }`}
              >
                Operadoras
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100/70 p-4 overflow-x-auto mt-4">
            {tableFilter === 'corretores' ? (
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-medium text-neutral-450 uppercase tracking-wider">
                    <th className="pb-3 pt-1 px-4">Corretor</th>
                    <th className="pb-3 pt-1 px-4 text-center">Leads</th>
                    <th className="pb-3 pt-1 px-4 text-center">Em Atend.</th>
                    <th className="pb-3 pt-1 px-4 text-center">Propostas</th>
                    <th className="pb-3 pt-1 px-4 text-center">Vendas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {data.leadsPorCorretor.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-neutral-400 font-medium">
                        Nenhum lead atribuído a corretores.
                      </td>
                    </tr>
                  ) : (
                    data.leadsPorCorretor.map((corretor) => (
                      <tr key={corretor.id} className="text-xs text-neutral-600 hover:bg-slate-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-neutral-800">{corretor.nome}</td>
                        <td className="py-3.5 px-4 text-center text-neutral-650 font-normal">{corretor.total}</td>
                        <td className="py-3.5 px-4 text-center text-blue-600 font-medium">{corretor.emAtendimento}</td>
                        <td className="py-3.5 px-4 text-center text-amber-600 font-medium">{corretor.propostas}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-600 font-medium">{corretor.vendas}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-medium text-neutral-450 uppercase tracking-wider">
                    <th className="pb-3 pt-1 px-4">Operadora</th>
                    <th className="pb-3 pt-1 px-4 text-center">Leads</th>
                    <th className="pb-3 pt-1 px-4 text-center">Em Atend.</th>
                    <th className="pb-3 pt-1 px-4 text-center">Vendas</th>
                    <th className="pb-3 pt-1 px-4 text-center">Conversão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {data.leadsPorOperadora.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-neutral-400 font-medium">
                        Nenhum lead registrado por operadora.
                      </td>
                    </tr>
                  ) : (
                    data.leadsPorOperadora.map((op, idx) => (
                      <tr key={idx} className="text-xs text-neutral-600 hover:bg-slate-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-neutral-800">{op.perfil}</td>
                        <td className="py-3.5 px-4 text-center text-neutral-650 font-normal">{op.total}</td>
                        <td className="py-3.5 px-4 text-center text-blue-600 font-medium">{op.emAtendimento}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-600 font-medium">{op.vendas}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-[10px] font-bold ${op.total > 0 && (op.vendas / op.total) >= 0.25 ? 'text-emerald-600' : 'text-neutral-400'}`}>
                            {op.total > 0 ? `${Math.round((op.vendas / op.total) * 100)}%` : '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
