import SectionCotacao from '@/components/lp/section-cotacao';
import SectionHero from '@/components/lp/section-hero';
import SectionPlanos from '@/components/lp/section-planos';
import SectionDiferenciais from '@/components/lp/section-diferenciais';
import Navbar from '@/components/navbar';
import React from 'react';

export default function Home() {
  return (
    <main className="flex  flex-col items-center justify-center px-24">
      <div className="container h-full min-h-screen  ">
        <Navbar />
        <SectionHero />
        <SectionCotacao />
        <SectionPlanos />
        <SectionDiferenciais />
      </div>
    </main>
  );
}
