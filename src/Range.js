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
    const inputTextColor = contrast(100);

    return (
      <div className={`flex flex-column ${className}`} style={{ style }}>
        {label && (
          <Contrast text={50} className="mb1">
            {label}{" "}
            <Contrast className="di" text={30}>
              ({min.toFixed(decimals)}-{max.toFixed(decimals)})
            </Contrast>
          </Contrast>
        )}
        <div className="flex items-center">
          {!hideInput && (
            <input
              type="number"
              className="mr2 ba br1"
              style={{
                width: "5em",
                fontSize: "inherit",
                color: inputTextColor,
                borderColor: contrast(10),
                background: "transparent"
              }}
              value={value.toFixed(decimals)}
              step={step}
              onChange={e => onChange(parseFloat(e.target.value))}
            />
          )}
          <input
            type="range"
            style={{
              color: contrast(20),
              backgroundColor: contrast(10),
              padding: 0,
              height: 1
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
