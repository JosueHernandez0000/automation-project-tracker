#!/usr/bin/env pwsh
# One-command update: regenerate the dashboard data from the Excel file, then build.
#
#   ./scripts/update.ps1            # regenerate data + production build
#   ./scripts/update.ps1 -DataOnly  # regenerate data only (for `npm run dev` workflow)
#   ./scripts/update.ps1 -Serve     # regenerate + build + open the preview server

param(
    [switch]$DataOnly,
    [switch]$Serve
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "==> Regenerating dashboard data from data/project_tracker.xlsx ..." -ForegroundColor Cyan
uv run python -m pipeline.build_data

if ($DataOnly) {
    Write-Host "Data regenerated. If `npm run dev` is running, just refresh the browser." -ForegroundColor Green
    return
}

Write-Host "==> Building dashboard ..." -ForegroundColor Cyan
npm --prefix dashboard run build

Write-Host "Done. Build output is in dashboard/dist." -ForegroundColor Green

if ($Serve) {
    Write-Host "==> Starting preview server (Ctrl+C to stop) ..." -ForegroundColor Cyan
    npm --prefix dashboard run preview
} else {
    Write-Host "Preview locally with: npm --prefix dashboard run preview" -ForegroundColor Green
}
