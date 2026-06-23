import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { pareto } from "@/lib/aggregate";
import { useChartTheme } from "@/lib/colors";
import { PALETTES, PARETO_PALETTE, sampleColormap } from "@/lib/palettes";
import type { Project } from "@/types";

/**
 * Bars (hours saved per project, descending) + cumulative-% line with an 80% marker.
 * Proves the portfolio's concentration: a few projects carry most of the impact.
 * Bars are colored by magnitude with a sequential colormap (the top contributors
 * read brightest); the cumulative line stays neutral for contrast over the gradient.
 */
export function ParetoChart({ projects }: { projects: Project[] }) {
  const t = useChartTheme();
  const data = pareto(projects).map((p, i) => ({ ...p, rank: i + 1 }));
  const maxHours = Math.max(1, ...data.map((d) => d.hoursSaved));
  const stops = PALETTES[PARETO_PALETTE];

  const axisLabel = { fill: t.muted, fontSize: 16, fontWeight: 500 };

  return (
    <ResponsiveContainer width="100%" height={380}>
      <ComposedChart data={data} margin={{ top: 12, right: 44, bottom: 34, left: 28 }}>
        <XAxis
          dataKey="rank"
          tick={{ fill: t.muted, fontSize: 16 }}
          tickLine={false}
          axisLine={{ stroke: t.border }}
          label={{
            value: "Projects (ranked by hours saved)",
            position: "insideBottom",
            offset: -14,
            style: { ...axisLabel, textAnchor: "middle" },
          }}
        />
        <YAxis
          yAxisId="hours"
          tick={{ fill: t.muted, fontSize: 16 }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "Hours saved / year",
            angle: -90,
            position: "insideLeft",
            offset: 4,
            style: { ...axisLabel, textAnchor: "middle" },
          }}
        />
        <YAxis
          yAxisId="pct"
          orientation="right"
          domain={[0, 100]}
          unit="%"
          tick={{ fill: t.muted, fontSize: 16 }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "Cumulative %",
            angle: 90,
            position: "insideRight",
            offset: 0,
            style: { ...axisLabel, textAnchor: "middle" },
          }}
        />
        <Tooltip
          cursor={{ fill: t.mutedBg, opacity: 0.4 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as (typeof data)[number];
            return (
              <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-lg">
                <p className="font-medium">
                  #{d.rank} {d.name}
                </p>
                <p className="text-muted-foreground">{Math.round(d.hoursSaved)} h saved</p>
                <p className="text-muted-foreground">{d.cumulativePct.toFixed(0)}% cumulative</p>
              </div>
            );
          }}
        />
        <ReferenceLine
          yAxisId="pct"
          y={80}
          stroke={t.muted}
          strokeDasharray="4 4"
          strokeOpacity={0.6}
        />
        <Bar yAxisId="hours" dataKey="hoursSaved" radius={[4, 4, 0, 0]} animationDuration={700}>
          {data.map((d) => (
            <Cell key={d.id} fill={sampleColormap(stops, d.hoursSaved / maxHours)} />
          ))}
        </Bar>
        <Line
          yAxisId="pct"
          type="monotone"
          dataKey="cumulativePct"
          stroke={t.foreground}
          strokeWidth={2.5}
          dot={{ r: 3, fill: t.foreground }}
          animationDuration={900}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
