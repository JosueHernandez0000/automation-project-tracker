"""Transform: normalize rows, recompute derived metrics, and build portfolio aggregates.

Derived metrics (hoursBefore/After/Saved, reductionPct) are recomputed from raw inputs
so the dashboard never inherits a stale Excel formula. When the workbook's own value
disagrees beyond tolerance, we record a warning rather than failing.
"""

from __future__ import annotations

from . import schema

# Standard working-hours assumption for "human" framing of the headline number.
WORKDAY_HOURS = 8

# Tolerance when comparing our recomputed value against the workbook's own column.
_TOL = 0.5  # hours


def _canon(value, table: dict[str, str], field: str, row_id) -> str:
    key = str(value).strip().casefold()
    if key not in table:
        raise schema.SchemaError(
            f"Row {row_id}: unrecognized {field} {value!r}. "
            f"Add it to {field.upper()}_CANON in schema.py if it is valid."
        )
    return table[key]


def normalize_project(raw: dict, warnings: list[str]) -> dict:
    """Clean one row into a typed project dict with recomputed derived metrics."""
    rid = raw.get("id")

    name = str(raw["name"]).strip()
    country = _canon(raw["country"], schema.COUNTRY_CANON, "country", rid)
    status = _canon(raw["status"], schema.STATUS_CANON, "status", rid)
    criticality = _canon(raw["criticality"], schema.CRITICALITY_CANON, "criticality", rid)
    role = _canon(raw["role"], schema.ROLE_CANON, "role", rid)

    freq = float(raw["frequencyPerYear"])
    manual = float(raw["manualMinutes"])
    auto = float(raw["autoMinutes"])

    for label, val in (("frequencyPerYear", freq), ("manualMinutes", manual), ("autoMinutes", auto)):
        if val < 0:
            raise schema.SchemaError(f"Row {rid}: {label} is negative ({val}).")
    if auto > manual:
        warnings.append(f"Row {rid} ({name}): automation time ({auto}m) exceeds manual time ({manual}m).")

    # Recompute from raw inputs — the trustworthy source of truth.
    hours_before = freq * manual / 60.0
    hours_after = freq * auto / 60.0
    hours_saved = hours_before - hours_after
    reduction_pct = (1 - auto / manual) * 100.0 if manual > 0 else 0.0

    # Cross-check against the workbook's own derived columns; warn on drift.
    _check(rid, name, "hoursBefore", raw.get("hoursBefore"), hours_before, warnings)
    _check(rid, name, "hoursAfter", raw.get("hoursAfter"), hours_after, warnings)
    _check(rid, name, "hoursSaved", raw.get("hoursSaved"), hours_saved, warnings)

    codes = schema.COUNTRY_CODES[country]
    return {
        "id": int(rid),
        "name": name,
        "country": country,
        "countryIso2": codes["iso2"],
        "countryIso3": codes["iso3"],
        "status": status,
        "criticality": criticality,
        "role": role,
        "frequencyPerYear": round(freq, 4),
        "manualMinutes": round(manual, 4),
        "autoMinutes": round(auto, 4),
        "hoursBefore": round(hours_before, 2),
        "hoursAfter": round(hours_after, 2),
        "hoursSaved": round(hours_saved, 2),
        "reductionPct": round(reduction_pct, 1),
    }


def _check(rid, name, field, workbook_val, computed, warnings: list[str]) -> None:
    if workbook_val is None:
        return
    try:
        if abs(float(workbook_val) - computed) > _TOL:
            warnings.append(
                f"Row {rid} ({name}): workbook {field}={float(workbook_val):.2f} "
                f"differs from recomputed {computed:.2f}; using recomputed."
            )
    except (TypeError, ValueError):
        warnings.append(f"Row {rid} ({name}): workbook {field}={workbook_val!r} is not numeric.")


# --- Aggregation ----------------------------------------------------------------

def _group(projects: list[dict], key: str) -> list[dict]:
    buckets: dict[str, dict] = {}
    for p in projects:
        b = buckets.setdefault(p[key], {"label": p[key], "count": 0, "hoursSaved": 0.0})
        b["count"] += 1
        b["hoursSaved"] += p["hoursSaved"]
    rows = sorted(buckets.values(), key=lambda r: r["hoursSaved"], reverse=True)
    for r in rows:
        r["hoursSaved"] = round(r["hoursSaved"], 2)
    return rows


def _by_country(projects: list[dict]) -> list[dict]:
    buckets: dict[str, dict] = {}
    for p in projects:
        b = buckets.setdefault(p["country"], {
            "country": p["country"],
            "countryIso2": p["countryIso2"],
            "countryIso3": p["countryIso3"],
            "projectCount": 0,
            "hoursSaved": 0.0,
        })
        b["projectCount"] += 1
        b["hoursSaved"] += p["hoursSaved"]
    rows = sorted(buckets.values(), key=lambda r: r["hoursSaved"], reverse=True)
    for r in rows:
        r["hoursSaved"] = round(r["hoursSaved"], 2)
    return rows


def _pareto(projects: list[dict], total: float) -> list[dict]:
    ranked = sorted(projects, key=lambda p: p["hoursSaved"], reverse=True)
    out, cum = [], 0.0
    for p in ranked:
        cum += p["hoursSaved"]
        out.append({
            "id": p["id"],
            "name": p["name"],
            "country": p["country"],
            "hoursSaved": p["hoursSaved"],
            "cumulativePct": round(cum / total * 100, 1) if total else 0.0,
        })
    return out


def _insights(projects: list[dict], total: float, by_country: list[dict]) -> list[dict]:
    insights: list[dict] = []
    ranked = sorted(projects, key=lambda p: p["hoursSaved"], reverse=True)

    # How few projects drive the bulk of the savings.
    if total > 0:
        cum, n = 0.0, 0
        for p in ranked:
            cum += p["hoursSaved"]
            n += 1
            if cum >= total * 0.8:
                break
        insights.append({
            "kind": "concentration",
            "headline": f"Top {n} automations deliver 80% of all hours saved",
            "value": n,
        })

    if by_country:
        lead = by_country[0]
        insights.append({
            "kind": "leadingCountry",
            "headline": f"{lead['country']} leads with {lead['hoursSaved']:.0f} hours/year saved",
            "value": lead["country"],
        })

    insights.append({
        "kind": "workdays",
        "headline": f"That's {total / WORKDAY_HOURS:.0f} working days reclaimed every year",
        "value": round(total / WORKDAY_HOURS, 0),
    })
    return insights


def build_portfolio(projects: list[dict]) -> dict:
    total = sum(p["hoursSaved"] for p in projects)
    countries = _by_country(projects)
    avg_reduction = sum(p["reductionPct"] for p in projects) / len(projects) if projects else 0.0
    return {
        "totalHoursSaved": round(total, 2),
        "projectCount": len(projects),
        "countryCount": len(countries),
        "avgReductionPct": round(avg_reduction, 1),
        "activeCount": sum(1 for p in projects if p["status"] == "Active"),
        "totalWorkdaysSaved": round(total / WORKDAY_HOURS, 1),
        "byCountry": countries,
        "byStatus": _group(projects, "status"),
        "byCriticality": _group(projects, "criticality"),
        "byRole": _group(projects, "role"),
        "paretoRanking": _pareto(projects, total),
        "insights": _insights(projects, total, countries),
    }
