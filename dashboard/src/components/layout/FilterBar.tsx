import { X } from "lucide-react";

import { Chip } from "@/components/ui/Chip";
import { applyFilters, isFilterActive, useFilters } from "@/store/useFilters";
import type { Criticality, Project, Role, Status } from "@/types";

const STATUSES: Status[] = ["Active", "On going", "On hold", "Obsolete"];
const CRITICALITIES: Criticality[] = ["High", "Medium", "Low"];
const ROLES: Role[] = ["Developed", "Coached", "Minor Fix"];

/** Global filter controls. For Phase B this proves the store drives the whole app. */
export function FilterBar({ projects }: { projects: Project[] }) {
  const f = useFilters();
  const filtered = applyFilters(projects, f);
  const active = isFilterActive(f);

  return (
    <div className="sticky top-16 z-20 border-b border-border bg-background/70 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-3">
        <span className="mr-1 hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
          Status
        </span>
        {STATUSES.map((s) => (
          <Chip key={s} active={f.statuses.includes(s)} onClick={() => f.toggleStatus(s)}>
            {s}
          </Chip>
        ))}

        <span className="mx-1 ml-3 hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
          Criticality
        </span>
        {CRITICALITIES.map((c) => (
          <Chip key={c} active={f.criticalities.includes(c)} onClick={() => f.toggleCriticality(c)}>
            {c}
          </Chip>
        ))}

        <span className="mx-1 ml-3 hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
          Role
        </span>
        {ROLES.map((r) => (
          <Chip key={r} active={f.roles.includes(r)} onClick={() => f.toggleRole(r)}>
            {r}
          </Chip>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {filtered.length} / {projects.length} projects
          </span>
          {active && (
            <Chip onClick={f.clear} className="text-foreground">
              <X className="h-3.5 w-3.5" /> Clear
            </Chip>
          )}
        </div>
      </div>
    </div>
  );
}
