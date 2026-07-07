"""Schema: the single source of truth for how the Excel sheet maps to clean data.

If a column is renamed in the workbook, change it here in one place. Validation rules
and the canonical label vocabularies also live here so the rest of the pipeline can
stay focused on transformation.
"""

from __future__ import annotations

# --- Column mapping -------------------------------------------------------------
# Exact Excel header  ->  clean field name used everywhere downstream.
COLUMN_MAP: dict[str, str] = {
    "No": "id",
    "Process Name": "name",
    "Capability Center": "capabilityCenter",
    "Country": "country",
    "Status": "status",
    "Criticality": "criticality",
    "Role": "role",
    "Development time (hrs)": "devHours",
    "Frequency (per year)": "frequencyPerYear",
    "Manual Execution time (min)": "manualMinutes",
    "Automation Execution time (min)": "autoMinutes",
    "h/year (before automation)": "hoursBefore",
    "h/year (after automation)": "hoursAfter",
    "h/year saved": "hoursSaved",
    "%Reduction": "reductionPct",
}

# Raw inputs we recompute derived metrics from (so stale Excel formulas can't lie).
# devHours is a one-time build cost (not a rate), but it's still a numeric input we validate.
NUMERIC_INPUTS = ["frequencyPerYear", "manualMinutes", "autoMinutes", "devHours"]

# --- Canonical label vocabularies ----------------------------------------------
# Anything not in these maps (after trimming/casefold) fails validation loudly.
STATUS_CANON: dict[str, str] = {
    "active": "Active",
    "obsolete": "Obsolete",
    "on hold": "On hold",
    "on going": "On going",
    "ongoing": "On going",
}

CRITICALITY_CANON: dict[str, str] = {
    "high": "High",
    "medium": "Medium",
    "low": "Low",
}

# Business area a project belongs to. Controlled vocabulary — extend if more centers appear.
CAPABILITY_CENTER_CANON: dict[str, str] = {
    "mcc": "MCC",
    "kcc": "KCC",
}

ROLE_CANON: dict[str, str] = {
    "developped": "Developed",  # fix the source typo
    "developed": "Developed",
    "coached": "Coached",
    "minor fix": "Minor Fix",
}

# Country name normalization (typos / spelling) -> canonical display name.
COUNTRY_CANON: dict[str, str] = {
    "caribean": "Caribbean",
    "caribbean": "Caribbean",
    "mexico": "Mexico",
    "peru": "Peru",
    "ecuador": "Ecuador",
    "brazil": "Brazil",
    "italy": "Italy",
    "usa": "USA",
    "spain": "Spain",
    "colombia": "Colombia",
}

# Canonical name -> ISO codes. Used by the map and flag rendering on the frontend.
# "Caribbean" is a region, not a country: no ISO code (frontend treats it specially).
COUNTRY_CODES: dict[str, dict[str, str | None]] = {
    "Mexico": {"iso2": "MX", "iso3": "MEX"},
    "Peru": {"iso2": "PE", "iso3": "PER"},
    "Ecuador": {"iso2": "EC", "iso3": "ECU"},
    "Brazil": {"iso2": "BR", "iso3": "BRA"},
    "Italy": {"iso2": "IT", "iso3": "ITA"},
    "USA": {"iso2": "US", "iso3": "USA"},
    "Spain": {"iso2": "ES", "iso3": "ESP"},
    "Colombia": {"iso2": "CO", "iso3": "COL"},
    "Caribbean": {"iso2": None, "iso3": None},
}


class SchemaError(Exception):
    """Raised when the workbook does not match the expected schema or fails validation."""


def required_headers() -> set[str]:
    return set(COLUMN_MAP.keys())
