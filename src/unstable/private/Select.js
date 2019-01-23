import React from "react";
import Contrast from "../Contrast.jsx";
import __ from "../atoms";

const Select = ({ value, onChange, label, children, className, style }) => {
  const selectedChild =
    children &&
    React.Children.toArray(children).find(child => child.props.value === value);
  const text = selectedChild ? selectedChild.props.children : "None";
  const finalValue = selectedChild ? value : "";
  return (
    <div className={className} style={style}>
      <Contrast style={__.db.mb1}>{label}</Contrast>
      <Contrast
        bg={10}
        text={50}
        className="hh-input"
        style={__.relative.dib.w100.flex.justify_between}
      >
        <select
          value={finalValue}
          style={__.o0.absolute.w100.h100.top0.left0}
          onChange={e => onChange && onChange(e.target.value)}
        >
          {children}
          {!selectedChild && <option value="">None</option>}
        </select>
        {text}
        <div style={__.ml2}>▿</div>
      </Contrast>
    </div>
  );
};

export default Select;
