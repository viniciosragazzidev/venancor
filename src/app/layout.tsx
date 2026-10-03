import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const amil = localFont({
  src: "../../public/fonts/Amil Typeface Bold.ttf",
  variable: "--font-amil",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MedLink",
    template: "%s · MedLink",
  },
  description: "Venda de planos de saúde com contrato, assinatura digital e link de pagamento.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${jakarta.variable} ${amil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
