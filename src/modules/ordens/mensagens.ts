export type TipoIndisponibilidadeProposta = "invalido" | "expirada" | "cancelada" | "ativa" | "paga";

export function mensagemPropostaIndisponivel(
  tipo: TipoIndisponibilidadeProposta,
  contexto: "pagamento" | "aceite" | "assinatura",
) {
  if (tipo === "invalido")
    return "Este link não é válido. Confira se ele foi copiado por inteiro ou fale com seu corretor.";
  if (tipo === "expirada") return "Este link venceu. Peça ao seu corretor um link novo.";
  if (tipo === "cancelada") return "Esta proposta foi cancelada. Fale com seu corretor para receber orientação.";
  if (tipo === "paga") return "Esta proposta já foi paga. Não é necessário fazer outro pagamento.";
  if (contexto === "assinatura") return "Esta proposta não está disponível para assinatura. Confira o estado da proposta.";
  if (contexto === "aceite") return "Esta proposta não está mais disponível para aceite.";
  return "Esta proposta não está disponível para pagamento. Confira o estado da proposta.";
}
