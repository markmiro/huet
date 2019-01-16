import React, { useContext } from "react";
import { BackgroundContext } from "./reactContexts";
import Contrast from "../Contrast";

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
      className={`flex flex-column max-input ${className}`}
      style={{ style }}
    >
      {label && (
        <Contrast text={100} className="mb1 flex justify-between">
          {label}
          <Contrast className="di" text={30}>
            ({min.toFixed(decimals)}-{max.toFixed(decimals)})
          </Contrast>
        </Contrast>
      )}
      <div className="flex items-center">
        {!hideInput && (
          <Contrast
            bg={10}
            text={50}
            as="input"
            type="number"
            className="mr1"
            style={{
              width: "5em",
              fontSize: "inherit"
            }}
            value={value.toFixed(decimals)}
            step={step}
            onChange={e => onChange(parseFloat(e.target.value))}
          />
        )}
        <input
          type="range"
          className="self-stretch"
          style={{
            backgroundColor: rangeBg,
            color: rangeBg.contrast(100)
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
