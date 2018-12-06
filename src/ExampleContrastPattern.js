import React, { useState, useContext } from "react";
import huet from "./huet";
import Range from "./Range";
import Contrast from "./Contrast";

const { ThemeContext } = huet;

export default function ContrastPattern() {
  const ctx = useContext(ThemeContext);
  const [contrast, setContrast] = useState(10);
  const [colorContrast, setColorContrast] = useState(5);
  return (
    <div className="flex-auto pv2">
      <Range
        className="ph2 pb2"
        label="Lightness contrast with parent"
        min={0}
        max={100}
        value={contrast}
        onChange={c => setContrast(c)}
      />
      <Range
        className="ph2 pb2"
        label="Color contrast"
        min={0}
        max={100}
        value={colorContrast}
        onChange={c => setColorContrast(c)}
      />
      <ThemeContext.Provider
        value={{
          ...ctx,
          bgLightness: ctx.ramps.gray.lightL,
          bgLightnessAbove: ctx.ramps.gray.lightL
        }}
      >
        <NestedBlocks
          levels={11}
          ramp="gray"
          contrast={contrast}
          colorContrast={colorContrast}
        />
      </ThemeContext.Provider>
      <ThemeContext.Provider
        value={{
          ...ctx,
          bgLightness: ctx.ramps.gray.darkL,
          bgLightnessAbove: ctx.ramps.gray.darkL
        }}
      >
        <NestedBlocks
          levels={11}
          ramp="gray"
          contrast={contrast}
          colorContrast={colorContrast}
        />
      </ThemeContext.Provider>
    </div>
  );
}

function NestedBlocks({
  currentLevel = 0,
  levels = 2,
  ramp = null,
  contrast,
  colorContrast
}) {
  const ctx = useContext(ThemeContext);
  if (levels === 0) return null;
  return (
    <Contrast
      bgRamp={ramp || "gray"}
      bg={currentLevel === 0 ? 0 : contrast}
      className="flex pb2 flex-auto"
    >
      <div className="flex flex-column">
        {Object.keys(ctx.ramps).map(key => (
          <Contrast
            key={key}
            bg={colorContrast}
            bgRamp={key}
            contrast={100}
            className="mv1 mh2 pa1"
          >
            Aa
          </Contrast>
        ))}
      </div>
      {currentLevel < levels - 1 && (
        <NestedBlocks
          currentLevel={currentLevel + 1}
          levels={levels}
          contrast={contrast}
          ramp={ramp}
          colorContrast={colorContrast}
        />
      )}
    </Contrast>
  );
}
