import { Slider as BaseSlider } from "@base-ui/react/slider";
import React from "react";

import cx from "../cx";

/** A white ring and a dark hairline, so a thumb shows on any color. */
export const thumbRing = "hc:shadow-[0_0_0_2px_white,0_0_0_3px_rgb(0_0_0/.35),0_1px_4px_rgb(0_0_0/.3)]";

/**
 * shadcn's Slider on Base UI. Without `track`, it's a plain neutral slider
 * with a filled indicator. With `track` (a CSS background, such as a
 * gradient of the colors it picks between), the track shows that instead and
 * the thumb shows `thumbColor`.
 */
export function Slider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  track,
  thumbColor,
  invalid,
  className,
  children,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  track?: string;
  thumbColor?: string;
  /** Out of range: the indicator turns red */
  invalid?: boolean;
  className?: string;
  /** Extra marks inside the track, such as ticks */
  children?: React.ReactNode;
}) {
  return (
    <BaseSlider.Root
      value={value}
      onValueChange={(next) => onValueChange(next as number)}
      min={min}
      max={max}
      step={step}
      className={cx("hc:relative hc:flex hc:w-full hc:min-w-0 hc:touch-none hc:select-none", className)}
    >
      <BaseSlider.Control className="hc:flex hc:items-center hc:w-full hc:h-[1.5em] hc:cursor-pointer">
        <BaseSlider.Track
          className={cx(
            "hc:relative hc:w-full hc:rounded-full",
            track ? "huet-border-10 hc:border hc:h-[.875em]" : "huet-bg-10 hc:h-[.375em]",
          )}
          style={track ? { background: track } : undefined}
        >
          {children}
          {!track && (
            <BaseSlider.Indicator
              className={cx("hc:rounded-full", invalid ? "huet-bg-red-100" : "huet-bg-70")}
            />
          )}
          <BaseSlider.Thumb
            aria-label={label}
            className={cx(
              "hc:block hc:size-[1.125em] hc:rounded-full hc:cursor-grab hc:active:cursor-grabbing",
              "hc:has-focus-visible:outline-2 hc:has-focus-visible:outline-offset-2 huet-outline-100",
              thumbRing,
              thumbColor ? "" : invalid ? "huet-bg-red-100" : "huet-bg-100",
            )}
            style={thumbColor ? { backgroundColor: thumbColor } : undefined}
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
