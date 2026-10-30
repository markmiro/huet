import { Color } from "huet/config";
import type { Theme } from "huet/config";
import { HSpace } from "./AllExceptFirst";
import Arrow from "./Arrow";
import Button from "./Button";

function BgColorPreview({
  theme,
  scaleValue,
  isSelected,
  onClick,
}: {
  theme: Theme;
  scaleValue: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  // Each swatch previews a background of the theme being edited, not the
  // panel's own theme, so its colors are computed here and set inline.
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
      colors=""
      className="hc:relative hc:h-8"
      style={{
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
          size=".5em"
          className="hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2 hc:translate-y-px"
          style={{ color: color.contrast(100).toString() }}
        />
      )}
    </Button>
  );
}

export default function BgColors({
  theme,
  bgRampValue,
  onRampValueChange,
}: {
  theme: Theme;
  bgRampValue: number;
  onRampValueChange: (value: number) => void;
}) {
  return (
    <HSpace growEach size={2}>
      {[0, 0.25, 0.75, 1].map((scaleValue) => (
        <BgColorPreview
          key={scaleValue}
          theme={theme}
          scaleValue={scaleValue}
          isSelected={bgRampValue === scaleValue}
          onClick={() => onRampValueChange(scaleValue)}
        />
      ))}
    </HSpace>
  );
}
