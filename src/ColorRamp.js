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

export function InnerRamp({ ramp, children }) {
  if (!ramp || !ramp.scale) return null;
  return (
    <>
      {/* <div
        className="h-100 w-100"
        style={{
          marginLeft: ramp.startL && `${ramp.startL}%`,
          // marginRight: ramp.startL && `${100 - ramp.endL}%`,
          width: ramp.startL ? `${ramp.endL - ramp.startL}%` : null,
          background: `linear-gradient(to right, ${_.range(0, 1, 0.1)
            .map(i => ramp.scale(i))
            .join(",")})`
        }}
      /> */}
      <div
        className="h-100 w-100 flex"
        style={{
          marginLeft: ramp.startL ? `${ramp.startL}%` : null,
          width: ramp.startL ? `${ramp.endL - ramp.startL}%` : null
        }}
      >
        {_.range(0, 1, 0.05).map(i => (
          <div
            key={i}
            className="h-100 w-100"
            style={{
              backgroundColor: ramp.scale(i)
            }}
          />
        ))}
      </div>
      {children}
    </>
  );
}

const ColorRamp = ({ ramp, themeContext }) => {
  const theRamp = themeContext.ramps[ramp];

  return (
    <div className="flex w-100 flex-row h1 mb2">
      <div className="w-100 relative flex">
        <InnerRamp ramp={theRamp}>
          {/* {!theRamp.isNeutral && (
            <>
              <Screen from={0} to={themeContext.minColorLightness} />
              <Screen from={themeContext.maxColorLightness} to={100} />
            </>
          )} */}
          {!theRamp.isNeutral && theRamp.mode !== "direct" && (
            <>
              <Bracket
                lightness={themeContext.minColorLightness}
                direction="left"
              />
              <Bracket
                lightness={themeContext.maxColorLightness}
                direction="right"
              />
            </>
          )}
          {theRamp.scale.colors().map((color, i) => (
            <RampColorMarker key={i} color={color} />
          ))}
        </InnerRamp>
      </div>
    </div>
  );
};

export default ColorRamp;
