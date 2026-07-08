import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const amilFont = localFont({
  src: "../public/fonts/Amil Typeface Bold.ttf",
  variable: "--font-logo",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.venacorseguros.com'),
  title: {
    default: 'Venancor Corretora | Planos de Saúde e Odontológicos',
    template: '%s | Venancor Corretora'
  },
  description: 'Compare e contrate os melhores planos de saúde e odontológicos (Amil, SulAmérica, Bradesco, Assim, GNDI, Leve Saúde). Economize até 35% com seu CNPJ ou MEI na Baixada Fluminense. Cotação grátis.',
  keywords: [
    'Planos de saúde',
    'Planos de saúde Nova Iguaçu',
    'Venancor Corretora',
    'Venancor Saúde',
    'Venacor Seguros',
    'Planos de saúde Baixada Fluminense',
    'Tabelas de planos de saúde',
    'Plano de saúde MEI',
    'Plano de saúde empresarial',
    'Amil Saúde',
    'Amep Saúde',
    'SulAmérica Saúde'
  ],
  authors: [{ name: 'Venancor Corretora' }],
  creator: 'Venancor Corretora',
  publisher: 'Venancor Corretora',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.venacorseguros.com',
  },
  openGraph: {
    title: 'Venancor Corretora | Planos de Saúde e Odontológicos',
    description: 'Compare e contrate os melhores planos de saúde com até 35% de desconto via CNPJ/MEI. Consultoria gratuita.',
    url: 'https://www.venacorseguros.com',
    siteName: 'Venancor Corretora',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venancor Corretora | Planos de Saúde e Odontológicos',
    description: 'Compare e contrate os melhores planos de saúde com até 35% de desconto via CNPJ/MEI.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${plusJakartaSans.variable} ${amilFont.variable} ${plusJakartaSans.className}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
