import { CalendarDays, Globe2, Sparkles, Target } from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";

import { useCountUp } from "@/hooks/useCountUp";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Portfolio } from "@/types";

// Per-insight accent + icon, pulled from the dashboard's chart palette so the chips are
// colorful but stay theme-aware. Full literal classes so Tailwind keeps them in the build.
const INSIGHT_STYLES: Record<string, { Icon: ComponentType<{ className?: string }>; box: string; icon: string }> = {
  concentration: { Icon: Target, box: "border-chart-1/40 bg-chart-1/10", icon: "text-chart-1" },
  leadingCountry: { Icon: Globe2, box: "border-chart-2/40 bg-chart-2/10", icon: "text-chart-2" },
  workdays: { Icon: CalendarDays, box: "border-chart-4/40 bg-chart-4/10", icon: "text-chart-4" },
};
const INSIGHT_FALLBACK = { Icon: Sparkles, box: "border-border bg-card/70", icon: "text-accent" };

/**
 * The opening statement. Always reflects the FULL portfolio (the headline thesis), even
 * when filters change the analytical sections below. The number counts up once on load.
 */
export function HeroImpact({ portfolio }: { portfolio: Portfolio }) {
  const hours = useCountUp(portfolio.totalHoursSaved, 2600);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <Aurora />
      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center md:py-32 print:py-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          Automation portfolio impact
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-4 text-6xl font-bold tracking-tight md:text-8xl"
        >
          <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text tabular-nums text-transparent">
            {formatNumber(Math.round(hours))}
          </span>
          <span className="ml-3 text-3xl font-semibold text-foreground md:text-5xl">hours</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground"
        >
          reclaimed every year across <strong className="text-foreground">{portfolio.projectCount}</strong>{" "}
          automations in <strong className="text-foreground">{portfolio.countryCount}</strong> countries.
        </motion.p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {portfolio.insights.slice(0, 3).map((insight, idx) => {
            const s = INSIGHT_STYLES[insight.kind] ?? INSIGHT_FALLBACK;
            const Icon = s.Icon;
            return (
              <motion.span
                key={insight.kind}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.12 }}
                className={cn(
                  "inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-base font-semibold text-foreground shadow-sm backdrop-blur md:text-lg",
                  s.box,
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", s.icon)} />
                {insight.headline}
              </motion.span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Static (non-looping) gradient field — premium depth without distracting motion. */
function Aurora() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="pointer-events-none absolute inset-0 -z-0"
    >
      <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-brand/25 blur-3xl" />
      <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-brand-2/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
    </motion.div>
  );
}
