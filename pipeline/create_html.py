"""Export the dashboard as ONE self-contained HTML file you can email / share on Teams or SharePoint.

    uv run create-html                       # -> exports/automation-portfolio-dashboard.html
    uv run create-html --output my.html      # custom output path
    uv run create-html --skip-build          # reuse the last standalone build (data-only change)

Steps:
  1. Excel -> dashboard/public/data/projects.json   (same pipeline as build_data)
  2. npm run build:standalone                        (React app with JS + CSS inlined)
  3. Embed projects.json + world-map geometry into that page and write the final file.

The result is the same React dashboard (same charts, filters, theme toggle, PDF export),
with no server and no internet connection needed. Opening the file from disk (file://)
blocks `fetch`, so the data has to be inside the page; the app checks
`window.__DASHBOARD_DATA__` / `window.__GEO_DATA__` before fetching.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from . import build_data

ROOT = build_data.ROOT
DASHBOARD = ROOT / "dashboard"
DATA_JSON = build_data.DEFAULT_OUTPUT
GEO_JSON = DASHBOARD / "public" / "geo" / "countries-110m.json"
BUILT_HTML = DASHBOARD / "dist-standalone" / "index.html"
DEFAULT_OUTPUT = ROOT / "exports" / "automation-portfolio-dashboard.html"


def _embed_json(value: object) -> str:
    """Serialize for a <script> block: `</` would end the tag early, so escape it."""
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def build_standalone() -> None:
    npm = shutil.which("npm")
    if npm is None:
        raise SystemExit("ERROR: npm not found on PATH. Install Node.js, then run `npm install` in dashboard/.")
    if not (DASHBOARD / "node_modules").exists():
        raise SystemExit("ERROR: dashboard dependencies missing. Run: npm --prefix dashboard install --legacy-peer-deps")
    print("==> Building standalone dashboard (npm run build:standalone) ...")
    result = subprocess.run([npm, "run", "build:standalone"], cwd=DASHBOARD)
    if result.returncode != 0:
        raise SystemExit(f"ERROR: dashboard build failed (exit {result.returncode}).")


def inject_data(html: str, dataset: object, geo: object) -> str:
    payload = (
        "<script>"
        f"window.__DASHBOARD_DATA__={_embed_json(dataset)};"
        f"window.__GEO_DATA__={_embed_json(geo)};"
        "</script>"
    )
    # Must run before the app's module script, which lives in <head> after the theme script.
    marker = "</title>"
    if marker not in html:
        raise SystemExit(f"ERROR: could not find {marker} in {BUILT_HTML}; index.html structure changed.")
    return html.replace(marker, marker + "\n    " + payload, 1)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Export the dashboard as one self-contained HTML file.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--input", type=Path, default=build_data.DEFAULT_INPUT, help="Excel tracker")
    parser.add_argument("--sheet", default="Sheet1")
    parser.add_argument("--skip-build", action="store_true", help="Reuse the existing standalone build.")
    args = parser.parse_args(argv)

    print("==> Regenerating data from the Excel tracker ...")
    rc = build_data.main(["--input", str(args.input), "--sheet", args.sheet])
    if rc != 0:
        return rc

    if not args.skip_build or not BUILT_HTML.exists():
        build_standalone()

    html = BUILT_HTML.read_text(encoding="utf-8")
    dataset = json.loads(DATA_JSON.read_text(encoding="utf-8"))
    geo = json.loads(GEO_JSON.read_text(encoding="utf-8"))
    out = inject_data(html, dataset, geo)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(out, encoding="utf-8")
    size_kb = args.output.stat().st_size / 1024
    print(f"OK  ->  {args.output}  ({size_kb:,.0f} KB, {datetime.now():%Y-%m-%d %H:%M})")
    print("    Open it in any browser, or share it by email / Teams / SharePoint.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
