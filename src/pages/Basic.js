import React, { useContext } from "react";
import { BackgroundContext } from "../huet";
import Contrast from "../Contrast";

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
      <pre>minColorLightness: {theme.minColorLightness}</pre>
      <pre>maxColorLightness: {theme.maxColorLightness}</pre>
    </div>
  );
}
