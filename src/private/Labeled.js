import React from "react";
import __ from "./atoms";

export default function Labeled({ label, children, className, style }) {
  if (!label) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <label className={className} style={style}>
      <div style={{ ...__.i.mb1, cursor: "default" }}>{label}</div>
      {children}
    </label>
  );
}
