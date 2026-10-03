import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="Venancor"
      width={150}
      height={45}
      priority
      className={cn("h-auto w-[150px]", className)}
    />
  );
}
