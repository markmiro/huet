import React from "react";
import huet from "./huet";
import Contrast from "./Contrast";

export default function ColorContrast() {
  const ctx = huet.useTheme();
  const graySteps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  // const graySteps = [0, 4, 8, 16, 32, 64, 100];
  const colorSteps = [0, 4, 8, 16, 32, 64, 100];
  return (
    <div>
      {graySteps.map(grayStep => (
        <Contrast key={grayStep} bg={grayStep} className="pa2">
          <b>{grayStep}</b>
          <div className="flex items-center flex-wrap">
            {Object.keys(ctx.value.ramps).map(ramp => (
              <div key={ramp} className="flex mv2 mr2">
                {colorSteps.map(colorStep => (
                  <Contrast
                    key={colorStep}
                    bg={colorStep}
                    bgRamp={ramp}
                    className="pa1"
                  >
                    {colorStep.toString()}
                  </Contrast>
                ))}
              </div>
            ))}
          </div>
        </Contrast>
      ))}
    </div>
  );
}
