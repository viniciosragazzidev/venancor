import type { DashboardData, LeadItem, CorretorRow, OperadoraRow } from "@/app/crm/resume/actions";

const demoUltimosLeads: LeadItem[] = [
  { id: 1, nome: "Maria Santos", status: "Em Atendimento", perfil: "Amil Saúde", created_at: new Date(Date.now() - 12 * 60000).toISOString(), corretorNome: "Vinicios Ragazzi" },
  { id: 2, nome: "João Pedro", status: "Proposta Enviada", perfil: "Unimed", created_at: new Date(Date.now() - 35 * 60000).toISOString(), corretorNome: "Andressa Lima" },
  { id: 3, nome: "Ana Oliveira", status: "Aguardando", perfil: "Bradesco Saúde", created_at: new Date(Date.now() - 52 * 60000).toISOString(), corretorNome: null },
  { id: 4, nome: "Carlos Ferreira", status: "Venda Concluída", perfil: "Amep Saúde", created_at: new Date(Date.now() - 90 * 60000).toISOString(), corretorNome: "Vinicios Ragazzi" },
  { id: 5, nome: "Juliana Costa", status: "Em Atendimento", perfil: "Amil Saúde", created_at: new Date(Date.now() - 120 * 60000).toISOString(), corretorNome: "Lucas Pinheiro" },
  { id: 6, nome: "Roberto Almeida", status: "Aguardando", perfil: "SulAmérica", created_at: new Date(Date.now() - 180 * 60000).toISOString(), corretorNome: null },
  { id: 7, nome: "Fernanda Lima", status: "Proposta Enviada", perfil: "Unimed", created_at: new Date(Date.now() - 240 * 60000).toISOString(), corretorNome: "Mariana Costa" },
  { id: 8, nome: "Pedro Martins", status: "Venda Concluída", perfil: "Bradesco Saúde", created_at: new Date(Date.now() - 300 * 60000).toISOString(), corretorNome: "Andressa Lima" },
];

const demoLeadsPorCorretor: CorretorRow[] = [
  { id: "1", nome: "Vinicios Ragazzi", total: 12, emAtendimento: 5, propostas: 3, vendas: 4 },
  { id: "2", nome: "Andressa Lima", total: 8, emAtendimento: 4, propostas: 2, vendas: 2 },
  { id: "3", nome: "Lucas Pinheiro", total: 6, emAtendimento: 3, propostas: 1, vendas: 2 },
  { id: "4", nome: "Mariana Costa", total: 4, emAtendimento: 2, propostas: 2, vendas: 0 },
];

const demoLeadsPorOperadora: OperadoraRow[] = [
  { perfil: "Amil Saúde", total: 18, emAtendimento: 7, vendas: 4 },
  { perfil: "Unimed", total: 14, emAtendimento: 5, vendas: 3 },
  { perfil: "Bradesco Saúde", total: 11, emAtendimento: 3, vendas: 2 },
  { perfil: "Amep Saúde", total: 7, emAtendimento: 2, vendas: 1 },
  { perfil: "SulAmérica", total: 3, emAtendimento: 1, vendas: 0 },
];

export function getDemoDashboardData(): DashboardData {
  return {
    totalLeads: demoUltimosLeads.length,
    aguardando: demoUltimosLeads.filter(l => l.status === "Aguardando").length,
    emAtendimento: demoUltimosLeads.filter(l => l.status === "Em Atendimento").length,
    propostasEnviadas: demoUltimosLeads.filter(l => l.status === "Proposta Enviada").length,
    vendasConcluidas: demoUltimosLeads.filter(l => l.status === "Venda Concluída").length,
    ultimosLeads: demoUltimosLeads,
    leadsPorCorretor: demoLeadsPorCorretor,
    leadsPorOperadora: demoLeadsPorOperadora,
  };
}
