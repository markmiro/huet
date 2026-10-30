import React from "react";
import chroma from "chroma-js";
import { rampModes, type Color } from "huet/config";

// Pill stops, from full contrast down to the background itself
const pillContrasts = [100, 87.5, 75, 62.5, 50, 37.5, 25, 12.5, 0];

/** Colored ramps at full contrast on `bg`, sorted from furthest to nearest in lightness. */
export function swatchesByContrast(bg: Color) {
  const theme = bg.theme;
  return Object.keys(theme.ramps)
    .filter((rampKey) => {
      const mode = theme.ramps[rampKey].config.mode;
      return (
        rampKey !== theme.bgRamp &&
        (mode === rampModes.SIGNAL || mode === rampModes.FURTHEST)
      );
    })
    .map((rampKey) => {
      const color = bg.contrast(100, theme.ramps[rampKey]).hex;
      const distance = Math.abs(chroma(color).get("lab.l") - chroma(bg.hex).get("lab.l"));
      return { rampKey, color, distance };
    })
    .sort((a, b) => b.distance - a.distance);
}

/** The neutral colors reachable from `bg`, highest contrast first. */
export function neutralGradient(bg: Color) {
  const stops = pillContrasts.map((amount) => bg.contrast(amount).hex);
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

/**
 * A small summary of a theme as it appears on `bg`: its colors as dots,
 * highest contrast on the left, over a pill showing the gray ramp in the
 * same direction.
 */
export default function ThemeMiniMap({ bg }: { bg: Color }) {
  return (
    <span aria-hidden className="hc:flex hc:flex-col hc:gap-[.25em] hc:shrink-0">
      <span className="hc:flex hc:gap-[.25em]">
        {swatchesByContrast(bg).map(({ rampKey, color }) => (
          <span
            key={rampKey}
            title={rampKey}
            className="hc:size-[.625em] hc:rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      <span
        className="hc:h-[.375em] hc:rounded-full"
        style={{ backgroundImage: neutralGradient(bg) }}
      />
    </span>
  );
}
