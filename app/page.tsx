import SectionCotacao from '@/components/lp/section-cotacao';
import SectionHero from '@/components/lp/section-hero';
import SectionPlanos from '@/components/lp/section-planos';
import SectionDiferenciais from '@/components/lp/section-diferenciais';
import SectionSimulador from '@/components/lp/section-simulador';
import SectionFaq from '@/components/lp/section-faq';
import SectionCta from '@/components/lp/section-cta';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos de Saúde | Venancor Corretora Nova Iguaçu e Baixada Fluminense',
  description: 'Contrate seu Plano de Saúde com desconto de até 35% via CNPJ/MEI. Tabelas completas Amil, Assim, SulAmérica, Unimed e Leve Saúde. Simulação grátis.',
  alternates: {
    canonical: 'https://www.venacorseguros.com',
  },
};

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-24 w-full overflow-hidden">
      <div className="container h-full min-h-screen">
        <Navbar />
        <SectionHero />
        <SectionCotacao />
        <SectionPlanos />
        <SectionCta variant="middle" />
        <SectionDiferenciais />
        <SectionSimulador />
        <SectionFaq />
        <SectionCta variant="bottom" />
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "InsuranceAgency",
              "name": "Venancor Corretora de Seguros",
              "alternateName": ["Venacor Seguros", "Venancor Saúde"],
              "url": "https://www.venacorseguros.com",
              "logo": "https://www.venacorseguros.com/logo.svg",
              "description": "Corretora de planos de saúde e odontológicos em Nova Iguaçu e Baixada Fluminense. Tabelas Amil, Assim, SulAmérica e Leve Saúde com descontos para PME e MEI.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+55-21-96446-9750",
                "email": "contato@venacorseguros.com",
                "contactType": "sales",
                "areaServed": "BR",
                "availableLanguage": "Portuguese"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rua Athaide Pimenta de Morais, 381 - Centro",
                "addressLocality": "Nova Iguaçu",
                "addressRegion": "RJ",
                "postalCode": "26210-190",
                "addressCountry": "BR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -22.7562,
                "longitude": -43.4608
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "09:00",
                  "closes": "18:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Saturday"],
                  "opens": "08:00",
                  "closes": "18:00"
                }
              ]
            })
          }}
        />
      </div>
    </main>
  );
}
