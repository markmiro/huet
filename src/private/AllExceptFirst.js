import React from "react";
import __ from "./atoms";

export default function AllExceptFirst({ style, styleEach, children }) {
  return [
    React.Children.map(children, (child, i) => (
      <div
        style={{
          ...(i > 0 && style),
          ...styleEach
        }}
      >
        {child}
      </div>
    ))
  ];
}

export function HSpace({ size = 1, growEach, children, style, className }) {
  return (
    <div className={className} style={{ ...__.flex.flex_row, ...style }}>
      <AllExceptFirst
        styleEach={growEach ? { flexGrow: 1 } : null}
        style={__["ml" + size]}
      >
        {children}
      </AllExceptFirst>
    </div>
  );
}

export function VSpace({ size = 1, children, style, className }) {
  return (
    <div className={className} style={{ ...__.flex.flex_column, ...style }}>
      <AllExceptFirst style={__["mt" + size]}>{children}</AllExceptFirst>
    </div>
  );
}
