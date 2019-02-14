import React from "react";
import Contrast from "../Contrast";
import Block from "../Block.js";
import __ from "./atoms";

const Checkbox = ({
  label,
  value,
  onChange,
  style,
  className,
  contrast,
  note
}) => {
  return (
    <Contrast
      as="label"
      className={className}
      style={{
        ...__.inline_flex.relative,
        cursor: "default",
        ...style
      }}
      text={contrast}
    >
      <input
        aria-label={label}
        type="checkbox"
        checked={value}
        onChange={e => onChange && onChange(e.target.checked)}
        style={__.absolute.top0.left0.w100.h100}
      />
      <span style={{ ...__.mr1, fontSize: "1.25em", lineHeight: 1 }}>
        {value ? "☒" : "☐"}
      </span>
      <div>
        {label}
        {note && (
          <Block contrast="fg=50" as="small" style={__.db.i}>
            {note}
          </Block>
        )}
      </div>
    </Contrast>
  );
};
export default Checkbox;
