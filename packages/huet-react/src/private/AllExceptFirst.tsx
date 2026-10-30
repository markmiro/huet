import React from "react";

import cx from "./cx";

// Gaps on the old atoms spacing scale: 1, 2, 3 = .25, .5, 1rem
const marginLeft = { 1: "hc:ml-1", 2: "hc:ml-2", 3: "hc:ml-4" } as const;
const marginTop = { 1: "hc:mt-1", 2: "hc:mt-2", 3: "hc:mt-4" } as const;
type Size = keyof typeof marginLeft;

/** Wraps each child, adding `exceptFirst` to every wrapper but the first. */
export default function AllExceptFirst({
  exceptFirst,
  each,
  children,
}: {
  exceptFirst?: string;
  each?: string;
  children?: React.ReactNode;
}) {
  return React.Children.map(children, (child, i) => (
    <div className={cx(i > 0 && exceptFirst, each) || undefined}>{child}</div>
  ));
}

export function HSpace({
  size = 1,
  growEach,
  children,
  className,
}: {
  size?: Size;
  growEach?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("hc:flex hc:flex-row", className)}>
      <AllExceptFirst
        each={growEach ? "hc:grow" : undefined}
        exceptFirst={marginLeft[size]}
      >
        {children}
      </AllExceptFirst>
    </div>
  );
}

export function VSpace({
  size = 1,
  children,
  className,
}: {
  size?: Size;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("hc:flex hc:flex-col", className)}>
      <AllExceptFirst exceptFirst={marginTop[size]}>{children}</AllExceptFirst>
    </div>
  );
}
