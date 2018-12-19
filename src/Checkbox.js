import React from "react";
import Contrast from "./Contrast";
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
        onChange={e => onChange(e.target.checked)}
      />
      <Icon
        contrast={contrast}
        name={isChecked ? "check_box" : "check_box_outline_blank"}
        className="mr1"
      />
      {/* <span style={{ fontSize: "1.25em" }}>{isChecked ? "☒" : "☐"}</span>{" "} */}
      {label}
    </Contrast>
  );
};
export default Checkbox;
