import React from "react";

import Block from "../Block";
import __ from "./atoms";

export default function Labeled({
  label,
  children,
  className,
  style,
  ...rest
}: {
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>) {
  if (!label) {
    return (
      <div className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }
  return (
    <label className={className} style={style} {...rest}>
      <Block style={{ ...__.mb1, cursor: "default" }}>{label}</Block>
      {children}
    </label>
  );
}
