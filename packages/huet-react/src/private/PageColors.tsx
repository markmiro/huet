import chroma from "chroma-js";
import React, { useState } from "react";

import { useThemeConfigurator } from "../context";
import { ColorEditor, SwatchRow } from "./ColorSwatches";
import { maxChroma } from "./colorMath";

const byLightness = (colors: readonly string[]) =>
  [...colors].sort((a, b) => chroma(a).get("oklch.l") - chroma(b).get("oklch.l"));

/** The color that stands for a palette: its middle one by lightness. */
const middleOf = (colors: readonly string[]) => byLightness(colors)[Math.floor((colors.length - 1) / 2)];

/**
 * `palette` with its middle color moved to `to`: every color turns by the
 * same hue and scales by the same chroma, keeping its own lightness, so a
 * palette such as amber's yellow to brown keeps its shape. A gray palette
 * takes `to`'s hue and chroma outright. A single color just becomes `to`.
 */
export function reshape(palette: readonly string[], to: string): string[] {
  if (palette.length <= 1) return [to];
  const [, fromC, fromH] = chroma(middleOf(palette)).oklch();
  const [, toC, toHue] = chroma(to).oklch();
  const toH = Number.isNaN(toHue) ? 0 : toHue;
  const gray = !(fromC >= 0.02);
  return palette.map((color) => {
    const [l, c, h] = chroma(color).oklch();
    const hue = gray || Number.isNaN(h) ? toH : (h + toH - fromH + 360) % 360;
    const chromaOut = gray ? toC : (c * toC) / fromC;
    return chroma.oklch(l, Math.min(chromaOut, maxChroma(l, hue)), hue).hex();
  });
}

/**
 * The page's own colors, such as an accent and a chart palette, as a row of
 * swatches like the hues. Editing one moves its middle color and reshapes the
 * rest around it. Default goes back to the page's own colors.
 */
export default function PageColors() {
  const { pageColors, setPageColor } = useThemeConfigurator();
  const [selected, setSelected] = useState<string | null>(null);
  const entries = Object.entries(pageColors).filter(([, { colors }]) => colors.length > 0);
  const current = selected === null ? undefined : pageColors[selected];
  return (
    <SwatchRow
      swatches={entries.map(([name, { colors }]) => {
        const sorted = byLightness(colors);
        return {
          key: name,
          label: name,
          fill: sorted.length > 1 ? `linear-gradient(to right, ${sorted.join(", ")})` : sorted[0],
          description: colors.join(", "),
        };
      })}
      selected={selected}
      onSelect={setPageColor ? setSelected : () => {}}
      editor={
        selected !== null &&
        current &&
        setPageColor && (
          <ColorEditor
            key={selected}
            name={selected}
            color={middleOf(current.colors)}
            // Reshape the page's own colors, so edits don't drift through repeated rounding
            onChange={(color) => setPageColor(selected, reshape(current.own ?? current.colors, color))}
            onReset={current.own ? () => setPageColor(selected, undefined) : undefined}
            onClose={() => setSelected(null)}
          />
        )
      }
    />
  );
}
