/** Modelo de mensagem para o admin mandar a proposta pelo próprio WhatsApp (04/11). */

const NOMES_PAGAMENTO: Record<string, string> = { pix: "Pix", boleto: "boleto", cartao: "cartão" };

function listaFormas(formas: readonly string[]) {
  const nomes = formas.map((forma) => NOMES_PAGAMENTO[forma] ?? forma);
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} ou ${nomes.at(-1)}`;
}

export function mensagemPropostaWhatsApp(dados: {
  nomeCliente: string;
  plano: string;
  valor: string;
  formasPagamento: readonly string[];
  link: string;
}) {
  const primeiroNome = dados.nomeCliente.trim().split(/\s+/)[0] ?? "";
  const formas = listaFormas(dados.formasPagamento);
  return [
    `Olá, ${primeiroNome}! Tudo bem?`,
    "",
    `Segue a sua proposta do plano *${dados.plano}* no valor de *${dados.valor}*.`,
    "",
    `Pelo link abaixo você confere o resumo, lê o contrato, assina pelo celular e paga${formas ? ` por ${formas}` : ""}:`,
    dados.link,
    "",
    "Qualquer dúvida, é só responder esta mensagem.",
  ].join("\n");
}

/** Link do WhatsApp com a mensagem pronta para o número do cliente (E.164). */
export function linkWhatsApp(telefoneE164: string, mensagem: string) {
  return `https://wa.me/${telefoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
}
