import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoModeProvider } from "@/lib/demo-mode";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const amilFont = localFont({
  src: "../public/fonts/Amil Typeface Bold.ttf",
  variable: "--font-logo",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.venancorseguros.com'),
  title: {
    default: 'Venancor Corretora | Planos de Saúde e Odontológicos',
    template: '%s | Venancor Corretora'
  },
  description: 'Compare e contrate os melhores planos de saúde e odontológicos (Amil, SulAmérica, Bradesco, Assim, GNDI, Leve Saúde). Economize até 35% com seu CNPJ ou MEI na Baixada Fluminense. Cotação grátis.',
  keywords: [
    'Planos de saúde',
    'Planos de saúde Nova Iguaçu',
    'Planos de saúde Baixada Fluminense',
    'Venancor Corretora',
    'Venancor Saúde',
    'Venacor Seguros',
    'Plano de saúde MEI',
    'Plano de saúde empresarial',
    'Plano de saúde CNPJ',
    'Tabelas de planos de saúde',
    'Amil Saúde Nova Iguaçu',
    'Amep Saúde',
    'SulAmérica Saúde',
    'Assim Saúde',
    'Leve Saúde',
    'Corretora de seguros Nova Iguaçu',
    'Plano de saúde Duque de Caxias',
    'Portabilidade de carência plano de saúde',
  ],
  authors: [{ name: 'Venancor Corretora', url: 'https://www.venancorseguros.com' }],
  creator: 'Venancor Corretora',
  publisher: 'Venancor Corretora',
  applicationName: 'Venancor Corretora',
  category: 'insurance',
  classification: 'Health Insurance Broker',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.venancorseguros.com',
    languages: {
      'pt-BR': 'https://www.venancorseguros.com',
    },
  },
  openGraph: {
    title: 'Venancor Corretora | Planos de Saúde e Odontológicos',
    description: 'Compare e contrate os melhores planos de saúde com até 35% de desconto via CNPJ/MEI. Consultoria gratuita na Baixada Fluminense.',
    url: 'https://www.venancorseguros.com',
    siteName: 'Venancor Corretora',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Venancor Corretora — Planos de Saúde na Baixada Fluminense',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venancor Corretora | Planos de Saúde e Odontológicos',
    description: 'Compare e contrate os melhores planos de saúde com até 35% de desconto via CNPJ/MEI.',
    images: ['/opengraph-image'],
  },
  other: {
    // Geo meta tags — indexação local (Google Maps, buscas locais, Bing Places)
    'geo.region': 'BR-RJ',
    'geo.placename': 'Nova Iguaçu, Rio de Janeiro, Brasil',
    'geo.position': '-22.7562;-43.4608',
    'ICBM': '-22.7562, -43.4608',
    // Idioma do conteúdo
    'content-language': 'pt-BR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${plusJakartaSans.variable} ${amilFont.variable} ${plusJakartaSans.className}`}>
      <body className="antialiased">
        <TooltipProvider>
          <DemoModeProvider>
            {children}
          </DemoModeProvider>
          <Toaster closeButton position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
