import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { useChartTheme } from "@/lib/colors";
import type { Project } from "@/types";

const truncate = (s: string, n = 20) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Horizontal ranked bars — long project names stay legible without rotation. */
export function HoursByProjectChart({ projects }: { projects: Project[] }) {
  const t = useChartTheme();
  const data = [...projects]
    .sort((a, b) => b.hoursSaved - a.hoursSaved)
    .map((p) => ({ ...p, shortName: truncate(p.name) }));

  const height = Math.max(240, data.length * 36 + 40);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 28, left: 8 }}>
        <XAxis
          type="number"
          tick={{ fill: t.muted, fontSize: 15 }}
          tickLine={false}
          axisLine={{ stroke: t.border }}
          label={{
            value: "Hours saved / year",
            position: "insideBottom",
            offset: -14,
            style: { fill: t.muted, fontSize: 16, fontWeight: 500, textAnchor: "middle" },
          }}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          width={185}
          tick={{ fill: t.muted, fontSize: 15 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: t.mutedBg, opacity: 0.4 }}
          content={({ active, payload, label }) => (
            <ChartTooltip active={active} payload={payload} label={label} unit=" h" />
          )}
        />
        <Bar dataKey="hoursSaved" name="Hours saved" radius={[0, 4, 4, 0]} animationDuration={700}>
          {data.map((d) => (
            <Cell key={d.id} fill={t.statusColor(d.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
