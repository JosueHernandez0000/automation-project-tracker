"""Build step: Excel  ->  validated, normalized  ->  dashboard/public/data/projects.json

Usage:
    uv run python -m pipeline.build_data
    uv run python -m pipeline.build_data --input data/project_tracker.xlsx --sheet Sheet1
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from . import schema, transform

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = ROOT / "data" / "project_tracker.xlsx"
DEFAULT_OUTPUT = ROOT / "dashboard" / "public" / "data" / "projects.json"


def load_rows(input_path: Path, sheet: str | int) -> list[dict]:
    """Read the workbook and rename columns to clean field names, validating headers."""
    df = pd.read_excel(input_path, sheet_name=sheet, engine="openpyxl")
    df.columns = [str(c).strip() for c in df.columns]

    missing = schema.required_headers() - set(df.columns)
    if missing:
        raise schema.SchemaError(
            f"Workbook is missing expected columns: {sorted(missing)}. "
            f"Found: {list(df.columns)}. Update COLUMN_MAP in schema.py if headers changed."
        )

    df = df.rename(columns=schema.COLUMN_MAP)
    df = df.dropna(subset=["id", "name"], how="any")  # skip blank/total rows
    return df.to_dict(orient="records")


def build(input_path: Path, sheet: str | int) -> dict:
    raw_rows = load_rows(input_path, sheet)
    if not raw_rows:
        raise schema.SchemaError("No data rows found in the workbook.")

    warnings: list[str] = []
    projects = [transform.normalize_project(r, warnings) for r in raw_rows]

    ids = [p["id"] for p in projects]
    if len(set(ids)) != len(ids):
        dupes = sorted({i for i in ids if ids.count(i) > 1})
        raise schema.SchemaError(f"Duplicate project ids found: {dupes}.")

    projects.sort(key=lambda p: p["id"])
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": str(input_path.relative_to(ROOT)).replace("\\", "/"),
        "projects": projects,
        "portfolio": transform.build_portfolio(projects),
        "warnings": warnings,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build projects.json from the Excel tracker.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--sheet", default="Sheet1")
    args = parser.parse_args(argv)

    if not args.input.exists():
        print(f"ERROR: input file not found: {args.input}", file=sys.stderr)
        return 1

    try:
        payload = build(args.input, args.sheet)
    except schema.SchemaError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    pf = payload["portfolio"]
    print(f"OK  ->  {args.output.relative_to(ROOT)}")
    print(
        f"    {pf['projectCount']} projects | {pf['countryCount']} countries | "
        f"{pf['totalHoursSaved']:.0f} h/year saved | {pf['avgReductionPct']:.0f}% avg reduction"
    )
    for w in payload["warnings"]:
        print(f"    WARN: {w}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
