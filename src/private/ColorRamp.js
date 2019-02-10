import React, { useContext } from "react";
import _ from "lodash";
import chroma from "chroma-js";
import Contrast from "../Contrast.jsx";
import Block from "../Block.jsx";
import { getLightness } from "../Color";
import { BackgroundContext } from "../reactContexts";
import __ from "./atoms";

export function Star({ lightness }) {
  return (
    <Contrast
      bg={50}
      border={10}
      style={{
        ...__.absolute.ba,
        width: 10,
        height: 10,
        top: "50%",
        left: `${lightness}%`,
        transform: "translate(-50%, -50%) rotate(45deg)"
      }}
    />
  );
}

export function Bracket({ lightness, direction }) {
  const parentBg = useContext(BackgroundContext);
  const borderColor = parentBg.contrast(100);
  return (
    <div
      style={{
        ...__.absolute.bt.bb,
        ...(direction === "left" ? __.bl : __.br),
        borderColor,
        height: "120%",
        width: ".3em",
        top: "50%",
        left: `${lightness}%`,
        transform: "translate(-50%, -50%)",
        textShadow: `0 0 10px 5px ${borderColor.contrast(100)}`
      }}
    />
  );
}

function RampColorMarker({ color, grayRamp }) {
  const size = "1em";
  const l =
    (getLightness(color) - grayRamp.startL) / (grayRamp.endL - grayRamp.startL);
  return (
    <Block
      style={parentBg => ({
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
        transform: "translateY(-50%)"
      })}
    />
  );
}

export function ContrastRange({ lightness, contrast }) {
  return (
    <Contrast
      bg={100}
      border={10}
      style={{
        ...__.absolute.bt,
        height: 2,
        width: `${Math.abs(contrast * 2)}%`,
        top: "50%",
        left: `${lightness}%`,
        transform: "translate(-50%, -50%)"
      }}
    />
  );
}

function duplicate(n) {
  return [n, n];
}
function pairs(ramp) {
  const classes = ramp.config.classes;
  const classesArr = Array.isArray(classes)
    ? classes
    : [..._.range(0, 1, 1 / classes), 1];
  const first = _.first(classesArr);
  const last = _.last(classesArr);
  const middle = _.initial(_.tail(classesArr));
  return _.chunk([first, ..._.flatMap(middle, duplicate), last], 2);
}

export function InnerRamp({ ramp }) {
  if (!ramp) return null;

  const type = ramp.config.classes ? "classes" : "normal";

  switch (type) {
    case "classes":
      return (
        <div style={__.h100.w100.flex}>
          {pairs(ramp).map(([first, second], i) => (
            <div
              key={i}
              style={{
                ...__.h100,
                backgroundColor: chroma(ramp((first + second) / 2)).hex(),
                width: `${(second - first) * 100}%`
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
            ...__.h100.w100,
            background: `linear-gradient(to right, ${_.range(0, 1.2, 0.2)
              .map(i => chroma.lab(...ramp(i)))
              .join(",")})`
          }}
        />
      );
  }
}

const ColorRamp = ({ ramp, theme }) => {
  return (
    <div
      style={{
        ...__.flex.w100.flex_row.h1.mb2,
        marginLeft: `${ramp.startL}%`,
        width: `${ramp.endL - ramp.startL}%`
      }}
    >
      <div style={__.w100.relative.flex}>
        <InnerRamp ramp={ramp} />
        {ramp.config.colors.map((color, i) => (
          <RampColorMarker
            key={i}
            color={theme.pallet[color]}
            grayRamp={theme.ramps.gray}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorRamp;
