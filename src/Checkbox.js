import React from "react";
import Contrast from "./Contrast";
import Icon from "./Icon";

const Checkbox = React.memo(
  ({ label, isChecked, onChange, style, className }) => {
    return (
      <Contrast
        as="label"
        style={style}
        className={`inline-flex items-center ${className}`}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={e => onChange(e.target.checked)}
        />
        <Icon
          name={isChecked ? "check_box/12" : "check_box_outline_blank/12"}
          className="mr1"
        />
        {/* <span style={{ fontSize: "1.25em" }}>{isChecked ? "☒" : "☐"}</span>{" "} */}
        {label}
      </Contrast>
    );
  }
);

export default Checkbox;
