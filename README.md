# Automation Portfolio Dashboard

A premium, interactive web dashboard that turns a single Excel tracker of automation
projects into an executive-grade story of business impact — time saved, efficiency gains,
and global reach. Runs entirely locally, opens in a browser, light/dark mode included.

> **At a glance:** ~953 hours/year saved · 12 projects · 8 countries · ~92% avg. time reduction.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [First-time setup](#first-time-setup)
- [How to use](#how-to-use)
- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Dependencies](#dependencies)
- [Data model](#data-model)
- [Maintenance](#maintenance)
- [Documentation](#documentation)

---

## Overview

The dashboard is built around **one source of truth** — `data/project_tracker.xlsx` — and
two cleanly separated halves:

1. A **Python pipeline** reads the Excel file, validates and normalizes it, recomputes all
   metrics from raw inputs, and emits a single JSON file.
2. A **React app** fetches that JSON and renders it as an animated, filterable dashboard.

This decoupling means updating data never requires touching the UI, and vice-versa. The app
is a static build, so there is no server, database, or external service to run.

The experience is a scrollable executive narrative: **headline impact → where → what drove it
→ composition → detail**, with everything cross-filterable.

## Features

- **Animated hero** with a count-up of total hours reclaimed.
- **Filter-aware KPIs** that recount as you filter.
- **World bubble map** — impact by country; click a country to filter the whole dashboard.
- **Pareto analysis** proving a few projects drive most of the savings (80/20).
- **Ranked hours-by-project** bars and **composition donuts** (Status / Criticality / Role)
  whose slices act as filters.
- **Click-through detail panel** per project with a before/after visualization.
- **Light/dark mode**, smooth motion (respects `prefers-reduced-motion`), and projector-friendly typography.
- **Save as PDF** for a paper-clean snapshot.
- **Robust data pipeline** that fails loudly on bad data and auto-fixes source typos.

## Tech stack

The dataset is small but the bar for visual polish is high, so the stack is split by concern:

| Concern | Technology | Why here |
|---|---|---|
| **Data layer** | **Python** (`pandas`, `openpyxl`), via **uv** | Best-in-class for reading/validating Excel; keeps the data work in a familiar, scriptable place. Runs once per data change. |
| **UI framework** | **React 19 + TypeScript** | Largest ecosystem of premium, animated components; types catch data-shape drift against the pipeline. |
| **Build tool** | **Vite 6** | Instant dev server and a small, portable static build (`base: "./"`). |
| **Styling** | **Tailwind v4** | Token-driven light/dark theming with minimal CSS. |
| **Animation** | **Motion** (Framer) | Tasteful, reduced-motion-aware transitions and count-ups. |
| **State** | **Zustand** | Tiny global store for cross-filtering and theme. |
| **Charts** | **Recharts** | Declarative, composable charts (bars, Pareto, donuts). |
| **Map** | **react-simple-maps** | SVG world map for the country bubble layer (geometry bundled offline). |

**Where each language lives:** Python is *only* the `pipeline/` (Excel → JSON). Everything in
`dashboard/` is TypeScript/React. They communicate through one file: `projects.json`.

## First-time setup

**Prerequisites:** [uv](https://docs.astral.sh/uv/) (Python 3.13) and **Node 18+** (Node 24 recommended).

```sh
# from the repo root
uv sync                          # Python deps for the pipeline
npm --prefix dashboard install   # frontend deps
```

## How to use

### Run the dashboard (development)

```sh
uv run python -m pipeline.build_data   # generate data (first time / after edits)
npm --prefix dashboard run dev         # http://localhost:5173
```

### Build & preview (production)

```sh
npm --prefix dashboard run build       # typecheck + build -> dashboard/dist
npm --prefix dashboard run preview     # serve the production build locally
```

### One-command update (data + build)

After editing the Excel file, regenerate data **and** rebuild in a single step:

```sh
./scripts/update.ps1        # Windows (PowerShell) — flags: -DataOnly, -Serve
./scripts/update.sh         # macOS / Linux / Git Bash — flag: --data-only
```

Use `-DataOnly` / `--data-only` when `npm run dev` is already running — just refresh the browser.

### Export a snapshot

Click **Save as PDF** (top-right). It forces light mode, hides the nav/filters, and uses the
browser's print-to-PDF for a clean, paper-white copy — handy for decks or email.

## Architecture

```
┌─────────────────┐   uv run        ┌──────────────────┐   fetch    ┌──────────────┐
│ project_tracker │ ──────────────▶ │  Python pipeline │ ──JSON───▶ │  React app   │
│     .xlsx       │   build_data    │ clean + validate │            │ (static SPA) │
└─────────────────┘                 │ + derive metrics │            └──────────────┘
        ▲                           └──────────────────┘                   │
    you edit                                                          browser (local)
```

- **Stateless & offline** — no server, DB, or network calls at runtime.
- **Decoupled** — data changes re-run the pipeline; UI changes never touch Python.
- **Trustworthy metrics** — hours/reduction are recomputed from raw inputs, immune to stale
  Excel formulas. Bad data fails loudly; numeric drift is reported as a warning.

## Folder structure

```
automation-project-tracker/
├── data/project_tracker.xlsx       # source of truth (you edit this)
├── pipeline/                       # Python: Excel -> projects.json
│   ├── schema.py                   #   column map, label vocab, country codes, validation
│   ├── transform.py                #   normalize, recompute metrics, aggregates + insights
│   └── build_data.py               #   orchestrator (run as a module)
├── dashboard/                      # React + Vite + TS frontend
│   ├── public/
│   │   ├── data/projects.json      #   pipeline output (the data contract)
│   │   └── geo/countries-110m.json #   offline world map geometry
│   └── src/
│       ├── components/             #   charts/ map/ hero/ kpi/ explorer/ layout/ ui/
│       ├── lib/                    #   data loader, formatters, colors, geo, aggregation, palettes
│       ├── store/useFilters.ts     #   global filter state
│       ├── theme/useTheme.ts       #   shared light/dark store
│       ├── hooks/useCountUp.ts     #   number animation
│       ├── types/index.ts          #   types mirroring projects.json
│       └── index.css               #   design tokens (light/dark) + print styles
├── scripts/update.{ps1,sh}         # one-command: pipeline + build
├── docs/design-rationale.md        # why each visualization works
├── ARCHITECTURE.md                 # full plan (phases A–E)
├── CLAUDE.md                       # guidance for AI-assisted work in this repo
└── pyproject.toml                  # Python project + deps (uv)
```

## Dependencies

**Python** (`pyproject.toml`, via uv): `pandas`, `openpyxl`.

**Frontend** (`dashboard/package.json`, via npm):

| Package | Role |
|---|---|
| `react`, `react-dom` | UI framework |
| `vite`, `@vitejs/plugin-react` | Build/dev tooling |
| `typescript` | Type safety |
| `tailwindcss`, `@tailwindcss/vite` | Styling / theming |
| `motion` | Animation |
| `zustand` | Global state |
| `recharts` | Charts |
| `react-simple-maps`, `prop-types` | World map (install with `--legacy-peer-deps`) |
| `lucide-react` | Icons |
| `clsx`, `tailwind-merge` | Class-name utilities |

## Data model

`projects.json` = `{ generatedAt, source, projects[], portfolio, warnings[] }`.

Each project carries: `id, name, country, countryIso2/3, status, criticality, role,
frequencyPerYear, manualMinutes, autoMinutes, hoursBefore, hoursAfter, hoursSaved,
reductionPct`. The `portfolio` block holds precomputed totals, per-country/status/criticality/role
aggregates, a Pareto ranking, and auto-generated insights.

Allowed categorical values:

- **Status:** Active · Obsolete · On hold · On going
- **Criticality:** High · Medium · Low
- **Role:** Developed · Coached · Minor Fix

## Maintenance

### Add or update a project

1. Edit `data/project_tracker.xlsx` — fill the raw inputs (Frequency, Manual/Automation
   minutes); derived columns are recomputed for you.
2. Run `./scripts/update.ps1` (or `.sh`).
3. Preview with `npm --prefix dashboard run preview`.

### Add a new label (Status / Criticality / Role / Country)

The pipeline rejects unknown values with an exact message. To register a new one:

- Add it to the matching `*_CANON` map in `pipeline/schema.py` (and `COUNTRY_CODES` for a country).
- For a new **country**, also add its `[longitude, latitude]` to `COUNTRY_COORDS` in
  `dashboard/src/lib/geo.ts` so it appears on the map.

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — full system plan and roadmap (phases A–E).
- [`docs/design-rationale.md`](./docs/design-rationale.md) — why each visualization works.

