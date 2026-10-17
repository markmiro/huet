import chroma from "chroma-js";
import _ from "lodash";
import React from "react";

import Block from "../Block";
import { getLightness } from "../Color";
import type { Ramp } from "../colorModel";
import type Theme from "../Theme";
import __ from "./atoms";
import { useTheme } from "../reactContexts";

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
    <Block
      style={(parentBg) => ({
        ...__.absolute.ba.w1.h1,
        borderColor: parentBg.contrast(0).alpha(0.3),
        outlineColor: parentBg.contrast(100).alpha(0.3),
        backgroundColor: color || "transparent",
        outlineWidth: 1,
        outlineOffset: "-2px",
        outlineStyle: "solid",
        width: size,
        height: size,
        top: "50%",
        left: `calc(${l * 100}% - ${size} * ${l})`,
        transform: "translateY(-50%)",
      })}
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
    : [..._.range(0, 1, 1 / (classes ?? 1)), 1];
  const first = _.first(classesArr) ?? 0;
  const last = _.last(classesArr) ?? 1;
  const middle = _.initial(_.tail(classesArr));
  return _.chunk([first, ..._.flatMap(middle, duplicate), last], 2);
}

const InnerRamp = React.memo(function InnerRamp({ ramp }: { ramp?: Ramp }) {
  if (!ramp) return null;

  const type = ramp.config.classes ? "classes" : "normal";

  switch (type) {
    case "classes":
      return (
        <div style={__.br1.h100.w100.flex}>
          {pairs(ramp).map(([first = 0, second = 0], i) => (
            <div
              key={i}
              style={{
                ...__.h100,
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
          style={{
            ...__.br1.h100.w100,
            background: `linear-gradient(to right, ${_.range(0, 1.2, 0.2)
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
      style={{
        ...__.flex.w100.flex_row.h1.mb2,
        marginLeft: `${ramp.startL}%`,
        width: `${(ramp.endL ?? Number.NaN) - (ramp.startL ?? Number.NaN)}%`,
      }}
    >
      <div style={__.w100.relative.flex}>
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

export default function ColorRamps() {
  const theme = useTheme();
  return (
    <div style={__.w100}>
      <Block
        contrast="b=10"
        style={{
          height: "4px",
          marginBottom: 6,
          background: "linear-gradient(to right, black, white)",
          ...__.w100,
        }}
      />
      {Object.keys(theme.ramps).map((key) => (
        <ColorRamp key={key} ramp={theme.ramps[key]} theme={theme} />
      ))}
    </div>
  );
}
