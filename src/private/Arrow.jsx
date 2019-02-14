import React from "react";

// TODO: consider making this component into an atom
// How this component works:
// https://css-tricks.com/snippets/css/css-triangle

const directionToCss = {
  up: {
    baseProp: "borderBottom",
    leftProp: "borderLeft",
    rightProp: "borderRight"
  },
  right: {
    baseProp: "borderLeft",
    leftProp: "borderTop",
    rightProp: "borderBottom"
  },
  down: {
    baseProp: "borderTop",
    leftProp: "borderRight",
    rightProp: "borderLeft"
  },
  left: {
    baseProp: "borderRight",
    leftProp: "borderBottom",
    rightProp: "borderLeft"
  }
};

export default function Arrow({ size = "1em", direction = "down", style }) {
  const directionCss = directionToCss[direction];
  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        // Border gives the element a size despite the zeroes
        width: 0,
        height: 0,
        background: "transparent",
        // Note: get different proportions by changing the base size
        [directionCss.baseProp]: `${size} solid currentColor`,
        [directionCss.leftProp]: `${size} solid transparent`,
        [directionCss.rightProp]: `${size} solid transparent`
      }}
    />
  );
}
