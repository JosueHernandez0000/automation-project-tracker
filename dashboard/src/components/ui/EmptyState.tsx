import { FilterX } from "lucide-react";

import { useFilters } from "@/store/useFilters";

/** Shown in a chart card when the active filters match no projects. */
export function EmptyState({ message }: { message?: string }) {
  const clear = useFilters((s) => s.clear);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <FilterX className="h-7 w-7 text-muted-foreground" />
      <p className="text-muted-foreground">
        {message ?? "No projects match the current filters."}
      </p>
      <button
        type="button"
        onClick={clear}
        className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-accent/60 hover:text-foreground"
      >
        Clear filters
      </button>
    </div>
  );
}
