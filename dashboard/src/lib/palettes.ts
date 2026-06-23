// Seaborn-derived sequential colormaps (generated via seaborn.color_palette(...).as_hex()).
// Used for magnitude-encoded charts (e.g. the Pareto), where a continuous gradient is
// the right encoding. Categorical charts keep the semantic status palette instead.

export const PALETTES = {
  rocket: ["#251433", "#4c1d4b", "#751f58", "#a11a5b", "#cb1b4f", "#e83f3f", "#f3714d", "#f69c73", "#f7c6a6"],
  magma: ["#140e36", "#3b0f70", "#641a80", "#8c2981", "#b73779", "#de4968", "#f7705c", "#fe9f6d", "#fecf92"],
  crest: ["#28437b", "#215584", "#1c6689", "#24768b", "#33858d", "#44948f", "#57a490", "#6db290", "#89bf91"],
  viridis: ["#482475", "#414487", "#355f8d", "#2a788e", "#21918c", "#22a884", "#44bf70", "#7ad151", "#bddf26"],
} as const;

export type PaletteName = keyof typeof PALETTES;

/** The colormap used for the Pareto bars. Change here to switch globally. */
export const PARETO_PALETTE: PaletteName = "rocket";

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Sample a colormap at t ∈ [0,1], interpolating between its stops. */
export function sampleColormap(stops: readonly string[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const pos = clamped * (stops.length - 1);
  const i = Math.floor(pos);
  const frac = pos - i;
  if (i >= stops.length - 1) return stops[stops.length - 1];
  const [r1, g1, b1] = hexToRgb(stops[i]);
  const [r2, g2, b2] = hexToRgb(stops[i + 1]);
  return rgbToHex(r1 + (r2 - r1) * frac, g1 + (g2 - g1) * frac, b1 + (b2 - b1) * frac);
}
