import { create } from "zustand";

import type { Criticality, Project, Role, Status } from "@/types";

/**
 * Global filter state. Every visualization reads from here so selecting a country,
 * status, criticality, or role filters the entire dashboard at once.
 */
interface FilterState {
  country: string | null;
  statuses: Status[];
  criticalities: Criticality[];
  roles: Role[];

  setCountry: (country: string | null) => void;
  toggleStatus: (status: Status) => void;
  toggleCriticality: (criticality: Criticality) => void;
  toggleRole: (role: Role) => void;
  clear: () => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export const useFilters = create<FilterState>((set) => ({
  country: null,
  statuses: [],
  criticalities: [],
  roles: [],

  setCountry: (country) => set((s) => ({ country: s.country === country ? null : country })),
  toggleStatus: (status) => set((s) => ({ statuses: toggle(s.statuses, status) })),
  toggleCriticality: (criticality) =>
    set((s) => ({ criticalities: toggle(s.criticalities, criticality) })),
  toggleRole: (role) => set((s) => ({ roles: toggle(s.roles, role) })),
  clear: () => set({ country: null, statuses: [], criticalities: [], roles: [] }),
}));

/** True when no filter is active. */
export function isFilterActive(s: Pick<FilterState, "country" | "statuses" | "criticalities" | "roles">): boolean {
  return s.country !== null || s.statuses.length > 0 || s.criticalities.length > 0 || s.roles.length > 0;
}

/** Apply the active filters to a project list (pure — usable anywhere). */
export function applyFilters(
  projects: Project[],
  f: Pick<FilterState, "country" | "statuses" | "criticalities" | "roles">,
): Project[] {
  return projects.filter((p) => {
    if (f.country && p.country !== f.country) return false;
    if (f.statuses.length && !f.statuses.includes(p.status)) return false;
    if (f.criticalities.length && !f.criticalities.includes(p.criticality)) return false;
    if (f.roles.length && !f.roles.includes(p.role)) return false;
    return true;
  });
}
