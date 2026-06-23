import { motion } from "motion/react";

import { Card } from "@/components/ui/Card";
import { useCountUp } from "@/hooks/useCountUp";
import { formatNumber } from "@/lib/format";
import type { Totals } from "@/lib/aggregate";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}

/** Filter-aware metric cards. Values count up and re-count when filters change. */
export function KpiStrip({ totals }: { totals: Totals }) {
  const stats: Stat[] = [
    { label: "Hours saved / year", value: totals.hoursSaved, suffix: " h" },
    { label: "Projects", value: totals.projectCount },
    { label: "Countries", value: totals.countryCount },
    { label: "Avg. reduction", value: totals.avgReductionPct, suffix: "%", decimals: 0 },
    { label: "Active", value: totals.activeCount },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {stats.map((s, i) => (
        <StatCard key={s.label} stat={s} index={i} />
      ))}
    </div>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const animated = useCountUp(stat.value);
  const shown = stat.decimals ? animated.toFixed(stat.decimals) : formatNumber(Math.round(animated));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="group relative overflow-hidden p-5 transition-colors hover:border-accent/50">
        {/* hover spotlight */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
        <p className="text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">
          {shown}
          {stat.suffix}
        </p>
        <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
      </Card>
    </motion.div>
  );
}
