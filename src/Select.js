import React from "react";
import Contrast from "./Contrast";
import huet from "./huet";

const Select = React.memo(({ value, onChange, label, children, className }) => {
  const { contrast } = huet.useTheme();
  const textColor = contrast(100);
  const text =
    children &&
    React.Children.toArray(children).find(child => child.props.value === value)
      .props.children;
  return (
    <div className={className}>
      <Contrast text={50} className="db mb1">
        {label}
      </Contrast>
      <div
        className="relative dib w-100 flex justify-between ba br1"
        style={{
          borderColor: contrast(10),
          padding: ".3em .5em",
          color: textColor
        }}
      >
        <select
          className="o-0 absolute w-100 h-100 top-0 left-0"
          onChange={e => onChange(e.target.value)}
        >
          {children}
        </select>
        {text}
        <span className="ml2">▿</span>
      </div>
    </div>
  );
});

export default Select;
