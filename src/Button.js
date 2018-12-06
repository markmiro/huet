import React from "react";
import Contrast from "./Contrast";

export function ButtonGroup({ children, className, style }) {
  const items = React.Children.map(children, (child, i) => {
    const isFirst = i === 0;
    return (
      <div style={style} className={`${className} ${isFirst ? "" : "ml1"}`}>
        {child}
      </div>
    );
  });

  return (
    <div className="flex" style={{ marginRight: 1 }}>
      {items}
    </div>
  );
}

export default function Button({
  className,
  style,
  children,
  isActive,
  ...rest
}) {
  return (
    <Contrast
      as="button"
      bgRamp={isActive ? "blue" : "gray"}
      bg={5}
      text={50}
      {...rest}
      className={className}
      style={style}
    >
      {children}
    </Contrast>
  );
}
