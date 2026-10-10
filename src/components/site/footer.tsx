"use client";

import React from "react";
import Logo from "@/components/site/logo";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CallIcon,
  Mail01Icon,
  Clock01Icon,
  Location01Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";

export default function Footer() {
  const mapUrl =
    "https://maps.google.com/?q=Rua+Athaide+Pimenta+de+Morais,+381+-+Centro,+Nova+Iguaçu+-+RJ,+26210-190";
  const whatsappUrl = "https://wa.me/5521964469750";

  // Smooth scroll to sections for menu links
  const handleScrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full bg-slate-50/50 border-t border-slate-100 font-sans select-none overflow-hidden relative will-change-transform"
    >
      {/* Upper Footer: Info Grid */}
      <div className="w-full max-w-[1280px] mx-auto px-6 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Branding and Identity */}
          <div className="lg:col-span-4 flex flex-col items-start gap-5">
            <div className="opacity-75 contrast-75 brightness-75 hover:opacity-100 hover:contrast-100 hover:brightness-100 transition-all duration-300">
              <Logo />
            </div>
            <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed max-w-[36ch] text-left">
              Sua escolha inteligente em planos de saúde e odontológicos. Consultoria isenta,
              transparente e focada em alta performance para você, sua família ou empresa.
            </p>
          </div>

          {/* Column 2: Nossos Produtos */}
          <div className="lg:col-span-3 flex flex-col items-start gap-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
              Nossos Produtos
            </h4>
            <ul className="flex flex-col gap-3 w-full text-left">
              <li>
                <a
                  href="#planos"
                  onClick={(e) => handleScrollToSection(e, "planos")}
                  className="group flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-[#3b2dff] transition-all duration-200 hover:translate-x-[2px] cursor-pointer"
                >
                  <span className="size-1 rounded-full bg-slate-300 group-hover:bg-[#3b2dff] transition-colors shrink-0" />
                  <span>Planos de Saúde Individual / Família</span>
                </a>
              </li>
              <li>
                <a
                  href="#planos"
                  onClick={(e) => handleScrollToSection(e, "planos")}
                  className="group flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-[#3b2dff] transition-all duration-200 hover:translate-x-[2px] cursor-pointer"
                >
                  <span className="size-1 rounded-full bg-slate-300 group-hover:bg-[#3b2dff] transition-colors shrink-0" />
                  <span>Planos de Saúde Empresarial / MEI</span>
                </a>
              </li>
              <li>
                <a
                  href="#planos"
                  onClick={(e) => handleScrollToSection(e, "planos")}
                  className="group flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-[#3b2dff] transition-all duration-200 hover:translate-x-[2px] cursor-pointer"
                >
                  <span className="size-1 rounded-full bg-slate-300 group-hover:bg-[#3b2dff] transition-colors shrink-0" />
                  <span>Planos Odontológicos Completos</span>
                </a>
              </li>
              <li>
                <a
                  href="#planos"
                  onClick={(e) => handleScrollToSection(e, "planos")}
                  className="group flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-[#3b2dff] transition-all duration-200 hover:translate-x-[2px] cursor-pointer"
                >
                  <span className="size-1 rounded-full bg-slate-300 group-hover:bg-[#3b2dff] transition-colors shrink-0" />
                  <span>Tabelas Amep Saúde — Rota Especial</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Atendimento e Contato */}
          <div className="lg:col-span-3 flex flex-col items-start gap-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
              Atendimento e Contato
            </h4>
            <div className="flex flex-col gap-4 w-full text-left">
              {/* Phone/WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-xs sm:text-sm text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <div className="size-8 rounded-lg bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:border-emerald-100 group-hover:text-emerald-600 transition-colors">
                  <HugeiconsIcon icon={WhatsappIcon} className="size-4 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                    Telefone / WhatsApp
                  </span>
                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors mt-0.5">
                    (21) 96446-9750
                  </span>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:contato@venacorseguros.com"
                className="group flex items-center gap-3 text-xs sm:text-sm text-slate-500 hover:text-[#3b2dff] transition-colors"
              >
                <div className="size-8 rounded-lg bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-400 group-hover:bg-[#3b2dff]/5 group-hover:border-[#3b2dff]/10 group-hover:text-[#3b2dff] transition-colors">
                  <HugeiconsIcon icon={Mail01Icon} className="size-4 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                    E-mail
                  </span>
                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors mt-0.5">
                    contato@venacorseguros.com
                  </span>
                </div>
              </a>

              {/* Hours */}
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-500">
                <div className="size-8 rounded-lg bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-400">
                  <HugeiconsIcon icon={Clock01Icon} className="size-4 shrink-0" />
                </div>
                <div className="flex flex-col leading-relaxed">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-1">
                    Funcionamento
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    Segunda a Sexta: 09h às 18h
                  </span>
                  <span className="text-xs text-slate-600 font-medium">Sábado: 08h às 18h</span>
                  <span className="text-xs text-slate-400 font-light mt-0.5">Domingo: Fechado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Presença Física */}
          <div className="lg:col-span-2 flex flex-col items-start gap-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
              Presença Física
            </h4>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-start text-left gap-3 w-full"
            >
              <div className="size-8 rounded-lg bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-400 group-hover:bg-[#3b2dff]/5 group-hover:border-[#3b2dff]/10 group-hover:text-[#3b2dff] transition-all">
                <HugeiconsIcon icon={Location01Icon} className="size-4 shrink-0" />
              </div>
              <div className="flex flex-col leading-relaxed">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-1">
                  Matriz Baixada
                </span>
                <span className="text-xs font-bold text-slate-700 group-hover:text-[#3b2dff] transition-colors">
                  Nova Iguaçu — RJ
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Regiões Atendidas + Operadoras — conteúdo SSR para indexação */}
      <div className="w-full border-t border-slate-100 bg-slate-50/80">
        <div className="w-full max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-8">
          {/* Operadoras Parceiras */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operadoras Parceiras
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
              A Venancor é corretora autorizada das seguintes operadoras de planos de saúde:{" "}
              <strong className="text-slate-600">Amil Saúde</strong>,{" "}
              <strong className="text-slate-600">SulAmérica Saúde</strong>,{" "}
              <strong className="text-slate-600">Assim Saúde</strong>,{" "}
              <strong className="text-slate-600">Leve Saúde</strong>,{" "}
              <strong className="text-slate-600">Amep Saúde</strong>,{" "}
              <strong className="text-slate-600">Notre Dame Intermédica (GNDI)</strong>,{" "}
              <strong className="text-slate-600">Porto Saúde</strong> e{" "}
              <strong className="text-slate-600">Bradesco Saúde</strong>. Atendemos planos
              individuais, familiares, empresariais (CNPJ), MEI e coletivos PME.
            </p>
          </div>

          {/* Regiões Atendidas */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Regiões Atendidas — Corretora de Planos de Saúde
            </h3>
            <div className="flex flex-wrap gap-x-1 gap-y-1 text-xs text-slate-500">
              {[
                "Nova Iguaçu",
                "Duque de Caxias",
                "São João de Meriti",
                "Belford Roxo",
                "Mesquita",
                "Nilópolis",
                "Queimados",
                "Japeri",
                "Seropédica",
                "Paracambi",
                "Magé",
                "Guapimirim",
                "Itaguaí",
                "Rio de Janeiro",
                "Niterói",
                "São Gonçalo",
                "Petrópolis",
                "Volta Redonda",
                "Cabo Frio",
                "Angra dos Reis",
                "Baixada Fluminense",
                "Grande Rio",
              ].map((cidade, i, arr) => (
                <span key={cidade} className="text-slate-500">
                  {cidade}
                  {i < arr.length - 1 ? <span className="text-slate-300 mx-0.5">·</span> : ""}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-3xl">
              Venancor Corretora de Seguros oferece consultoria gratuita para contratação de planos
              de saúde Amil, SulAmérica, Assim, Leve Saúde e Amep em toda a Baixada Fluminense e
              Grande Rio de Janeiro. Atendimento 100% digital com suporte presencial em Nova Iguaçu
              — RJ.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright & Regulatory Bar */}
      <div className="w-full bg-[#3b2dff] border-t border-[#3b2dff]/20 py-8 relative z-10 text-left select-text overflow-hidden">
        {/* Background decorative glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-[100px]" />
        </div>

        <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-4 text-[10px] sm:text-xs font-light text-white/85 leading-relaxed relative z-10">
          <p className="max-w-6xl">
            © 2026 Venancor Corretora de Seguros. Todos os direitos reservados. A Venancor é uma
            corretora de seguros independente autorizada a comercializar os produtos das operadoras
            parceiras. As informações de tabelas de preços, carências e redes credenciadas estão
            sujeitas a alterações sem aviso prévio por parte das operadoras e devem ser validadas
            junto ao consultor. Registro ANS Operadoras Parceiras sob consulta individual.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
