import type { Metadata } from "next";

import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: { absolute: "Venancor" },
};

// Placeholder até a fase V3 portar a landing (VENANCOR-MIGRATION.md).
export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-muted/40 p-6 text-center">
      <Logo className="h-12 w-auto" />
      <p className="text-sm text-pretty text-muted-foreground">
        A landing da Venancor será publicada aqui em breve.
      </p>
    </main>
  );
}
