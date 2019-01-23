import React from "react";
import Contrast from "../Contrast.jsx";
import __ from "../atoms";

const Checkbox = ({
  label,
  isChecked,
  onChange,
  style,
  className,
  contrast
}) => {
  return (
    <Contrast
      as="label"
      className={className}
      style={{ ...__.inline_flex.items_center.relative, ...style }}
      text={contrast}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={e => onChange && onChange(e.target.checked)}
        style={__.absolute.top0.left0.w0.h100}
      />
      <span style={{ ...__.mr1, fontSize: "1.25em" }}>
        {isChecked ? "☒" : "☐"}
      </span>
      {label}
    </Contrast>
  );
};
export default Checkbox;
