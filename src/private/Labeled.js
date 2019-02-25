import React from "react";

import Block from "../Block";
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
      <Block style={{ ...__.mb1, cursor: "default" }}>{label}</Block>
      {children}
    </label>
  );
}
