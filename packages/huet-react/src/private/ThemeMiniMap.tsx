import React from "react";
import chroma from "chroma-js";
import type { ResolvedTheme, Surface } from "huet/internal";

// Pill stops, from full contrast down to the background itself
const pillContrasts = [100, 87.5, 75, 62.5, 50, 37.5, 25, 12.5, 0];
const hues = ["red", "yellow", "green", "blue", "purple"] as const;

/** Each hue at full strength on `bg`, sorted from furthest to nearest in lightness. */
export function swatchesByContrast(theme: ResolvedTheme, bg: Surface) {
  const lightness = (hex: string) => chroma(hex).get("lab.l");
  return hues
    .map((hue) => {
      const color = theme.step(bg, 100, hue).hex;
      return { hue, color, distance: Math.abs(lightness(color) - lightness(bg.hex)) };
    })
    .sort((a, b) => b.distance - a.distance);
}

/** The neutral colors reachable from `bg`, highest contrast first. */
export function neutralGradient(theme: ResolvedTheme, bg: Surface) {
  const stops = pillContrasts.map((amount) => theme.step(bg, amount).hex);
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

/**
 * A small summary of a theme as it appears on `bg`: its colors as dots,
 * highest contrast on the left, over a pill showing the gray ramp in the
 * same direction.
 */
export default function ThemeMiniMap({ theme, bg }: { theme: ResolvedTheme; bg: Surface }) {
  return (
    <span aria-hidden className="hc:flex hc:flex-col hc:gap-[.25em] hc:shrink-0">
      <span className="hc:flex hc:gap-[.25em]">
        {swatchesByContrast(theme, bg).map(({ hue, color }) => (
          <span
            key={hue}
            title={hue}
            className="hc:size-[.625em] hc:rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      <span
        className="hc:h-[.375em] hc:rounded-full"
        style={{ backgroundImage: neutralGradient(theme, bg) }}
      />
    </span>
  );
}
