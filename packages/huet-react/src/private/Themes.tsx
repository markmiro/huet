import { isEqual } from "lodash-es";
import React, { useLayoutEffect, useRef, useState } from "react";

import { useThemeConfigurator } from "../context";
import { Color } from "huet/config";
import type { ThemeConfig } from "huet/config";
import { Theme, rampModes } from "huet/config";
import { themeConfigs as defaultThemeConfigs } from "huet/config";
import { VSpace } from "./AllExceptFirst";
import Arrow from "./Arrow";
import Button, { JsonUploadButton, TextButton } from "./Button";
import cx from "./cx";
import { baseThemeConfig } from "huet/config";
import { parseThemeConfig } from "huet/config";
import usePersistentState, { type Parse } from "./persistentState";

/*
  Each preview card shows a different theme. Huet classes resolve against the
  panel's own theme, and Huet roots can't nest, so the cards compute their
  colors with the legacy Color API and set them inline. These match what
  `<Block theme={theme} contrast="bg=0 ...">` used to produce.
*/

/** The card's background: the previewed theme's page background. */
function cardBackground(theme: Theme) {
  return Color.fromTheme(theme).contrast(0);
}

function ThemeFrame({
  theme,
  isSelected,
  children,
  onClick,
  isHidden,
}: {
  theme: Theme;
  isSelected?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  isHidden?: boolean;
}) {
  const root = Color.fromTheme(theme);
  const bg = root.contrast(0);
  const className =
    "hc:w-full hc:h-full hc:border hc:rounded-sm hc:relative hc:overflow-hidden";
  const style = {
    backgroundColor: bg.hex,
    color: bg.contrast(100).hex,
    borderColor: root.contrast(isSelected ? 100 : 12).hex,
    boxShadow: `0 2px 10px ${root.contrast(100).alpha(0.2)}`,
  };

  const $el = useRef<HTMLDivElement>(null);
  const height = $el.current ? $el.current.clientHeight : 0;

  return (
    <div
      ref={$el}
      className={cx(
        "hc:flex hc:relative hc:basis-[20em] hc:shrink-0 hc:transition-[scale,margin,opacity] hc:duration-150 hc:ease-[ease-out]",
        isHidden && "hc:pointer-events-none hc:scale-y-0 hc:opacity-0",
      )}
      style={
        isHidden
          ? { marginTop: `-${height / 2}px`, marginBottom: `-${height / 2}px` }
          : undefined
      }
    >
      {isSelected ? (
        <div className={className} style={style}>
          {children}
          <Arrow
            size=".75em"
            className="hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2"
          />
        </div>
      ) : (
        <button onClick={onClick} className={className} style={style}>
          <div className="hc:h-full">{children}</div>
        </button>
      )}
    </div>
  );
}

function Pallet({ theme }: { theme: Theme }) {
  return (
    <div className="hc:flex hc:h-[.5em]">
      {Object.keys(theme.pallet).map((palletKey) => (
        <div
          key={palletKey}
          className="hc:w-full hc:h-full"
          style={{ backgroundColor: theme.pallet[palletKey] }}
        />
      ))}
    </div>
  );
}

function Title({ children }: { children?: React.ReactNode }) {
  return (
    <h3 className="hc:mx-2 hc:py-2 hc:flex hc:items-center hc:justify-between">
      {children}
    </h3>
  );
}

function Shadow({ bg }: { bg: Color }) {
  return (
    <div
      className="hc:-mt-2 hc:h-2"
      style={{ background: `linear-gradient(${bg}, ${bg.contrast(12)})` }}
    />
  );
}

function ColorMatrix({ theme, bg }: { theme: Theme; bg: Color }) {
  return Object.keys(theme.ramps)
    .filter((rampKey) => {
      const mode = theme.ramps[rampKey].config.mode;
      return mode === rampModes.SIGNAL || mode === rampModes.FURTHEST;
    })
    .map((rampKey) => {
      const base = bg.base(theme.ramps[rampKey]);
      return (
        <div key={rampKey} className="hc:flex">
          {[100, 75, 50, 25].map((contrastInner) => (
            <div
              key={contrastInner}
              className={cx("hc:w-full hc:mt-px", rampKey === "gray" ? "hc:h-6" : "hc:h-2")}
              style={{ backgroundColor: base.contrast(contrastInner).hex }}
            />
          ))}
        </div>
      );
    });
}

function Section({ children }: { children?: React.ReactNode }) {
  return (
    <div className="hc:flex">
      <div className="hc:p-2 hc:w-full hc:flex hc:flex-col">{children}</div>
    </div>
  );
}

const UnmodifiedThemePreview = React.memo(function UnmodifiedThemePreview({
  config,
  isSelected,
  onClick,
  onRemove,
}: {
  config: ThemeConfig;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove: () => void;
}) {
  const [isHidden, setIsHidden] = useState(false);
  const theme = new Theme(config);
  const bg = cardBackground(theme);
  const isBaseTheme = config.id === baseThemeConfig.id;

  function startRemove() {
    setIsHidden(true);
    setTimeout(() => onRemove(), 200);
  }

  return (
    <ThemeFrame
      theme={theme}
      isSelected={isSelected}
      onClick={onClick}
      isHidden={isHidden}
    >
      <Pallet theme={theme} />
      <Title>
        {theme.name}
        {isSelected && !isBaseTheme && (
          <TextButton
            style={{ color: bg.base(theme.ramps.red).contrast(100).hex }}
            onClick={startRemove}
            verify
          >
            Remove
          </TextButton>
        )}
      </Title>
      <Shadow bg={bg} />
      <Section>
        <ColorMatrix theme={theme} bg={bg} />
      </Section>
    </ThemeFrame>
  );
});

/** A full-strength button on one of the previewed theme's ramps */
function signalButtonStyle(bg: Color, ramp: string) {
  const fill = bg.contrast(100, bg.theme.ramps[ramp]);
  return { backgroundColor: fill.hex, color: fill.contrast(100).hex };
}

function ModifiedThemePreview({
  config,
  onReset,
  onCreate,
}: {
  config: ThemeConfig;
  onReset: () => void;
  onCreate: () => void;
}) {
  const theme = new Theme(config);
  const bg = cardBackground(theme);
  return (
    <ThemeFrame isSelected theme={theme}>
      <Pallet theme={theme} />
      <Title>{theme.name}</Title>
      <Shadow bg={bg} />
      <Section>
        <Button colors="" style={signalButtonStyle(bg, "green")} onClick={onCreate}>
          Save As New Theme
        </Button>
        <Button
          colors=""
          className="hc:mt-1"
          style={signalButtonStyle(bg, "red")}
          verify
          onClick={onReset}
        >
          Reset
        </Button>
      </Section>
    </ThemeFrame>
  );
}

function ThemePreview({
  configs,
  config,
  onSelectConfig,
  onConfigsChange,
}: {
  configs: ThemeConfig[];
  config: ThemeConfig;
  onSelectConfig: (config: ThemeConfig) => void;
  onConfigsChange: (configs: ThemeConfig[]) => void;
}) {
  const [theme] = useThemeConfigurator();
  const selectedConfig = theme.config;
  const isSelected = config.id === selectedConfig.id;
  // Deep comparison rather than comparing JSON strings, which would report a
  // false "modified" whenever two equivalent configs serialize their keys in a
  // different order.
  const isSelectedAndModified =
    isSelected && !isEqual(config, selectedConfig);

  const onSelect = () => onSelectConfig(config);

  const onRemove = () => {
    const i = configs.indexOf(config);
    const newConfigs = configs.filter((c) => c.id !== config.id);
    onConfigsChange(newConfigs);
    onSelectConfig(newConfigs[Math.min(i, newConfigs.length - 1)]);
  };

  const onCreate = () => {
    const newConfig = {
      ...selectedConfig,
      id: Math.random(),
      name:
        config.name === selectedConfig.name
          ? `${config.name} Copy`
          : selectedConfig.name
    };
    onConfigsChange([newConfig, ...configs]);
    onSelectConfig(newConfig);
  };

  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () => {
      // FIX: scrolls parent and the parent of the parent
      if (isSelected && ref.current)
        ref.current.scrollIntoView({ block: "center" });
    },
    // Run on mount, but not after that
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div ref={ref}>
      {isSelectedAndModified ? (
        <ModifiedThemePreview
          config={selectedConfig}
          onReset={onSelect}
          onCreate={onCreate}
        />
      ) : (
        <UnmodifiedThemePreview
          config={config}
          isSelected={isSelected}
          onClick={onSelect}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}

// Drop individual broken themes rather than losing every saved theme
export const parseConfigs: Parse<ThemeConfig[]> = (stored) => {
  if (!Array.isArray(stored)) return undefined;
  const configs = stored
    .map(parseThemeConfig)
    .filter((config) => config !== undefined);
  return configs.length > 0 ? configs : undefined;
};

export default function Themes() {
  const [configs, setConfigs] = usePersistentState(
    "themes",
    defaultThemeConfigs,
    parseConfigs
  );
  const [, setSelectedConfig] = useThemeConfigurator();

  return (
    <VSpace size={3} className="hc:p-4">
      <JsonUploadButton
        onUpload={uploadedConfig => {
          // A fresh id, so importing the same file twice (or a file whose id
          // matches an existing theme, or that has no id) doesn't produce two
          // themes that are both treated as selected.
          const themeConfig = { ...uploadedConfig, id: Math.random() };
          setConfigs([themeConfig, ...configs]);
          setSelectedConfig(themeConfig);
        }}
      >
        Import Theme
      </JsonUploadButton>
      {configs.map(config => (
        <ThemePreview
          key={config.id}
          configs={configs}
          config={config}
          onSelectConfig={setSelectedConfig}
          onConfigsChange={setConfigs}
        />
      ))}
    </VSpace>
  );
}
