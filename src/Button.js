import React from "react";
import huet from "./huet";

export function ButtonGroup({ children, className, style }) {
  const items = React.Children.map(children, (child, i) => {
    const maybeLeftBorder = i === 0 ? "br--left" : "";
    const maybeRightBorder = i === children.length - 1 ? "br--right" : "";
    return (
      <div style={{ ...style, marginRight: -1 }} className={className}>
        <child.type
          {...child.props}
          className={`${
            child.props.className
          } ${maybeLeftBorder} ${maybeRightBorder}`}
          style={{
            ...child.props.style,
            borderRadius: !maybeLeftBorder && !maybeRightBorder ? 0 : null
          }}
        />
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
  const { contrast } = huet.useTheme();
  return (
    <button
      {...rest}
      className={`ba br1 ${className}`}
      style={{
        backgroundColor: isActive ? contrast(10, { ramp: "blue" }) : null,
        borderColor: contrast(10),
        color: contrast(100),
        ...style
      }}
    >
      {children}
    </button>
  );
}
