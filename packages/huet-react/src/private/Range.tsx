import React, { useEffect, useMemo, useState } from "react";

import cx from "./cx";
import { inputClass } from "./inputClass";
import Labeled from "./Labeled";

export default function Range({
  label,
  min = 0,
  max = 100,
  decimals = 0,
  value,
  onChange,
  className,
  hideInput = false,
}: {
  label?: React.ReactNode;
  min?: number;
  max?: number;
  decimals?: number;
  value: number;
  onChange?: (value: number) => void;
  className?: string;
  hideInput?: boolean;
}) {
  const step = 1 / 10 ** decimals;
  const [isTyping, setIsTyping] = useState(false);
  const [stringNumber, setStringNumber] = useState(value.toFixed(decimals));
  const isOutOfRange = value < min || value > max;

  useEffect(() => {
    if (!isTyping) setStringNumber(value.toFixed(decimals));
  }, [decimals, isTyping, value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStringNumber(event.target.value);
    const parsed = Number.parseFloat(event.target.value);
    if (!Number.isFinite(parsed)) return;
    onChange?.(parsed);
  };

  const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    onChange?.(parsed);
  };

  const handleKey = (event: React.KeyboardEvent) => {
    let direction: number | null = null;
    if (event.key === "ArrowUp") direction = 1;
    if (event.key === "ArrowDown") direction = -1;

    if (direction) {
      const val = event.shiftKey
        ? value + step * 10 * direction
        : value + step * direction;
      setStringNumber(val.toFixed(decimals));
      onChange?.(val);
      event.preventDefault();
    }
  };

  const labelBody = useMemo(
    () => (
      <span className="hc:flex hc:justify-between">
        {label}
        <span className={isOutOfRange ? "huet-text-red-100" : "huet-text-50"}>
          ({min.toFixed(decimals)}-{max.toFixed(decimals)})
        </span>
      </span>
    ),
    [label, isOutOfRange, decimals, min, max]
  );

  return (
    <Labeled
      label={label && labelBody}
      className={cx("hc:flex hc:flex-col hc:max-w-[30em]", className)}
      onKeyDown={handleKey}
    >
      <span className="hc:flex hc:items-center">
        {!hideInput && (
          <input
            aria-hidden
            type="number"
            className={cx(
              isOutOfRange
                ? "huet-border-red-100 huet-bg-red-12 huet-bg/text-red-100"
                : "huet-border-20",
              inputClass,
              "hc:w-[5em] hc:mr-2 hc:cursor-auto",
            )}
            value={stringNumber}
            step={step}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            onChange={handleInputChange}
          />
        )}
        <input
          aria-label={typeof label === "string" ? label : undefined}
          type="range"
          className={cx("huet-border-20", inputClass, "hc:w-full hc:self-stretch hc:cursor-default")}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleRangeChange}
        />
      </span>
    </Labeled>
  );
}
