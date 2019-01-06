import React, { useContext } from "react";
import range from "lodash/range";
import partition from "lodash/partition";
import { useDebounce } from "use-debounce";
import { ThemeContext, BackgroundContext, Contrast } from "../huet";
import useBrowserState from "../useBrowserState";
import Select from "../Select";

const sharedDoubleFractionSteps = [100 / 16, 100 / 8, 100 / 4, 100 / 2];
const doubleSteps = [0, 4, 8, 16, 32, 64, 100];
const littleSteps = [0, 2, 4, 6, 96, 98, 100];

const stepSizes = {
  doubleFraction: {
    graySteps: [
      0,
      ...sharedDoubleFractionSteps,
      100 - 100 / 4,
      100 - 100 / 8,
      100 - 100 / 16,
      100
    ],
    colorSteps: [0, ...sharedDoubleFractionSteps, 100]
  },
  double: {
    graySteps: doubleSteps,
    colorSteps: doubleSteps
  },
  littleSteps: {
    graySteps: littleSteps,
    colorSteps: littleSteps
  },
  increment10: {
    graySteps: range(0, 110, 10),
    colorSteps: range(0, 110, 10)
  },
  increment20: {
    graySteps: range(0, 120, 20),
    colorSteps: range(0, 120, 20)
  }
};

const Things = React.memo(({ colorSteps, graySteps, theme }) => {
  const [direct, indirect] = partition(
    Object.keys(theme.ramps),
    key => theme.ramps[key].config.mode === "direct"
  );
  return (
    <ThemeContext.Provider value={theme}>
      {graySteps.map(grayStep => (
        <Contrast key={grayStep} bg={grayStep} className="pa2">
          <b>{grayStep}</b>
          <div className="flex flex-wrap">
            {[...indirect, ...direct].map(ramp => (
              <div key={ramp} className="flex mt1 mr2">
                {theme.ramps[ramp].config.mode === "direct" ? (
                  <Contrast
                    bg={0}
                    bgRamp={ramp}
                    text={0}
                    textRamp={ramp}
                    className="pa1"
                  >
                    Direct
                  </Contrast>
                ) : (
                  colorSteps.map(colorStep => (
                    <Contrast
                      key={colorStep}
                      bg={colorStep}
                      bgRamp={ramp}
                      text={colorStep}
                      textRamp={ramp}
                      className="pa1"
                    >
                      {colorStep.toString()}
                    </Contrast>
                  ))
                )}
                <div className="flex flex-column">
                  <div
                    className="w1 h-100"
                    style={{
                      backgroundColor: theme.ramps[ramp](
                        theme.minColorLightness / 100
                      )
                    }}
                  />
                  <div
                    className="w1 h-100"
                    style={{
                      backgroundColor: theme.ramps[ramp](
                        theme.maxColorLightness / 100
                      )
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Contrast>
      ))}
    </ThemeContext.Provider>
  );
});

export default function ColorContrast() {
  const parentBg = useContext(BackgroundContext);
  const debouncedTheme = useDebounce(parentBg.theme, 100);
  const [stepKey, setStepKey] = useBrowserState("increment20");

  return (
    <div>
      <Select
        label="Step sizes"
        value={stepKey}
        onChange={setStepKey}
        className="pa2"
      >
        <option value="doubleFraction">100/16, 100/8, 100/4...</option>
        <option value="double">0, 4, 8, ..., 92, 96, 100</option>
        <option value="littleSteps">2, 4, ..., 98, 100</option>
        <option value="increment10">10, 20, 30, ...</option>
        <option value="increment20">20, 40, 80, ...</option>
      </Select>
      <Things {...stepSizes[stepKey]} theme={debouncedTheme} />
    </div>
  );
}
