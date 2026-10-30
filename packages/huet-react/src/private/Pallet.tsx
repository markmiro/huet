import { map } from "lodash-es";

import { HSpace } from "./AllExceptFirst";

function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  return (
    <input
      type="color"
      value={color}
      onChange={(event) => onChange(event.target.value)}
      className="huet-border-12 hc:w-full hc:h-4 hc:p-0 hc:border hc:rounded-xs hc:overflow-hidden"
      // The picked color itself, not a theme color
      style={{ backgroundColor: color || "transparent" }}
    />
  );
}

export default function Pallet({
  colors,
  onColorsChange,
}: {
  colors: Record<string, string>;
  onColorsChange: (colors: Record<string, string>) => void;
}) {
  return (
    <HSpace growEach>
      {map(colors, (color, key) => (
        <ColorPicker
          key={key}
          color={color}
          onChange={(next) => onColorsChange({ ...colors, [key]: next })}
        />
      ))}
    </HSpace>
  );
}
