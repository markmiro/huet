import React, { useMemo } from "react";
import type { Theme } from "huet";
import { resolveTheme } from "huet/internal";

import { Slider } from "./ui/slider";

/**
 * Where the background can sit on the neutral ramp: fine steps near each end,
 * where most pages are, and 49% and 51% for the middle on either side.
 */
export const backgroundStops = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.49, 0.51, 0.75, 0.8, 0.85, 0.9, 0.95, 1];

/** The stop nearest `background`, which the host may have set to anything. */
function nearestStop(background: number) {
  let best = 0;
  backgroundStops.forEach((stop, i) => {
    if (Math.abs(stop - background) < Math.abs(backgroundStops[best] - background)) best = i;
  });
  return best;
}

/**
 * A slider that snaps the page background to `backgroundStops`. Its track is
 * the edited theme's background at each stop, so it previews where each one
 * lands. The stops are evenly spaced on the track, not by value.
 */
export default function BackgroundSlider({
  theme,
  background,
  onChange,
}: {
  theme: Theme;
  background: number;
  onChange: (background: number) => void;
}) {
  const colors = useMemo(
    () => backgroundStops.map((stop) => resolveTheme(theme, { background: stop }).root.hex),
    [theme],
  );
  const index = nearestStop(background);
  const last = backgroundStops.length - 1;
  // One hard-edged band per stop, centered on where the thumb sits for it
  const track = `linear-gradient(to right, ${colors
    .map((color, i) => {
      const from = i === 0 ? 0 : ((i - 0.5) / last) * 100;
      const to = i === last ? 100 : ((i + 0.5) / last) * 100;
      return `${color} ${from}% ${to}%`;
    })
    .join(", ")})`;
  return (
    <div className="hc:flex hc:flex-col hc:gap-[.25em]">
      <Slider
        label="Background"
        min={0}
        max={last}
        step={1}
        value={index}
        onValueChange={(i) => onChange(backgroundStops[i])}
        track={track}
        thumbColor={colors[index]}
      />
      <div aria-hidden className="hc:flex hc:justify-between hc:text-[.75em] huet-text-50">
        <span>Dark</span>
        <span>Middle</span>
        <span>Light</span>
      </div>
    </div>
  );
}
