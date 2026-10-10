import SectionCotacao from "@/components/site/lp/section-cotacao";
import SectionHero from "@/components/site/lp/section-hero";
import SectionPlanos from "@/components/site/lp/section-planos";
import SectionDiferenciais from "@/components/site/lp/section-diferenciais";
import SectionSimulador from "@/components/site/lp/section-simulador";
import SectionFaq from "@/components/site/lp/section-faq";
import SectionCta from "@/components/site/lp/section-cta";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import React from "react";
import type { Metadata } from "next";

const BASE_URL = "https://www.venancorseguros.com";

export const metadata: Metadata = {
  title: "Planos de Saúde em Nova Iguaçu e Baixada Fluminense | Venancor Corretora",
  description:
    "Venancor Corretora de Seguros: planos de saúde Amil, SulAmérica, Assim, Leve Saúde e Amep com até 35% de desconto via CNPJ/MEI em Nova Iguaçu, Duque de Caxias, São João de Meriti, Belford Roxo, Mesquita, Nilópolis e toda a Baixada Fluminense. Cotação grátis.",
  alternates: {
    canonical: BASE_URL,
  },
};

// --- JSON-LD Schemas ---

const schemaWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Venancor Corretora de Seguros",
  alternateName: ["Venancor Saúde", "Venacor Seguros"],
  url: BASE_URL,
  description:
    "Corretora autorizada de planos de saúde e odontológicos na Baixada Fluminense. Compare Amil, SulAmérica, Assim, Leve Saúde e Amep. Oferecemos os melhores valores e custo-benefício com consultoria gratuita.",
  inLanguage: "pt-BR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const schemaOrganization = {
  "@context": "https://schema.org",
  "@type": ["InsuranceAgency", "LocalBusiness"],
  "@id": `${BASE_URL}/#organization`,
  name: "Venancor Corretora de Seguros",
  alternateName: ["Venancor Saúde", "Venacor Seguros"],
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/logo.svg`,
    width: 200,
    height: 60,
  },
  image: `${BASE_URL}/bg_hero.jpg`,
  description:
    "Corretora de planos de saúde e odontológicos em Nova Iguaçu e Baixada Fluminense. Encontre os melhores valores em tabelas Amil, Assim, SulAmérica e Leve Saúde. Consultoria gratuita e contratação 100% digital.",
  foundingDate: "2015",
  areaServed: [
    // Baixada Fluminense — cidades principais
    { "@type": "City", name: "Nova Iguaçu", sameAs: "https://www.wikidata.org/wiki/Q194197" },
    { "@type": "City", name: "Duque de Caxias", sameAs: "https://www.wikidata.org/wiki/Q194048" },
    {
      "@type": "City",
      name: "São João de Meriti",
      sameAs: "https://www.wikidata.org/wiki/Q194143",
    },
    { "@type": "City", name: "Belford Roxo", sameAs: "https://www.wikidata.org/wiki/Q194218" },
    { "@type": "City", name: "Mesquita", sameAs: "https://www.wikidata.org/wiki/Q384360" },
    { "@type": "City", name: "Nilópolis", sameAs: "https://www.wikidata.org/wiki/Q194106" },
    { "@type": "City", name: "Queimados", sameAs: "https://www.wikidata.org/wiki/Q1684887" },
    { "@type": "City", name: "Japeri", sameAs: "https://www.wikidata.org/wiki/Q1684768" },
    { "@type": "City", name: "Seropédica", sameAs: "https://www.wikidata.org/wiki/Q1330598" },
    { "@type": "City", name: "Paracambi" },
    { "@type": "City", name: "Magé", sameAs: "https://www.wikidata.org/wiki/Q194266" },
    { "@type": "City", name: "Guapimirim" },
    { "@type": "City", name: "Itaguaí", sameAs: "https://www.wikidata.org/wiki/Q194285" },
    // Grande Rio
    { "@type": "City", name: "Rio de Janeiro", sameAs: "https://www.wikidata.org/wiki/Q8678" },
    { "@type": "City", name: "Niterói", sameAs: "https://www.wikidata.org/wiki/Q193977" },
    { "@type": "City", name: "São Gonçalo", sameAs: "https://www.wikidata.org/wiki/Q194170" },
    { "@type": "City", name: "Petrópolis", sameAs: "https://www.wikidata.org/wiki/Q193979" },
    { "@type": "City", name: "Volta Redonda", sameAs: "https://www.wikidata.org/wiki/Q193987" },
    // Região dos Lagos
    { "@type": "City", name: "Cabo Frio", sameAs: "https://www.wikidata.org/wiki/Q194306" },
    { "@type": "City", name: "Angra dos Reis", sameAs: "https://www.wikidata.org/wiki/Q194298" },
    // Regiões administrativas
    {
      "@type": "AdministrativeArea",
      name: "Baixada Fluminense",
      sameAs: "https://www.wikidata.org/wiki/Q1137979",
    },
    { "@type": "AdministrativeArea", name: "Grande Rio de Janeiro" },
    {
      "@type": "AdministrativeArea",
      name: "Estado do Rio de Janeiro",
      sameAs: "https://www.wikidata.org/wiki/Q43235",
    },
  ],
  sameAs: [
    "https://www.facebook.com/venancorseguros",
    "https://www.instagram.com/venancorseguros",
    "https://www.linkedin.com/company/venancorseguros",
    "https://api.whatsapp.com/send?phone=5521964469750",
    "https://maps.google.com/?q=Venancor+Corretora+Nova+Iguaçu",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+55-21-96446-9750",
      contactType: "customer service",
      contactOption: "TollFree",
      areaServed: "BR",
      availableLanguage: "Portuguese",
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    },
    {
      "@type": "ContactPoint",
      email: "contato@venancorseguros.com",
      contactType: "sales",
      areaServed: "BR",
      availableLanguage: "Portuguese",
    },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Athaide Pimenta de Morais, 381 - Centro",
    addressLocality: "Nova Iguaçu",
    addressRegion: "RJ",
    postalCode: "26210-190",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -22.7562,
    longitude: -43.4608,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Planos de Saúde e Odontológicos",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plano de Saúde Amil" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plano de Saúde SulAmérica" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plano de Saúde Assim Saúde" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plano de Saúde Amep Saúde" } },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Plano Odontológico Amil Dental" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Plano Odontológico SulAmérica" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Plano Odontológico Bradesco Dental" },
      },
    ],
  },
  priceRange: "$$",
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Eu tenho apenas um MEI ou CNPJ pequeno. Consigo contratar plano de saúde com desconto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Com certeza. Para garantir o menor preço através da tabela empresarial com descontos de até 35%, basta possuir um CNPJ ou MEI ativo. Na modalidade MEI (de 2 a 29 vidas), o titular entra obrigatoriamente no contrato, mas os demais dependentes não precisam ter vínculo empregatício — você pode incluir parentes, colaboradores ou qualquer outra pessoa de sua escolha. Esta é a forma mais inteligente de pagar menos pelo mesmo atendimento.",
      },
    },
    {
      "@type": "Question",
      name: "Como funciona o processo de contratação de plano de saúde? Preciso ir até uma agência física?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não há necessidade. Todo o processo de análise de documentos, preenchimento de propostas e assinatura do contrato é feito de forma 100% digital e segura. No entanto, como a Venancor é uma corretora consolidada com sede física estruturada no Centro de Nova Iguaçu, você tem a segurança extra de contar com suporte humano e presencial sempre que precisar no pós-venda.",
      },
    },
    {
      "@type": "Question",
      name: "O plano de saúde cobre consultas e tratamentos fora da Baixada Fluminense?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Isso depende estritamente do modelo e da abrangência que você escolher. Nós trabalhamos tanto com planos de abrangência regional (focados no atendimento de excelência na Baixada Fluminense e Grande Rio) quanto com planos de abrangência nacional premium. Nossa consultoria isenta avalia a rotina da sua família ou da sua equipe para indicar o modelo com o melhor custo-benefício.",
      },
    },
    {
      "@type": "Question",
      name: "Já tenho outro plano de saúde. Consigo migrar aproveitando minhas carências?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim, é perfeitamente possível através do processo de compra ou redução de carência. Nós analisamos detalhadamente o tempo que você permaneceu no seu plano de saúde anterior — exigindo-se a permanência a partir de 6 meses no convênio anterior para determinadas operadoras — e a categoria dele para reduzir ou zerar os prazos de espera regulamentares na sua nova escolha.",
      },
    },
    {
      "@type": "Question",
      name: "O que está incluso em um plano de saúde ambulatorial e quais são as carências?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O plano ambulatorial garante o direito completo a consultas nas especialidades médicas, exames complementares e atendimentos de urgência e emergência com repouso de até 12 horas em enfermaria, funcionando inteiramente sem franquia e sem coparticipação. Prazos regulamentares de carência incluem 24 horas para urgência/emergência, 30 dias para consultas e exames simples, e 180 dias para exames de alta complexidade.",
      },
    },
  ],
};

const schemaBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Início",
      item: BASE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Planos de Saúde",
      item: `${BASE_URL}/#planos`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Simulador",
      item: `${BASE_URL}/#simulador`,
    },
  ],
};

// Schema: Área de Atendimento (ServiceArea)
const schemaServiceArea = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${BASE_URL}/#service-main`,
  name: "Corretagem de Planos de Saúde e Odontológicos",
  description:
    "Consultoria gratuita para contratação de planos de saúde individuais, familiares, empresariais e PME nas principais operadoras do Brasil, entregando os melhores valores do mercado. Atendemos Nova Iguaçu, Duque de Caxias, São João de Meriti, Belford Roxo e Baixada Fluminense.",
  provider: { "@id": `${BASE_URL}/#organization` },
  serviceType: [
    "Plano de Saúde Individual",
    "Plano de Saúde Familiar",
    "Plano de Saúde Empresarial",
    "Plano de Saúde MEI",
    "Plano Odontológico",
    "Plano Coletivo PME",
    "Plano Dental Empresarial",
  ],
  areaServed: [
    { "@type": "City", name: "Nova Iguaçu" },
    { "@type": "City", name: "Duque de Caxias" },
    { "@type": "City", name: "São João de Meriti" },
    { "@type": "City", name: "Belford Roxo" },
    { "@type": "City", name: "Mesquita" },
    { "@type": "City", name: "Nilópolis" },
    { "@type": "City", name: "Queimados" },
    { "@type": "City", name: "Japeri" },
    { "@type": "City", name: "Seropédica" },
    { "@type": "City", name: "Paracambi" },
    { "@type": "City", name: "Magé" },
    { "@type": "City", name: "Guapimirim" },
    { "@type": "City", name: "Itaguaí" },
    { "@type": "City", name: "Rio de Janeiro" },
    { "@type": "City", name: "Niterói" },
    { "@type": "City", name: "São Gonçalo" },
    { "@type": "City", name: "Petrópolis" },
    { "@type": "City", name: "Cabo Frio" },
    { "@type": "City", name: "Angra dos Reis" },
    { "@type": "AdministrativeArea", name: "Baixada Fluminense" },
    { "@type": "AdministrativeArea", name: "Estado do Rio de Janeiro" },
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
    description:
      "Consultoria e assessoria para contratação de planos de saúde e odontológicos completamente gratuita.",
  },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: BASE_URL,
    servicePhone: "+55-21-96446-9750",
    availableLanguage: "Portuguese",
  },
};

// Schemas: Serviço por Operadora
const schemaServicos = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Plano de Saúde Amil — Venancor Corretora",
    description:
      "Tabelas e planos Amil Saúde para pessoa física, familiar e empresarial (CNPJ/MEI) na Baixada Fluminense. Descontos de até 35% na tabela PME. Consultoria gratuita via Venancor Corretora em Nova Iguaçu, Duque de Caxias, São João de Meriti e regiões.",
    provider: { "@id": `${BASE_URL}/#organization` },
    brand: { "@type": "Brand", name: "Amil Saúde" },
    serviceType: "Plano de Saúde",
    areaServed: { "@type": "AdministrativeArea", name: "Baixada Fluminense" },
    url: BASE_URL,
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Plano de Saúde SulAmérica — Venancor Corretora",
    description:
      "Tabelas e planos SulAmérica Saúde para coletivos por adesão e empresariais na Baixada Fluminense e Grande Rio. Simule e contrate com desconto via Venancor em Nova Iguaçu e Duque de Caxias.",
    provider: { "@id": `${BASE_URL}/#organization` },
    brand: { "@type": "Brand", name: "SulAmérica Saúde" },
    serviceType: "Plano de Saúde",
    areaServed: { "@type": "AdministrativeArea", name: "Baixada Fluminense" },
    url: BASE_URL,
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Plano de Saúde Assim Saúde — Venancor Corretora",
    description:
      "Planos Assim Saúde com foco em PME e empresarial na Baixada Fluminense. Contrate com consultoria gratuita pela Venancor Corretora em Nova Iguaçu.",
    provider: { "@id": `${BASE_URL}/#organization` },
    brand: { "@type": "Brand", name: "Assim Saúde" },
    serviceType: "Plano de Saúde",
    areaServed: { "@type": "AdministrativeArea", name: "Baixada Fluminense" },
    url: BASE_URL,
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Plano de Saúde Leve Saúde — Venancor Corretora",
    description:
      "Planos Leve Saúde acessíveis para MEI e pequenas empresas na Baixada Fluminense. Compare tabelas e contrate via Venancor Corretora em Nova Iguaçu e Duque de Caxias.",
    provider: { "@id": `${BASE_URL}/#organization` },
    brand: { "@type": "Brand", name: "Leve Saúde" },
    serviceType: "Plano de Saúde",
    areaServed: { "@type": "AdministrativeArea", name: "Baixada Fluminense" },
    url: BASE_URL,
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Plano Amep Saúde — Venancor Corretora",
    description:
      "Amep Saúde: plano regional com cobertura em mais de 21 cidades do Rio de Janeiro, incluindo Nova Iguaçu, Duque de Caxias, São João de Meriti e Região dos Lagos. Adesão e consultoria via Venancor Corretora.",
    provider: { "@id": `${BASE_URL}/#organization` },
    brand: { "@type": "Brand", name: "Amep Saúde" },
    serviceType: "Plano de Saúde Regional",
    areaServed: { "@type": "AdministrativeArea", name: "Estado do Rio de Janeiro" },
    url: `${BASE_URL}/amep`,
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Plano Notre Dame Intermédica — Venancor Corretora",
    description:
      "Planos Notre Dame Intermédica (GNDI) empresariais com ampla rede credenciada na Baixada Fluminense e Grande Rio. Cotação e contratação via Venancor Corretora.",
    provider: { "@id": `${BASE_URL}/#organization` },
    brand: { "@type": "Brand", name: "Notre Dame Intermédica" },
    serviceType: "Plano de Saúde",
    areaServed: { "@type": "AdministrativeArea", name: "Baixada Fluminense" },
    url: BASE_URL,
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Plano Porto Saúde — Venancor Corretora",
    description:
      "Planos Porto Saúde individuais e familiares com cobertura nacional. Contrate com consultoria gratuita via Venancor Corretora na Baixada Fluminense.",
    provider: { "@id": `${BASE_URL}/#organization` },
    brand: { "@type": "Brand", name: "Porto Saúde" },
    serviceType: "Plano de Saúde",
    areaServed: { "@type": "Country", name: "Brasil" },
    url: BASE_URL,
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Planos Odontológicos (Amil Dental, Bradesco Dental, SulAmérica Odonto) — Venancor Corretora",
    description:
      "Encontre os melhores valores em planos odontológicos (dental) para você, sua família ou sua empresa. Contrate com a corretora Venancor e tenha acesso à maior rede credenciada de dentistas na Baixada Fluminense e no Brasil.",
    provider: { "@id": `${BASE_URL}/#organization` },
    brand: { "@type": "Brand", name: "Múltiplas Operadoras" },
    serviceType: "Plano Odontológico",
    areaServed: { "@type": "Country", name: "Brasil" },
    url: BASE_URL,
  },
];

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaServiceArea) }}
        />
        {schemaServicos.map((s, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
          />
        ))}
      </div>
    </main>
  );
}
