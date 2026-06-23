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
