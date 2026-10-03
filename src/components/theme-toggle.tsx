"use client";

import { useTheme } from "next-themes";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Alternar tema" />}
      >
        <span className="relative grid size-4 place-items-center">
          <SunIcon
            aria-hidden
            className="col-start-1 row-start-1 transition-[opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] opacity-100 dark:opacity-0"
          />
          <MoonIcon
            aria-hidden
            className="col-start-1 row-start-1 absolute transition-[opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] opacity-0 dark:opacity-100"
          />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value)}>
          <DropdownMenuRadioItem value="light" className="gap-2">
            <SunIcon aria-hidden />
            Claro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="gap-2">
            <MoonIcon aria-hidden />
            Escuro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="gap-2">
            <LaptopIcon aria-hidden />
            Sistema
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
