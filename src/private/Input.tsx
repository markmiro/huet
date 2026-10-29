import React from "react";

import cx from "./cx";
import { inputClass } from "./inputClass";
import Labeled from "./Labeled";

export default function Input({
  label,
  value,
  onChange,
  className,
  ...rest
}: {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "className">) {
  return (
    <Labeled
      label={label}
      className="hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:max-w-[30em]"
    >
      <input
        aria-label={label}
        className={cx(
          "huet-border-20",
          inputClass,
          "hc:w-full hc:cursor-auto",
          className,
        )}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        {...rest}
      />
    </Labeled>
  );
}
