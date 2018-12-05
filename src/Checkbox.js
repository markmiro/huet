import React from "react";
import Contrast from "./Contrast";

const Checkbox = React.memo(
  ({ label, isChecked, onChange, style, className }) => {
    return (
      <label style={style} className={`dib ${className}`}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={e => onChange(e.target.checked)}
        />
        <Contrast text={50}>
          <span style={{ fontSize: "1.25em" }}>{isChecked ? "☒" : "☐"}</span>{" "}
          {label}
        </Contrast>
      </label>
    );
  }
);

export default Checkbox;
