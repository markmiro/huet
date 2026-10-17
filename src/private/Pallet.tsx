import _ from "lodash";
import React from "react";

import Block from "../Block";
import { HSpace } from "./AllExceptFirst";
import __ from "./atoms";
import { colorClass } from "./styles";

function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  return (
    <Block
      as="input"
      contrast="b=12"
      type="color"
      value={color}
      onChange={(event) => onChange((event.target as HTMLInputElement).value)}
      className={colorClass}
      style={{
        ...__.w100.h1.pa0.ba.br1,
        overflow: "hidden",
        backgroundColor: color || "transparent",
      }}
    />
  );
}

export default function Pallet({
  colors,
  onColorsChange,
}: {
  colors: Record<string, string>;
  onColorsChange: (colors: Record<string, string>) => void;
}) {
  return (
    <HSpace growEach>
      {_.map(colors, (color, key) => (
        <ColorPicker
          key={key}
          color={color}
          onChange={(next) => onColorsChange({ ...colors, [key]: next })}
        />
      ))}
    </HSpace>
  );
}
