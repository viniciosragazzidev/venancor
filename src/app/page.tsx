import { redirect } from "next/navigation";

// Sem landing: a raiz leva direto ao painel (o proxy manda para /login sem sessão).
export default function Home() {
  redirect("/painel");
}
