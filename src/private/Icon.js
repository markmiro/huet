import React, { useContext } from "react";
import { BackgroundContext } from "../reactContexts";
import __ from "./atoms";

const Icon = ({ name, contrast, ramp, className, style, size = "1em" }) => {
  const parentBg = useContext(BackgroundContext);
  const color = parentBg.contrast(contrast, ramp);

  return (
    <div className={className} style={style}>
      <span style={{ ...__.ba, color, borderStyle: "dotted" }}>{name}</span>
    </div>
  );
};
export default Icon;
