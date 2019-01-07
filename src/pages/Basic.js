import React, { useContext } from "react";
import { BackgroundContext, Contrast, Block } from "../huet";

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
      <Block className="pa1 tc w-100 f4" colors="bg:100-white bg/fg:100">
        Button
      </Block>
    </div>
  );
}
