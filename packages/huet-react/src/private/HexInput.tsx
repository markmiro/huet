import chroma from "chroma-js";
import React, { useState } from "react";

import cx from "./cx";

/** A color typed as text. It applies as soon as it's a valid color, and shows the current color otherwise. */
export default function HexInput({
  label,
  color,
  onChange,
  className,
}: {
  label: string;
  color: string;
  onChange: (color: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState<string>();
  const shown = draft ?? chroma(color).hex("rgb");
  const isValid = draft === undefined || chroma.valid(draft);
  return (
    <input
      aria-label={label}
      spellCheck={false}
      value={shown}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        if (chroma.valid(next)) onChange(chroma(next).hex());
      }}
      onBlur={() => setDraft(undefined)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === "Escape") {
          setDraft(undefined);
          event.currentTarget.blur();
        }
      }}
      className={cx(
        "hc:h-[1.875em] hc:w-[6.5em] hc:px-[.5em] hc:border hc:rounded-md hc:font-mono hc:text-[.9375em] hc:cursor-text",
        isValid ? "huet-border-20" : "huet-border-red-100 huet-text-red-100",
        className,
      )}
    />
  );
}
