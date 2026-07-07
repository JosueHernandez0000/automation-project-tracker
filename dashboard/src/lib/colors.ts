import { useMemo } from "react";

import { useTheme } from "@/theme/useTheme";
import type { CapabilityCenter, Criticality, Role, Status } from "@/types";

// A category keeps the same color in every chart so the eye can track it without a legend.
export const STATUS_TOKEN: Record<Status, string> = {
  Active: "--chart-1",
  "On going": "--chart-6",
  "On hold": "--chart-4",
  Obsolete: "--chart-5",
};

export const CRITICALITY_TOKEN: Record<Criticality, string> = {
  High: "--chart-5",
  Medium: "--chart-4",
  Low: "--chart-1",
};

export const ROLE_TOKEN: Record<Role, string> = {
  Developed: "--chart-2",
  Coached: "--chart-3",
  "Minor Fix": "--chart-6",
};

export const CAPABILITY_TOKEN: Record<CapabilityCenter, string> = {
  MCC: "--chart-2",
  KCC: "--chart-4",
};

const PALETTE_TOKENS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6"];

/**
 * Resolve design tokens to concrete color strings for libraries (Recharts, SVG) that
 * can't consume CSS var() in attributes. Recomputes on theme change so charts recolor
 * in lockstep with light/dark.
 */
export function useChartTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    const resolve = (token: string) => style.getPropertyValue(token).trim() || token;

    return {
      theme,
      resolve,
      palette: PALETTE_TOKENS.map(resolve),
      statusColor: (s: Status) => resolve(STATUS_TOKEN[s]),
      criticalityColor: (c: Criticality) => resolve(CRITICALITY_TOKEN[c]),
      roleColor: (r: Role) => resolve(ROLE_TOKEN[r]),
      foreground: resolve("--foreground"),
      muted: resolve("--muted-foreground"),
      mutedBg: resolve("--muted"),
      border: resolve("--border"),
      card: resolve("--card"),
      brand: resolve("--brand"),
      brand2: resolve("--brand-2"),
      accent: resolve("--accent"),
    };
    // theme is the trigger: tokens change value when the .dark class flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}

export type ChartTheme = ReturnType<typeof useChartTheme>;
