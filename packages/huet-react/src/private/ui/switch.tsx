import { Switch as BaseSwitch } from "@base-ui/react/switch";
import React from "react";

import cx from "../cx";

/**
 * shadcn's Switch on Base UI, in a label. Huet classes have no `checked`
 * variant, so its colors follow the controlled `checked` value. The thumb is
 * full contrast from the track, so it shows both on and off.
 */
export function Switch({
  label,
  checked,
  onCheckedChange,
  className,
  children,
}: {
  label: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  /** More controls on the label's row, after the switch */
  children?: React.ReactNode;
}) {
  return (
    <div className={cx("hc:flex hc:items-center hc:gap-[.5em] hc:min-h-[1.875em]", className)}>
      <label className="hc:flex hc:items-center hc:gap-[.625em] hc:grow hc:cursor-pointer">
        <BaseSwitch.Root
          checked={checked}
          onCheckedChange={onCheckedChange}
          className={cx(
            "hc:relative hc:inline-flex hc:shrink-0 hc:items-center hc:w-[2.25em] hc:h-[1.25em] hc:p-[.1875em] hc:rounded-full hc:cursor-pointer",
            "hc:has-focus-visible:outline-2 hc:has-focus-visible:outline-offset-2 hc:focus-visible:outline-2 hc:focus-visible:outline-offset-2 huet-outline-100",
            checked ? "huet-bg-100" : "huet-bg-20",
          )}
        >
          <BaseSwitch.Thumb
            className={cx(
              "huet-bg-100 hc:block hc:size-[.875em] hc:rounded-full hc:transition-transform hc:duration-150",
              checked && "hc:translate-x-[1em]",
            )}
          />
        </BaseSwitch.Root>
        {label}
      </label>
      {children}
    </div>
  );
}
