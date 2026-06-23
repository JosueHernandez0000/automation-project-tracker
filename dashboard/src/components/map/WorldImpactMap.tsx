import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import { useChartTheme } from "@/lib/colors";
import { byCountry } from "@/lib/aggregate";
import { coordsFor } from "@/lib/geo";
import { formatNumber } from "@/lib/format";
import { useFilters } from "@/store/useFilters";
import type { Project } from "@/types";

const GEO_URL = `${import.meta.env.BASE_URL}geo/countries-110m.json`;

/**
 * Bubble map: one circle per country, area-proportional to hours saved, clickable to
 * filter the whole dashboard. Bubbles (not a choropleth) keep impact independent of
 * landmass and let "Caribbean" — a region with no ISO code — be represented honestly.
 */
export function WorldImpactMap({ projects }: { projects: Project[] }) {
  const t = useChartTheme();
  const selectedCountry = useFilters((s) => s.country);
  const setCountry = useFilters((s) => s.setCountry);
  const [hovered, setHovered] = useState<string | null>(null);

  const points = byCountry(projects).filter((p) => coordsFor(p.country));
  const maxHours = Math.max(1, ...points.map((p) => p.hoursSaved));
  const radius = (hours: number) => 6 + (Math.sqrt(hours) / Math.sqrt(maxHours)) * 18;

  // Crop the empty Pacific / islands on the far left while keeping the right edge fixed.
  // CROP_LEFT is the fraction trimmed from the left; bump it to crop more. The map is
  // scaled up so the remaining (right) portion fills the container.
  const CROP_LEFT = 0.16;
  const scale = 1 / (1 - CROP_LEFT);

  return (
    <div className="relative w-full overflow-hidden">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 165, center: [-30, 15] }}
        height={440}
        style={{
          width: `${scale * 100}%`,
          height: "auto",
          marginLeft: `-${CROP_LEFT * scale * 100}%`,
        }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={t.mutedBg}
                stroke={t.border}
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: t.mutedBg },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Pass 1: bubbles. */}
        {points.map((p) => {
          const isSelected = selectedCountry === p.country;
          const isHovered = hovered === p.country;
          const dim = selectedCountry !== null && !isSelected;
          return (
            <Marker
              key={p.country}
              coordinates={coordsFor(p.country)!}
              onClick={() => setCountry(p.country)}
              onMouseEnter={() => setHovered(p.country)}
              onMouseLeave={() => setHovered(null)}
              style={{ default: { cursor: "pointer" } }}
            >
              <circle
                r={radius(p.hoursSaved) * (isHovered ? 1.12 : 1)}
                fill={t.brand}
                fillOpacity={dim ? 0.25 : 0.7}
                stroke={isSelected ? t.brand2 : t.brand}
                strokeWidth={isSelected ? 2.5 : 1}
                style={{ transition: "r 0.15s ease, fill-opacity 0.2s ease" }}
              />
            </Marker>
          );
        })}

        {/* Pass 2: labels — drawn after every bubble so they always sit on top, each
            with a background-colored halo so they stay legible across any circle. */}
        {points.map((p) => {
          const dim = selectedCountry !== null && selectedCountry !== p.country;
          return (
            <Marker key={`label-${p.country}`} coordinates={coordsFor(p.country)!}>
              <text
                textAnchor="middle"
                y={radius(p.hoursSaved) + 14}
                style={{
                  fill: t.foreground,
                  fontSize: 12,
                  fontWeight: 600,
                  paintOrder: "stroke",
                  stroke: t.card,
                  strokeWidth: 3.5,
                  strokeLinejoin: "round",
                  opacity: dim ? 0.4 : 1,
                  pointerEvents: "none",
                }}
              >
                {p.country}
              </text>
            </Marker>
          );
        })}
      </ComposableMap>

      {hovered && (
        <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-lg">
          <p className="font-medium">{hovered}</p>
          <p className="text-muted-foreground">
            {formatNumber(points.find((p) => p.country === hovered)?.hoursSaved ?? 0)} h/year ·{" "}
            {points.find((p) => p.country === hovered)?.projectCount} project(s)
          </p>
        </div>
      )}
    </div>
  );
}
