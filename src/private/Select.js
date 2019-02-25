import React from "react";

import Block from "../Block";
import Contrast from "../Contrast";
import Arrow from "./Arrow";
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
      <div style={__.db.mb1}>{label}</div>
      <Block
        contrast="b=20"
        style={{
          ...inputStyle,
          ...__.relative.dib.w100.flex.justify_between.items_center
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
        <Arrow direction="down" size=".4em" style={__.ml2.mr1} />
      </Block>
    </div>
  );
};

export default Select;
