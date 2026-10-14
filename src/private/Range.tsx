import React, { useEffect, useMemo, useState } from "react";

import Block from "../Block";
import Contrast from "../Contrast";
import __ from "./atoms";
import Labeled from "./Labeled";
import { inputStyle, maxInputWidthStyle, rangeClass } from "./styles";

export default function Range({
  label,
  min = 0,
  max = 100,
  decimals = 0,
  value,
  onChange,
  className = "",
  style,
  hideInput = false,
}: {
  label?: React.ReactNode;
  min?: number;
  max?: number;
  decimals?: number;
  value: number;
  onChange?: (value: number) => void;
  className?: string;
  style?: React.CSSProperties;
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
      <div style={__.flex.justify_between}>
        {label}
        <Contrast
          text={isOutOfRange ? 100 : 50}
          textRamp={isOutOfRange ? "red" : null}
        >
          ({min.toFixed(decimals)}-{max.toFixed(decimals)})
        </Contrast>
      </div>
    ),
    [label, isOutOfRange, decimals, min, max]
  );

  return (
    <Labeled
      label={label && labelBody}
      className={className}
      style={{ ...__.flex.flex_column, ...maxInputWidthStyle, ...style }}
      onKeyDown={handleKey}
    >
      <div style={__.flex.items_center}>
        {!hideInput && (
          <Block
            aria-hidden
            base={isOutOfRange ? "red" : null}
            contrast={isOutOfRange ? "b=100 bg=12" : "b=20"}
            as="input"
            type="number"
            style={{
              ...inputStyle,
              color: "inherit",
              background: "transparent",
              width: "5em",
              fontSize: "inherit",
              cursor: "initial",
              ...__.mr2.ba,
            }}
            value={stringNumber}
            step={step}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            onChange={handleInputChange}
          />
        )}
        <Block
          as="input"
          contrast="b=20"
          aria-label={typeof label === "string" ? label : undefined}
          type="range"
          className={rangeClass}
          style={{
            ...inputStyle,
            ...__.self_stretch,
          }}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleRangeChange}
        />
      </div>
    </Labeled>
  );
}
