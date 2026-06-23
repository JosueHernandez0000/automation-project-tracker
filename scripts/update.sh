#!/usr/bin/env bash
# One-command update: regenerate the dashboard data from the Excel file, then build.
#
#   ./scripts/update.sh              # regenerate data + production build
#   ./scripts/update.sh --data-only  # regenerate data only (for `npm run dev` workflow)
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Regenerating dashboard data from data/project_tracker.xlsx ..."
uv run python -m pipeline.build_data

if [ "${1:-}" = "--data-only" ]; then
  echo "Data regenerated. If 'npm run dev' is running, just refresh the browser."
  exit 0
fi

echo "==> Building dashboard ..."
npm --prefix dashboard run build

echo "Done. Build output is in dashboard/dist."
echo "Preview locally with: npm --prefix dashboard run preview"
