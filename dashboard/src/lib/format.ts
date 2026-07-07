/** Number / unit formatters shared across the dashboard. */

const numberFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const numberFmt1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

export function formatHours(value: number): string {
  return `${numberFmt.format(value)} h`;
}

export function formatPercent(value: number): string {
  return `${numberFmt1.format(value)}%`;
}

export function formatDecimal(value: number): string {
  return numberFmt1.format(value);
}

/** Leverage / return multiple, e.g. 3.4×. */
export function formatRatio(value: number | null): string {
  return value === null ? "—" : `${numberFmt1.format(value)}×`;
}

/** Payback period in weeks, e.g. "3.2 wks". */
export function formatWeeks(value: number | null): string {
  return value === null ? "—" : `${numberFmt1.format(value)} wks`;
}
