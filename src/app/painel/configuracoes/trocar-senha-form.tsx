"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Campo, inputPill } from "@/components/admin/campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export const SENHA_MINIMA = 12;

/** Checks the form before calling the server; returns the message to show, or null when valid. */
export function validarTrocaSenha(input: { atual: string; nova: string; confirmacao: string }) {
  if (!input.atual) return "Informe a senha atual.";
  if (input.nova.length < SENHA_MINIMA) return `A nova senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (input.nova === input.atual) return "A nova senha precisa ser diferente da atual.";
  if (input.nova !== input.confirmacao) return "A confirmação não é igual à nova senha.";
  return null;
}

export function TrocarSenhaForm() {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problema = validarTrocaSenha({ atual, nova, confirmacao });
    setErro(problema);
    if (problema) return;
    setSalvando(true);
    const { error } = await authClient.changePassword({
      currentPassword: atual,
      newPassword: nova,
      revokeOtherSessions: true,
    });
    setSalvando(false);
    if (error) {
      setErro(
        error.code === "INVALID_PASSWORD"
          ? "A senha atual está incorreta."
          : error.code === "PASSWORD_TOO_SHORT" || error.code === "PASSWORD_TOO_LONG"
            ? `A nova senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`
            : "Não foi possível trocar a senha. Tente de novo.",
      );
      return;
    }
    setAtual("");
    setNova("");
    setConfirmacao("");
    toast.success("Senha trocada.");
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <Campo label="Senha atual" htmlFor="senha-atual">
        <Input id="senha-atual" type="password" autoComplete="current-password" className={inputPill} value={atual} onChange={(e) => setAtual(e.target.value)} />
      </Campo>
      <Campo label="Nova senha" htmlFor="senha-nova" hint={`Pelo menos ${SENHA_MINIMA} caracteres.`}>
        <Input id="senha-nova" type="password" autoComplete="new-password" className={inputPill} value={nova} onChange={(e) => setNova(e.target.value)} />
      </Campo>
      <Campo label="Confirmar nova senha" htmlFor="senha-confirmacao" error={erro}>
        <Input id="senha-confirmacao" type="password" autoComplete="new-password" className={inputPill} value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
      </Campo>
      <Button type="submit" size="lg" className="self-start rounded-full px-6" disabled={salvando}>
        {salvando ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}
