import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card } from "@/components/ui/Card";
import { groupBy } from "@/lib/aggregate";
import {
  CAPABILITY_TOKEN,
  CRITICALITY_TOKEN,
  ROLE_TOKEN,
  STATUS_TOKEN,
  useChartTheme,
} from "@/lib/colors";
import { useFilters } from "@/store/useFilters";
import type { CapabilityCenter, Criticality, Project, Role, Status } from "@/types";

/**
 * Four part-of-whole donuts (Status / Criticality / Role / Capability Center). Slices
 * double as filter controls. Computed from the full portfolio so they stay a stable
 * facet reference.
 */
export function CompositionDonuts({ projects }: { projects: Project[] }) {
  const f = useFilters();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Donut
        title="Status"
        data={groupBy(projects, "status")}
        tokenMap={STATUS_TOKEN}
        active={f.statuses}
        onToggle={(l) => f.toggleStatus(l as Status)}
      />
      <Donut
        title="Criticality"
        data={groupBy(projects, "criticality")}
        tokenMap={CRITICALITY_TOKEN}
        active={f.criticalities}
        onToggle={(l) => f.toggleCriticality(l as Criticality)}
      />
      <Donut
        title="Role"
        data={groupBy(projects, "role")}
        tokenMap={ROLE_TOKEN}
        active={f.roles}
        onToggle={(l) => f.toggleRole(l as Role)}
      />
      <Donut
        title="Capability Center"
        data={groupBy(projects, "capabilityCenter")}
        tokenMap={CAPABILITY_TOKEN}
        active={f.capabilityCenters}
        onToggle={(l) => f.toggleCapabilityCenter(l as CapabilityCenter)}
      />
    </div>
  );
}

interface DonutProps {
  title: string;
  data: { label: string; count: number }[];
  tokenMap: Record<string, string>;
  active: string[];
  onToggle: (label: string) => void;
}

function Donut({ title, data, tokenMap, active, onToggle }: DonutProps) {
  const t = useChartTheme();
  const total = data.reduce((s, d) => s + d.count, 0);
  const isDim = (label: string) => active.length > 0 && !active.includes(label);

  return (
    <Card className="p-5">
      <p className="mb-1 text-sm font-medium text-muted-foreground">{title}</p>
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={54}
              outerRadius={78}
              paddingAngle={2}
              stroke="none"
              animationDuration={600}
              onClick={(d) => onToggle((d as unknown as { label: string }).label)}
            >
              {data.map((d) => (
                <Cell
                  key={d.label}
                  fill={t.resolve(tokenMap[d.label])}
                  fillOpacity={isDim(d.label) ? 0.25 : 1}
                  style={{ cursor: "pointer", outline: "none" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">{total}</span>
          <span className="text-xs text-muted-foreground">projects</span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {data.map((d) => (
          <button
            key={d.label}
            type="button"
            onClick={() => onToggle(d.label)}
            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted"
            style={{ opacity: isDim(d.label) ? 0.5 : 1 }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: t.resolve(tokenMap[d.label]) }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-medium tabular-nums">{d.count}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
