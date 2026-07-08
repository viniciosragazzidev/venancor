import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Venacor Seguros | Gestão e Vendas",
  description: "Painel interno do CRM da Venacor Corretora de Seguros. Gestão de leads, clientes e cotações.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" }
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function CrmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full scroll-smooth"
    >
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-full bg-slate-50 flex flex-col antialiased`}>
        <div className="flex-1 flex flex-col">
          {/* A simple CRM bar/navigation can go here, distinct from site principal */}
          <header className="w-full bg-slate-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
            <span className="font-extrabold tracking-tight text-lg">VENACOR <span className="text-primary">CRM</span></span>
            <span className="text-xs text-slate-400 font-mono">Painel de Controle</span>
          </header>
          <main className="flex-1 p-6 md:p-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
