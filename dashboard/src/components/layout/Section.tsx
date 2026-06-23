import { motion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

/** A scroll section that reveals its content with a subtle, reduced-motion-aware rise. */
export function Section({ title, subtitle, className, children }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "mx-auto max-w-7xl px-6 py-10",
        // Print: override Framer's reveal so off-screen sections aren't blank in the PDF.
        "print:!opacity-100 print:![transform:none] print:break-inside-avoid print:py-5",
        className,
      )}
    >
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.section>
  );
}
