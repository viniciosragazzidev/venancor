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

const BASE_URL = 'https://www.venancorseguros.com';

export const metadata: Metadata = {
  title: 'Planos de Saúde | Venancor Corretora Nova Iguaçu e Baixada Fluminense',
  description: 'Contrate seu Plano de Saúde com desconto de até 35% via CNPJ/MEI. Tabelas completas Amil, Assim, SulAmérica, Unimed e Leve Saúde. Simulação grátis.',
  alternates: {
    canonical: BASE_URL,
  },
};

// --- JSON-LD Schemas ---

const schemaWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Venancor Corretora de Seguros',
  alternateName: ['Venancor Saúde', 'Venacor Seguros'],
  url: BASE_URL,
  description: 'Corretora autorizada de planos de saúde e odontológicos na Baixada Fluminense. Compare Amil, SulAmérica, Assim, Leve Saúde e Amep com consultoria gratuita.',
  inLanguage: 'pt-BR',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const schemaOrganization = {
  '@context': 'https://schema.org',
  '@type': ['InsuranceAgency', 'LocalBusiness'],
  '@id': `${BASE_URL}/#organization`,
  name: 'Venancor Corretora de Seguros',
  alternateName: ['Venancor Saúde', 'Venacor Seguros'],
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo.svg`,
    width: 200,
    height: 60,
  },
  image: `${BASE_URL}/bg_hero.jpg`,
  description: 'Corretora de planos de saúde e odontológicos em Nova Iguaçu e Baixada Fluminense. Tabelas Amil, Assim, SulAmérica e Leve Saúde com descontos para PME e MEI. Consultoria gratuita e contratação 100% digital.',
  foundingDate: '2015',
  areaServed: [
    { '@type': 'City', name: 'Nova Iguaçu', sameAs: 'https://www.wikidata.org/wiki/Q194197' },
    { '@type': 'City', name: 'Duque de Caxias', sameAs: 'https://www.wikidata.org/wiki/Q194048' },
    { '@type': 'City', name: 'São João de Meriti', sameAs: 'https://www.wikidata.org/wiki/Q194143' },
    { '@type': 'City', name: 'Belford Roxo' },
    { '@type': 'City', name: 'Mesquita' },
    { '@type': 'City', name: 'Nilópolis' },
    { '@type': 'AdministrativeArea', name: 'Baixada Fluminense' },
    { '@type': 'AdministrativeArea', name: 'Rio de Janeiro' },
  ],
  sameAs: [
    'https://www.facebook.com/venancorseguros',
    'https://www.instagram.com/venancorseguros',
    'https://www.linkedin.com/company/venancorseguros',
    'https://api.whatsapp.com/send?phone=5521964469750',
    'https://maps.google.com/?q=Venancor+Corretora+Nova+Iguaçu',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+55-21-96446-9750',
      contactType: 'customer service',
      contactOption: 'TollFree',
      areaServed: 'BR',
      availableLanguage: 'Portuguese',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    },
    {
      '@type': 'ContactPoint',
      email: 'contato@venancorseguros.com',
      contactType: 'sales',
      areaServed: 'BR',
      availableLanguage: 'Portuguese',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Athaide Pimenta de Morais, 381 - Centro',
    addressLocality: 'Nova Iguaçu',
    addressRegion: 'RJ',
    postalCode: '26210-190',
    addressCountry: 'BR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -22.7562,
    longitude: -43.4608,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '08:00',
      closes: '18:00',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Planos de Saúde e Odontológicos',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Plano de Saúde Amil' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Plano de Saúde SulAmérica' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Plano de Saúde Assim Saúde' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Plano de Saúde Leve Saúde' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Plano de Saúde Amep Saúde' } },
    ],
  },
  priceRange: '$$',
};

const schemaFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Eu tenho apenas um MEI ou CNPJ pequeno. Consigo contratar plano de saúde com desconto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Com certeza. Para garantir o menor preço através da tabela empresarial com descontos de até 35%, basta possuir um CNPJ ou MEI ativo. Na modalidade MEI (de 2 a 29 vidas), o titular entra obrigatoriamente no contrato, mas os demais dependentes não precisam ter vínculo empregatício — você pode incluir parentes, colaboradores ou qualquer outra pessoa de sua escolha. Esta é a forma mais inteligente de pagar menos pelo mesmo atendimento.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como funciona o processo de contratação de plano de saúde? Preciso ir até uma agência física?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Não há necessidade. Todo o processo de análise de documentos, preenchimento de propostas e assinatura do contrato é feito de forma 100% digital e segura. No entanto, como a Venancor é uma corretora consolidada com sede física estruturada no Centro de Nova Iguaçu, você tem a segurança extra de contar com suporte humano e presencial sempre que precisar no pós-venda.',
      },
    },
    {
      '@type': 'Question',
      name: 'O plano de saúde cobre consultas e tratamentos fora da Baixada Fluminense?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Isso depende estritamente do modelo e da abrangência que você escolher. Nós trabalhamos tanto com planos de abrangência regional (focados no atendimento de excelência na Baixada Fluminense e Grande Rio) quanto com planos de abrangência nacional premium. Nossa consultoria isenta avalia a rotina da sua família ou da sua equipe para indicar o modelo com o melhor custo-benefício.',
      },
    },
    {
      '@type': 'Question',
      name: 'Já tenho outro plano de saúde. Consigo migrar aproveitando minhas carências?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, é perfeitamente possível através do processo de compra ou redução de carência. Nós analisamos detalhadamente o tempo que você permaneceu no seu plano de saúde anterior — exigindo-se a permanência a partir de 6 meses no convênio anterior para determinadas operadoras — e a categoria dele para reduzir ou zerar os prazos de espera regulamentares na sua nova escolha.',
      },
    },
    {
      '@type': 'Question',
      name: 'O que está incluso em um plano de saúde ambulatorial e quais são as carências?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O plano ambulatorial garante o direito completo a consultas nas especialidades médicas, exames complementares e atendimentos de urgência e emergência com repouso de até 12 horas em enfermaria, funcionando inteiramente sem franquia e sem coparticipação. Prazos regulamentares de carência incluem 24 horas para urgência/emergência, 30 dias para consultas e exames simples, e 180 dias para exames de alta complexidade.',
      },
    },
  ],
};

const schemaBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Início',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Planos de Saúde',
      item: `${BASE_URL}/#planos`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Simulador',
      item: `${BASE_URL}/#simulador`,
    },
  ],
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

        {/* JSON-LD Schemas — Indexação para Google, ChatGPT, Claude, Perplexity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
        />
      </div>
    </main>
  );
}



