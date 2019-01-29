import React, { useContext } from "react";
import { BackgroundContext } from "../reactContexts";
import Contrast from "../Contrast.jsx";
import __ from "./atoms";
import { rangeClass, inputStyle, maxInputWidthStyle } from "./styles.js";

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
  return (
    <div
      className={className}
      style={{ ...__.flex.flex_column, ...maxInputWidthStyle, ...style }}
    >
      {label && (
        <Contrast text={100} style={__.i.mb1.flex.justify_between}>
          {label}
          <Contrast style={__.di} text={30}>
            ({min.toFixed(decimals)}-{max.toFixed(decimals)})
          </Contrast>
        </Contrast>
      )}
      <div style={__.flex.items_center}>
        {!hideInput && (
          <Contrast
            bg={10}
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
            value={value.toFixed(decimals)}
            step={step}
            onChange={e => onChange(parseFloat(e.target.value))}
          />
        )}
        <input
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
          onChange={e => onChange && onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default Range;
