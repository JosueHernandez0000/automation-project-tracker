import { create } from "zustand";

import type { CapabilityCenter, Criticality, Project, Role, Status } from "@/types";

/**
 * Global filter state. Every visualization reads from here so selecting a country,
 * status, criticality, role, or capability center filters the entire dashboard at once.
 */
interface FilterState {
  country: string | null;
  statuses: Status[];
  criticalities: Criticality[];
  roles: Role[];
  capabilityCenters: CapabilityCenter[];

  setCountry: (country: string | null) => void;
  toggleStatus: (status: Status) => void;
  toggleCriticality: (criticality: Criticality) => void;
  toggleRole: (role: Role) => void;
  toggleCapabilityCenter: (center: CapabilityCenter) => void;
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
  capabilityCenters: [],

  setCountry: (country) => set((s) => ({ country: s.country === country ? null : country })),
  toggleStatus: (status) => set((s) => ({ statuses: toggle(s.statuses, status) })),
  toggleCriticality: (criticality) =>
    set((s) => ({ criticalities: toggle(s.criticalities, criticality) })),
  toggleRole: (role) => set((s) => ({ roles: toggle(s.roles, role) })),
  toggleCapabilityCenter: (center) =>
    set((s) => ({ capabilityCenters: toggle(s.capabilityCenters, center) })),
  clear: () => set({ country: null, statuses: [], criticalities: [], roles: [], capabilityCenters: [] }),
}));

type FilterFacets = Pick<
  FilterState,
  "country" | "statuses" | "criticalities" | "roles" | "capabilityCenters"
>;

/** True when no filter is active. */
export function isFilterActive(s: FilterFacets): boolean {
  return (
    s.country !== null ||
    s.statuses.length > 0 ||
    s.criticalities.length > 0 ||
    s.roles.length > 0 ||
    s.capabilityCenters.length > 0
  );
}

/** Apply the active filters to a project list (pure — usable anywhere). */
export function applyFilters(projects: Project[], f: FilterFacets): Project[] {
  return projects.filter((p) => {
    if (f.country && p.country !== f.country) return false;
    if (f.statuses.length && !f.statuses.includes(p.status)) return false;
    if (f.criticalities.length && !f.criticalities.includes(p.criticality)) return false;
    if (f.roles.length && !f.roles.includes(p.role)) return false;
    if (f.capabilityCenters.length && !f.capabilityCenters.includes(p.capabilityCenter)) return false;
    return true;
  });
}
