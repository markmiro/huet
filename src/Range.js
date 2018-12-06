import React from "react";
import Contrast from "./Contrast";
import huet from "./huet";

const Range = React.memo(
  ({
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
    const { contrast } = huet.useTheme();

    return (
      <div className={`flex flex-column ${className}`} style={{ style }}>
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
              bg={5}
              text={50}
              as="input"
              type="number"
              className="mr1"
              style={{
                width: "5em",
                fontSize: "inherit"
                // borderColor: contrast(10)
                // background: "transparent"
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
              color: contrast(100),
              backgroundColor: contrast(5)
            }}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
          />
        </div>
      </div>
    );
  }
);

export default Range;
