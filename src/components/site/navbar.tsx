"use client";

import React from "react";
import Logo from "@/components/site/logo";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, ZapIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/site/ui/button";

const Navbar: React.FC = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="flex w-full h-20 items-center justify-between font-sans select-none relative z-50"
    >
      <div className="flex gap-4 md:gap-18 items-center">
        <Logo />
        <ul className="hidden md:flex items-center gap-8 text-gray-600 text-sm">
          <li>
            <Link
              className="transition-all duration-300 hover:underline hover:text-[#3b2dff]"
              href="/"
            >
              Nossos Planos
            </Link>
          </li>
          <li>
            <Link
              className="transition-all duration-300 hover:underline hover:text-[#3b2dff]"
              href="/sobre"
            >
              Sobre
            </Link>
          </li>
          <li>
            <Link
              className="transition-all duration-300 hover:underline hover:text-[#3b2dff]"
              href="/produtos"
            >
              Produtos
            </Link>
          </li>

          <li className="ml-5 text-gray-500 hover:text-slate-800 transition-colors">
            <HugeiconsIcon icon={Search01Icon} className="w-5 h-5 cursor-pointer" />
          </li>
        </ul>
      </div>

      <div className="flex gap-8 items-center">
        <ul className="flex items-center gap-8 text-gray-600 text-sm">
          <li>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                variant="default"
                size="lg"
                onClick={() => {
                  window.open(
                    `https://wa.me/5521964469750?text=${encodeURIComponent("Olá! Vim pelo site da Venacor e gostaria de uma cotação rápida de plano de saúde.")}`,
                    "_blank",
                  );
                }}
                className="text-[13.5px] px-4 cursor-pointer will-change-transform"
              >
                Cotação Rápida{" "}
                <span>
                  <HugeiconsIcon icon={ZapIcon} />
                </span>
              </Button>
            </motion.div>
          </li>
        </ul>
      </div>
    </motion.nav>
  );
};

export default Navbar;
