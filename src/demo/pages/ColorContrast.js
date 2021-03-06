import _ from "lodash";
import React, { useContext } from "react";

import { rampModes } from "../../Theme";
import {
  BackgroundContext,
  Block,
  Color,
  Contrast,
  Theme,
  ThemeContext
} from "../../huet";
import Select from "../../private/Select";
import __ from "../../private/atoms";
import useBrowserState from "../../private/useBrowserState";

const sharedDoubleFractionSteps = [100 / 16, 100 / 8, 100 / 4, 100 / 2];
const doubleSteps = [0, 4, 8, 16, 32, 64, 100];

const stepSizes = {
  increment20: {
    graySteps: _.range(0, 120, 20),
    colorSteps: _.range(0, 120, 20)
  },
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
  increment10: {
    graySteps: _.range(0, 110, 10),
    colorSteps: _.range(0, 110, 10)
  }
};

function useColoredRampKeys() {
  const theme = useContext(ThemeContext);
  return Object.keys(theme.ramps).filter(rampKey => {
    const mode = theme.ramps[rampKey].config.mode;
    return mode === rampModes.SIGNAL || mode === rampModes.FURTHEST;
  });
}

export default function ColorContrast() {
  const parentBg = useContext(BackgroundContext);
  const theme = parentBg.theme;
  const [stepKey, setStepKey] = useBrowserState("increment20");
  const [rampKey, setRampKey] = useBrowserState("gray");

  return (
    <div>
      <div className="pa2">
        <Block as="h1" contrast="b=25" style={__.f2.pb2.bb.mv0.mb2}>
          {theme.name}
        </Block>
        <Select label="Step sizes" value={stepKey} onChange={setStepKey}>
          <option value="increment20">20, 40, 80, ...</option>
          <option value="doubleFraction">100/16, 100/8, 100/4...</option>
          <option value="double">0, 4, 8, ..., 92, 96, 100</option>
          <option value="increment10">10, 20, 30, ...</option>
        </Select>
        <div className="flex flex-column mt2">
          Background ramp
          <RampPicker rampKey={rampKey} onRampKeyChange={setRampKey} />
        </div>
      </div>
      <Block
        theme={new Theme({ ...theme.config, bgRamp: rampKey })}
        base={rampKey === "none" ? "gray" : rampKey}
        contrast="bg=0"
      >
        <Matrix {...stepSizes[stepKey]} />
        <NamedColors />
        <FormExample />
      </Block>
    </div>
  );
}

const Matrix = React.memo(({ colorSteps, graySteps }) => {
  const theme = useContext(ThemeContext);
  const [direct, indirect] = _.partition(
    Object.keys(theme.ramps),
    key => theme.ramps[key].config.mode === "direct"
  );

  return (
    <div>
      {graySteps.map(grayStep => (
        <Contrast
          key={grayStep}
          bg={grayStep}
          className="pa2 flex items-center"
        >
          <pre style={__.ma0}>{String(grayStep).padStart(5, " ")}</pre>
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
                        theme.startSignalLightness
                      )
                    }}
                  />
                  <div
                    className="w1 h-100"
                    style={{
                      backgroundColor: theme.ramps[ramp](
                        theme.endSignalLightness
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
  );
});

function NamedColors() {
  const theme = useContext(ThemeContext);
  return (
    <>
      {[100, 50, 25, 12.5, 6.25].map(bg => (
        <div key={bg} className="flex">
          {Object.keys(theme.ramps).map(key => (
            <Contrast
              key={key}
              className="pa1 tc w-100 f4"
              bg={bg}
              bgRamp={key}
              textRamp="white"
            >
              {key}
            </Contrast>
          ))}
        </div>
      ))}
    </>
  );
}

function FormExample() {
  const rampKeys = useColoredRampKeys();
  return (
    <div>
      <div style={{ ...__.flex.flex_row, overflow: "scroll" }}>
        {[0, 49, 51, 100].map(bg => (
          <Block key={bg} contrast={`bg=${bg}`}>
            <div style={__.pa3}>
              {rampKeys.map(rampKey => (
                <div key={rampKey}>
                  {[1, 2, 3, 4, 5, 6, 7].map(fontSize => (
                    <Block
                      key={fontSize}
                      contrast={`fg=${rampKey}`}
                      style={__.di["f" + fontSize]}
                    >
                      Lig
                    </Block>
                  ))}
                </div>
              ))}
              {rampKeys.map(rampKey => (
                <div key={rampKey}>
                  <Block as="label" style={__.db.mb1.mt2}>
                    Name
                  </Block>
                  <Block
                    as="input"
                    contrast="b=100 fg=100"
                    value="Some text"
                    readOnly
                    base={rampKey}
                    style={{
                      ...__.ba.br2.pa2,
                      backgroundColor: "transparent",
                      width: "20em"
                    }}
                  />
                  <Block base={rampKey} style={__.f7.mt1}>
                    This is a message about the field above
                  </Block>
                </div>
              ))}
              {rampKeys.map(rampKey => (
                <Block
                  key={rampKey}
                  as="button"
                  contrast="bg=12 fg=100 b=100"
                  base={rampKey}
                  style={{
                    ...__.pa2.tc.w100.br2.mt2.ba.db,
                    fontSize: "inherit",
                    fontFamily: "inherit",
                    maxWidth: "20em"
                  }}
                >
                  Submit
                </Block>
              ))}
            </div>
          </Block>
        ))}
      </div>
    </div>
  );
}

function Bullet() {
  return <Block contrast="bg=100" className="w1 h1 br-100" />;
}

function RampPicker({ rampKey, onRampKeyChange }) {
  const theme = useContext(ThemeContext);
  const rampKeys = useColoredRampKeys();
  return (
    <div className="flex mt1">
      {rampKeys.map(key => (
        <Block
          as="button"
          contrast="b=20"
          key={key}
          className="w2 h2 ba ml1"
          onClick={() => onRampKeyChange(key)}
          style={{
            // TODO: either don't use the style BG color for calculations in <Bullet> or somehow wrap
            // normal HEX colors within <Block> so we can do calculations
            backgroundColor: new Color({
              theme,
              lab: theme.ramps[key](0.5)
            })
          }}
        >
          {key === rampKey && <Bullet />}
        </Block>
      ))}
    </div>
  );
}
