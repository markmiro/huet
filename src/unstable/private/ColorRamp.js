import React, { useContext } from "react";
import styled from "styled-components";
import _ from "lodash";
import Contrast from "../Contrast.jsx";
import Block from "../Block.jsx";
import { getLightness } from "../../Color";
import { BackgroundContext } from "./reactContexts";

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
  const parentBg = useContext(BackgroundContext);
  return <ScreenElement {...props} color={parentBg} />;
}

export function Bracket({ lightness, direction }) {
  const parentBg = useContext(BackgroundContext);
  const borderColor = parentBg.contrast(100);
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
  --size: 1em;
  background-color: ${({ color }) => color || "transparent"};
  outline-width: 1px;
  outline-offset: -2px;
  outline-style: solid;
  width: var(--size);
  height: var(--size);
  top: 50%;
  left: ${({ color, grayRamp }) => {
    const l =
      (getLightness(color) - grayRamp.startL) /
      (grayRamp.endL - grayRamp.startL);
    return `calc(${l * 100}% - (var(--size)) * ${l})`;
  }};
  transform: translateY(-50%);
`;

function RampColorMarker({ color, grayRamp }) {
  return (
    <Block
      as={RampColorMarkerElement}
      color={color}
      grayRamp={grayRamp}
      style={parentBg => ({
        borderColor: parentBg.contrast(0).alpha(0.3),
        outlineColor: parentBg.contrast(100).alpha(0.3)
      })}
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
        <div className="h-100 w-100 flex">
          {pairs(ramp).map(([first, second], i) => (
            <div
              key={i}
              className="h-100"
              style={{
                backgroundColor: ramp((first + second) / 2),
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
          className="h-100 w-100"
          style={{
            background: `linear-gradient(to right, ${_.range(0, 1.2, 0.2)
              .map(i => ramp(i))
              .join(",")})`
          }}
        />
      );
  }
}

const ColorRamp = ({ ramp, theme }) => {
  return (
    <div
      className="flex w-100 flex-row h1 mb2"
      style={{
        marginLeft: `${ramp.startL}%`,
        width: `${ramp.endL - ramp.startL}%`
      }}
    >
      <div className="w-100 relative flex">
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
