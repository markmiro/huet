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

const Block = styled.input`
  background-color: ${({ color }) => color || "transparent"};
  outline-width: 1px;
  outline-offset: -2px;
  outline-style: solid;
  width: 1.1em;
  height: 120%;
  top: 50%;
  left: ${({ color }) => huet.getLightness(color)}%;
  transform: translate(-50%, -50%);
  padding: 0;
  &:hover,
  &:focus {
    transform: translate(-50%, -50%) scale(1.5);
    z-index: 1;
  }
`;

function MobileColorPicker({ color, onChange }) {
  return (
    <Contrast
      as={Block}
      type="color"
      value={color}
      color={color}
      onChange={onChange}
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
          marginLeft: !ramp.isMirror && `${ramp.darkL}%`,
          // marginRight: !ramp.isMirror && `${100 - ramp.lightL}%`,
          width: !ramp.isMirror ? `${ramp.lightL - ramp.darkL}%` : null,
          background: `linear-gradient(to right, ${_.range(0, 1, 0.1)
            .map(i => ramp.scale(i))
            .join(",")})`
        }}
      /> */}
      <div
        className="h-100 w-100 flex"
        style={{
          marginLeft: !ramp.isMirror && `${ramp.darkL}%`,
          width: !ramp.isMirror ? `${ramp.lightL - ramp.darkL}%` : null
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

const ColorRamp = ({ ramp, onChangeRamp, themeContext }) => {
  const theRamp = themeContext.ramps[ramp];

  return (
    <div className="flex w-100 flex-row h1 mb2">
      {/* <div className="flex flex-row w-30 justify-between pr2">
        {theRamp.colors.map((color, i) => (
          <ThemeContext.Provider
            key={i}
            value={{
              ...themeContext,
              isPicking: false,
              pickedObject: null,
              bgLightnessAbove: huet.getLightness(color),
              bgLightness: huet.getLightness(color)
            }}
          >
            <Contrast
              key={i}
              as="input"
              outline={10}
              outlineRamp={ramp}
              type="color"
              value={color}
              onChange={e => onChangeRamp && onChangeRamp(e.target.value, i)}
              className="w-third h-100"
              style={{
                borderWidth: 0,
                outlineWidth: 1,
                outlineStyle: "solid",
                background: color,
                outlineOffset: -4
              }}
            />
          </ThemeContext.Provider>
        ))}
      </div> */}
      <div className="w-100 relative flex">
        <InnerRamp ramp={theRamp}>
          {/* {theRamp !== themeContext.ramps.gray && (
            <>
              <Screen from={0} to={themeContext.minColorLightness} />
              <Screen from={themeContext.maxColorLightness} to={100} />
            </>
          )} */}
          {theRamp !== themeContext.ramps.gray && (
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
          {theRamp.colors.map((color, i) => (
            <MobileColorPicker
              key={i}
              color={color}
              onChange={e => onChangeRamp && onChangeRamp(e.target.value, i)}
            />
          ))}
        </InnerRamp>
      </div>
    </div>
  );
};

export default ColorRamp;
