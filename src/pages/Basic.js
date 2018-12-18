import React, { useContext } from "react";
import huet from "../huet";
import Contrast from "../Contrast";

export default function Basic() {
  const { contrast } = huet.useTheme();
  const ctx = useContext(huet.ThemeContext);
  const red = contrast(10, { ramp: "red" });
  const hundredContrast = contrast(100);
  return (
    <div className="pa4">
      Basic
      <div style={{ color: red }}>Red</div>
      <div style={{ color: hundredContrast }}>100 contrast</div>
      <Contrast text={100}>50 Contrast</Contrast>
      <pre>minColorLightness: {ctx.minColorLightness}</pre>
      <pre>maxColorLightness: {ctx.maxColorLightness}</pre>
      <pre>bgLightness: {ctx.bgLightness}</pre>
    </div>
  );
}
