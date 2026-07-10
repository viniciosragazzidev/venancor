"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getClientsAction,
  startAttendanceAction,
  updateClientStatusAction,
  ClientLead,
} from "./actions";
import { AddClientSheet } from "./add-client-sheet";

// �€�€�€ Constants �€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  Aguardando: { label: "Aguardando", color: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-400" },
  "Em Atendimento": { label: "Negociando", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  "Proposta Enviada": { label: "Proposta", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  "Venda Concluída": { label: "Concluída", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

// �€�€�€ Helpers �€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€
function getRequiredDocuments(perfil: string) {
  const isEmpresarial =
    perfil.toLowerCase().includes("empresa") ||
    perfil.toLowerCase().includes("pme") ||
    perfil.toLowerCase().includes("cnpj");
  if (isEmpresarial) {
    return [
      { key: "cnpj", label: "Cartão CNPJ" },
      { key: "contrato", label: "Contrato Social / CCMEI" },
      { key: "documento_socio", label: "RG/CPF do Sócio Administrador" },
      { key: "comp_empresa", label: "Comprovante de Endereço da Empresa" },
      { key: "vinculo_benef", label: "Comprovação de Vínculo dos Beneficiários" },
    ];
  }
  return [
    { key: "rg_cpf", label: "RG e CPF (ou CNH frente e verso)" },
    { key: "comp_residencia", label: "Comprovante de Residência (últimos 90 dias)" },
    { key: "cert_nascimento", label: "Certidão de Nascimento (para menores)" },
    { key: "vinculo_familiar", label: "Cert. Casamento / União Estável (se houver cônjuge)" },
  ];
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// �€�€�€ Status Badge �€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-neutral-100 text-neutral-600 border-neutral-200", dot: "bg-neutral-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium uppercase tracking-wider ${cfg.color}`}>
      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// �€�€�€ Pagination Bar �€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€
function PaginationBar({
  total, page, pageSize, onPage, onPageSize,
}: {
  total: number; page: number; pageSize: number;
  onPage: (p: number) => void; onPageSize: (s: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 px-1">
      <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400">
        <span>Linhas por página:</span>
        {PAGE_SIZE_OPTIONS.map((s) => (
          <Button
            key={s}
            variant={pageSize === s ? 'default' : 'outline'}
            size="xs"
            onClick={() => { onPageSize(s); onPage(1); }}
            className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-colors ${pageSize === s
              ? "bg-[#3b2dff] text-white border-[#3b2dff]"
              : "border-neutral-200 text-neutral-500 hover:border-[#3b2dff]"
              }`}
          >
            {s}
          </Button>
        ))}
        <span className="ml-2 text-neutral-400">
          {start}�“{end} de <span className="font-medium text-neutral-600">{total}</span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-[10px] font-bold text-neutral-400">�¦</span>
          ) : (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              size="icon-xs"
              onClick={() => onPage(p as number)}
              className={`size-7 rounded-lg border text-[10px] font-semibold cursor-pointer transition-colors ${page === p
                ? "bg-[#3b2dff] text-white border-[#3b2dff]"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
        </Button>
      </div>
    </div>
  );
}

// �€�€�€ Docs Drawer �€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€
function DocsDrawer({
  client,
  onClose,
  collectedDocs,
  toggleDoc,
}: {
  client: ClientLead;
  onClose: () => void;
  collectedDocs: Record<string, boolean>;
  toggleDoc: (key: string) => void;
}) {
  const docs = getRequiredDocuments(client.perfil);
  const collected = docs.filter(d => collectedDocs[`${client.id}-${d.key}`]).length;
  const progress = Math.round((collected / docs.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900 cursor-pointer"
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white h-full w-full max-w-md shadow-xl border-l border-neutral-200/60 p-6 md:p-8 relative z-10 overflow-y-auto text-left flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Checklist de Documentação</h3>
            <p className="text-[10px] text-neutral-450 font-bold mt-1">Marque os documentos recebidos do cliente.</p>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1.5 rounded-xl border border-neutral-200 text-neutral-400 hover:text-neutral-700 cursor-pointer">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </Button>
        </div>

        {/* Client info card */}
        <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#3b2dff]/10 border border-[#3b2dff]/15 flex items-center justify-center text-[#3b2dff] font-semibold text-xs">
              {getInitials(client.nome)}
            </div>
            <div>
              <p className="font-semibold text-neutral-800 text-sm">{client.nome}</p>
              <p className="text-[10px] font-bold text-neutral-450">{formatPhone(client.whatsapp)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[8px] font-medium text-neutral-400 uppercase tracking-widest block">Perfil</span>
              <span className="text-[10px] font-medium text-neutral-600 mt-0.5 block">{client.perfil}</span>
            </div>
            <div>
              <span className="text-[8px] font-medium text-neutral-400 uppercase tracking-widest block">Vidas</span>
              <span className="text-[10px] font-medium text-neutral-600 mt-0.5 block">{client.idades}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest">Progresso da Documentação</span>
            <span className="text-[10px] font-medium text-neutral-600">{collected}/{docs.length}</span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#3b2dff] to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Documents checklist */}
        <div className="space-y-2 flex-1">
          <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest block">Documentos Necessários</span>
          {docs.map((doc) => {
            const key = `${client.id}-${doc.key}`;
            const done = collectedDocs[key] || false;
            return (
              <button
                key={doc.key}
                onClick={() => toggleDoc(key)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer group ${done
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-600"
                  }`}
              >
                <span className={`size-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${done ? "bg-emerald-500 border-emerald-500" : "border-neutral-300 group-hover:border-neutral-400 bg-white"
                  }`}>
                  {done && (
                    <svg className="size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </span>
                <span className={`text-xs font-bold leading-relaxed ${done ? "line-through opacity-60" : ""}`}>{doc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer footer actions */}
        <div className="pt-4 border-t border-neutral-100 flex gap-3">
          <a
            href={`https://wa.me/55${client.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 rounded-2xl text-center transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            Chamar no WhatsApp
          </a>
          <Button variant="outline" size="sm" onClick={onClose} className="px-4 py-3 rounded-2xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 font-semibold text-xs cursor-pointer h-9">Fechar</Button>
        </div>
      </motion.div>
    </div>
  );
}

// �€�€�€ Main Page Component �€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€�€
export default function ClientsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [, startTransition] = useTransition();

  // Tab
  const [activeTab, setActiveTab] = useState<"leads" | "clients">("leads");

  // Data
  const [leadsList, setLeadsList] = useState<ClientLead[]>([]);
  const [clientsList, setClientsList] = useState<ClientLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter / Sort / Pagination �” Leads
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsStatusF, setLeadsStatusF] = useState("todos");
  const [leadsSort, setLeadsSort] = useState<"id_desc" | "nome_asc">("id_desc");
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsPageSize, setLeadsPageSize] = useState(10);

  // Filter / Sort / Pagination �” Clients
  const [clientSearch, setClientSearch] = useState("");
  const [clientStatusF, setClientStatusF] = useState("todos");
  const [clientSort, setClientSort] = useState<"id_desc" | "nome_asc">("id_desc");
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);

  // Drawer
  const [drawerClient, setDrawerClient] = useState<ClientLead | null>(null);
  const [collectedDocs, setCollectedDocs] = useState<Record<string, boolean>>({});

  // Add Client Sheet
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const isUserAdmin = session && (session.user as any).role === "ADMIN";

  // �€�€ Fetch �€�€
  useEffect(() => {
    if (isPending) return;
    if (!session) { router.push("/crm/login"); return; }

    async function fetchClients() {
      setIsLoading(true);
      setError(null);
      const res = await getClientsAction();
      if (res.error) setError(res.error);
      else if (res.data) {
        setLeadsList(res.data.leads || []);
        setClientsList(res.data.clients || []);
      }
      setIsLoading(false);
    }
    fetchClients();
  }, [session, isPending, router]);

  // �€�€ Actions �€�€
  const handleStartAttendance = (clientId: number) => {
    setError(null);
    const claimed = leadsList.find(l => l.id === clientId);
    if (claimed) {
      setLeadsList(prev => prev.filter(l => l.id !== clientId));
      setClientsList(prev => [
        { ...claimed, status: "Em Atendimento", corretorId: session?.user.id || null, corretorNome: session?.user.name },
        ...prev,
      ]);
    }
    startTransition(async () => {
      const res = await startAttendanceAction(clientId);
      if (res.error) {
        setError(res.error);
        const fresh = await getClientsAction();
        if (fresh.data) { setLeadsList(fresh.data.leads || []); setClientsList(fresh.data.clients || []); }
      } else {
        setSuccessMsg("Lead assumido com sucesso!");
        setTimeout(() => setSuccessMsg(null), 2500);
        setActiveTab("clients");
      }
    });
  };

  const handleStatusChange = (clientId: number, status: ClientLead["status"]) => {
    setError(null);
    setClientsList(prev => prev.map(c => c.id === clientId ? { ...c, status } : c));
    startTransition(async () => {
      const res = await updateClientStatusAction(clientId, status as any);
      if (res.error) {
        setError(res.error);
        const fresh = await getClientsAction();
        if (fresh.data) { setLeadsList(fresh.data.leads || []); setClientsList(fresh.data.clients || []); }
      } else {
        setSuccessMsg("Status atualizado!");
        setTimeout(() => setSuccessMsg(null), 2000);
      }
    });
  };

  const handleClientAdded = (client: ClientLead) => {
    if (client.status === "Aguardando") {
      setLeadsList((prev) => [client, ...prev]);
    } else {
      setClientsList((prev) => [client, ...prev]);
    }
    setSuccessMsg("Cliente registrado com sucesso!");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // �€�€ Filtering + Sorting + Pagination �€�€
  const processedLeads = useMemo(() => {
    let list = [...leadsList];
    if (leadsSearch.trim()) {
      const q = leadsSearch.toLowerCase();
      list = list.filter(l =>
        l.nome.toLowerCase().includes(q) ||
        l.whatsapp.includes(q) ||
        l.perfil.toLowerCase().includes(q) ||
        l.idades.includes(q)
      );
    }
    if (leadsSort === "nome_asc") list.sort((a, b) => a.nome.localeCompare(b.nome));
    else list.sort((a, b) => b.id - a.id);
    return list;
  }, [leadsList, leadsSearch, leadsSort]);

  const processedClients = useMemo(() => {
    let list = [...clientsList];
    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      list = list.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        c.whatsapp.includes(q) ||
        c.perfil.toLowerCase().includes(q) ||
        c.idades.includes(q) ||
        (c.corretorNome || "").toLowerCase().includes(q)
      );
    }
    if (clientStatusF !== "todos") list = list.filter(c => c.status === clientStatusF);
    if (clientSort === "nome_asc") list.sort((a, b) => a.nome.localeCompare(b.nome));
    else list.sort((a, b) => b.id - a.id);
    return list;
  }, [clientsList, clientSearch, clientStatusF, clientSort]);

  const paginatedLeads = processedLeads.slice((leadsPage - 1) * leadsPageSize, leadsPage * leadsPageSize);
  const paginatedClients = processedClients.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize);

  // �€�€ Loading skeleton �€�€
  if (isPending || isLoading) {
    return (
      <div className="p-6 lg:p-10 space-y-6 bg-[#fafafa] min-h-screen">
        <div className="space-y-2 animate-pulse">
          <div className="h-7 bg-neutral-200 rounded-lg w-56" />
          <div className="h-4 bg-neutral-200 rounded w-80" />
        </div>
        <div className="bg-[#f8f9fa73]/40 border border-slate-200/20 rounded-3xl p-6 overflow-hidden animate-pulse">
          <div className="h-12 bg-neutral-100 border-b border-neutral-200" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-neutral-100 flex items-center px-6 gap-4">
              <div className="size-8 bg-neutral-200 rounded-lg" />
              <div className="flex-1 h-3 bg-neutral-200 rounded" />
              <div className="w-24 h-3 bg-neutral-200 rounded" />
              <div className="w-20 h-6 bg-neutral-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 select-none text-left bg-white">

      {/* �€�€ Header �€�€ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base lg:text-lg font-bold text-neutral-800 tracking-tight">Pipeline Comercial</h2>
          <p className="text-neutral-400 text-[11px] lg:text-xs font-normal">
            Gerencie leads inbound e acompanhe negociações em andamento.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddSheetOpen(true)}
            className="bg-[#3b2dff] hover:bg-[#2d20e0] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar Cliente
          </motion.button>
          {/* KPI strip */}
          {[
            { label: "Leads na Fila", value: leadsList.length, accent: "#3b2dff" },
            { label: "Em Negociação", value: clientsList.filter(c => c.status === "Em Atendimento").length, accent: "#3b90ff" },
            { label: "Propostas", value: clientsList.filter(c => c.status === "Proposta Enviada").length, accent: "#f59e0b" },
            { label: "Concluídas", value: clientsList.filter(c => c.status === "Venda Concluída").length, accent: "#10b981" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[#f8f9fa73]/40 border border-slate-200/20 rounded-xl px-3 py-2 shadow-2xs text-center min-w-[64px]">
              <p className="text-[18px] font-extrabold leading-none" style={{ color: kpi.accent }}>{kpi.value}</p>
              <p className="text-[8px] font-medium text-neutral-400 uppercase tracking-wider mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* �€�€ Notifications �€�€ */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </motion.div>
        )}
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* �€�€ Tabs �€�€ */}
      <div className="flex gap-1 bg-neutral-100/50 p-1 rounded-xl w-fit">
        {(["leads", "clients"] as const).map(tab => {
          const count = tab === "leads" ? leadsList.length : clientsList.length;
          const label = tab === "leads" ? "Fila de Leads" : "Carteira de Clientes";
          const active = activeTab === tab;
          return (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              onClick={() => { setActiveTab(tab); setError(null); }}
              className={`px-4 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 ${active ? "bg-white text-neutral-900 shadow-sm font-semibold" : "text-neutral-500 hover:text-neutral-700 font-normal"
                }`}
            >
              {label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${active
                ? (tab === "leads" ? "bg-[#3b2dff] text-white font-semibold" : "bg-neutral-800 text-white font-semibold")
                : "bg-neutral-200 text-neutral-500 font-normal"
                }`}>
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* �€�€ Table Content �€�€ */}
      <AnimatePresence mode="wait">
        {activeTab === "leads" ? (
          <motion.div key="leads-table" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="bg-[#f8f9fa73]/40 border border-slate-200/20 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.005)] overflow-hidden">

            {/* Table toolbar */}
            <div className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <Input
                  type="text"
                  placeholder="Buscar leads..."
                  value={leadsSearch}
                  onChange={e => { setLeadsSearch(e.target.value); setLeadsPage(1); }}
                  className="w-full pl-8 pr-3 py-1 rounded-xl border border-slate-200/50 bg-white focus:border-[#3b2dff]/30 focus:ring-1 focus:ring-[#3b2dff]/10 text-xs font-normal outline-none transition-all h-8.5 text-neutral-700 placeholder:text-neutral-400"
                />
              </div>
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest shrink-0">Ordenar:</span>
                {[{ val: "id_desc", lbl: "Mais Recente" }, { val: "nome_asc", lbl: "Nome A-Z" }].map(o => (
                  <Button key={o.val} variant={leadsSort === o.val ? 'default' : 'outline'} size="xs" onClick={() => setLeadsSort(o.val as any)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] cursor-pointer transition-all ${leadsSort === o.val ? "bg-[#3b2dff] text-white border-[#3b2dff] font-semibold" : "border-neutral-200 text-neutral-500 hover:border-neutral-300 font-normal"
                      }`}>{o.lbl}</Button>
                ))}
              </div>
              {/* Total */}
              <span className="text-[10px] font-bold text-neutral-400 ml-auto">{processedLeads.length} resultado{processedLeads.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm overflow-x-auto mt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    {["Cliente", "WhatsApp", "Perfil", "Vidas / Idades", "Entrada", "Ações"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[9px] font-medium text-neutral-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="size-12 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-300">
                            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                          </div>
                          <p className="text-xs font-bold text-neutral-500">Nenhum lead encontrado</p>
                          <p className="text-[10px] text-neutral-400">{leadsSearch ? "Tente ajustar os filtros de busca." : "Aguardando chegada de novos leads pelo simulador."}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLeads.map((lead, idx) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-neutral-50 hover:bg-neutral-50/60 transition-colors group"
                      >
                        {/* Nome */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-xl bg-[#3b2dff]/8 border border-[#3b2dff]/10 text-[#3b2dff] font-extrabold text-[10px] flex items-center justify-center shrink-0">
                              {getInitials(lead.nome)}
                            </div>
                            <span className="font-semibold text-neutral-800 text-xs truncate max-w-[160px]">{lead.nome}</span>
                          </div>
                        </td>
                        {/* WhatsApp */}
                        <td className="px-5 py-3.5">
                          <a href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] font-bold text-neutral-600 hover:text-[#3b2dff] flex items-center gap-1 transition-colors">
                            {formatPhone(lead.whatsapp)}
                            <svg className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                          </a>
                        </td>
                        {/* Perfil */}
                        <td className="px-5 py-3.5">
                          <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-lg">{lead.perfil}</span>
                        </td>
                        {/* Idades */}
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] font-bold text-neutral-600">
                            {lead.idades.split(",").length} vida{lead.idades.split(",").length > 1 ? "s" : ""}
                          </span>
                          <span className="text-[9px] text-neutral-400 block">{lead.idades}</span>
                        </td>
                        {/* Status/Entrada */}
                        <td className="px-5 py-3.5">
                          <StatusBadge status={lead.status} />
                        </td>
                        {/* Ações */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleStartAttendance(lead.id)}
                              className="bg-[#3b2dff] hover:bg-[#2d20e0] text-white text-[10px] font-medium uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
                            >
                              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
                              Assumir
                            </motion.button>
                            <a
                              href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-emerald-600 hover:border-emerald-300 transition-all"
                              title="Abrir WhatsApp"
                            >
                              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                            </a>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3">
              <PaginationBar
                total={processedLeads.length}
                page={leadsPage}
                pageSize={leadsPageSize}
                onPage={setLeadsPage}
                onPageSize={setLeadsPageSize}
              />
            </div>
          </motion.div>

        ) : (
          <motion.div key="clients-table" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="bg-[#f8f9fa73]/40 border border-slate-200/20 rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.005)] overflow-hidden">

            {/* Table toolbar */}
            <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <Input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={clientSearch}
                  onChange={e => { setClientSearch(e.target.value); setClientPage(1); }}
                  className="w-full pl-8 pr-3 py-1 rounded-xl border border-slate-200/50 bg-white focus:border-[#3b2dff]/30 focus:ring-1 focus:ring-[#3b2dff]/10 text-xs font-normal outline-none transition-all h-8.5 text-neutral-700 placeholder:text-neutral-400"
                />
              </div>
              {/* Status filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { val: "todos", lbl: "Todos" },
                  { val: "Em Atendimento", lbl: "Negociando" },
                  { val: "Proposta Enviada", lbl: "Proposta" },
                  { val: "Venda Concluída", lbl: "Concluída" },
                ].map(f => (
                  <Button key={f.val} variant={clientStatusF === f.val ? 'default' : 'outline'} size="xs" onClick={() => { setClientStatusF(f.val); setClientPage(1); }}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] cursor-pointer transition-all ${clientStatusF === f.val ? "bg-[#3b2dff] text-white border-[#3b2dff] font-semibold" : "border-neutral-200 text-neutral-500 hover:border-neutral-300 font-normal"
                      }`}>{f.lbl}</Button>
                ))}
              </div>
              {/* Sort */}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Ordem:</span>
                {[{ val: "id_desc", lbl: "Recente" }, { val: "nome_asc", lbl: "A-Z" }].map(o => (
                  <Button key={o.val} variant={clientSort === o.val ? 'default' : 'outline'} size="xs" onClick={() => setClientSort(o.val as any)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] cursor-pointer transition-all ${clientSort === o.val ? "bg-[#3b2dff] text-white border-[#3b2dff] font-semibold" : "border-neutral-200 text-neutral-500 hover:border-neutral-300 font-normal"
                      }`}>{o.lbl}</Button>
                ))}
                <span className="text-[10px] font-medium text-neutral-400 ml-2">{processedClients.length}</span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm overflow-x-auto mt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    {[
                      "Cliente", "Contato", "Perfil", "Vidas", "Status",
                      ...(isUserAdmin ? ["Corretor"] : []),
                      "Ações"
                    ].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[9px] font-medium text-neutral-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedClients.length === 0 ? (
                    <tr>
                      <td colSpan={isUserAdmin ? 7 : 6} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="size-12 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-300">
                            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                          </div>
                          <p className="text-xs font-bold text-neutral-500">Nenhum cliente encontrado</p>
                          <p className="text-[10px] text-neutral-400">{clientSearch || clientStatusF !== "todos" ? "Ajuste os filtros acima." : "Assume leads na aba ao lado para iniciar negociações."}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedClients.map((client, idx) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-neutral-50 hover:bg-neutral-50/60 transition-colors group"
                      >
                        {/* Nome */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`size-8 rounded-xl font-extrabold text-[10px] flex items-center justify-center shrink-0 border ${client.status === "Venda Concluída"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : client.status === "Proposta Enviada"
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-blue-50 border-blue-200 text-blue-700"
                              }`}>
                              {getInitials(client.nome)}
                            </div>
                            <span className="font-semibold text-neutral-800 text-xs truncate max-w-[150px]">{client.nome}</span>
                          </div>
                        </td>
                        {/* WhatsApp */}
                        <td className="px-5 py-3.5">
                          <a href={`https://wa.me/55${client.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] font-bold text-neutral-600 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                            {formatPhone(client.whatsapp)}
                          </a>
                        </td>
                        {/* Perfil */}
                        <td className="px-5 py-3.5">
                          <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-lg">{client.perfil}</span>
                        </td>
                        {/* Vidas */}
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] font-bold text-neutral-700">{client.idades.split(",").length}v</span>
                          <span className="text-[9px] text-neutral-400 block truncate max-w-[80px]">{client.idades}</span>
                        </td>
                        {/* Status inline select */}
                        <td className="px-5 py-3.5">
                          <div className="relative inline-flex items-center">
                            <span className={`size-1.5 rounded-full absolute left-2.5 pointer-events-none ${client.status === "Em Atendimento"
                              ? "bg-blue-500"
                              : client.status === "Proposta Enviada"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                              }`} />
                            <select
                              value={client.status}
                              onChange={e => handleStatusChange(client.id, e.target.value as any)}
                              className={`pl-6 pr-6 py-1 rounded-full border text-[9px] font-medium uppercase tracking-wider appearance-none cursor-pointer outline-none transition-all ${client.status === "Em Atendimento"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : client.status === "Proposta Enviada"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                            >
                              <option value="Em Atendimento">Negociando</option>
                              <option value="Proposta Enviada">Proposta</option>
                              <option value="Venda Concluída">Concluída</option>
                            </select>
                            <svg className="absolute right-2 top-1.5 size-2.5 pointer-events-none text-current opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
                          </div>
                        </td>
                        {/* Corretor (Admin only) */}
                        {isUserAdmin && (
                          <td className="px-5 py-3.5">
                            {client.corretorNome ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-600 text-[9px] font-extrabold">
                                <span className="size-1.5 rounded-full bg-neutral-400" />
                                {client.corretorNome.split(" ")[0]}
                              </span>
                            ) : (
                              <span className="text-[9px] text-neutral-300 font-bold">�”</span>
                            )}
                          </td>
                        )}
                        {/* Ações */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {/* Docs drawer */}
                            <button
                              onClick={() => setDrawerClient(client)}
                              title="Ver checklist de documentação"
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-[#3b2dff] hover:border-[#3b2dff]/30 transition-all cursor-pointer"
                            >
                              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </button>
                            {/* WhatsApp */}
                            <a
                              href={`https://wa.me/55${client.whatsapp.replace(/\D/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              title="Abrir WhatsApp"
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                            >
                              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                            </a>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3">
              <PaginationBar
                total={processedClients.length}
                page={clientPage}
                pageSize={clientPageSize}
                onPage={setClientPage}
                onPageSize={setClientPageSize}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Docs Drawer ── */}
      <AnimatePresence>
        {drawerClient && (
          <DocsDrawer
            client={drawerClient}
            onClose={() => setDrawerClient(null)}
            collectedDocs={collectedDocs}
            toggleDoc={(key) => setCollectedDocs(prev => ({ ...prev, [key]: !prev[key] }))}
          />
        )}
      </AnimatePresence>

      {/* ── Add Client Sheet ── */}
      <AddClientSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        onClientAdded={handleClientAdded}
        sessionUserId={session?.user.id || ""}
      />
    </div>
  );
}

