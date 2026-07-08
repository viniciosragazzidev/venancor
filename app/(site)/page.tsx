import NavbarLp from "@/components/lp/navbar";
import Hero from "@/components/lp/hero";
import SectionOne from "@/components/lp/section-1";
import SectionTwo from "@/components/lp/section-2";
import SectionThree from "@/components/lp/section-3";
import SectionFour from "@/components/lp/section-4";
import SectionFive from "@/components/lp/section-5";
import SectionSix from "@/components/lp/section-6";
import SectionSeven from "@/components/lp/section-7";
import Footer from "@/components/lp/footer";
import FloatingChat from "@/components/lp/floating-chat";

export default function Home() {
  return (
    <main className="w-full min-h-screen h-full flex flex-col">
      <NavbarLp />
      <Hero />
      <SectionOne />
      <SectionTwo />
      <SectionThree />
      <SectionFour />
      <SectionFive />
      <SectionSix />
      <SectionSeven />
      <Footer />
      <FloatingChat />
    </main>
  );
}
