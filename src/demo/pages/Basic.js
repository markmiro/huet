import React, { useContext } from "react";
import { BackgroundContext, Contrast, Block } from "../../huet";
import __ from "../../private/atoms";

export default function Basic() {
  const parentBg = useContext(BackgroundContext);
  const theme = parentBg.theme;
  const red = parentBg.contrast(10, theme.ramps.red);
  const hundredContrast = parentBg.contrast(100);
  const rampKeys = Object.keys(theme.ramps).filter(
    rampKey => theme.ramps[rampKey].config.mode === "colored"
  );
  return (
    <div style={__.pa4}>
      Basic
      <div style={{ color: red }}>Red</div>
      <div style={{ color: hundredContrast }}>100 contrast</div>
      <Contrast text={100}>50 Contrast</Contrast>
      <Contrast bg={100} bgRamp="white" style={__.pa1.tc.w100.f4}>
        Button
      </Contrast>
      <div style={__.pa3}>
        {rampKeys.map(rampKey => (
          <Block
            key={rampKey}
            contrast="b=100 bg=100 bg/fg=white"
            base={rampKey}
            style={__.pa2}
          >
            {rampKeys.map(rampKey => (
              <Block as="span" key={rampKey} contrast="fg=100" base={rampKey}>
                △⁄■◉✓
              </Block>
            ))}
          </Block>
        ))}
      </div>
      {rampKeys.map(rampKey => (
        <Block
          key={rampKey}
          as="button"
          contrast="b=80 bg=60 bg/fg=white"
          base={rampKey}
          style={p => ({
            ...__.pa1.tc.w100.f4.br2.mt2.ba,
            background: `linear-gradient(${p.contrast(60)}, ${p.contrast(70)})`
          })}
        >
          Button
        </Block>
      ))}
    </div>
  );
}
