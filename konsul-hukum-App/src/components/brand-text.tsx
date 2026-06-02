"use client";

import { cn } from "@/lib/utils";

export function BrandText({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      Konsul Hukum <span className="text-primary-foreground/70 font-light">AI</span>
    </span>
  );
}
