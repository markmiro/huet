import React from "react";

import Block from "../Block";
import __ from "./atoms";

export default function AllExceptFirst({
  styleExcept,
  styleEach,
  children,
}: {
  styleExcept?: React.CSSProperties | null;
  styleEach?: React.CSSProperties | null;
  children?: React.ReactNode;
}) {
  return React.Children.map(children, (child, i) => (
    <Block
      style={{
        ...(i > 0 ? styleExcept ?? undefined : undefined),
        ...styleEach,
      }}
    >
      {child}
    </Block>
  ));
}

export function HSpace({
  size = 1,
  growEach,
  children,
  style,
  className,
}: {
  size?: number | string;
  growEach?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
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

export function VSpace({
  size = 1,
  children,
  style,
  className,
}: {
  size?: number | string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={className} style={{ ...__.flex.flex_column, ...style }}>
      <AllExceptFirst styleExcept={__["mt" + size]}>{children}</AllExceptFirst>
    </div>
  );
}
