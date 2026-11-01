import chroma from "chroma-js";
import React, { useState } from "react";
import { hues, themes as presets, type Hue, type Theme } from "huet";

import { ColorEditor, SwatchRow } from "./ColorSwatches";

// Huet's default hues, for themes that leave some out
export const defaultColors = presets.Base.colors as Record<Hue, string>;

const label = (hue: Hue) => hue[0].toUpperCase() + hue.slice(1);

/**
 * The theme's signal hues as a row of swatches. Clicking one opens its hue
 * and saturation sliders under the row.
 */
export default function Hues({ theme, onChange }: { theme: Theme; onChange: (colors: Theme["colors"]) => void }) {
  const [selected, setSelected] = useState<Hue | null>(null);
  const colorOf = (hue: Hue) => theme.colors?.[hue] ?? defaultColors[hue];
  const isDefault = (hue: Hue) => chroma(colorOf(hue)).hex() === chroma(defaultColors[hue]).hex();
  return (
    <SwatchRow
      swatches={hues.map((hue) => ({ key: hue, label: label(hue), fill: colorOf(hue), description: colorOf(hue) }))}
      selected={selected}
      onSelect={(key) => setSelected(key as Hue | null)}
      editor={
        selected && (
          <ColorEditor
            key={selected}
            name={label(selected)}
            color={colorOf(selected)}
            onChange={(color) => onChange({ ...theme.colors, [selected]: color })}
            onReset={isDefault(selected) ? undefined : () => onChange({ ...theme.colors, [selected]: defaultColors[selected] })}
            onClose={() => setSelected(null)}
          />
        )
      }
    />
  );
}
