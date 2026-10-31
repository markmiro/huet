import React, { createContext, useContext, useId, useMemo } from "react";

import { isHuetClass } from "huet";
import { Color, Theme, rampModes } from "huet/config";
import usePersistentState, {
  asOneOf,
  asString,
} from "../../../packages/huet-react/src/private/persistentState";
import { useThemeConfig } from "./themeStore";

const range = (start: number, end: number, step: number) =>
  Array.from({ length: Math.ceil((end - start) / step) }, (_, i) => start + i * step);

const sharedDoubleFractionSteps = [100 / 16, 100 / 8, 100 / 4, 100 / 2];
const doubleSteps = [0, 4, 8, 16, 32, 64, 100];

const stepSizes = {
  increment20: {
    graySteps: range(0, 120, 20),
    colorSteps: range(0, 120, 20),
  },
  doubleFraction: {
    graySteps: [
      0,
      ...sharedDoubleFractionSteps,
      100 - 100 / 4,
      100 - 100 / 8,
      100 - 100 / 16,
      100,
    ],
    colorSteps: [0, ...sharedDoubleFractionSteps, 100],
  },
  double: {
    graySteps: doubleSteps,
    colorSteps: doubleSteps,
  },
  increment10: {
    graySteps: range(0, 110, 10),
    colorSteps: range(0, 110, 10),
  },
};

type StepKey = keyof typeof stepSizes;
const asStepKey = asOneOf(Object.keys(stepSizes) as StepKey[]);

// Class names need integers, so fractional steps (6.25, 12.5, ...) are rounded;
// their labels keep the exact value. Amounts classes don't take are colored inline.
const amount = (value: number) => Math.round(value);

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

function coloredRampKeys(theme: Theme) {
  return Object.keys(theme.ramps).filter((rampKey) => {
    const mode = theme.ramps[rampKey].config.mode;
    return mode === rampModes.SIGNAL || mode === rampModes.FURTHEST;
  });
}

/*
  Most elements here are colored by Huet classes, which `mountTheme` resolves
  against the page's theme. Classes can't express two things the legacy page
  did, so those fall back to inline colors from the legacy `Color` API:
  - A background ramp other than the theme's own. The legacy page rendered the
    samples under `new Theme({ ...config, bgRamp })`, which changes how every
    contrast is solved, not just which ramp is used.
  - Ramps that classes don't name, and backgrounds sampled straight from a ramp.
  `Painted` keeps the class strings as the single description of each color.
  When an element (or an ancestor) can't use classes, it strips its Huet
  classes and solves them the same way `mountTheme` does.
*/
type Scope = {
  /** The background this element's Huet classes are relative to. */
  color: () => Color;
  /** True when this subtree is colored inline instead of by classes. */
  inline: boolean;
};
const ScopeContext = createContext<Scope | null>(null);

function once<T>(get: () => T): () => T {
  let value: T | undefined;
  let done = false;
  return () => {
    if (!done) {
      value = get();
      done = true;
    }
    return value as T;
  };
}

const huetPattern = /^huet-(bg\/)?(bg|text|border|outline)-(?:(.+)-)?(\d+)$/;
const cssProperty = {
  text: "color",
  border: "borderColor",
  outline: "outlineColor",
} as const;

function parse(name: string) {
  const match = huetPattern.exec(name);
  if (!match || (match[1] && match[2] === "bg"))
    throw new Error(`Unsupported Huet class: ${name}`);
  return {
    property: match[2] as "bg" | keyof typeof cssProperty,
    ownBackground: !!match[1],
    ramp: match[3],
    amount: Number(match[4]),
  };
}

function solve(base: Color, spec: ReturnType<typeof parse>) {
  const ramp = spec.ramp === undefined ? undefined : base.theme.ramps[spec.ramp];
  if (spec.ramp !== undefined && !ramp)
    throw new Error(`Unknown ramp: ${spec.ramp}`);
  return base.contrast(spec.amount, ramp);
}

/** Starts a subtree colored by its own theme, like `<Block theme base>`. */
function ThemeScope({
  theme,
  base,
  inline,
  children,
}: {
  theme: Theme;
  base: string;
  inline: boolean;
  children: React.ReactNode;
}) {
  const scope = useMemo(
    () => ({
      color: once(() => Color.fromTheme(theme).base(theme.ramps[base])),
      inline,
    }),
    [theme, base, inline],
  );
  return <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>;
}

type PaintedProps = {
  as?: "div" | "span" | "h1" | "label" | "input" | "select" | "button";
  /** A background sampled directly from a ramp. Classes can't express it. */
  background?: Color;
  children?: React.ReactNode;
} & Omit<React.AllHTMLAttributes<HTMLElement>, "as">;

function Painted({
  as = "div",
  background,
  className = "",
  style,
  children,
  ...rest
}: PaintedProps) {
  const parent = useContext(ScopeContext);
  if (!parent) throw new Error("Painted needs a ThemeScope");
  const names = className.split(/\s+/).filter(Boolean);
  const huet = names.filter((name) => name.startsWith("huet-"));
  const inline = parent.inline || huet.some((name) => !isHuetClass(name));
  const specs = huet.map(parse);
  const bgSpec = specs.find((spec) => spec.property === "bg");

  // Mirrors `mountTheme`: text and borders are relative to the parent unless
  // they're `bg/…`, and a new background brings 100-contrast text with it.
  const ownColor = once(() =>
    bgSpec ? solve(parent.color(), bgSpec) : parent.color(),
  );
  let finalStyle = style;
  let finalClassName = className;
  if (inline) {
    const colors: React.CSSProperties = {};
    if (bgSpec) {
      colors.backgroundColor = ownColor().hex;
      colors.color = ownColor().contrast(100).hex;
    }
    for (const spec of specs) {
      if (spec.property === "bg") continue;
      const base = spec.ownBackground ? ownColor() : parent.color();
      colors[cssProperty[spec.property]] = solve(base, spec).hex;
    }
    finalStyle = { ...style, ...colors };
    finalClassName = names.filter((name) => !name.startsWith("huet-")).join(" ");
  }
  if (background) finalStyle = { ...finalStyle, backgroundColor: background.hex };

  const scope: Scope = background
    ? { color: () => background, inline: true }
    : { color: ownColor, inline };

  return React.createElement(
    as,
    { ...rest, className: finalClassName || undefined, style: finalStyle },
    children === undefined ? undefined : (
      <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>
    ),
  );
}

export default function ColorContrast() {
  const config = useThemeConfig();
  const theme = useMemo(() => config && new Theme(config), [config]);
  const [stepKey, setStepKey] = usePersistentState<StepKey>(
    "demo:colorContrast:stepKey",
    "increment20",
    asStepKey,
  );
  const [savedRampKey, setRampKey] = usePersistentState(
    "demo:colorContrast:rampKey",
    "gray",
    asString,
  );
  const id = useId();
  // The saved ramp may not exist in the theme that's selected now
  const rampKey =
    !theme || savedRampKey in theme.ramps ? savedRampKey : theme.bgRamp;
  // Classes only follow the page's theme. Another background ramp needs the
  // legacy nested theme, so those samples are colored inline.
  const inline = !!theme && rampKey !== theme.bgRamp;
  const sampleTheme = useMemo(
    () => theme && (inline ? new Theme({ ...theme.config, bgRamp: rampKey }) : theme),
    [theme, inline, rampKey],
  );
  // The page is hidden until the configurator loads a theme.
  if (!theme || !sampleTheme) return null;
  const base = rampKey === "none" ? "gray" : rampKey;

  return (
    <ThemeScope theme={theme} base={theme.bgRamp} inline={false}>
      <div className="leading-[1.15]">
        <div className="p-2">
          <Painted as="h1" className="huet-border-20 mb-2 border-b pb-2 text-4xl/[1.15] font-bold">
            {theme.name}
          </Painted>
          <label htmlFor={`${id}-steps`} className="mb-1 block">
            Step sizes
          </label>
          <div className="relative max-w-[30em]">
            <Painted
              as="select"
              id={`${id}-steps`}
              value={stepKey}
              onChange={(event) =>
                setStepKey((event.target as HTMLSelectElement).value as StepKey)
              }
              className="huet-border-20 block w-full appearance-none rounded-xs border bg-transparent px-[.5em] py-[.3em] pr-8"
            >
              <option value="increment20">20, 40, 80, ...</option>
              <option value="doubleFraction">100/16, 100/8, 100/4...</option>
              <option value="double">0, 4, 8, ..., 92, 96, 100</option>
              <option value="increment10">10, 20, 30, ...</option>
            </Painted>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 border-x-[.4em] border-t-[.4em] border-x-transparent border-t-current" />
          </div>
          <div className="mt-2 flex flex-col">
            <span id={`${id}-ramp`}>Background ramp</span>
            <RampPicker
              theme={theme}
              labelledBy={`${id}-ramp`}
              rampKey={rampKey}
              onRampKeyChange={setRampKey}
            />
          </div>
        </div>
        <ThemeScope theme={sampleTheme} base={base} inline={inline}>
          <Painted className={`huet-bg-${base}-0`}>
            <Matrix theme={theme} base={base} {...stepSizes[stepKey]} />
            <NamedColors theme={theme} />
            <FormExample theme={theme} base={base} />
          </Painted>
        </ThemeScope>
      </div>
    </ThemeScope>
  );
}

function Matrix({
  theme,
  base,
  colorSteps,
  graySteps,
}: {
  theme: Theme;
  base: string;
  colorSteps: number[];
  graySteps: number[];
}) {
  const keys = Object.keys(theme.ramps);
  const isDirect = (key: string) => theme.ramps[key].config.mode === "direct";
  const ramps = [...keys.filter((key) => !isDirect(key)), ...keys.filter(isDirect)];
  const signal = (ramp: string, position: number) =>
    new Color({ theme, lab: theme.ramps[ramp](position) }).hex;

  return (
    <div data-matrix>
      {graySteps.map((grayStep) => (
        <Painted
          key={grayStep}
          data-row={grayStep}
          className={`huet-bg-${base}-${amount(grayStep)} flex items-center p-2`}
        >
          {/* Normalize gave pre the browser monospace font. */}
          <pre className="font-[monospace,monospace]">{String(grayStep).padStart(5, " ")}</pre>
          <div className="flex flex-wrap">
            {ramps.map((ramp) => (
              <div key={ramp} className="mt-1 mr-2 flex">
                {isDirect(ramp) ? (
                  <Painted data-swatch className={`huet-bg-${ramp}-0 huet-bg/text-${ramp}-0 p-1`}>
                    Direct
                  </Painted>
                ) : (
                  colorSteps.map((colorStep) => (
                    <Painted
                      key={colorStep}
                      data-swatch
                      className={`huet-bg-${ramp}-${amount(colorStep)} huet-bg/text-${ramp}-${amount(colorStep)} p-1`}
                    >
                      {colorStep.toString()}
                    </Painted>
                  ))
                )}
                <div className="flex flex-col">
                  <div
                    className="h-full w-4"
                    style={{ backgroundColor: signal(ramp, theme.startSignalLightness) }}
                  />
                  <div
                    className="h-full w-4"
                    style={{ backgroundColor: signal(ramp, theme.endSignalLightness) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Painted>
      ))}
    </div>
  );
}

function NamedColors({ theme }: { theme: Theme }) {
  return (
    <>
      {[100, 50, 25, 12.5, 6.25].map((bg) => (
        <div key={bg} className="flex">
          {Object.keys(theme.ramps).map((key) => (
            <Painted
              key={key}
              className={`huet-bg-${key}-${amount(bg)} huet-bg/text-white-100 w-full p-1 text-center ${fontSizes[3]}`}
            >
              {key}
            </Painted>
          ))}
        </div>
      ))}
    </>
  );
}

function FormExample({ theme, base }: { theme: Theme; base: string }) {
  const rampKeys = coloredRampKeys(theme);
  const id = useId();
  return (
    <div data-form-example className="flex flex-row overflow-scroll">
      {[0, 49, 51, 100].map((bg) => (
        <Painted key={bg} className={`huet-bg-${base}-${bg}`}>
          <div className="p-4">
            {rampKeys.map((rampKey) => (
              <div key={rampKey}>
                {fontSizes.map((fontSize) => (
                  <Painted as="span" key={fontSize} className={`huet-text-${rampKey}-100 ${fontSize}`}>
                    Lig
                  </Painted>
                ))}
              </div>
            ))}
            {rampKeys.map((rampKey) => (
              <div key={rampKey}>
                <Painted
                  as="label"
                  htmlFor={`${id}-${bg}-${rampKey}`}
                  className={`huet-text-${base}-100 mt-2 mb-1 block`}
                >
                  Name
                </Painted>
                <Painted
                  as="input"
                  id={`${id}-${bg}-${rampKey}`}
                  value="Some text"
                  readOnly
                  className={`huet-border-${rampKey}-100 huet-text-${rampKey}-100 w-[20em] rounded border bg-transparent p-2`}
                />
                <Painted className={`huet-text-${rampKey}-100 mt-1 ${fontSizes[6]}`}>
                  This is a message about the field above
                </Painted>
              </div>
            ))}
            {rampKeys.map((rampKey) => (
              <Painted
                key={rampKey}
                as="button"
                type="button"
                className={`huet-bg-${rampKey}-10 huet-text-${rampKey}-100 huet-border-${rampKey}-100 mt-2 block w-full max-w-[20em] rounded border p-2 text-center`}
              >
                Submit
              </Painted>
            ))}
          </div>
        </Painted>
      ))}
    </div>
  );
}

function RampPicker({
  theme,
  labelledBy,
  rampKey,
  onRampKeyChange,
}: {
  theme: Theme;
  labelledBy: string;
  rampKey: string;
  onRampKeyChange: (key: string) => void;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="mt-1 flex">
      {coloredRampKeys(theme).map((key) => (
        <Painted
          as="button"
          type="button"
          key={key}
          aria-label={key}
          aria-pressed={key === rampKey}
          className="huet-border-20 ml-1 flex size-8 items-center justify-center border"
          onClick={() => onRampKeyChange(key)}
          background={new Color({ theme, lab: theme.ramps[key](0.5) })}
        >
          {key === rampKey && <Painted className="huet-bg-100 size-4 rounded-full" />}
        </Painted>
      ))}
    </div>
  );
}
