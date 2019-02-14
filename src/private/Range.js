import React, { useContext, useState, useEffect, useMemo } from "react";
import { BackgroundContext } from "../reactContexts";
import Contrast from "../Contrast";
import __ from "./atoms";
import { rangeClass, inputStyle, maxInputWidthStyle } from "./styles.js";
import Labeled from "./Labeled";

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
  const step = 1 / Math.pow(10, decimals);
  const parentBg = useContext(BackgroundContext);
  const rangeBg = parentBg.contrast(10);
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
    console.log(e.key, e.shiftKey, e.which);
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
          text={isOutOfRange ? 50 : 30}
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
          <Contrast
            aria-hidden
            bg={isOutOfRange ? 50 : 10}
            bgRamp={isOutOfRange ? "red" : null}
            text={50}
            as="input"
            type="number"
            style={{
              ...inputStyle,
              width: "5em",
              fontSize: "inherit",
              cursor: "initial",
              ...__.mr1
            }}
            value={stringNumber}
            step={step}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            onChange={handleInputChange}
          />
        )}
        <input
          aria-label={label}
          type="range"
          className={rangeClass}
          style={{
            ...inputStyle,
            backgroundColor: rangeBg,
            color: rangeBg.contrast(100),
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
