import React, { useEffect, useMemo, useState } from "react";

import Block from "../Block";
import Contrast from "../Contrast";
import Labeled from "./Labeled";
import __ from "./atoms";
import { inputStyle, maxInputWidthStyle, rangeClass } from "./styles.js";

const Range = ({
  label,
  min = 0,
  max = 100,
  decimals = 0,
  value,
  onChange,
  className = "",
  style,
  hideInput = false
}) => {
  const step = 1 / 10 ** decimals;
  const [isTyping, setIsTyping] = useState(false);
  const [stringNumber, setStringNumber] = useState(value.toFixed(decimals));
  const isOutOfRange = value < min || value > max;

  useEffect(() => {
    if (!isTyping) setStringNumber(value.toFixed(decimals));
  }, [value]);

  const handleInputChange = e => {
    setStringNumber(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!Number.isFinite(parsed)) return;
    onChange(parsed);
  };

  const handleRangeChange = e => {
    const parsed = parseFloat(e.target.value);
    if (onChange) {
      onChange(parsed);
    }
  };

  const handleKey = e => {
    let direction = null;
    if (e.key === "ArrowUp") direction = 1;
    if (e.key === "ArrowDown") direction = -1;

    let val;
    if (direction) {
      if (e.shiftKey) {
        val = value + step * 10 * direction;
      } else {
        val = value + step * direction;
      }
      setStringNumber(val.toFixed(decimals));
      onChange(val);
      e.preventDefault();
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
    [label, isOutOfRange, decimals]
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
              ...__.mr2.ba
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
          aria-label={label}
          type="range"
          className={rangeClass}
          style={{
            ...inputStyle,
            ...__.self_stretch
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
};

export default Range;
