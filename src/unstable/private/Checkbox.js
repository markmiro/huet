import React from "react";
import Contrast from "../Contrast.jsx";
import Icon from "./Icon";

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
      style={style}
      className={`inline-flex items-center ${className}`}
      text={contrast}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={e => onChange && onChange(e.target.checked)}
      />
      <span className="mr1" style={{ fontSize: "1.25em" }}>
        {isChecked ? "☒" : "☐"}
      </span>
      {label}
    </Contrast>
  );
};
export default Checkbox;
