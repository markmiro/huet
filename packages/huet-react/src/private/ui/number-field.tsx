import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { IconMinus, IconPlus } from "@tabler/icons-react";

import cx from "../cx";

const stepper =
  "hc:flex hc:items-center hc:justify-center hc:w-[1.625em] hc:h-full hc:cursor-pointer hc:tint-hover hc:data-disabled:opacity-40 hc:data-disabled:cursor-default";

/**
 * shadcn-style number input on Base UI, with its own minus and plus buttons
 * so the steppers take the theme's colors (a native number input's arrows
 * don't).
 */
export function NumberField({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  suffix,
  invalid,
  allowOutOfRange,
  className,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  invalid?: boolean;
  /** Typed values can go past `min`/`max`, so the field can show they're out of range */
  allowOutOfRange?: boolean;
  className?: string;
}) {
  return (
    <BaseNumberField.Root
      value={value}
      onValueChange={(next) => {
        if (next !== null && Number.isFinite(next)) onValueChange(next);
      }}
      min={min}
      max={max}
      step={step}
      smallStep={step / 10}
      largeStep={step * 10}
      allowOutOfRange={allowOutOfRange}
      format={{ maximumFractionDigits: 2 }}
      className={cx("hc:shrink-0", className)}
    >
      <BaseNumberField.Group
        className={cx(
          "hc:flex hc:items-center hc:h-[1.875em] hc:rounded-md hc:border hc:overflow-hidden",
          invalid ? "huet-border-red-100 huet-text-red-100" : "huet-border-20",
        )}
      >
        <BaseNumberField.Decrement aria-label={`Decrease ${label}`} className={stepper}>
          <IconMinus size=".875em" stroke={2} />
        </BaseNumberField.Decrement>
        <span className="hc:flex hc:items-center hc:h-full">
          <BaseNumberField.Input
            aria-label={label}
            className="hc:w-[3em] hc:h-full hc:text-center hc:tabular-nums hc:cursor-text"
          />
          {suffix && <span className="hc:-ml-[.375em] hc:pr-[.25em] huet-text-60">{suffix}</span>}
        </span>
        <BaseNumberField.Increment aria-label={`Increase ${label}`} className={stepper}>
          <IconPlus size=".875em" stroke={2} />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
