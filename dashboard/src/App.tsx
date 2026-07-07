import { useEffect, useState } from "react";

import { CapacityBreakdown } from "@/components/capacity/CapacityBreakdown";
import { ParetoChart } from "@/components/charts/ParetoChart";
import { CompositionDonuts } from "@/components/charts/CompositionDonuts";
import { HoursByProjectChart } from "@/components/charts/HoursByProjectChart";
import { EfficiencyView } from "@/components/efficiency/EfficiencyView";
import { ProjectDetail } from "@/components/explorer/ProjectDetail";
import { HeroImpact } from "@/components/hero/HeroImpact";
import { KpiStrip } from "@/components/kpi/KpiStrip";
import { FilterBar } from "@/components/layout/FilterBar";
import { Section } from "@/components/layout/Section";
import { TopBar } from "@/components/layout/TopBar";
import { WorldImpactMap } from "@/components/map/WorldImpactMap";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { totals } from "@/lib/aggregate";
import { STATUS_TOKEN, useChartTheme } from "@/lib/colors";
import { loadDataset } from "@/lib/data";
import { formatNumber, formatPercent } from "@/lib/format";
import { applyFilters, useFilters } from "@/store/useFilters";
import type { Dataset, Project } from "@/types";

export default function App() {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDataset()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (error) {
    return (
      <Centered>
        <p className="text-lg font-semibold">Could not load data</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
      </Centered>
    );
  }

  if (!data) {
    return (
      <Centered>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </Centered>
    );
  }

  return <Dashboard data={data} />;
}

function Dashboard({ data }: { data: Dataset }) {
  const filters = useFilters();
  const filtered = applyFilters(data.projects, filters);
  const t = totals(filtered);
  const theme = useChartTheme();
  const [selected, setSelected] = useState<Project | null>(null);
  const isEmpty = filtered.length === 0;

  return (
    <div className="min-h-screen">
      <TopBar />
      <HeroImpact portfolio={data.portfolio} />
      <FilterBar projects={data.projects} />

      <Section title="Portfolio metrics" subtitle="Reacts to the filters above.">
        <KpiStrip totals={t} />
      </Section>

      <Section
        title="Where the impact lands"
        subtitle="Bubble size = hours saved per year. Click a country to filter the dashboard."
      >
        <Card className="p-4">
          {isEmpty ? <EmptyState /> : <WorldImpactMap projects={filtered} />}
        </Card>
      </Section>

      <Section
        title="What drove the result"
        subtitle="Pareto: a few high-leverage automations carry most of the savings."
      >
        <Card className="p-5">
          {isEmpty ? <EmptyState /> : <ParetoChart projects={filtered} />}
        </Card>
      </Section>

      <Section title="Hours saved by project" subtitle="Ranked, colored by status.">
        <Card className="p-5">
          {isEmpty ? <EmptyState /> : <HoursByProjectChart projects={filtered} />}
        </Card>
      </Section>

      <Section
        title="Portfolio composition"
        subtitle="Click any slice to filter. Shows the full portfolio for reference."
      >
        <CompositionDonuts projects={data.projects} />
      </Section>

      <Section
        title="Where the effort went"
        subtitle="Development hours invested — the capacity behind the portfolio."
      >
        {isEmpty ? <EmptyState /> : <CapacityBreakdown projects={filtered} />}
      </Section>

      <Section
        title="What the effort returned"
        subtitle="Effort vs impact: one-time build hours against annual hours saved."
      >
        {isEmpty ? <EmptyState /> : <EfficiencyView projects={filtered} totals={t} />}
      </Section>

      <Section title="Projects" subtitle={`${filtered.length} shown · click any row for full details`}>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <Th>Process</Th>
                  <Th>Center</Th>
                  <Th>Country</Th>
                  <Th>Status</Th>
                  <Th>Criticality</Th>
                  <Th className="text-right">Dev (h)</Th>
                  <Th className="text-right">Before (h/yr)</Th>
                  <Th className="text-right">After (h/yr)</Th>
                  <Th className="text-right">Hours saved</Th>
                  <Th className="text-right">Reduction</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/60"
                  >
                    <Td className="font-medium">{p.name}</Td>
                    <Td className="text-muted-foreground">{p.capabilityCenter}</Td>
                    <Td className="text-muted-foreground">{p.country}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: theme.resolve(STATUS_TOKEN[p.status]) }}
                        />
                        {p.status}
                      </span>
                    </Td>
                    <Td className="text-muted-foreground">{p.criticality}</Td>
                    <Td className="text-right tabular-nums text-muted-foreground">
                      {formatNumber(p.devHours)}
                    </Td>
                    <Td className="text-right tabular-nums text-muted-foreground">
                      {formatNumber(p.hoursBefore)}
                    </Td>
                    <Td className="text-right tabular-nums text-muted-foreground">
                      {formatNumber(p.hoursAfter)}
                    </Td>
                    <Td className="text-right tabular-nums">{formatNumber(p.hoursSaved)}</Td>
                    <Td className="text-right tabular-nums">{formatPercent(p.reductionPct)}</Td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <Td className="py-8 text-center text-muted-foreground" colSpan={10}>
                      No projects match the current filters.
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {data.warnings.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">
            {data.warnings.length} pipeline warning(s). Source: {data.source}
          </p>
        )}
      </Section>

      <footer className="mx-auto max-w-7xl px-6 pb-12 pt-4 text-xs text-muted-foreground">
        Generated {new Date(data.generatedAt).toLocaleString()} · source {data.source}
      </footer>

      <ProjectDetail project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {children}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}

function Td({
  children,
  className = "",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={`px-4 py-3 ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
