// Representative [longitude, latitude] per location, for the bubble map.
// "Caribbean" is a region (no ISO country) — placed in the Caribbean Sea.
export const COUNTRY_COORDS: Record<string, [number, number]> = {
  Mexico: [-102, 23.5],
  USA: [-98, 39],
  Brazil: [-51, -10],
  Peru: [-75, -9],
  Ecuador: [-78.2, -1.5],
  Italy: [12.5, 42],
  Spain: [-3.7, 40.2],
  Colombia: [-73.5, 4.5],
  Caribbean: [-66, 18],
};

export function coordsFor(country: string): [number, number] | null {
  return COUNTRY_COORDS[country] ?? null;
}
