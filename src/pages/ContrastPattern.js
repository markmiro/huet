import React, { useState, useContext } from "react";
import { ThemeContext, Block } from "../huet";
import Range from "../Range";

export default function ContrastPattern() {
  const theme = useContext(ThemeContext);
  const [contrast, setContrast] = useState(10);
  const [colorContrast, setColorContrast] = useState(5);
  return (
    <div className="flex-auto pv2">
      <Range
        className="mh2 mb2"
        label="Lightness contrast with parent"
        min={0}
        max={100}
        value={contrast}
        onChange={c => setContrast(c)}
      />
      <Range
        className="mh2 mb2"
        label="Color contrast"
        min={0}
        max={100}
        value={colorContrast}
        onChange={c => setColorContrast(c)}
      />
      <Block
        theme={{
          ...theme,
          bgRampValue: 0
        }}
        colors="bg:0"
      >
        <NestedBlocks
          levels={11}
          ramp={theme.ramps.gray}
          contrast={contrast}
          colorContrast={colorContrast}
        />
      </Block>
      <Block
        theme={{
          ...theme,
          bgRampValue: 1
        }}
        colors="bg:0"
      >
        <NestedBlocks
          levels={11}
          ramp={theme.ramps.gray}
          contrast={contrast}
          colorContrast={colorContrast}
        />
      </Block>
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
  const { ramps } = useContext(ThemeContext);
  if (levels === 0) return null;
  return (
    <Block
      style={parentColor => ({
        backgroundColor: parentColor.contrast(
          currentLevel === 0 ? 0 : contrast,
          ramp
        )
      })}
      className="flex pb2 flex-auto"
    >
      <div className="flex flex-column">
        {Object.keys(ramps).map(rampKey => (
          <Block
            key={rampKey}
            colors={`bg:${colorContrast}-${rampKey} bg/fg:100`}
            className="pa1 mv1 mh2"
          >
            Aa
          </Block>
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
    </Block>
  );
}
