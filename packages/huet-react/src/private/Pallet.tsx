import chroma from "chroma-js";
import { useEffect, useRef, useState } from "react";

/** A color input. Its swatch is the picked color itself, not a theme color. */
export function ColorPicker({
  label,
  color,
  onChange,
}: {
  label: string;
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
  const shown = picked ?? color;

  return (
    <input
      type="color"
      aria-label={label}
      title={label}
      // Color inputs only take #rrggbb
      value={chroma(shown).hex("rgb")}
      onChange={(event) => {
        latest.current.picked = event.target.value;
        setPicked(event.target.value);
        frame.current ??= requestAnimationFrame(() => {
          frame.current = undefined;
          setPicked(undefined);
          latest.current.onChange(latest.current.picked);
        });
      }}
      className="huet-border-10 hc:w-full hc:h-4 hc:p-0 hc:border hc:rounded-xs hc:overflow-hidden"
      style={{ backgroundColor: shown }}
    />
  );
}
