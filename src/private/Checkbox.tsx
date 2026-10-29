import React from "react";

import Contrast from "../Contrast";
import __ from "./atoms";

export default function Checkbox({
  label,
  value,
  onChange,
  style,
  className,
  contrast,
}: {
  label?: string;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
  contrast?: number;
}) {
  return (
    <Contrast
      as="label"
      className={className}
      style={{
        ...__.inline_flex.relative,
        cursor: "default",
        ...style,
      }}
      text={contrast}
    >
      <input
        aria-label={label}
        type="checkbox"
        checked={value}
        onChange={(event) => onChange?.(event.target.checked)}
        style={__.absolute.top0.left0.w100.h100}
      />
      <span style={{ ...__.mr1, fontSize: "1.25em", lineHeight: 1 }}>
        {value ? "☒" : "☐"}
      </span>
      <div>{label}</div>
    </Contrast>
  );
}
