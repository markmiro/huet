import type { CSSProperties } from "react";

const directionToCss = {
  up: {
    baseProp: "borderBottom",
    leftProp: "borderLeft",
    rightProp: "borderRight",
  },
  right: {
    baseProp: "borderLeft",
    leftProp: "borderTop",
    rightProp: "borderBottom",
  },
  down: {
    baseProp: "borderTop",
    leftProp: "borderRight",
    rightProp: "borderLeft",
  },
  left: {
    baseProp: "borderRight",
    leftProp: "borderBottom",
    rightProp: "borderLeft",
  },
} as const;

type Direction = keyof typeof directionToCss;

export default function Arrow({
  size = "1em",
  direction = "down",
  style,
}: {
  size?: string | number;
  direction?: Direction;
  style?: CSSProperties;
}) {
  const directionCss = directionToCss[direction];
  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        width: 0,
        height: 0,
        background: "transparent",
        [directionCss.baseProp]: `${size} solid currentColor`,
        [directionCss.leftProp]: `${size} solid transparent`,
        [directionCss.rightProp]: `${size} solid transparent`,
      }}
    />
  );
}
