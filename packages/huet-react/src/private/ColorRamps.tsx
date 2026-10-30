import chroma from "chroma-js";
import { chunk, first as firstOf, flatMap, initial, last as lastOf, range, tail } from "lodash-es";
import React from "react";

import { getLightness } from "huet/config";
import type { Ramp } from "huet/config";
import type { Theme } from "huet/config";

// Ramp gradients and markers show the theme's own colors, which no Huet class
// expresses, so those are inline. Everything else uses classes.

function RampColorMarker({
  color,
  grayRamp,
}: {
  color: string;
  grayRamp: Ramp;
}) {
  const size = "1em";
  const l =
    (getLightness(color) - (grayRamp.startL ?? 0)) /
    ((grayRamp.endL ?? 0) - (grayRamp.startL ?? 0));
  return (
    <div
      // Background and foreground at 30% (scaled by contrast, like Color.alpha)
      className="hc:absolute hc:border hc:border-[color-mix(in_srgb,var(--huet-background)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:outline hc:outline-[color-mix(in_srgb,var(--huet-foreground)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:-outline-offset-2 hc:top-1/2 hc:-translate-y-1/2"
      style={{
        backgroundColor: color || "transparent",
        width: size,
        height: size,
        left: `calc(${l * 100}% - ${size} * ${l})`,
      }}
    />
  );
}

function duplicate(n: number) {
  return [n, n];
}

function pairs(ramp: Ramp) {
  const classes = ramp.config.classes;
  const classesArr = Array.isArray(classes)
    ? classes
    : [...range(0, 1, 1 / (classes ?? 1)), 1];
  const first = firstOf(classesArr) ?? 0;
  const last = lastOf(classesArr) ?? 1;
  const middle = initial(tail(classesArr));
  return chunk([first, ...flatMap(middle, duplicate), last], 2);
}

const InnerRamp = React.memo(function InnerRamp({ ramp }: { ramp?: Ramp }) {
  if (!ramp) return null;

  const type = ramp.config.classes ? "classes" : "normal";

  switch (type) {
    case "classes":
      return (
        <div className="hc:rounded-xs hc:h-full hc:w-full hc:flex">
          {pairs(ramp).map(([first = 0, second = 0], i) => (
            <div
              key={i}
              className="hc:h-full"
              style={{
                backgroundColor: chroma.lab(...ramp((first + second) / 2)).hex(),
                width: `${(second - first) * 100}%`,
              }}
            />
          ))}
        </div>
      );
    case "normal":
    default:
      return (
        <div
          className="hc:rounded-xs hc:h-full hc:w-full"
          style={{
            background: `linear-gradient(to right, ${range(0, 1.2, 0.2)
              .map((i) => chroma.lab(...ramp(i)).hex())
              .join(",")})`,
          }}
        />
      );
  }
});

function ColorRamp({ ramp, theme }: { ramp: Ramp; theme: Theme }) {
  return (
    <div
      className="hc:flex hc:w-full hc:flex-row hc:h-4 hc:mb-2"
      style={{
        marginLeft: `${ramp.startL}%`,
        width: `${(ramp.endL ?? Number.NaN) - (ramp.startL ?? Number.NaN)}%`,
      }}
    >
      <div className="hc:w-full hc:relative hc:flex">
        <InnerRamp ramp={ramp} />
        {ramp.config.colors.map((color, i) => (
          <RampColorMarker
            key={i}
            color={theme.pallet[color] ?? ""}
            grayRamp={theme.ramps.gray}
          />
        ))}
      </div>
    </div>
  );
}

export default function ColorRamps({ theme }: { theme: Theme }) {
  return (
    <div className="hc:w-full">
      <div className="huet-border-10 hc:h-[4px] hc:mb-[6px] hc:w-full hc:bg-[linear-gradient(to_right,black,white)]" />
      {Object.keys(theme.ramps).map((key) => (
        <ColorRamp key={key} ramp={theme.ramps[key]} theme={theme} />
      ))}
    </div>
  );
}
