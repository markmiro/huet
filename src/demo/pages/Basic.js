import React, { useContext } from "react";
import { BackgroundContext, Contrast, Block } from "../../huet";
import __ from "../../private/atoms";

export default function Basic() {
  const parentBg = useContext(BackgroundContext);
  const theme = parentBg.theme;
  const rampKeys = Object.keys(theme.ramps).filter(
    rampKey => theme.ramps[rampKey].config.mode === "colored"
  );
  return (
    <div
      style={{
        ...__.pa4,
        width: "50em",
        marginLeft: "auto",
        marginRight: "auto"
      }}
    >
      <h1 style={__.f1}>Basic</h1>
      <Block debug contrast="bg=12" base="red">
        Test
      </Block>
      <div>
        {rampKeys.map(rampKey => (
          <Block
            key={rampKey}
            contrast="b=100 bg=100 bg/fg=white"
            base={rampKey}
            style={__.pa2}
          >
            {rampKeys.map(rampKey => (
              <Block key={rampKey} contrast="fg=100" base={rampKey}>
                △◉✓ The quick brown fox jumped over the lazy dog.
              </Block>
            ))}
          </Block>
        ))}
      </div>
    </div>
  );
}
