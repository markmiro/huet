import chroma from "chroma-js";
import React from "react";
import { hues } from "huet";

import { useThemeConfigurator } from "../context";

// Ramp gradients and markers show the theme's own colors, which no Huet class
// expresses, so those are inline. Everything else uses classes.

/** CIELAB lightness from 0 to 1, which places each ramp under the black-to-white bar. */
const lightnessOf = (color: string) => Math.max(0, chroma(color).get("lab.l")) / 100;
const stops = Array.from({ length: 9 }, (_, i) => i / 8);

function Marker({ color, at }: { color: string; at: number }) {
  const size = "1em";
  return (
    <div
      // Background and foreground at 30% (scaled by contrast, like the shadows)
      className="hc:absolute hc:border hc:border-[color-mix(in_srgb,var(--huet-background)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:outline hc:outline-[color-mix(in_srgb,var(--huet-foreground)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:-outline-offset-2 hc:top-1/2 hc:-translate-y-1/2"
      style={{ backgroundColor: color, width: size, height: size, left: `calc(${at * 100}% - ${size} * ${at})` }}
    />
  );
}

/** A ramp's gradient, placed by lightness, with a marker on each of its own colors. */
function Ramp({ sample, markers }: { sample: (t: number) => string; markers: string[] }) {
  const [start, end] = [lightnessOf(sample(0)), lightnessOf(sample(1))];
  const span = end - start || 1;
  return (
    <div
      className="hc:flex hc:h-4 hc:mb-2"
      style={{ marginLeft: `${start * 100}%`, width: `${Math.abs(span) * 100}%` }}
    >
      <div className="hc:w-full hc:relative hc:flex">
        <div
          className="hc:rounded-xs hc:h-full hc:w-full"
          style={{ background: `linear-gradient(to right, ${stops.map(sample).join(",")})` }}
        />
        {markers.map((color, i) => (
          <Marker key={i} color={color} at={(lightnessOf(color) - start) / span} />
        ))}
      </div>
    </div>
  );
}

/**
 * The theme's neutral ramp, then each hue between the neutral ramp's ends.
 * Hue steps such as `huet-text-red-60` travel along these.
 */
export default function ColorRamps() {
  const { theme, resolved } = useThemeConfigurator();
  const [dark, light] = [resolved.dark, resolved.light];
  return (
    <div className="hc:w-full">
      <div className="huet-border-10 hc:h-[4px] hc:mb-[6px] hc:w-full hc:bg-[linear-gradient(to_right,black,white)]" />
      <Ramp sample={resolved.ramp} markers={[...theme.neutral]} />
      {hues.map((hue) => {
        const color = resolved.colors[hue];
        const scale = chroma.scale([dark, color, light]).mode("lab").correctLightness();
        return <Ramp key={hue} sample={(t) => scale(t).hex()} markers={[dark, color, light]} />;
      })}
    </div>
  );
}
