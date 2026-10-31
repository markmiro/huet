import { useId } from "react";

import { amounts } from "huet";
import usePersistentState, {
  asOneOf,
} from "../../../packages/huet-react/src/private/persistentState";
import { themeName, useDemoTheme } from "./themeStore";

/*
  Every color here comes from a Huet class, which `mountTheme` resolves against
  the page's theme. The background ramp picker puts the samples on a colored
  surface (`huet-bg-blue-…`), and every class inside is relative to it.
*/

const range = (start: number, end: number, step: number) =>
  Array.from({ length: Math.ceil((end - start) / step) }, (_, i) => start + i * step);

// Classes take the 13 amounts in `amounts`, so every option uses those.
const stepSizes = {
  increment20: { graySteps: range(0, 120, 20), colorSteps: range(0, 120, 20) },
  increment10: { graySteps: range(0, 110, 10), colorSteps: range(0, 110, 10) },
  all: { graySteps: [...amounts], colorSteps: [...amounts] },
};

type StepKey = keyof typeof stepSizes;
const asStepKey = asOneOf(Object.keys(stepSizes) as StepKey[]);

/** The ramps Huet classes step along. `white` picks a band instead. */
const ramps = ["gray", "red", "yellow", "green", "blue", "purple"] as const;
type RampKey = (typeof ramps)[number];
const asRampKey = asOneOf(ramps);

// Tachyons' font sizes didn't set a line height, so text kept normalize's 1.15.
const fontSizes = [
  "text-5xl/[1.15]",
  "text-4xl/[1.15]",
  "text-2xl/[1.15]",
  "text-xl/[1.15]",
  "text-base/[1.15]",
  "text-sm/[1.15]",
  "text-xs/[1.15]",
];

export default function ColorContrast() {
  const { theme } = useDemoTheme();
  const [stepKey, setStepKey] = usePersistentState<StepKey>(
    "demo:colorContrast:stepKey",
    "increment20",
    asStepKey,
  );
  const [base, setBase] = usePersistentState<RampKey>("demo:colorContrast:rampKey", "gray", asRampKey);
  const id = useId();

  return (
    <div className="leading-[1.15]">
      <div className="p-2">
        <h1 className="huet-border-20 mb-2 border-b pb-2 text-4xl/[1.15] font-bold">{themeName(theme)}</h1>
        <label htmlFor={`${id}-steps`} className="mb-1 block">
          Step sizes
        </label>
        <div className="relative max-w-[30em]">
          <select
            id={`${id}-steps`}
            value={stepKey}
            onChange={(event) => setStepKey(event.target.value as StepKey)}
            className="huet-border-20 block w-full appearance-none rounded-xs border bg-transparent px-[.5em] py-[.3em] pr-8"
          >
            <option value="increment20">20, 40, 60, ...</option>
            <option value="increment10">10, 20, 30, ...</option>
            <option value="all">0, 5, 10, 20, ..., 90, 95, 100</option>
          </select>
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 border-x-[.4em] border-t-[.4em] border-x-transparent border-t-current" />
        </div>
        <div className="mt-2 flex flex-col">
          <span id={`${id}-ramp`}>Background ramp</span>
          <RampPicker labelledBy={`${id}-ramp`} rampKey={base} onRampKeyChange={setBase} />
        </div>
      </div>
      <Matrix base={base} {...stepSizes[stepKey]} />
      <NamedColors />
      <FormExample base={base} />
    </div>
  );
}

function Matrix({
  base,
  colorSteps,
  graySteps,
}: {
  base: RampKey;
  colorSteps: number[];
  graySteps: number[];
}) {
  return (
    <div data-matrix>
      {graySteps.map((grayStep) => (
        <div
          key={grayStep}
          data-row={grayStep}
          className={`huet-bg-${base}-${grayStep} flex items-center p-2`}
        >
          {/* Normalize gave pre the browser monospace font. */}
          <pre className="font-[monospace,monospace]">{String(grayStep).padStart(5, " ")}</pre>
          <div className="flex flex-wrap">
            {ramps.map((ramp) => (
              <div key={ramp} className="mt-1 mr-2 flex">
                {colorSteps.map((colorStep) => (
                  <div
                    key={colorStep}
                    data-swatch
                    className={`huet-bg-${ramp}-${colorStep} huet-bg/text-${ramp}-${colorStep} p-1`}
                  >
                    {colorStep.toString()}
                  </div>
                ))}
              </div>
            ))}
            <div className="mt-1 mr-2 flex">
              <div data-swatch className="huet-bg-white-0 huet-bg/text-white-0 p-1">
                White
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NamedColors() {
  return (
    <>
      {[100, 50, 20, 10, 5].map((bg) => (
        <div key={bg} className="flex">
          {[...ramps, "white"].map((key) => (
            <div
              key={key}
              className={`huet-bg-${key}-${bg} huet-bg/text-white-100 w-full p-1 text-center ${fontSizes[3]}`}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function FormExample({ base }: { base: RampKey }) {
  const id = useId();
  return (
    <div data-form-example className="flex flex-row overflow-scroll">
      {[0, 40, 60, 100].map((bg) => (
        <div key={bg} className={`huet-bg-${base}-${bg}`}>
          <div className="p-4">
            {ramps.map((rampKey) => (
              <div key={rampKey}>
                {fontSizes.map((fontSize) => (
                  <span key={fontSize} className={`huet-text-${rampKey}-100 ${fontSize}`}>
                    Lig
                  </span>
                ))}
              </div>
            ))}
            {ramps.map((rampKey) => (
              <div key={rampKey}>
                <label htmlFor={`${id}-${bg}-${rampKey}`} className={`huet-text-${base}-100 mt-2 mb-1 block`}>
                  Name
                </label>
                <input
                  id={`${id}-${bg}-${rampKey}`}
                  value="Some text"
                  readOnly
                  className={`huet-border-${rampKey}-100 huet-text-${rampKey}-100 w-[20em] rounded border bg-transparent p-2`}
                />
                <div className={`huet-text-${rampKey}-100 mt-1 ${fontSizes[6]}`}>
                  This is a message about the field above
                </div>
              </div>
            ))}
            {ramps.map((rampKey) => (
              <button
                key={rampKey}
                type="button"
                className={`huet-bg-${rampKey}-10 huet-text-${rampKey}-100 huet-border-${rampKey}-100 mt-2 block w-full max-w-[20em] rounded border p-2 text-center`}
              >
                Submit
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RampPicker({
  labelledBy,
  rampKey,
  onRampKeyChange,
}: {
  labelledBy: string;
  rampKey: RampKey;
  onRampKeyChange: (key: RampKey) => void;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="mt-1 flex">
      {ramps.map((key) => (
        <button
          type="button"
          key={key}
          aria-label={key}
          aria-pressed={key === rampKey}
          className={`huet-bg-${key}-50 huet-border-20 ml-1 flex size-8 items-center justify-center border`}
          onClick={() => onRampKeyChange(key)}
        >
          {key === rampKey && <span className="huet-bg-100 size-4 rounded-full" />}
        </button>
      ))}
    </div>
  );
}
