import chroma from "chroma-js";
import { IconRestore, IconX } from "@tabler/icons-react";
import React, { useState } from "react";
import { hues, themes as presets, type Hue, type Theme } from "huet";

import { fromLsh, gradient, toLsh, useDraggedColor, type Lsh } from "./colorMath";
import cx from "./cx";
import HexInput from "./HexInput";
import { Button } from "./ui/button";
import { NumberField } from "./ui/number-field";
import { Slider } from "./ui/slider";

// Huet's default hues, for themes that leave some out
export const defaultColors = presets.Base.colors as Record<Hue, string>;

const label = (hue: Hue) => hue[0].toUpperCase() + hue.slice(1);

/**
 * Hue and saturation sliders for one signal color, in OKLCH at the color's own
 * lightness. Saturation is a share of the most vivid color sRGB has at that
 * hue and lightness, so 100% is always as vivid as it gets.
 */
function HueEditor({
  hue,
  color,
  onChange,
  onClose,
}: {
  hue: Hue;
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}) {
  const [lsh, setLsh] = useDraggedColor(color, onChange, (c, previous?: Lsh) => toLsh(c, previous?.h), fromLsh);
  const name = label(hue);
  const hueTrack = gradient((t) => fromLsh({ ...lsh, h: t * 360 }));
  const saturationTrack = gradient((t) => fromLsh({ ...lsh, s: t }), 6);
  const isDefault = chroma(color).hex() === chroma(defaultColors[hue]).hex();
  return (
    <div className="hc:grid hc:grid-cols-[5.5em_1fr_auto] hc:items-center hc:gap-x-[.75em] hc:gap-y-[.5em]">
      <span>Hue</span>
      <Slider
        label={`${name} hue`}
        min={0}
        max={360}
        value={lsh.h}
        onValueChange={(h) => setLsh({ ...lsh, h })}
        track={hueTrack}
        thumbColor={fromLsh(lsh)}
      />
      <NumberField
        label={`${name} hue`}
        min={0}
        max={360}
        suffix="°"
        value={Math.round(lsh.h)}
        onValueChange={(h) => setLsh({ ...lsh, h: ((h % 360) + 360) % 360 })}
      />
      <span>Saturation</span>
      <Slider
        label={`${name} saturation`}
        min={0}
        max={1}
        step={0.01}
        value={lsh.s}
        onValueChange={(s) => setLsh({ ...lsh, s })}
        track={saturationTrack}
        thumbColor={fromLsh(lsh)}
      />
      <NumberField
        label={`${name} saturation`}
        min={0}
        max={100}
        suffix="%"
        value={Math.round(lsh.s * 100)}
        onValueChange={(percent) => setLsh({ ...lsh, s: Math.max(0, Math.min(100, percent)) / 100 })}
      />
      <span className="hc:col-span-3 hc:flex hc:items-center hc:gap-[.5em] hc:pt-[.25em]">
        <HexInput label={`${name} hex`} color={fromLsh(lsh)} onChange={(next) => setLsh(toLsh(next, lsh.h))} />
        <span className="hc:grow" />
        {!isDefault && (
          <Button variant="ghost" size="sm" onClick={() => onChange(defaultColors[hue])}>
            <IconRestore size="1em" stroke={2} />
            Default
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Done" title="Done" onClick={onClose}>
          <IconX size="1em" stroke={2} />
        </Button>
      </span>
    </div>
  );
}

/**
 * The theme's signal hues as a row of swatches. Clicking one opens its hue
 * and saturation sliders under the row, joined to the swatch so it's clear
 * which color they change.
 */
export default function Hues({ theme, onChange }: { theme: Theme; onChange: (colors: Theme["colors"]) => void }) {
  const [selected, setSelected] = useState<Hue | null>(null);
  const colorOf = (hue: Hue) => theme.colors?.[hue] ?? defaultColors[hue];
  return (
    <div className="hc:flex hc:flex-col">
      <div className="hc:flex hc:gap-[.5em]">
        {hues.map((hue) => {
          const isSelected = hue === selected;
          return (
            <button
              key={hue}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Edit ${hue}, ${colorOf(hue)}`}
              onClick={() => setSelected(isSelected ? null : hue)}
              className={cx(
                "hc:flex hc:flex-col hc:gap-[.375em] hc:grow hc:basis-0 hc:min-w-0 hc:cursor-pointer hc:group",
                // The open swatch reaches down into the editor below it
                isSelected ? "huet-bg-5 hc:rounded-t-lg hc:p-[.375em] hc:pb-[.5em]" : "hc:p-[.375em]",
              )}
            >
              <span
                className={cx(
                  "hc:block hc:h-[2.25em] hc:rounded-md hc:border",
                  isSelected
                    ? "huet-border-10 huet-outline-100 hc:outline-2 hc:outline-offset-2"
                    : "huet-border-20 hc:group-hover:outline-1 hc:group-hover:outline-offset-1 huet-outline-50",
                )}
                style={{ backgroundColor: colorOf(hue) }}
              />
              <span className={cx("hc:text-[.8125em] hc:text-center", isSelected ? "hc:font-semibold" : "huet-text-70")}>
                {label(hue)}
              </span>
            </button>
          );
        })}
      </div>
      {selected && (
        <div
          className={cx(
            "huet-bg-5 hc:rounded-b-lg hc:p-[.75em]",
            // Square where the open swatch joins it
            selected === hues[0] ? "" : "hc:rounded-tl-lg",
            selected === hues[hues.length - 1] ? "" : "hc:rounded-tr-lg",
          )}
        >
          <HueEditor
            key={selected}
            hue={selected}
            color={colorOf(selected)}
            onChange={(color) => onChange({ ...theme.colors, [selected]: color })}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}
