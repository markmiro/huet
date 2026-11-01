import chroma from "chroma-js";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import React, { useRef, useState } from "react";
import type { ColorModel } from "huet";

import { useThemeConfigurator } from "../context";
import { clamp01, fromHsv, gradient, toHsv, useDraggedColor, type Hsv } from "./colorMath";
import cx from "./cx";
import HexInput from "./HexInput";
import { Button } from "./ui/button";
import { Slider, thumbRing } from "./ui/slider";

const hueTrack = gradient((t) => chroma.hsv(t * 360, 1, 1).hex());

/** A saturation (x) by brightness (y) square for one hue, as in most color pickers. */
function ColorArea({ hsv, onChange }: { hsv: Hsv; onChange: (hsv: Hsv) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const pick = (event: React.PointerEvent) => {
    const box = ref.current!.getBoundingClientRect();
    onChange({
      h: hsv.h,
      s: clamp01((event.clientX - box.left) / box.width),
      v: clamp01(1 - (event.clientY - box.top) / box.height),
    });
  };
  const nudge = (event: React.KeyboardEvent) => {
    const amount = event.shiftKey ? 0.1 : 0.01;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-amount, 0],
      ArrowRight: [amount, 0],
      ArrowUp: [0, amount],
      ArrowDown: [0, -amount],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onChange({ h: hsv.h, s: clamp01(hsv.s + move[0]), v: clamp01(hsv.v + move[1]) });
  };
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Saturation and brightness"
      aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pick(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) pick(event);
      }}
      onKeyDown={nudge}
      className="huet-border-10 hc:relative hc:h-[11em] hc:border hc:rounded-lg hc:cursor-crosshair hc:touch-none"
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${chroma.hsv(hsv.h, 1, 1).hex()})`,
      }}
    >
      <div
        className={cx(
          "hc:absolute hc:size-[1.25em] hc:rounded-full hc:-translate-x-1/2 hc:translate-y-1/2 hc:pointer-events-none",
          thumbRing,
        )}
        style={{ left: `${hsv.s * 100}%`, bottom: `${hsv.v * 100}%`, backgroundColor: fromHsv(hsv) }}
      />
    </div>
  );
}

/** The big picker for one base color: the square, a hue slider and the hex. */
function ColorEditor({
  label,
  color,
  onChange,
  onRemove,
}: {
  label: string;
  color: string;
  onChange: (color: string) => void;
  onRemove?: () => void;
}) {
  const [hsv, setHsv] = useDraggedColor(color, onChange, (c, previous?: Hsv) => toHsv(c, previous?.h), fromHsv);
  return (
    <div className="hc:flex hc:flex-col hc:gap-[.75em]">
      <ColorArea hsv={hsv} onChange={setHsv} />
      <Slider
        label={`${label} hue`}
        min={0}
        max={360}
        value={hsv.h}
        onValueChange={(h) => setHsv({ ...hsv, h })}
        track={hueTrack}
        thumbColor={chroma.hsv(hsv.h, 1, 1).hex()}
      />
      <div className="hc:flex hc:items-center hc:gap-[.5em]">
        <HexInput label={`${label} hex`} color={fromHsv(hsv)} onChange={(next) => setHsv(toHsv(next, hsv.h))} />
        <span className="huet-text-60 hc:grow">{label}</span>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <IconTrash size="1em" stroke={2} />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

const nameOf = (i: number, count: number) =>
  i === 0 ? "Darkest" : i === count - 1 ? "Lightest" : count === 3 ? "Middle" : `Middle ${i}`;

/**
 * The neutral ramp's colors, darkest first. The bar above shows how they
 * blend. Click a color to edit it in the picker below; the + between two
 * colors adds a middle color halfway between them.
 */
export default function BaseColors({
  colors,
  colorModel = "oklab",
  onChange,
}: {
  colors: readonly string[];
  colorModel?: ColorModel;
  onChange: (colors: string[]) => void;
}) {
  const { resolved } = useThemeConfigurator();
  const [selected, setSelected] = useState<number | null>(0);
  const current = selected !== null && selected < colors.length ? selected : null;

  const insertAfter = (i: number) => {
    const middle = chroma.mix(colors[i], colors[i + 1], 0.5, colorModel === "oklab" ? "oklab" : "lab").hex();
    onChange([...colors.slice(0, i + 1), middle, ...colors.slice(i + 1)]);
    setSelected(i + 1);
  };
  const remove = (i: number) => {
    onChange(colors.filter((_, j) => j !== i));
    setSelected(null);
  };

  return (
    <div className="hc:flex hc:flex-col hc:gap-[.75em]">
      <div
        aria-hidden
        className="huet-border-10 hc:h-[1.5em] hc:rounded-md hc:border"
        style={{ background: gradient(resolved.ramp, 24) }}
      />
      <div className="hc:flex hc:items-start">
        {colors.map((color, i) => {
          const name = nameOf(i, colors.length);
          const isSelected = i === current;
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <button
                  type="button"
                  aria-label={`Add a color between ${nameOf(i - 1, colors.length)} and ${name}`}
                  title="Add a middle color"
                  onClick={() => insertAfter(i - 1)}
                  className="huet-border-20 hc:flex hc:items-center hc:justify-center hc:shrink-0 hc:size-[1.5em] hc:mx-[.25em] hc:mt-[.875em] hc:rounded-full hc:border hc:border-dashed hc:cursor-pointer hc:tint-hover huet-text-70"
                >
                  <IconPlus size=".875em" stroke={2.5} />
                </button>
              )}
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`Edit ${name}, ${color}`}
                onClick={() => setSelected(isSelected ? null : i)}
                className="hc:flex hc:flex-col hc:items-center hc:gap-[.375em] hc:grow hc:basis-0 hc:min-w-0 hc:cursor-pointer hc:group"
              >
                <span
                  className={cx(
                    "hc:block hc:w-full hc:h-[3.25em] hc:rounded-lg hc:border hc:transition-[outline-offset] hc:duration-100",
                    isSelected
                      ? "huet-border-10 huet-outline-100 hc:outline-2 hc:outline-offset-2"
                      : "huet-border-20 hc:group-hover:outline-1 hc:group-hover:outline-offset-1 huet-outline-50",
                  )}
                  style={{ backgroundColor: color }}
                />
                <span className="hc:text-[.8125em] hc:leading-tight hc:text-center">
                  <span className={cx("hc:block", isSelected ? "hc:font-semibold" : "huet-text-70")}>{name}</span>
                  <span className="hc:block hc:font-mono huet-text-50">{chroma(color).hex("rgb")}</span>
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
      {current !== null ? (
        <div className="huet-bg-5 hc:rounded-lg hc:p-[.75em]">
          <ColorEditor
            key={current}
            label={nameOf(current, colors.length)}
            color={colors[current]}
            onChange={(next) => onChange(colors.map((c, j) => (j === current ? next : c)))}
            onRemove={current > 0 && current < colors.length - 1 ? () => remove(current) : undefined}
          />
        </div>
      ) : (
        <p className="huet-text-60">Click a color to edit it. Use + to add a middle color.</p>
      )}
    </div>
  );
}
