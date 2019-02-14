import React, { useContext } from "react";
import Button from "./Button";
import __ from "./atoms";
import { ThemeContext } from "../reactContexts";
import { HSpace } from "./AllExceptFirst";
import Color from "../Color";
import Arrow from "./Arrow";

function BgColorPreview({ scaleValue, isSelected, onClick }) {
  const theme = useContext(ThemeContext);
  const ramp = theme.ramps[theme.bgRamp];
  const lab = ramp(scaleValue);
  const color = new Color({
    theme,
    bgColor: null,
    lab,
    ramp,
    baseRamp: ramp
  });

  return (
    <Button
      key={scaleValue}
      style={{
        ...__.ba.w100.relative.h2,
        backgroundColor: color,
        borderColor: color.contrast(isSelected ? 100 : 12),
        color: color.contrast(100, theme.ramps.white),
        boxShadow: `0 2px 10px ${color.shadowColor(0.2)}`
      }}
      onClick={onClick}
    >
      {scaleValue * 100}%
      {isSelected && (
        <Arrow
          direction="up"
          size=".5em"
          style={{ ...__.abc, transform: "translate(-50%, 1px)" }}
        />
      )}
    </Button>
  );
}

export default function BgColors({ bgRampValue, onRampValueChange }) {
  return (
    <HSpace growEach style={__.flex}>
      {[0, 0.25, 0.75, 1].map(scaleValue => (
        <BgColorPreview
          scaleValue={scaleValue}
          isSelected={bgRampValue === scaleValue}
          onClick={() => onRampValueChange(scaleValue)}
        />
      ))}
    </HSpace>
  );
}
