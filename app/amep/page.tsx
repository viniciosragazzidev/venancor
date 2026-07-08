import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import SectionHero from '@/components/amep/section-hero';
import SectionDiferenciais from '@/components/amep/section-diferenciais';
import SectionVideo from '@/components/amep/section-video';
import SectionExpansao from '@/components/amep/section-expansao';
import SectionRede from '@/components/amep/section-rede';
import SectionPrecos from '@/components/amep/section-precos';
import SectionDepoimentos from '@/components/amep/section-depoimentos';
import SectionCta from '@/components/amep/section-cta';
import SectionSimulador from '@/components/amep/section-simulador';
import SectionCoberturas from '@/components/amep/section-coberturas';

export const metadata: Metadata = {
  title: 'Plano Amep Saúde — Venancor Corretora | Tabelas Ambulatoriais a partir de R$ 82,94',
  description: 'Consulte a tabela oficial de preços, carências e hospitais credenciados do plano Amep Saúde. Simulação rápida e consultoria isenta na Baixada Fluminense.',
  alternates: {
    canonical: 'https://www.venacorseguros.com/amep',
  },
};

export default function AmepPage() {
  return (
    <main className="flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-24 w-full overflow-hidden">
      <div className="container h-full min-h-screen">
        <Navbar />
        <SectionHero />
        <SectionDiferenciais />
        <SectionVideo />
        <SectionExpansao />
        <SectionRede />
        <SectionPrecos />
        <SectionDepoimentos />
        <SectionCta variant="middle" />
        <SectionSimulador />
        <SectionCoberturas />
        <SectionCta variant="bottom" />
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "Plano Amep Saúde",
                "image": "https://www.venacorseguros.com/amep_saude_logo.png",
                "description": "Plano de saúde ambulatorial completo com consultas, exames e carência reduzida na Baixada Fluminense e Região dos Lagos.",
                "brand": {
                  "@type": "Brand",
                  "name": "Amep Saúde"
                },
                "offers": {
                  "@type": "AggregateOffer",
                  "priceCurrency": "BRL",
                  "lowPrice": "82.94",
                  "highPrice": "493.45",
                  "offerCount": "10",
                  "seller": {
                    "@type": "InsuranceAgency",
                    "name": "Venancor Corretora"
                  }
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Como funciona a carência de Urgência e Emergência?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Cobertura completa para atendimentos imediatos pós-acidentes ou mal súbitos com até 12 horas de observação em enfermaria, disponível após 24 horas da contratação."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Qual o prazo de carência para consultas no plano Amep Saúde?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Acesso a consultas médicas em clínicas e consultórios credenciados em até 30 dias (sujeito a Carência Zero na rede própria em campanhas promocionais)."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Como funcionam exames complexos e alta complexidade?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Exames simples têm prazo de 30 dias. Exames complexos levam de 120 a 180 dias. Procedimentos de alta complexidade como ressonâncias têm carência de 180 dias."
                    }
                  }
                ]
              }
            ])
          }}
        />
      </div>
    </main>
  );
}
