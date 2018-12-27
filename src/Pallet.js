import React from "react";
import styled from "styled-components";
import map from "lodash/map";
import Contrast from "./Contrast";

const ColorPickerElement = styled.input`
  background-color: ${({ color }) => color || "transparent"};
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
      border={100}
      borderAlpha={0.3}
      className="ba w-100 h1"
    />
  );
}

export default function Pallet({ colors, onColorsChange }) {
  return (
    <div className="flex">
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
