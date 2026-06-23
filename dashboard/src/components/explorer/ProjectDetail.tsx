import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect } from "react";

import { CRITICALITY_TOKEN, ROLE_TOKEN, STATUS_TOKEN, useChartTheme } from "@/lib/colors";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Project } from "@/types";

/** Animated detail panel for a single project. Opens from a table row click. */
export function ProjectDetail({ project, onClose }: { project: Project | null; onClose: () => void }) {
  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && <DetailPanel project={project} onClose={onClose} />}
    </AnimatePresence>
  );
}

function DetailPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  const t = useChartTheme();
  const afterPct = project.hoursBefore > 0 ? (project.hoursAfter / project.hoursBefore) * 100 : 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${project.name} details`}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        {/* Accent header band */}
        <div className="bg-gradient-to-r from-brand/15 to-brand-2/15 px-6 pb-5 pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="pr-8 text-xl font-semibold tracking-tight">{project.name}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge label={project.country} />
            <Badge label={project.status} color={t.resolve(STATUS_TOKEN[project.status])} />
            <Badge label={`${project.criticality} criticality`} color={t.resolve(CRITICALITY_TOKEN[project.criticality])} />
            <Badge label={project.role} color={t.resolve(ROLE_TOKEN[project.role])} />
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Headline figures */}
          <div className="flex items-end gap-8">
            <div>
              <p className="text-3xl font-bold tracking-tight tabular-nums">
                {formatNumber(project.hoursSaved)}
                <span className="ml-1 text-base font-medium text-muted-foreground">h / year</span>
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">saved</p>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight tabular-nums text-brand">
                {formatPercent(project.reductionPct)}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">time reduction</p>
            </div>
          </div>

          {/* Before / after */}
          <div className="mt-6 space-y-3">
            <BeforeAfterBar label="Before automation" hours={project.hoursBefore} pct={100} color={t.brand} opacity={0.45} />
            <BeforeAfterBar label="After automation" hours={project.hoursAfter} pct={afterPct} color={t.brand} opacity={1} />
          </div>

          {/* Secondary metrics */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
            <Metric label="Runs / year" value={formatNumber(project.frequencyPerYear)} />
            <Metric label="Manual (min)" value={formatNumber(project.manualMinutes)} />
            <Metric label="Automated (min)" value={formatNumber(project.autoMinutes)} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs font-medium">
      {color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
      {label}
    </span>
  );
}

function BeforeAfterBar({
  label,
  hours,
  pct,
  color,
  opacity = 1,
}: {
  label: string;
  hours: number;
  pct: number;
  color: string;
  opacity?: number;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{formatNumber(hours)} h</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, opacity }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, pct)}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
