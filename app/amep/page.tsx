import { Metadata } from 'next';
import NavbarLp from "@/components/lp/navbar";
import AmepHero from "@/components/amep/amep-hero";
import AmepTabs from "@/components/amep/amep-tabs";
import AmepVideoDemo from "@/components/amep/amep-video-demo";
import AmepSimulator from "@/components/amep/amep-simulator";
import AmepPricing from "@/components/amep/amep-pricing";
import AmepTestimonials from "@/components/amep/amep-testimonials";
import AmepCta from "@/components/amep/amep-cta";
import AmepFooter from "@/components/amep/amep-footer";
import FloatingChat from "@/components/lp/floating-chat";

export const metadata: Metadata = {
    title: "Plano Amep Saúde - Tabela de Preços e Cotação Online | Venacor Saúde",
    description: "Consulte a tabela oficial do plano Amep Saúde. Planos a partir de R$ 82,94 (CNPJ/MEI) e R$ 138,74 (Individual). Atendimento garantido no Hospital Prontonil em Nova Iguaçu.",
    openGraph: {
        title: "Plano Amep Saúde - Tabela Promocional Atualizada",
        description: "Planos de saúde acessíveis na Baixada Fluminense com carência zero para consultas na rede própria Amep.",
        url: "https://Venacorsaude.com.br/amep",
        siteName: "Venacor Saúde",
        images: [
            {
                url: "/amep_saude_logo.png",
                width: 1200,
                height: 630,
                alt: "Plano Amep Saúde - Tabela Promocional Venacor Saúde"
            }
        ],
        locale: "pt_BR",
        type: "website"
    }
};

const jsonLdSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "InsuranceAgency",
            "@id": "https://Venacorsaude.com.br/#agency",
            "name": "Venacor Saúde",
            "url": "https://Venacorsaude.com.br",
            "logo": "https://Venacorsaude.com.br/logo.webp",
            "telephone": "+5521974450263",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "R. Athaide Pimenta de Morais, 381 - Centro",
                "addressLocality": "Nova Iguaçu",
                "addressRegion": "RJ",
                "postalCode": "26210-190",
                "addressCountry": "BR"
            }
        },
        {
            "@type": "Product",
            "name": "Plano Amep Saúde Nova Iguaçu",
            "description": "Plano de saúde ambulatorial sem coparticipação com atendimento garantido no Hospital Prontonil em Nova Iguaçu.",
            "brand": {
                "@type": "Brand",
                "name": "Amep Saúde"
            },
            "offers": {
                "@type": "AggregateOffer",
                "lowPrice": "82.94",
                "highPrice": "221.11",
                "priceCurrency": "BRL",
                "offerCount": "12"
            }
        }
    ]
};

export default function AmepPage() {
    return (
        <main className="w-full min-h-[100dvh] flex flex-col bg-background font-sans overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
            />
            <NavbarLp />
            <AmepHero />
            <AmepTabs />
            <AmepVideoDemo />
            <AmepSimulator />
            <AmepPricing />
            <AmepTestimonials />
            <AmepCta />
            <AmepFooter />
            <FloatingChat />
        </main>
    );
}
