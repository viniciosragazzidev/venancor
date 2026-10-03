"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  ClipboardListIcon,
  FileTextIcon,
  HeartPulseIcon,
  LayoutDashboardIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/painel", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/painel/ordens", label: "Ordens", icon: ClipboardListIcon },
  { href: "/painel/clientes", label: "Clientes", icon: UsersIcon },
  { href: "/painel/planos", label: "Planos", icon: HeartPulseIcon },
  { href: "/painel/operadoras", label: "Operadoras", icon: Building2Icon },
  { href: "/painel/modelos-contrato", label: "Modelos de contrato", icon: FileTextIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/painel") {
    return pathname === "/painel";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-0.5 p-2", className)} aria-label="Principal">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon
              aria-hidden
              className={cn("size-4 shrink-0", active ? "text-primary" : undefined)}
              strokeWidth={1.5}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
