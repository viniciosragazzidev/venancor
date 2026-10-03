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
      className={cn(
        "h-auto w-[150px] dark:rounded-xl dark:bg-white dark:px-2 dark:py-1",
        className,
      )}
    />
  );
}
