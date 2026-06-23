import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** A toggleable filter pill. */
export function Chip({ active = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "border-transparent bg-accent text-accent-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-accent/50",
        className,
      )}
      {...props}
    />
  );
}
