import React, { useContext } from "react";
import styled from "styled-components";
import { BackgroundContext, Contrast, Block } from "../../huet";

const Button = styled.button`
  &:hover {
    ${({ contrast, ramps }) => `
      border-color: ${contrast(50, ramps.blue)} !important;
      color: ${contrast(20, ramps.blue).contrast(70, ramps.blue)} !important;
      background: linear-gradient(${contrast(20, ramps.blue)}, ${contrast(
      40,
      ramps.blue
    )})
      !important;
    `}
  }
`;

const Button2 = styled.button`
  ${({ contrast, ramps }) => `
      border-color: ${contrast(80, ramps.blue)} !important;
      color: ;
      background: linear-gradient(${contrast(50, ramps.blue)}, ${contrast(
    60,
    ramps.blue
  )})
      !important;
    `}
`;

export default function Basic() {
  const parentBg = useContext(BackgroundContext);
  const theme = parentBg.theme;
  const red = parentBg.contrast(10, theme.ramps.red);
  const hundredContrast = parentBg.contrast(100);
  return (
    <div className="pa4">
      Basic
      <div style={{ color: red }}>Red</div>
      <div style={{ color: hundredContrast }}>100 contrast</div>
      <Contrast text={100}>50 Contrast</Contrast>
      <Contrast className="pa1 tc w-100 f4" bg={100} bgRamp="white">
        Button
      </Contrast>
      {Object.keys(theme.ramps).map(rampKey => (
        <Block
          key={rampKey}
          as="button"
          className="pa1 tc w-100 f4 br2 mt2 ba"
          colors="b:80 bg:60 bg/fg:white"
          base={rampKey}
          style={p => ({
            background: `linear-gradient(${p.contrast(60)}, ${p.contrast(70)})`
          })}
        >
          Button
        </Block>
      ))}
    </div>
  );
}
