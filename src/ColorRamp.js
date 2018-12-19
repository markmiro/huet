import React from "react";
import styled from "styled-components";
import _ from "lodash";
import huet from "./huet";
import Contrast from "./Contrast";

export function Star({ lightness }) {
  return (
    <Contrast
      bg={50}
      border={10}
      className="absolute ba"
      style={{
        width: 10,
        height: 10,
        top: "50%",
        left: `${lightness}%`,
        transform: "translate(-50%, -50%) rotate(45deg)"
      }}
    />
  );
}

const ScreenElement = styled.div`
  position: absolute;
  height: 100%;
  top: 0;
  left: ${({ from }) => from}%;
  width: ${({ to }) => to}%;
  background-color: ${({ color }) => color};
  opacity: 0.5;

  &:hover {
    opacity: 0;
  }
`;

export function Screen(props) {
  const { contrast } = huet.useTheme();
  return <ScreenElement {...props} color={contrast(0)} />;
}

export function Bracket({ lightness, direction }) {
  const { contrast } = huet.useTheme();
  const borderColor = contrast(100);
  return (
    <div
      className={`absolute bt bb ${direction === "left" ? "bl" : "br"}`}
      style={{
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

const RampColorMarkerElement = styled.div`
  --width: 1.1em;
  background-color: ${({ color }) => color || "transparent"};
  outline-width: 1px;
  outline-offset: -2px;
  outline-style: solid;
  width: var(--width);
  height: 120%;
  top: 50%;
  left: ${({ color }) => {
    const l = huet.getLightness(color);
    return `calc(${l}% - (var(--width)) * ${l / 100})`;
  }};
  transform: translateY(-50%);
`;

function RampColorMarker({ color }) {
  return (
    <Contrast
      as={RampColorMarkerElement}
      color={color}
      border={0}
      borderAlpha={0.3}
      outline={100}
      outlineAlpha={0.3}
      className="absolute ba w1"
    />
  );
}

export function ContrastRange({ lightness, contrast }) {
  return (
    <Contrast
      bg={100}
      border={10}
      className="absolute bt"
      style={{
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
  const classes = ramp.scale.classes();
  const classesArr = Array.isArray(classes)
    ? classes
    : [..._.range(0, 1, 1 / classes), 1];
  const first = _.first(classesArr);
  const last = _.last(classesArr);
  const middle = _.initial(_.tail(classesArr));
  return _.chunk([first, ..._.flatMap(middle, duplicate), last], 2);
}

export function InnerRamp({ ramp }) {
  if (!ramp || !ramp.scale) return null;

  const type = ramp.scale.classes()
    ? "classes"
    : ramp.scale.theDomain
    ? "domain"
    : "normal";

  switch (type) {
    case "classes":
      return (
        <div className="h-100 w-100 flex">
          {pairs(ramp).map(([first, second], i) => (
            <div
              key={i}
              className="h-100"
              style={{
                backgroundColor: ramp.scale((first + second) / 2),
                width: `${(second - first) * 100}%`
              }}
            />
          ))}
        </div>
      );
    case "domain":
      return (
        <div className="h-100 w-100 flex">
          {_.chunk(ramp.scale.theDomain, 2).map(([first, second], i) => (
            <div
              key={i}
              className="h-100 w-100"
              style={{
                width: `${(second - first) * 100}%`,
                background: `linear-gradient(to right, ${ramp.scale(
                  first + 0.001
                )}, ${ramp.scale(second)})`
              }}
            />
          ))}
        </div>
      );
    case "normal":
    default:
      return (
        <div
          className="h-100 w-100"
          style={{
            background: `linear-gradient(to right, ${_.range(0, 1, 0.01)
              .map(i => ramp.scale(i))
              .join(",")})`
          }}
        />
      );
  }
}

const ColorRamp = ({ ramp, themeContext }) => {
  const theRamp = themeContext.ramps[ramp];

  return (
    <div className="flex w-100 flex-row h1 mb2">
      <div className="w-100 relative flex">
        <InnerRamp ramp={theRamp} />
        {theRamp.scale.colors().map((color, i) => (
          <RampColorMarker key={i} color={color} />
        ))}
      </div>
    </div>
  );
};

export default ColorRamp;
