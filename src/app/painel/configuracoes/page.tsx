import { headers } from "next/headers";

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

import { TrocarSenhaForm } from "./trocar-senha-form";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configurações" description="Sua conta de acesso ao painel." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>
            {session?.user.name} · {session?.user.email}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Trocar senha</CardTitle>
          <CardDescription>
            Use pelo menos 12 caracteres. Ao trocar, os outros aparelhos conectados saem da conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrocarSenhaForm />
        </CardContent>
      </Card>
    </div>
  );
}
