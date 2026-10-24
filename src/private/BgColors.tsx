import React from "react";

import Color from "../Color";
import { HSpace } from "./AllExceptFirst";
import Arrow from "./Arrow";
import __ from "./atoms";
import Button from "./Button";
import { useTheme } from "../reactContexts";

function BgColorPreview({
  scaleValue,
  isSelected,
  onClick,
}: {
  scaleValue: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const theme = useTheme();
  const ramp = theme.ramps[theme.bgRamp];
  const lab = ramp(scaleValue);
  const color = new Color({
    theme,
    bgColor: null,
    lab,
    ramp,
    baseRamp: ramp,
  });

  return (
    <Button
      style={{
        ...__.ba.w100.relative.h2,
        backgroundColor: color.toString(),
        borderColor: color.contrast(isSelected ? 100 : 12).toString(),
        color: color.contrast(75).toString(),
        boxShadow: `0 2px 10px ${color.shadowColor(0.2)}`,
      }}
      onClick={onClick}
    >
      {scaleValue * 100}%
      {isSelected && (
        <Arrow
          direction="up"
          size=".5em"
          style={{
            ...__.abc,
            transform: "translate(-50%, 1px)",
            color: color.contrast(100).toString(),
          }}
        />
      )}
    </Button>
  );
}

export default function BgColors({
  bgRampValue,
  onRampValueChange,
}: {
  bgRampValue: number;
  onRampValueChange: (value: number) => void;
}) {
  return (
    <HSpace growEach style={__.flex} size="2">
      {[0, 0.25, 0.75, 1].map((scaleValue) => (
        <BgColorPreview
          key={scaleValue}
          scaleValue={scaleValue}
          isSelected={bgRampValue === scaleValue}
          onClick={() => onRampValueChange(scaleValue)}
        />
      ))}
    </HSpace>
  );
}
