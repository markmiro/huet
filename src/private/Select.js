import React from "react";
import Contrast from "../Contrast";
import __ from "./atoms";
import { inputStyle } from "./styles";

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
        style={{
          ...inputStyle,
          ...__.relative.dib.w100.flex.justify_between
        }}
      >
        <select
          value={finalValue}
          onChange={e => onChange && onChange(e.target.value)}
          style={{
            ...__.o0.absolute.w100.h100.top0.left0.br0,
            padding: 1,
            border: 0,
            background: "none"
          }}
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
