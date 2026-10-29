import type { CSSProperties } from "react";

import cx from "./cx";

// A CSS border triangle pointing up, colored with `currentColor`
const sizes = {
  ".5em": "hc:border-x-[.5em] hc:border-b-[.5em]",
  ".75em": "hc:border-x-[.75em] hc:border-b-[.75em]",
} as const;

export default function Arrow({
  size,
  className,
  style,
}: {
  size: keyof typeof sizes;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cx(
        "hc:inline-block hc:w-0 hc:h-0 hc:border-x-transparent hc:border-b-current",
        sizes[size],
        className,
      )}
      style={style}
    />
  );
}
