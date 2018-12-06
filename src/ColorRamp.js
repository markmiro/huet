import React from "react";
import huet from "./huet";
import Contrast from "./Contrast";

const { ThemeContext } = huet;

function Star({ lightness }) {
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

function TheRange({ pickedObject }) {
  return (
    <Contrast
      bg={100}
      border={10}
      className="absolute bt"
      style={{
        height: 2,
        width: `${Math.abs(pickedObject.props.bg * 2)}%`,
        top: "50%",
        left: `${pickedObject.contextValue.bgLightness}%`,
        transform: "translate(-50%, -50%)"
      }}
    />
  );
}

export default function ColorRamp({
  ramp,
  onChangeRamp,
  themeContext,
  pickedObject
}) {
  const theRamp = themeContext.ramps[ramp];

  return (
    <div className="flex w-100 flex-row h1">
      <div className="flex flex-row w-30 justify-between">
        {theRamp.colors.map((color, i) => (
          <ThemeContext.Provider
            key={i}
            value={{
              ...themeContext,
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
      </div>
      <div className="w-70 relative flex">
        {theRamp.normalScale && (
          <div
            className="h-100 w-100 bl br"
            style={{
              marginLeft: `${theRamp.dark.l}%`,
              marginRight: `${100 - theRamp.light.l}%`,
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
                .map(i => theRamp.scale(i))
                .join(",")})`
            }}
          />
        )}
        {pickedObject && (
          <>
            <Star lightness={pickedObject.contextValue.bgLightness} />
            <TheRange pickedObject={pickedObject} />
          </>
        )}
      </div>
    </div>
  );
}
