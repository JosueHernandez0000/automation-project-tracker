// Client-side aggregation so charts recompute under the active filters.
// Mirrors the logic in pipeline/transform.py (which produces the *unfiltered* portfolio).

import type { Project } from "@/types";

export interface Totals {
  hoursSaved: number;
  projectCount: number;
  countryCount: number;
  avgReductionPct: number;
  activeCount: number;
}

export function totals(projects: Project[]): Totals {
  const hoursSaved = projects.reduce((s, p) => s + p.hoursSaved, 0);
  const avg = projects.length
    ? projects.reduce((s, p) => s + p.reductionPct, 0) / projects.length
    : 0;
  return {
    hoursSaved,
    projectCount: projects.length,
    countryCount: new Set(projects.map((p) => p.country)).size,
    avgReductionPct: avg,
    activeCount: projects.filter((p) => p.status === "Active").length,
  };
}

export interface CountryPoint {
  country: string;
  hoursSaved: number;
  projectCount: number;
}

export function byCountry(projects: Project[]): CountryPoint[] {
  const map = new Map<string, CountryPoint>();
  for (const p of projects) {
    const c = map.get(p.country) ?? { country: p.country, hoursSaved: 0, projectCount: 0 };
    c.hoursSaved += p.hoursSaved;
    c.projectCount += 1;
    map.set(p.country, c);
  }
  return [...map.values()].sort((a, b) => b.hoursSaved - a.hoursSaved);
}

export interface GroupPoint {
  label: string;
  count: number;
  hoursSaved: number;
}

export function groupBy<K extends keyof Project>(projects: Project[], key: K): GroupPoint[] {
  const map = new Map<string, GroupPoint>();
  for (const p of projects) {
    const label = String(p[key]);
    const g = map.get(label) ?? { label, count: 0, hoursSaved: 0 };
    g.count += 1;
    g.hoursSaved += p.hoursSaved;
    map.set(label, g);
  }
  return [...map.values()].sort((a, b) => b.hoursSaved - a.hoursSaved);
}

export interface ParetoPoint {
  id: number;
  name: string;
  status: Project["status"];
  hoursSaved: number;
  cumulativePct: number;
}

export function pareto(projects: Project[]): ParetoPoint[] {
  const total = projects.reduce((s, p) => s + p.hoursSaved, 0);
  const ranked = [...projects].sort((a, b) => b.hoursSaved - a.hoursSaved);
  let cum = 0;
  return ranked.map((p) => {
    cum += p.hoursSaved;
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      hoursSaved: p.hoursSaved,
      cumulativePct: total ? (cum / total) * 100 : 0,
    };
  });
}
