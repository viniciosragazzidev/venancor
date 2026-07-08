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

export default function Home() {
  return (
    <main className="flex  flex-col items-center justify-center px-24">
      <div className="container h-full min-h-screen  ">
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
      </div>
    </main>
  );
}
