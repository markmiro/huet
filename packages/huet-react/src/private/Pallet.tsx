import { map } from "lodash-es";
import { useEffect, useRef, useState } from "react";

import { HSpace } from "./AllExceptFirst";

function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  // Dragging in the native picker can fire input events faster than the
  // screen refreshes, and each change rebuilds the theme. The swatch shows
  // every pick right away; the theme gets the latest one once per frame.
  const [picked, setPicked] = useState<string>();
  const latest = useRef({ picked: color, onChange });
  latest.current.onChange = onChange;
  const frame = useRef<number>(undefined);
  useEffect(() => () => cancelAnimationFrame(frame.current ?? 0), []);

  return (
    <input
      type="color"
      value={picked ?? color}
      onChange={(event) => {
        latest.current.picked = event.target.value;
        setPicked(event.target.value);
        frame.current ??= requestAnimationFrame(() => {
          frame.current = undefined;
          setPicked(undefined);
          latest.current.onChange(latest.current.picked);
        });
      }}
      className="huet-border-12 hc:w-full hc:h-4 hc:p-0 hc:border hc:rounded-xs hc:overflow-hidden"
      // The picked color itself, not a theme color
      style={{ backgroundColor: (picked ?? color) || "transparent" }}
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
