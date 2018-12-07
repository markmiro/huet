import React from "react";
import Contrast from "./Contrast";
import Icon from "./Icon";

const Select = ({ value, onChange, label, children, className }) => {
  const text =
    children &&
    React.Children.toArray(children).find(child => child.props.value === value)
      .props.children;
  return (
    <div className={className}>
      <Contrast className="db mb1">{label}</Contrast>
      <Contrast
        bg={10}
        text={50}
        className="relative dib w-100 flex justify-between input"
      >
        <select
          value={value}
          className="o-0 absolute w-100 h-100 top-0 left-0"
          onChange={e => onChange(e.target.value)}
        >
          {children}
        </select>
        {text}
        <Icon name="chevron" size=".6em" className="ml2 rotate-90" />
      </Contrast>
    </div>
  );
};

export default Select;
