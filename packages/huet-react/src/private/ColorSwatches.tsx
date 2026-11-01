import { IconRestore, IconX } from "@tabler/icons-react";
import React from "react";

import { fromLsh, gradient, toLsh, useDraggedColor, type Lsh } from "./colorMath";
import cx from "./cx";
import HexInput from "./HexInput";
import { Button } from "./ui/button";
import { NumberField } from "./ui/number-field";
import { Slider } from "./ui/slider";

/**
 * Hue and saturation sliders for one color, in OKLCH at the color's own
 * lightness. Saturation is a share of the most vivid color sRGB has at that
 * hue and lightness, so 100% is always as vivid as it gets. `onReset`, when
 * given, shows a Default button.
 */
export function ColorEditor({
  name,
  color,
  onChange,
  onReset,
  onClose,
}: {
  name: string;
  color: string;
  onChange: (color: string) => void;
  onReset?: () => void;
  onClose: () => void;
}) {
  const [lsh, setLsh] = useDraggedColor(color, onChange, (c, previous?: Lsh) => toLsh(c, previous?.h), fromLsh);
  const hueTrack = gradient((t) => fromLsh({ ...lsh, h: t * 360 }));
  const saturationTrack = gradient((t) => fromLsh({ ...lsh, s: t }), 6);
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
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
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

export interface Swatch {
  key: string;
  label: string;
  /** What the swatch shows: a color, or a gradient for a palette. */
  fill: string;
  /** Read out with the swatch's name, such as its hex. */
  description: string;
}

/**
 * A row of swatches. Clicking one selects it, and `editor` opens under the
 * row, joined to the swatch so it's clear which color it changes.
 */
export function SwatchRow({
  swatches,
  selected,
  onSelect,
  editor,
}: {
  swatches: readonly Swatch[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  editor?: React.ReactNode;
}) {
  return (
    <div className="hc:flex hc:flex-col">
      <div className="hc:flex hc:gap-[.5em]">
        {swatches.map(({ key, label, fill, description }) => {
          const isSelected = key === selected;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Edit ${label.toLowerCase()}, ${description}`}
              onClick={() => onSelect(isSelected ? null : key)}
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
                style={{ background: fill }}
              />
              <span className={cx("hc:text-[.8125em] hc:text-center", isSelected ? "hc:font-semibold" : "huet-text-70")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {selected && editor && (
        <div
          className={cx(
            "huet-bg-5 hc:rounded-b-lg hc:p-[.75em]",
            // Square where the open swatch joins it
            selected === swatches[0]?.key ? "" : "hc:rounded-tl-lg",
            selected === swatches[swatches.length - 1]?.key ? "" : "hc:rounded-tr-lg",
          )}
        >
          {editor}
        </div>
      )}
    </div>
  );
}
