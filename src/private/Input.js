import React from "react";
import { inputStyle } from "./styles";
import Block from "../Block.jsx";
import __ from "./atoms";
import { maxInputWidthStyle } from "./styles";

export default function Input({
  label,
  value,
  onChange,
  className,
  style,
  ...rest
}) {
  return (
    <div style={{ ...__.flex.flex_column.flex_auto, ...maxInputWidthStyle }}>
      {label && <Block style={__.mb1.i}>{label}</Block>}
      <Block
        as="input"
        contrast="bg=10 bg/fg=50"
        className={className}
        style={parentBg => ({
          ...inputStyle,
          borderWidth: 1,
          borderStyle: "solid",
          cursor: "initial",
          ...style
        })}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}
