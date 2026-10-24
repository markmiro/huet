import React from "react";

import Block from "../Block";
import __ from "./atoms";
import Arrow from "./Arrow";
import { inputStyle } from "./styles";

export default function Select({
  value,
  onChange,
  label,
  children,
  className,
  style,
}: {
  value?: string;
  onChange?: (value: string) => void;
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const selectedChild = React.Children.toArray(children).find(
    (child): child is React.ReactElement<{ value?: string; children?: React.ReactNode }> =>
      React.isValidElement<{ value?: string }>(child) && child.props.value === value
  );
  const text = selectedChild ? selectedChild.props.children : "None";
  const finalValue = selectedChild ? value : "";

  return (
    <div className={className} style={style}>
      <div style={__.db.mb1}>{label}</div>
      <Block
        contrast="b=20"
        style={{
          ...inputStyle,
          ...__.relative.dib.w100.flex.justify_between.items_center,
        }}
      >
        <select
          value={finalValue}
          onChange={(event) => onChange?.(event.target.value)}
          style={{
            ...__.o0.absolute.w100.h100.top0.left0.br0,
            padding: 1,
            border: 0,
            background: "none",
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
}
