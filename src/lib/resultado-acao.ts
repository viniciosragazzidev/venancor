import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { ErroProvedorPagamento, mensagemErroAsaasCliente, mensagemErroAsaasPainel } from "@/providers/payment/erros";

/**
 * Result of a server action called from the client link. In production Next hides the message of
 * an error thrown by a server action (the client saw "Minified React error #441"), so the reason
 * comes back as data.
 */
export type ResultadoAcao<T> = { ok: true; valor: T } | { ok: false; erro: string };

export type OpcoesResultadoAcao = {
  validacao?: "generica" | "campo";
  publico?: "cliente" | "painel";
  rotulo?: string;
  referencia?: string;
};

const camposPt: Record<string, string> = {
  nome: "Nome",
  cpf: "CPF",
  nascimento: "Data de nascimento",
  email: "E-mail",
  whatsapp: "WhatsApp",
  nomeMae: "Nome da mãe",
  rg: "RG",
  estadoCivil: "Estado civil",
  cep: "CEP",
  logradouro: "Logradouro",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  uf: "Estado",
  clienteId: "Cliente",
  clienteIds: "Clientes",
  ordemIds: "Ordens",
  planoId: "Plano",
  dependenteIds: "Dependentes",
  parentesco: "Parentesco",
  contratoModeloId: "Modelo de contrato",
  valorCobradoTipo: "Forma de cobrança",
  valorPersonalizado: "Valor personalizado",
  formasPagamento: "Formas de pagamento",
  maxParcelas: "Máximo de parcelas",
  validadeDias: "Validade do link",
  desconto: "Desconto",
  descontoObs: "Observação do desconto",
  vigenciaInicio: "Início da vigência",
  diaVencimento: "Dia do vencimento",
  exigeAssinatura: "Exigir assinatura do contrato",
  incluirDependentes: "Incluir dependentes",
  nomeModelo: "Nome do modelo",
  operadoraId: "Operadora",
  registroAns: "Registro ANS",
  codigo: "Código",
  segmentacao: "Segmentação",
  acomodacao: "Acomodação",
  abrangencia: "Abrangência",
  tipoContratacao: "Tipo de contratação",
  coparticipacao: "Coparticipação",
  carencias: "Carências",
  coberturas: "Coberturas",
  redeCredenciada: "Rede credenciada",
  ativa: "Situação da operadora",
  ativo: "Situação",
  taxaAdesao: "Taxa de adesão",
  precos: "Preços",
  faixaEtaria: "Faixa etária",
  plano: "Plano",
  corpo: "Texto do contrato",
  imagemBase64: "Assinatura",
  metodo: "Forma de pagamento",
  parcelas: "Parcelas",
};

const ROTULOS_ACAO: Record<string, string> = {
  pagamento: "gerar o pagamento",
  assinatura: "concluir a assinatura",
  otp: "enviar ou confirmar o código de assinatura",
  consentimento: "registrar o aceite da proposta",
  "painel.ordem.criar": "criar a ordem",
  "painel.ordens.criar_lote": "criar as ordens",
  "painel.ordens.excluir_lote": "excluir as ordens",
  "painel.ordem.enviar": "enviar a proposta",
  "painel.ordem.copiar_link": "copiar o link da proposta",
  "painel.ordem.duplicar": "duplicar a ordem",
  "painel.ordem.gerar_link": "gerar um novo link",
  "painel.ordem.cancelar": "cancelar a ordem",
  "painel.cliente.criar": "cadastrar o cliente",
  "painel.cliente.atualizar": "atualizar o cliente",
  "painel.cliente.excluir": "excluir o cliente",
  "painel.cliente.buscar_cep": "consultar o CEP",
  "painel.dependente.criar": "cadastrar o dependente",
  "painel.dependente.atualizar": "atualizar o dependente",
  "painel.dependente.excluir": "excluir o dependente",
  "painel.dependente.listar": "carregar os dependentes",
  "painel.plano.criar": "cadastrar o plano",
  "painel.plano.atualizar": "atualizar o plano",
  "painel.plano.desativar": "desativar o plano",
  "painel.plano.listar_precos": "carregar os preços do plano",
  "painel.plano.salvar_precos": "salvar os preços do plano",
  "painel.operadora.criar": "cadastrar a operadora",
  "painel.operadora.atualizar": "atualizar a operadora",
  "painel.operadora.desativar": "desativar a operadora",
  "painel.operadora.logo": "salvar a logo da operadora",
  "painel.contrato_modelo.criar": "cadastrar o modelo de contrato",
  "painel.contrato_modelo.atualizar": "atualizar o modelo de contrato",
  "painel.contrato_modelo.desativar": "desativar o modelo de contrato",
  "painel.ordem_modelo.criar": "salvar o modelo de ordem",
  "painel.ordem_modelo.atualizar": "atualizar o modelo de ordem",
  "painel.ordem_modelo.desativar": "desativar o modelo de ordem",
  "painel.lembrete.enviar": "enviar o lembrete da proposta",
  "painel.lead.converter_em_ordem": "converter o lead em ordem",
};

function nomeAcao(rotulo?: string) {
  if (!rotulo) return "concluir a solicitação";
  return ROTULOS_ACAO[rotulo] ?? rotulo.replace(/^painel\./, "").replace(/[._]/g, " ");
}

function codigoReferencia() {
  return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").slice(-6).toUpperCase();
}

export function registrarErroInesperado(rotulo: string, erro: unknown): string {
  const referencia = codigoReferencia();
  console.error(`[${rotulo}] erro inesperado ref=${referencia}`, erro);
  return referencia;
}

export function erroEhInesperado(erro: unknown) {
  return !(erro instanceof ErroNegocio) && !(erro instanceof ZodError) && !(erro instanceof ErroProvedorPagamento);
}

function mensagemValidacao(erro: ZodError) {
  const primeira = erro.issues[0];
  if (!primeira) return "Os dados informados estão inválidos. Confira os campos e tente novamente.";
  const chave = [...primeira.path].reverse().find((parte): parte is string => typeof parte === "string");
  const campo = chave
    ? camposPt[chave] ?? chave.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (letra) => letra.toUpperCase())
    : "Dados informados";
  const mensagemTecnicaZod =
    /^Invalid input|^Too small:|^Too big:|^Invalid string|^Invalid option|^Unrecognized key|^Expected /i.test(
      primeira.message,
    );
  const mensagem = !mensagemTecnicaZod
    ? primeira.message
    : primeira.code === "invalid_type"
      ? "Informe um valor válido."
      : primeira.code === "too_small"
        ? "O valor está abaixo do mínimo permitido."
        : primeira.code === "too_big"
          ? "O valor ultrapassa o limite permitido."
          : primeira.code === "invalid_value"
            ? "Selecione uma opção válida."
            : primeira.code === "unrecognized_keys"
              ? "Remova os campos não reconhecidos."
              : primeira.code === "invalid_union"
                ? "Confira os dados informados."
                : "Use um formato válido.";
  return `${campo}: ${mensagem}`;
}

/** An error whose message is written for the client and safe to show on the link page. */
export class ErroNegocio extends Error {
  readonly negocio = true;
}

/**
 * Only messages marked as business errors reach the client. Everything else (database, payment
 * provider, configuration, network, bugs) becomes a generic message and stays in the server log.
 */
export function mensagemParaCliente(erro: unknown, opcoes: OpcoesResultadoAcao = {}): string {
  if (erro instanceof ErroNegocio) return erro.message;
  if (erro instanceof ErroProvedorPagamento) return mensagemErroAsaasCliente(erro);
  if (erro instanceof ZodError) return mensagemValidacao(erro);
  const referencia = opcoes.referencia ?? codigoReferencia();
  return `Erro inesperado ao ${nomeAcao(opcoes.rotulo)} (ref. ${referencia}). Tente novamente.`;
}

export function mensagemParaPainel(erro: unknown, opcoes: OpcoesResultadoAcao = {}): string {
  if (erro instanceof ErroNegocio) return erro.message;
  if (erro instanceof ErroProvedorPagamento) return mensagemErroAsaasPainel(erro);
  if (erro instanceof ZodError) return mensagemValidacao(erro);
  const referencia = opcoes.referencia ?? codigoReferencia();
  return `Erro inesperado ao ${nomeAcao(opcoes.rotulo)} (ref. ${referencia}).`;
}

export async function executarAcao<T>(
  rotulo: string,
  acao: () => Promise<T>,
  opcoes: OpcoesResultadoAcao = {},
): Promise<ResultadoAcao<T>> {
  try {
    return { ok: true, valor: await acao() };
  } catch (erro) {
    // Login redirect and not found (requireAdmin) must keep working.
    unstable_rethrow(erro);
    const inesperado = erroEhInesperado(erro);
    const referencia = inesperado ? registrarErroInesperado(rotulo, erro) : undefined;
    if (erro instanceof ErroProvedorPagamento) {
      console.warn(`[${rotulo}] Asaas recusou a operação`, {
        status: erro.status,
        code: erro.code,
        categoria: erro.categoria,
      });
    }
    const opcoesErro = { ...opcoes, rotulo, ...(referencia ? { referencia } : {}) };
    const mensagem = opcoes.publico === "painel"
      ? mensagemParaPainel(erro, opcoesErro)
      : mensagemParaCliente(erro, opcoesErro);
    return { ok: false, erro: mensagem };
  }
}

/** Server action of the panel: field-named validation messages, never throws (React #441). */
export async function executarAcaoPainel<T>(rotulo: string, acao: () => Promise<T>): Promise<ResultadoAcao<T>> {
  return executarAcao(rotulo, acao, { validacao: "campo", publico: "painel" });
}

/** Client side: turns the result back into a value or a thrown Error with the readable message. */
export function valorOuErro<T>(resultado: ResultadoAcao<T>): T {
  if (!resultado.ok) throw new Error(resultado.erro);
  return resultado.valor;
}
