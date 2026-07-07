import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "@/lib/colors";
import { formatNumber, formatRatio } from "@/lib/format";
import type { Project } from "@/types";

interface Point {
  x: number;
  y: number;
  name: string;
  status: Project["status"];
  leverage: number | null;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * The bridge chart: plots one-time build effort (x) against annual hours saved (y).
 * Median reference lines split it into four zones — the diagonal is efficiency.
 */
export function EffortImpactScatter({ projects }: { projects: Project[] }) {
  const t = useChartTheme();
  const data: Point[] = projects.map((p) => ({
    x: p.devHours,
    y: p.hoursSaved,
    name: p.name,
    status: p.status,
    leverage: p.leverage,
  }));

  const mx = median(data.map((d) => d.x));
  const my = median(data.map((d) => d.y));

  return (
    <div className="relative">
      {/* Quadrant captions (purely descriptive; absolute so they don't fight the SVG). */}
      <span className="pointer-events-none absolute left-14 top-2 z-10 text-xs font-medium text-muted-foreground">
        ◤ Quick wins
      </span>
      <span className="pointer-events-none absolute right-3 top-2 z-10 text-xs font-medium text-muted-foreground">
        Big bets ◥
      </span>
      <span className="pointer-events-none absolute bottom-10 left-14 z-10 text-xs font-medium text-muted-foreground">
        ◣ Fill-ins
      </span>
      <span className="pointer-events-none absolute bottom-10 right-3 z-10 text-xs font-medium text-muted-foreground">
        Money pits ◢
      </span>

      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 24, right: 24, bottom: 36, left: 12 }}>
          <CartesianGrid stroke={t.border} strokeOpacity={0.5} />
          <XAxis
            type="number"
            dataKey="x"
            name="Dev hours"
            tick={{ fill: t.muted, fontSize: 14 }}
            tickLine={false}
            axisLine={{ stroke: t.border }}
            label={{
              value: "Development hours (one-time)",
              position: "insideBottom",
              offset: -18,
              style: { fill: t.muted, fontSize: 15, fontWeight: 500, textAnchor: "middle" },
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Hours saved"
            tick={{ fill: t.muted, fontSize: 14 }}
            tickLine={false}
            axisLine={{ stroke: t.border }}
            label={{
              value: "Hours saved / year",
              angle: -90,
              position: "insideLeft",
              style: { fill: t.muted, fontSize: 15, fontWeight: 500, textAnchor: "middle" },
            }}
          />
          <ReferenceLine x={mx} stroke={t.muted} strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={my} stroke={t.muted} strokeDasharray="4 4" strokeOpacity={0.6} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ScatterTooltip />} />
          <Scatter data={data} animationDuration={700}>
            {data.map((d, i) => (
              <Cell key={i} fill={t.statusColor(d.status)} fillOpacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScatterTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-card-foreground">{p.name}</p>
      <Row label="Saved / year" value={`${formatNumber(p.y)} h`} />
      <Row label="Dev hours" value={`${formatNumber(p.x)} h`} />
      <Row label="Return" value={formatRatio(p.leverage)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-6 text-muted-foreground">
      <span>{label}</span>
      <span className="ml-auto font-medium tabular-nums text-card-foreground">{value}</span>
    </div>
  );
}
