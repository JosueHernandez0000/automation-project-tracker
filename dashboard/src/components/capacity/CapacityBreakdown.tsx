import { Card } from "@/components/ui/Card";
import { devHoursBy } from "@/lib/aggregate";
import { CAPABILITY_TOKEN, ROLE_TOKEN } from "@/lib/colors";
import { formatNumber } from "@/lib/format";
import type { Project } from "@/types";

import { DevHoursBars } from "./DevHoursBars";

/**
 * Act II — Capacity. Where the build effort went: total hours invested, split by
 * capability center (which business area) and by role (build vs coach vs fix).
 * Measures dev hours — distinct from the Act I donut, which counts projects.
 */
export function CapacityBreakdown({ projects }: { projects: Project[] }) {
  const total = projects.reduce((s, p) => s + p.devHours, 0);
  const avg = projects.length ? total / projects.length : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <div className="mb-5 flex gap-8">
          <Stat label="Total dev hours" value={`${formatNumber(total)} h`} />
          <Stat label="Avg / project" value={`${formatNumber(avg)} h`} />
        </div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Effort by capability center</p>
        <DevHoursBars data={devHoursBy(projects, "capabilityCenter")} tokenMap={CAPABILITY_TOKEN} />
      </Card>

      <Card className="p-5">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Effort by role</p>
        <DevHoursBars data={devHoursBy(projects, "role")} tokenMap={ROLE_TOKEN} />
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
