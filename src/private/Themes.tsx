import _ from "lodash";
import React, { useLayoutEffect, useRef, useState } from "react";

import Block from "../Block";
import type Color from "../Color";
import { useThemeConfigurator } from "../Body";
import type { ThemeConfig } from "../colorModel";
import Theme, { rampModes } from "../Theme";
import defaultThemeConfigs from "../demo/themeConfigs";
import { useTheme } from "../reactContexts";
import { VSpace } from "./AllExceptFirst";
import Arrow from "./Arrow";
import Button, { JsonUploadButton, TextButton } from "./Button";
import __ from "./atoms";
import baseThemeConfig from "./baseThemeConfig";
import { parseThemeConfig } from "./isThemeConfig";
import usePersistentState, { type Parse } from "./persistentState";

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
  const style = (parentBg: Color) => ({
    ...__.w100.h100.ba.br2.relative,
    boxShadow: `0 2px 10px ${parentBg.contrast(100).alpha(0.2)}`,
    overflow: "hidden"
  });

  const $el = useRef<HTMLDivElement>(null);
  const height = $el.current ? $el.current.clientHeight : 0;

  return (
    <div
      ref={$el}
      style={{
        ...__.flex.relative,
        flexBasis: `${20}em`,
        flexShrink: 0,
        transitionProperty: "transform, margin, opacity",
        transitionDuration: "150ms",
        transitionTimingFunction: "ease-out",
        ...(isHidden && {
          pointerEvents: "none",
          transform: `scaleY(0)`,
          opacity: 0,
          marginTop: `-${height / 2}px`,
          marginBottom: `-${height / 2}px`
        })
      }}
    >
      {isSelected ? (
        <Block theme={theme} as="div" contrast="bg=0 b=100" style={style}>
          {children}
          <Arrow direction="up" size=".75em" style={__.abc} />
        </Block>
      ) : (
        <Block
          theme={theme}
          as="button"
          onClick={onClick}
          contrast="bg=0 b=12"
          style={style}
        >
          <div style={__.h100}>{children}</div>
        </Block>
      )}
    </div>
  );
}

function Pallet() {
  const theme = useTheme();
  return (
    <div style={{ ...__.flex, height: "0.5em" }}>
      {Object.keys(theme.pallet).map(palletKey => (
        <div
          key={palletKey}
          style={{
            ...__.w100.h100,
            backgroundColor: theme.pallet[palletKey]
          }}
        />
      ))}
    </div>
  );
}

function Title({ children }: { children?: React.ReactNode }) {
  return (
    <h3 style={__.mh2.pv2.flex.items_center.justify_between}>{children}</h3>
  );
}

function Shadow() {
  return (
    <Block
      style={parentBg => ({
        marginTop: "-.5rem",
        height: ".5rem",
        background: `linear-gradient(${parentBg}, ${parentBg.contrast(12)})`
      })}
    />
  );
}

function ColorMatrix() {
  const theme = useTheme();
  return [
    Object.keys(theme.ramps)
      .filter(rampKey => {
        const mode = theme.ramps[rampKey].config.mode;
        return mode === rampModes.SIGNAL || mode === rampModes.FURTHEST;
      })
      .map(rampKey => (
        <div key={rampKey} style={__.flex}>
          {[100, 75, 50, 25].map(contrastInner => (
            <Block
              key={contrastInner}
              base={rampKey}
              contrast={`bg=${contrastInner}`}
              style={{
                ...__.w100,
                marginTop: 1,
                height: rampKey === "gray" ? "1.5rem" : "0.5rem"
              }}
            />
          ))}
        </div>
      ))
  ];
}

function Section({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Shadow />
      <Block style={__.flex}>
        <div style={__.pa2.w100.flex.flex_column}>{children}</div>
      </Block>
    </>
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
        <Pallet />
        <Title>
          {theme.name}
          {isSelected && !isBaseTheme && (
            <TextButton base="red" onClick={startRemove} verify>
              Remove
            </TextButton>
          )}
        </Title>
        <Section>
          <ColorMatrix />
        </Section>
      </ThemeFrame>
    );
  }
);

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
  return (
    <ThemeFrame isSelected theme={theme}>
      <Pallet />
      <Title>{theme.name}</Title>
      <Section>
        <Button bgRamp="green" bg={100} text={100} onClick={onCreate}>
          Save As New Theme
        </Button>
        <Button
          text={100}
          bgRamp="red"
          bg={100}
          style={__.mt1}
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
    isSelected && !_.isEqual(config, selectedConfig);

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
const parseConfigs: Parse<ThemeConfig[]> = (stored) => {
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
    <VSpace size="3" style={__.pa3}>
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
