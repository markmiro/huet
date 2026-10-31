import { IconChevronDown } from "@tabler/icons-react";

import cx from "./cx";
import { inputClass } from "./inputClass";

/**
 * A native select. The panel's reset removes the browser's arrow, so a
 * chevron is drawn over the right edge instead.
 */
export default function Select<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  label?: string;
}) {
  return (
    <span className="hc:relative hc:flex hc:w-full">
      <select
        aria-label={label}
        className={cx("huet-border-20", inputClass, "hc:w-full hc:pr-[2em] hc:cursor-pointer")}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <IconChevronDown
        aria-hidden
        size="1em"
        stroke={2}
        className="hc:absolute hc:right-[.5em] hc:top-1/2 hc:-translate-y-1/2 hc:pointer-events-none"
      />
    </span>
  );
}
