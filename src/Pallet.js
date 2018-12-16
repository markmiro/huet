import React from "react";
import styled from "styled-components";
import map from "lodash/map";
import Contrast from "./Contrast";

const ColorPickerElement = styled.input`
  background-color: ${({ color }) => color || "transparent"};
  outline-width: 1px;
  outline-offset: -2px;
  outline-style: solid;
  padding: 0;
`;

function ColorPicker({ color, onChange }) {
  return (
    <Contrast
      as={ColorPickerElement}
      type="color"
      value={color}
      color={color}
      onChange={e => onChange(e.target.value)}
      border={0}
      borderAlpha={0.3}
      outline={100}
      outlineAlpha={0.3}
      className="ba w2 h2"
    />
  );
}

export default function Pallet({ colors, onColorsChange }) {
  return (
    <div>
      {map(colors, (color, key) => (
        <ColorPicker
          key={key}
          color={color}
          onChange={c => onColorsChange({ ...colors, [key]: c })}
        />
      ))}
    </div>
  );
}
