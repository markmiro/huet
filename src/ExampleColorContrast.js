import React from "react";
import range from "lodash/range";
import huet from "./huet";
import Contrast from "./Contrast";
import { useDebounce } from "use-debounce";

export default function ColorContrast() {
  const ctx = huet.useTheme();
  const debouncedCtx = useDebounce(ctx.contextValue, 100);
  const sharedSteps = [100 / 16, 100 / 8, 100 / 4, 100 / 2];
  // const colorSteps = [0, ...sharedSteps, 100];
  // // const colorSteps = [4, 8, 16, 32, 64, 100];
  // // const colorSteps = [0, 4, 8, 16, 84, 92, 96, 100];
  // const graySteps = [
  //   0,
  //   ...sharedSteps,
  //   100 - 100 / 4,
  //   100 - 100 / 8,
  //   100 - 100 / 16,
  //   100
  // ];

  const colorSteps = range(0, 120, 20);
  const graySteps = colorSteps;

  return (
    <huet.ThemeContext.Provider value={debouncedCtx}>
      <div>
        {graySteps.map(grayStep => (
          <Contrast key={grayStep} bg={grayStep} className="pa2">
            <b>{grayStep}</b>
            <div className="flex items-center flex-wrap">
              {Object.keys(ctx.contextValue.ramps).map(ramp => (
                <div key={ramp} className="flex mt1 mr2">
                  {ctx.contextValue.ramps[ramp].mode === "direct" ? (
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
                        backgroundColor: ctx.contextValue.ramps[ramp].scale(
                          ctx.contextValue.maxColorLightness / 100
                        )
                      }}
                    />
                    <div
                      className="w1 h-100"
                      style={{
                        backgroundColor: ctx.contextValue.ramps[ramp].scale(
                          ctx.contextValue.minColorLightness / 100
                        )
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Contrast>
        ))}
      </div>
    </huet.ThemeContext.Provider>
  );
}
