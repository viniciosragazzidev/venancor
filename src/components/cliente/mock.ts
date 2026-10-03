// Mock visual da página do cliente (F4.2/F5.4/F6.5).
// Tipos espelham o docs/CONTRACTS.md (§1-2) para o Cofre (F4.1) trocar por dados reais.

export type OrdemStatus =
  | "rascunho"
  | "enviada"
  | "visualizada"
  | "assinada"
  | "aguardando_pagamento"
  | "paga"
  | "expirada"
  | "cancelada";

export type MetodoPagamento = "pix" | "boleto" | "cartao";

export type FaixaEtaria =
  "0-18" | "19-23" | "24-28" | "29-33" | "34-38" | "39-43" | "44-48" | "49-53" | "54-58" | "59+";

export type BeneficiarioOrdem = {
  titular: boolean;
  nome: string;
  cpf: string;
  nascimento: string;
  faixa_etaria: FaixaEtaria;
  valor: number;
};

export type PlanoSnapshot = {
  operadora_nome: string;
  plano_nome: string;
  segmentacao: string;
  acomodacao: string;
  abrangencia: string;
  tipo_contratacao: string;
  coparticipacao: boolean;
  carencias: string;
  coberturas: string;
  rede_credenciada: string;
};

export type DadosOrdemCliente = {
  id: string;
  status: OrdemStatus;
  expira_em: string;
  cliente: { nome: string; cpf: string; whatsapp: string };
  plano: PlanoSnapshot;
  beneficiarios: BeneficiarioOrdem[];
  valor_mensal: number;
  valor_adesao: number;
  desconto: number;
  valor_cobrado: number;
  valor_cobrado_tipo: string;
  formas_pagamento: MetodoPagamento[];
  max_parcelas: number;
  contrato_corpo: string;
};

export type CobrancaCliente = {
  metodo: MetodoPagamento;
  valor: number;
  parcelas: number;
  vencimento: string;
  pix_payload?: string;
  pix_qr_base64?: string | null;
  boleto_linha?: string;
  boleto_url?: string;
  checkout_url?: string;
};

export type OtpErro = "expirado" | "invalido" | "bloqueado";

export const mockOrdem: DadosOrdemCliente = {
  id: "ordem-exemplo-001",
  status: "enviada",
  expira_em: "2026-10-10T23:59:59-03:00",
  cliente: {
    nome: "Mariana Souza",
    cpf: "12345678909",
    whatsapp: "+5511987654321",
  },
  plano: {
    operadora_nome: "MedVida Operadora de Saúde",
    plano_nome: "Plano MedVida Nacional Apartamento",
    segmentacao: "ambulatorial_hospitalar",
    acomodacao: "apartamento",
    abrangencia: "nacional",
    tipo_contratacao: "familiar",
    coparticipacao: false,
    carencias:
      "Urgência e emergência: 24 horas. Consultas e exames: 30 dias. Cirurgias e internações: 180 dias.",
    coberturas:
      "Consultas e exames ambulatoriais\nInternações hospitalares em apartamento\nExames de imagem e laboratoriais\nParto e obstetrícia\nProcedimentos de alta complexidade",
    rede_credenciada: "Rede nacional MedVida — consulte em rede.medvida.exemplo.com.br",
  },
  beneficiarios: [
    {
      titular: true,
      nome: "Mariana Souza",
      cpf: "12345678909",
      nascimento: "1990-05-12",
      faixa_etaria: "34-38",
      valor: 98765,
    },
    {
      titular: false,
      nome: "Lucas Souza",
      cpf: "98765432100",
      nascimento: "2021-02-03",
      faixa_etaria: "0-18",
      valor: 45678,
    },
  ],
  valor_mensal: 144443,
  valor_adesao: 15000,
  desconto: 0,
  valor_cobrado: 159443,
  valor_cobrado_tipo: "primeira_mensalidade_adesao",
  formas_pagamento: ["pix", "boleto", "cartao"],
  max_parcelas: 3,
  contrato_corpo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE SAÚDE

Contratada: MedVida Operadora de Saúde S.A., registro ANS nº 000000.
Contratante: Mariana Souza, CPF 123.456.789-09.
Plano: MedVida Nacional Apartamento, contratação familiar.

CLÁUSULA 1 — OBJETO
A Contratada disponibiliza ao Contratante e seus dependentes a cobertura assistencial do plano descrito acima, conforme a Segmentação Assistencial e a Rede Credenciada vigentes.

CLÁUSULA 2 — BENEFICIÁRIOS
Titular: Mariana Souza (34-38), mensalidade R$ 987,65.
Dependente: Lucas Souza (0-18), mensalidade R$ 456,78.

CLÁUSULA 3 — VALORES
Mensalidade total: R$ 1.444,43. Taxa de adesão: R$ 150,00. Total a pagar agora: R$ 1.594,43 (1ª mensalidade + adesão), conforme o contrato nº 000001 firmado em 03/10/2026.

CLÁUSULA 4 — CARÊNCIAS
Urgência e emergência: 24 horas. Consultas e exames: 30 dias. Cirurgias e internações: 180 dias.

CLÁUSULA 5 — VIGÊNCIA
A cobertura tem início após a confirmação do pagamento da 1ª mensalidade e da taxa de adesão.

CLÁUSULA 6 — REGULAMENTO
Este contrato segue a Lei nº 9.656/98 e as normas vigentes da ANS. As Condições Gerais integram este contrato.`,
};

export const mockCobrancaPix: CobrancaCliente = {
  metodo: "pix",
  valor: 159443,
  parcelas: 1,
  vencimento: "2026-10-05",
  pix_payload:
    "00020126580014BR.GOV.BCB.PIX0136exemplo-pix-copia-e-cola-visual-5204000053039865401594.435802BR5921MEDVIDA OPERADORA6009SAO PAULO62070503***6304ABCD",
  pix_qr_base64: null,
};

export const mockCobrancaBoleto: CobrancaCliente = {
  metodo: "boleto",
  valor: 159443,
  parcelas: 1,
  vencimento: "2026-10-05",
  boleto_linha: "34191.09008 12345.678901 23456.789012 3 12340000015944",
  boleto_url: "https://boleto.exemplo.com.br/medlink/ordem-exemplo-001.pdf",
};

export const mockCobrancaCartao: CobrancaCliente = {
  metodo: "cartao",
  valor: 159443,
  parcelas: 1,
  vencimento: "2026-10-05",
  checkout_url: "https://checkout.exemplo.com.br/ordem-exemplo-001",
};
