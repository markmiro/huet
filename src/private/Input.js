import React from "react";
import { inputStyle } from "./styles";
import Block from "../Block.jsx";
import __ from "./atoms";
import { maxInputWidthStyle } from "./styles";
import Labeled from "./Labeled";

export default function Input({
  label,
  value,
  onChange,
  className,
  style,
  ...rest
}) {
  return (
    <Labeled
      label={label}
      style={{ ...__.flex.flex_column.flex_auto, ...maxInputWidthStyle }}
    >
      <Block
        aria-label={label}
        as="input"
        contrast="bg=10 bg/fg=50"
        className={className}
        style={{
          ...inputStyle,
          borderWidth: 1,
          borderStyle: "solid",
          cursor: "initial",
          ...style
        }}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        {...rest}
      />
    </Labeled>
  );
}
