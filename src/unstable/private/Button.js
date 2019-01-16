import React from "react";
import Contrast from "../Contrast";

export function ButtonGroup({ children, className, style }) {
  const items = React.Children.map(children, (child, i) => {
    const isFirst = i === 0;
    return <div className={`${isFirst ? "" : "ml1"}`}>{child}</div>;
  });

  return (
    <div className={`flex ${className}`} style={{ marginRight: 1, ...style }}>
      {items}
    </div>
  );
}

export default function Button({
  className,
  style,
  children,
  isActive,
  verify,
  onClick,
  ...rest
}) {
  return (
    <Contrast
      as="button"
      bgRamp={isActive ? "blue" : "gray"}
      bg={10}
      text={50}
      onClick={e => {
        if (verify) {
          const didAccept = window.confirm(
            verify === true ? "Are you sure?" : verify
          );
          if (!didAccept) return;
        }
        onClick && onClick(e);
      }}
      {...rest}
      className={`flex justify-center ${className}`}
      style={style}
    >
      {children}
    </Contrast>
  );
}
