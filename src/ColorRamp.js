import React from "react";
import huet from "./huet";
import styled from "styled-components";
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
  &:hover {
    opacity: 0;
  }
`;

export function Screen({ from, to }) {
  return (
    <Contrast
      as={ScreenElement}
      bg={0}
      bgAlpha={0.8}
      className="absolute"
      style={{
        width: `${to}%`,
        height: "100%",
        top: 0,
        left: `${from}%`
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
  height: calc(100% - 2px);
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
      // style={{
      //   backgroundColor: color || "transparent",
      //   outlineWidth: 1,
      //   outlineOffset: -2,
      //   outlineStyle: "solid",
      //   width: "1.1em",
      //   height: "calc(100% - 2px)",
      //   top: "50%",
      //   left: `${huet.getLightness(color)}%`,
      //   transform: "translate(-50%, -50%)",
      //   padding: 0
      // }}
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
      <div
        className="h-100 w-100 bl br"
        style={{
          marginLeft: !ramp.isMirror && `${ramp.darkL}%`,
          // marginRight: !ramp.isMirror && `${100 - ramp.lightL}%`,
          width: !ramp.isMirror ? `${ramp.lightL - ramp.darkL}%` : null,
          background: `linear-gradient(to right, ${[
            0,
            5,
            10,
            15,
            20,
            25,
            30,
            35,
            40,
            45,
            50,
            55,
            60,
            65,
            70,
            75,
            80,
            85,
            90,
            95,
            100
          ]
            .map(i => ramp.scale(i))
            .join(",")})`
        }}
      />
      {children}
    </>
  );
}

const ColorRamp = React.memo(({ ramp, onChangeRamp, themeContext }) => {
  const theRamp = themeContext.ramps[ramp];

  return (
    <div className="flex w-100 flex-row h1">
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
          {theRamp !== themeContext.ramps.gray && (
            <>
              <Screen from={0} to={themeContext.minColorLightness} />
              <Screen from={themeContext.maxColorLightness} to={100} />
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
});

export default ColorRamp;
