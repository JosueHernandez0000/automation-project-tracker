import { Card } from "@/components/ui/Card";
import type { Totals } from "@/lib/aggregate";
import { formatRatio, formatWeeks } from "@/lib/format";
import type { Project } from "@/types";

import { EffortImpactScatter } from "./EffortImpactScatter";

/**
 * Act III — Efficiency. What the effort returned: the effort-vs-impact quadrant (the
 * bridge between Capacity and Impact) plus the two headline ratios.
 */
export function EfficiencyView({ projects, totals }: { projects: Project[]; totals: Totals }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <Card className="p-5">
        <EffortImpactScatter projects={projects} />
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        <Stat
          label="Avg leverage"
          value={formatRatio(totals.avgLeverage)}
          hint="hours saved per year for every hour invested"
        />
        <Stat
          label="Portfolio payback"
          value={formatWeeks(totals.paybackWeeks)}
          hint="time for savings to repay the build cost"
        />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="flex flex-col justify-center p-5">
      <p className="text-4xl font-semibold tracking-tight tabular-nums text-brand">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </Card>
  );
}
