# Automation Portfolio Dashboard — Architecture & Plan

> Status: **Planning approved** · No code yet · Last updated: 2026-06-23

An interactive, premium web dashboard that turns `data/project_tracker.xlsx` into an
executive narrative of automation impact. Built to be shown **live on a laptop/projector**
and to make the **business-impact story** (≈953 hours/year saved) land in three seconds.

---

## Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Frontend stack | **React + Vite + TypeScript** | Highest "wow" ceiling + richest premium component ecosystem |
| Data layer | **Python pipeline** (`pandas` + `openpyxl`) → static JSON | Stay in comfort zone; decoupled from UI |
| Primary goal | **Clear business impact** | Hero number, auto-insights, and Pareto get the most design budget |
| Delivery context | **Live on laptop/projector** | Big-screen layout, projector legibility (high contrast, large type), smooth motion |
| Themes | Light + dark | Built-in toggle via Tailwind tokens |

---

## Source data (verified from the live file)

`data/project_tracker.xlsx` → Sheet1, **12 projects × 13 columns**:

`No, Process Name, Country, Status, Criticality, Role, Frequency (per year),
Manual Execution time (min), Automation Execution time (min),
h/year (before automation), h/year (after automation), h/year saved, %Reduction`

- **Countries (8):** Mexico, Peru, Ecuador, Brazil, Italy, USA, Spain, Caribbean
- **Status:** Active · Obsolete · On hold · On going
- **Criticality:** High · Medium · Low
- **Role:** Developed · Coached · Minor Fix
- **Headline metrics:** ~953 h/year saved · 12 projects · 8 countries · ~90%+ avg reduction
- **Data hygiene to fix in pipeline:** "Caribean"→"Caribbean", "Developped"→"Developed", trim "PPT Deck "

---

## Architecture

```
┌─────────────────┐   build step   ┌──────────────────┐   bundles   ┌──────────────┐
│ project_tracker │ ─────────────▶ │  Python pipeline │ ──JSON────▶ │  React app   │
│     .xlsx       │                │ (clean+derive)   │             │ (static SPA) │
└─────────────────┘                └──────────────────┘             └──────────────┘
        ▲                                                                   │
    you edit                                                          browser (local)
```

- **Stateless & offline** — no server, no DB, no network. Frontend reads static JSON.
- **Decoupled** — data changes → re-run pipeline; UI changes → never touch the pipeline.
- **One update command** — `scripts/update.ps1` runs pipeline + build.

---

## Technology assessment (summary)

| Option | Verdict | Reason |
|---|---|---|
| **React + Vite** | ✅ Chosen | Premium ecosystem (shadcn/Aceternity/Magic UI), Framer Motion, static build |
| Streamlit | ❌ | Recognizable "internal tool" look; weak animation control |
| Dash / Plotly | ❌ | Utilitarian visuals; overkill for 12 rows |
| Next.js | ⚠️ | Great but SSR/routing solves problems we don't have; Vite static is simpler. Upgrade path if hosting later |
| Vue | ⚠️ | Solid, smaller premium-component ecosystem |
| SvelteKit | ⚠️ | Strong runner-up; lost on ready-made executive components |
| Java (Vaadin/JavaFX) | ❌ | Heavyweight, dated defaults, weakest animation |
| Power BI / Tableau | ❌ | Excluded by requirement |

---

## Dashboard vision

**Concept:** *"The Automation Portfolio"* — a scrollable executive narrative, not a control panel.
Narrative arc: **Big number → Where → What drove it → Health → Detail.**

1. **Hero impact** — full-viewport, "**953 hours reclaimed every year**" counting up; aurora background.
2. **KPI strip** — Hours Saved · Projects · Countries · Avg Reduction · Active. Animated count-up.
3. **World impact map** — countries lit by impact; hover → projects + hours. Signature visual.
4. **Impact breakdown** — hours-saved-per-project bar + before/after + Pareto ("top 3 = X% of savings").
5. **Composition** — donuts/treemap by Status / Criticality / Role, cross-filterable.
6. **Project explorer** — filterable card grid; card → detail via shared-layout animation.

**Global filtering:** selecting a country or a Status/Criticality chip filters *every* section together.

**Motion rules:** ≤400ms, eased, purposeful; respect `prefers-reduced-motion`. Guides attention, never delays.

**Projector-specific:** high contrast, generous type scale, no thin 1px greys, test on a real projector.

---

## Folder structure

```
automation-project-tracker/
├── data/project_tracker.xlsx          # source of truth (you edit this)
├── pipeline/
│   ├── build_data.py                  # xlsx → validated, normalized projects.json
│   ├── transform.py                   # derive metrics, aggregates, insights
│   └── schema.py                      # column mapping + validation rules
├── dashboard/
│   ├── public/data/projects.json      # pipeline output
│   ├── src/
│   │   ├── main.tsx, App.tsx
│   │   ├── theme/                     # light/dark tokens, Tailwind config
│   │   ├── lib/                       # data loader, formatters, insight helpers
│   │   ├── components/
│   │   │   ├── layout/                # TopBar, ThemeToggle, FilterBar, Section
│   │   │   ├── hero/                  # HeroImpact, CountUp
│   │   │   ├── kpi/                   # KpiStrip, MetricCard
│   │   │   ├── map/                   # WorldImpactMap
│   │   │   ├── charts/                # HoursBar, BeforeAfter, CompositionDonut, Pareto
│   │   │   └── explorer/              # ProjectGrid, ProjectCard, ProjectDetail
│   │   ├── store/                     # global filter state (Zustand)
│   │   └── types/                     # TS types mirroring schema
│   ├── package.json, vite.config.ts, tailwind.config.ts
├── scripts/update.ps1                 # one command: pipeline + build
├── pyproject.toml
└── ARCHITECTURE.md
```

---

## Data model (frontend types)

```
Project {
  id, name, country, countryCode,
  status, criticality, role,
  frequencyPerYear, manualMinutes, autoMinutes,
  hoursBefore, hoursAfter, hoursSaved, reductionPct
}

Portfolio {
  totalHoursSaved, projectCount, countryCount, avgReductionPct, activeCount,
  byCountry[], byStatus[], byCriticality[], byRole[],
  paretoRanking[], insights[]   // pre-computed in Python at build time
}
```

Aggregates computed **once in Python** → frontend stays simple, fast, auditable.

---

## Dependencies

- **Pipeline:** `pandas`, `openpyxl`
- **Frontend:** `react`, `vite`, `typescript`, `tailwindcss`, `framer-motion`,
  `recharts`, `@visx/*` (optional), `react-simple-maps`, `zustand`, shadcn/ui primitives

---

## Implementation roadmap

| Phase | Objective | Complexity | Key risk | Success criteria |
|---|---|---|---|---|
| **A. Data pipeline** | Excel → clean JSON + derived metrics/insights | Low | Source data hygiene; column renames | One command regenerates correct JSON; bad data fails loudly |
| **B. Frontend skeleton** | Running app, design system, light/dark, data loading | Low–Med | Over-investing in tooling | App runs, toggles theme, renders data via store |
| **C. Core visualizations** | KPIs, charts, world map, cross-filtering | Med–High | Map country-matching; filter edge cases | Any filter updates every chart smoothly + correctly |
| **D. Premium polish** | Hero, motion, explorer, auto-insights | Med | Animation overload; jank | Stakeholders react to the *feel*; smooth on real laptop |
| **E. Hardening & handoff** | One-command update, README, edge states | Low | "Works on my machine" | Add a project → run one command → it appears |

---

## Future extensibility

- New columns (Cost $, Owner, Go-Live Date) → add to `schema.py` + a type + a component.
- Multiple sheets/trackers → pipeline merges to one JSON.
- Dated entries → add a time-trend section.
- Hosting later → static build drops onto any internal server; Next.js migration available.
- Deck export → "Download section as PNG/PDF."
