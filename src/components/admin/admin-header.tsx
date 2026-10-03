"use client";

import { ChevronsUpDownIcon, LogOutIcon, MenuIcon, UserRoundIcon } from "lucide-react";

import { Brand } from "@/components/admin/brand";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur lg:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="-ml-1 lg:hidden"
              aria-label="Abrir menu"
            />
          }
        >
          <MenuIcon aria-hidden />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Navegação principal</SheetDescription>
            <Brand />
          </SheetHeader>
          <SidebarNav className="p-2" />
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 px-1.5"
                aria-label="Conta do usuário"
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback>
                <UserRoundIcon aria-hidden className="size-3.5" strokeWidth={1.5} />
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm sm:inline">Gestor</span>
            <ChevronsUpDownIcon
              aria-hidden
              className="size-3.5 text-muted-foreground"
              strokeWidth={1.5}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="w-40">
            <DropdownMenuLabel>Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* TODO: exibir e-mail/nome reais da sessão e chamar authClient.signOut() quando src/lib/auth-client.ts existir (Cofre, F1.3) */}
            <DropdownMenuItem className="gap-2">
              <LogOutIcon aria-hidden strokeWidth={1.5} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
