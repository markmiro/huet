import React from "react";

import Block from "../Block.js";
import Labeled from "./Labeled";
import __ from "./atoms";
import { inputStyle, maxInputWidthStyle } from "./styles";

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
        contrast="b=20"
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
