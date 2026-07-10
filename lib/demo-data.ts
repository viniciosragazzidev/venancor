import type { DashboardData, LeadItem, CorretorRow, OperadoraRow } from "@/app/crm/resume/actions";

export interface ChartDataPoint {
  date: string;
  leads: number;
  propostas: number;
  vendas: number;
}

export interface Activity {
  id: string;
  time: string;
  client: string;
  status: 'aguardando' | 'em_atendimento' | 'proposta' | 'concluido';
  broker: string;
  action: string;
}

const demoUltimosLeads: LeadItem[] = [
  { id: 1, nome: "Maria Santos", status: "Em Atendimento", perfil: "Amil Saúde", corretorNome: "Vinicios Ragazzi" },
  { id: 2, nome: "João Pedro", status: "Proposta Enviada", perfil: "Unimed", corretorNome: "Andressa Lima" },
  { id: 3, nome: "Ana Oliveira", status: "Aguardando", perfil: "Bradesco Saúde", corretorNome: null },
  { id: 4, nome: "Carlos Ferreira", status: "Venda Concluída", perfil: "Amep Saúde", corretorNome: "Vinicios Ragazzi" },
  { id: 5, nome: "Juliana Costa", status: "Em Atendimento", perfil: "Amil Saúde", corretorNome: "Lucas Pinheiro" },
  { id: 6, nome: "Roberto Almeida", status: "Aguardando", perfil: "SulAmérica", corretorNome: null },
  { id: 7, nome: "Fernanda Lima", status: "Proposta Enviada", perfil: "Unimed", corretorNome: "Mariana Costa" },
  { id: 8, nome: "Pedro Martins", status: "Venda Concluída", perfil: "Bradesco Saúde", corretorNome: "Andressa Lima" },
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

const demoChartData: ChartDataPoint[] = [
  { date: "Seg", leads: 12, propostas: 4, vendas: 2 },
  { date: "Ter", leads: 18, propostas: 6, vendas: 3 },
  { date: "Qua", leads: 15, propostas: 5, vendas: 4 },
  { date: "Qui", leads: 22, propostas: 8, vendas: 5 },
  { date: "Sex", leads: 28, propostas: 10, vendas: 7 },
  { date: "Sáb", leads: 8, propostas: 3, vendas: 1 },
  { date: "Dom", leads: 5, propostas: 2, vendas: 1 },
];

const demoActivities: Activity[] = [
  { id: "1247", time: "14:32", client: "Maria Santos", status: "em_atendimento", broker: "Vinicios R.", action: "ligacao" },
  { id: "1246", time: "13:15", client: "João Pedro", status: "proposta", broker: "Andressa L.", action: "email" },
  { id: "1245", time: "12:44", client: "Ana Oliveira", status: "aguardando", broker: "—", action: "followup" },
  { id: "1244", time: "11:30", client: "Carlos Ferreira", status: "concluido", broker: "Vinicios R.", action: "reuniao" },
  { id: "1243", time: "10:15", client: "Juliana Costa", status: "em_atendimento", broker: "Lucas P.", action: "ligacao" },
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

export function getDemoChartData(): ChartDataPoint[] {
  return demoChartData;
}

export function getDemoActivities(): Activity[] {
  return demoActivities;
}
