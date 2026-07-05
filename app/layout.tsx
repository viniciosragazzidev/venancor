import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Venacor Saúde | Planos de Saúde e Odonto em Nova Iguaçu e RJ",
  description: "Cotação rápida de planos de saúde e odontológicos multimarcas. Compare Amil, Bradesco, SulAmérica, Unimed, Assim, Cemeru e Porto Saúde.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" }
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full scroll-smooth"
    >
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
