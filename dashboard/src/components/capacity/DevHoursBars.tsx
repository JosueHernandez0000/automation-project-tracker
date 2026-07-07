import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { useChartTheme } from "@/lib/colors";
import type { DevHoursPoint } from "@/lib/aggregate";

/** Compact horizontal bars of development hours for a categorical breakdown. */
export function DevHoursBars({
  data,
  tokenMap,
}: {
  data: DevHoursPoint[];
  tokenMap: Record<string, string>;
}) {
  const t = useChartTheme();
  const height = Math.max(150, data.length * 46 + 24);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 4, left: 8 }}>
        <XAxis
          type="number"
          tick={{ fill: t.muted, fontSize: 13 }}
          tickLine={false}
          axisLine={{ stroke: t.border }}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={96}
          tick={{ fill: t.muted, fontSize: 14 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: t.mutedBg, opacity: 0.4 }}
          content={({ active, payload, label }) => (
            <ChartTooltip active={active} payload={payload} label={label} unit=" h" />
          )}
        />
        <Bar dataKey="devHours" name="Dev hours" radius={[0, 4, 4, 0]} animationDuration={700}>
          {data.map((d) => (
            <Cell key={d.label} fill={t.resolve(tokenMap[d.label] ?? "--chart-1")} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
