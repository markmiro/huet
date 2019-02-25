import _ from "lodash";
import React from "react";

import Block from "../Block";
import { HSpace } from "./AllExceptFirst";
import __ from "./atoms";
import { colorClass } from "./styles";

function ColorPicker({ color, onChange }) {
  return (
    <Block
      as="input"
      contrast="b=12"
      type="color"
      value={color}
      onChange={e => onChange(e.target.value)}
      className={colorClass}
      style={{
        ...__.w100.h1.pa0.ba.br1,
        overflow: "hidden",
        backgroundColor: color || "transparent"
      }}
    />
  );
}

export default function Pallet({ colors, onColorsChange }) {
  return (
    <HSpace growEach>
      {_.map(colors, (color, key) => (
        <ColorPicker
          key={key}
          color={color}
          onChange={c => onColorsChange({ ...colors, [key]: c })}
        />
      ))}
    </HSpace>
  );
}
