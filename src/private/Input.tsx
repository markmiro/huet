import React from "react";

import Block from "../Block";
import __ from "./atoms";
import Labeled from "./Labeled";
import { inputStyle, maxInputWidthStyle } from "./styles";

export default function Input({
  label,
  value,
  onChange,
  className,
  style,
  ...rest
}: {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "style">) {
  return (
    <Labeled
      label={label}
      style={{ ...__.flex.flex_column.flex_auto, ...maxInputWidthStyle }}
    >
      <Block
        aria-label={label}
        as="input"
        contrast="b=20"
        className={className}
        style={{
          ...inputStyle,
          borderWidth: 1,
          borderStyle: "solid",
          cursor: "initial",
          ...style,
        }}
        value={value}
        onChange={(event) => {
          const target = event.target as HTMLInputElement;
          onChange?.(target.value);
        }}
        {...rest}
      />
    </Labeled>
  );
}
