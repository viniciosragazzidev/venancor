"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon, Cancel01Icon } from "@hugeicons/core-free-icons";

export default function SectionVideo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.section
      id="apresentacao-video"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full py-16 md:py-20 bg-slate-50/50 font-sans select-none overflow-hidden will-change-transform relative"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 flex flex-col gap-8 md:gap-10">
        {/* Header */}
        <div className="w-full text-center space-y-3 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="size-2 rounded-full bg-[#3b2dff]" />
            <span>Vídeo de Apresentação</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            Apresentação do Plano Amep Saúde
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed max-w-lg mx-auto">
            Descubra em menos de 2 minutos como a Amep Saúde reorganizou o acesso a consultas,
            exames e cirurgias com alto padrão e economia.
          </p>
        </div>

        {/* Video Player Mock Card */}
        <div className="w-full max-w-4xl mx-auto mt-2">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full aspect-video rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            {/* Background Image */}
            <Image
              src="/video_bg.jpg"
              alt="Apresentação Amep Saúde"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/5 group-hover:from-black/60 transition-colors duration-300" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="size-16 sm:size-20 rounded-full bg-white text-[#3b2dff] flex items-center justify-center shadow-lg shadow-black/10 backdrop-blur-sm group-hover:bg-[#3b2dff] group-hover:text-white transition-colors duration-300 relative"
              >
                <HugeiconsIcon icon={PlayIcon} className="size-6 sm:size-8 ml-1" />
                <span className="absolute -inset-2 rounded-full border border-white/20 animate-pulse group-hover:border-[#3b2dff]/30" />
              </motion.div>
            </div>

            {/* Video Label */}
            <div className="absolute bottom-6 left-6 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded border border-white/10">
                01:45 Minutos
              </span>
              <h4 className="text-white font-extrabold text-base sm:text-lg mt-2">
                Conheça a Rede Própria e os Benefícios Exclusivos Amep
              </h4>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-20 size-10 rounded-full bg-black/50 text-white hover:bg-black/75 flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
              </button>

              {/* YouTube Embed Video */}
              <div className="w-full aspect-video bg-black relative">
                <iframe
                  className="w-full h-full border-0 absolute inset-0"
                  src="https://www.youtube.com/embed/bRB6uliM_b4?autoplay=1"
                  title="Apresentação Amep Saúde"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
