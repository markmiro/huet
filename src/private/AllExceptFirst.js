import React from "react";

import Block from "../Block";
import __ from "./atoms";

export default function AllExceptFirst({ styleExcept, styleEach, children }) {
  return [
    React.Children.map(children, (child, i) => (
      <Block
        style={parentBg => ({
          ...(i > 0 && styleExcept),
          ...styleEach
        })}
      >
        {child}
      </Block>
    ))
  ];
}

export function HSpace({ size = 1, growEach, children, style, className }) {
  return (
    <div className={className} style={{ ...__.flex.flex_row, ...style }}>
      <AllExceptFirst
        styleEach={growEach ? { flexGrow: 1 } : null}
        styleExcept={__["ml" + size]}
      >
        {children}
      </AllExceptFirst>
    </div>
  );
}

export function VSpace({ size = 1, children, style, className }) {
  return (
    <div className={className} style={{ ...__.flex.flex_column, ...style }}>
      <AllExceptFirst styleExcept={__["mt" + size]}>{children}</AllExceptFirst>
    </div>
  );
}
