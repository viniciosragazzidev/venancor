"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  getDevTasksAction,
  createDevTaskAction,
  updateDevTaskStatusAction,
  updateDevTaskAction,
  deleteDevTaskAction,
  DevTask,
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CodeIcon,
  AddCircleIcon,
  Edit01Icon,
  Delete01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  doing: "Fazendo",
  done: "Concluído",
};

const STATUS_STYLES: Record<string, string> = {
  backlog: "bg-neutral-100 text-neutral-600 border-neutral-200",
  doing: "bg-amber-50 text-amber-700 border-amber-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-blue-50 text-blue-600 border-blue-200",
  medium: "bg-neutral-100 text-neutral-600 border-neutral-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  critical: "bg-rose-50 text-rose-600 border-rose-200",
};

export default function DevRoadmapPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DevTask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sortBy, setSortBy] = useState<"created_at" | "priority" | "status">("created_at");

  const filterStatuses = ["backlog", "doing", "done"];

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push("/crm/login");
      return;
    }
    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      setIsLoading(false);
      return;
    }
    fetchTasks();
  }, [session, isPending, router]);

  async function fetchTasks() {
    setIsLoading(true);
    setError(null);
    const res = await getDevTasksAction();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setTasks(res.data);
    }
    setIsLoading(false);
  }

  async function handleCreateTask(data: { title: string; description: string; priority: "low" | "medium" | "high" | "critical" }) {
    setIsSubmitting(true);
    setError(null);
    const res = await createDevTaskAction(data);
    setIsSubmitting(false);
    if (res.error) {
      setError(res.error);
    } else {
      setIsCreateModalOpen(false);
      showSuccess("Tarefa criada com sucesso.");
      const updated = await getDevTasksAction();
      if (updated.data) setTasks(updated.data);
    }
  }

  async function handleStatusChange(taskId: number, newStatus: "backlog" | "doing" | "done") {
    const res = await updateDevTaskStatusAction(taskId, newStatus);
    if (res.error) {
      setError(res.error);
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      showSuccess(`Tarefa movida para "${STATUS_LABELS[newStatus]}".`);
    }
  }

  async function handleEditTask(data: { title: string; description: string; priority: "low" | "medium" | "high" | "critical" }) {
    if (!editingTask) return;
    setIsSubmitting(true);
    setError(null);
    const res = await updateDevTaskAction(editingTask.id, data);
    setIsSubmitting(false);
    if (res.error) {
      setError(res.error);
    } else {
      setIsEditModalOpen(false);
      setEditingTask(null);
      showSuccess("Tarefa atualizada com sucesso.");
      const updated = await getDevTasksAction();
      if (updated.data) setTasks(updated.data);
    }
  }

  async function handleDeleteTask(taskId: number) {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    const res = await deleteDevTaskAction(taskId);
    if (res.error) {
      setError(res.error);
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showSuccess("Tarefa excluída.");
    }
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "priority") {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.priority as keyof typeof order] ?? 2) - (order[b.priority as keyof typeof order] ?? 2);
    }
    if (sortBy === "status") {
      const order = { backlog: 0, doing: 1, done: 2 };
      return (order[a.status as keyof typeof order] ?? 0) - (order[b.status as keyof typeof order] ?? 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const isUserAdmin = session && (session.user as any).role === "ADMIN";

  if (isPending || isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 text-left select-none h-full bg-white">
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-100 rounded-lg" />
            <div className="h-4 w-32 bg-slate-50 rounded-lg" />
          </div>
          <div className="h-9 w-32 bg-slate-100 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (session && !isUserAdmin) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center h-[70vh] bg-white select-none">
        <div className="bg-[#f8f9fa73]/40 border border-slate-200/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-md py-12">
          <div className="size-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-3xs mb-4">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-800 text-base">Acesso Restrito</h3>
          <p className="text-neutral-400 text-xs font-semibold leading-relaxed max-w-xs mt-2">
            Apenas administradores podem visualizar o roadmap de desenvolvimento.
          </p>
          <button
            onClick={() => router.push("/crm/resume")}
            className="mt-6 bg-[#3b2dff] hover:bg-[#2d20e0] text-white font-bold text-[10px] px-5 py-2.5 rounded-xl transition-all cursor-pointer active:scale-[0.97] select-none"
          >
            Voltar para o Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 select-none text-left flex flex-col h-full bg-white">
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

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2">
          <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#3b2dff]/5 border border-[#3b2dff]/10 flex items-center justify-center text-[#3b2dff]">
              <HugeiconsIcon icon={CodeIcon} className="size-4.5" />
            </div>
            <h1 className="text-lg font-bold text-neutral-900 tracking-tight">Dev Roadmap</h1>
          </div>
          <p className="text-[11px] font-semibold text-neutral-400 mt-0.5 ml-11">
            Roadmap e tarefas de desenvolvimento
          </p>
        </div>
        <button
          onClick={() => { setError(null); setIsCreateModalOpen(true); }}
          className="flex items-center gap-1.5 bg-[#3b2dff] hover:bg-[#2d20e0] text-white font-bold text-[10px] px-4 py-2.5 rounded-xl transition-all cursor-pointer active:scale-[0.97] select-none"
        >
          <HugeiconsIcon icon={AddCircleIcon} className="size-3.5" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">Ordenar por:</span>
        {(["created_at", "priority", "status"] as const).map(key => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer select-none ${sortBy === key
              ? 'bg-[#3b2dff]/5 text-[#3b2dff] border-[#3b2dff]/15'
              : 'bg-transparent text-neutral-400 border-transparent hover:text-neutral-600'
              }`}
          >
            {key === "created_at" ? "Data" : key === "priority" ? "Prioridade" : "Status"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filterStatuses.map(statusKey => {
          const statusTasks = sortedTasks.filter(t => t.status === statusKey);
          return (
            <div key={statusKey} className="bg-[#f8f9fa73]/40 border border-slate-200/20 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[statusKey]}`}>
                  {STATUS_LABELS[statusKey]}
                </div>
                <span className="text-[11px] font-semibold text-neutral-400">{statusTasks.length} tarefa(s)</span>
              </div>
              <div className="space-y-2">
                {statusTasks.length === 0 ? (
                  <p className="text-xs text-neutral-400 font-medium py-4 text-center">Nenhuma tarefa nesta etapa.</p>
                ) : (
                  statusTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${PRIORITY_STYLES[task.priority]}`}>
                              {PRIORITY_LABELS[task.priority]}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-medium">
                              {new Date(task.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-neutral-900 leading-snug">{task.title}</h3>
                          {task.description && (
                            <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {task.status !== "done" && (
                            <button
                              onClick={() => handleStatusChange(task.id, task.status === "backlog" ? "doing" : "done")}
                              className="p-1.5 rounded-lg hover:bg-slate-50 text-neutral-400 hover:text-[#3b2dff] transition-colors cursor-pointer"
                              title={task.status === "backlog" ? "Mover para Fazendo" : "Mover para Concluído"}
                            >
                              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => { setEditingTask(task); setIsEditModalOpen(true); }}
                            className="p-1.5 rounded-lg hover:bg-slate-50 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <TaskFormModal
            mode="create"
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateTask}
            isSubmitting={isSubmitting}
          />
        )}
        {isEditModalOpen && editingTask && (
          <TaskFormModal
            mode="edit"
            initialData={{ title: editingTask.title, description: editingTask.description, priority: editingTask.priority }}
            onClose={() => { setIsEditModalOpen(false); setEditingTask(null); }}
            onSubmit={handleEditTask}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskFormModal({
  mode,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  mode: "create" | "edit";
  initialData?: { title: string; description: string; priority: string };
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; priority: "low" | "medium" | "high" | "critical" }) => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">(
    (initialData?.priority as any) || "medium"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), priority });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-neutral-900/30" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white rounded-3xl border border-slate-200 shadow-xl p-6 w-full max-w-lg"
      >
        <h2 className="text-base font-bold text-neutral-900 mb-4">
          {mode === "create" ? "Nova Tarefa" : "Editar Tarefa"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Implementar módulo de relatórios"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#3b2dff]/30 focus:ring-1 focus:ring-[#3b2dff]/10 text-sm font-medium outline-none transition-all placeholder:text-neutral-300"
              required
            />
          </div>
          <div>
            <label className="block text-[9px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva a tarefa em detalhes..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#3b2dff]/30 focus:ring-1 focus:ring-[#3b2dff]/10 text-sm font-medium outline-none transition-all placeholder:text-neutral-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Prioridade
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high", "critical"] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${priority === p
                    ? `${PRIORITY_STYLES[p]} ring-1 ring-offset-1`
                    : 'border-slate-200 text-neutral-400 hover:text-neutral-600'
                    }`}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-neutral-500 hover:text-neutral-700 text-[10px] font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-[#3b2dff] hover:bg-[#2d20e0] disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-[10px] font-bold transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              {isSubmitting ? "Salvando..." : mode === "create" ? "Criar Tarefa" : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
