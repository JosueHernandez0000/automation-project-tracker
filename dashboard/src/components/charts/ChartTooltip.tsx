import { formatNumber } from "@/lib/format";

interface TooltipEntry {
  name?: string | number;
  value?: string | number | readonly (string | number)[];
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string | number;
  unit?: string;
}

/** Card-styled tooltip shared by all Recharts charts (matches the design system). */
export function ChartTooltip({ active, payload, label, unit = "" }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-lg">
      {label != null && label !== "" && (
        <p className="mb-1 font-medium text-card-foreground">{label}</p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.name}</span>
          <span className="ml-auto font-medium tabular-nums text-card-foreground">
            {formatNumber(Number(entry.value))}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}
