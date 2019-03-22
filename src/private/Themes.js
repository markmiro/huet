import React, { useContext, useLayoutEffect, useRef, useState } from "react";

import Block from "../Block";
import { ThemeConfiguratorContext } from "../Body";
import Theme, { rampModes } from "../Theme";
import defaultThemeConfigs from "../demo/themeConfigs";
import { ThemeContext } from "../reactContexts";
import { VSpace } from "./AllExceptFirst";
import Arrow from "./Arrow";
import Button, { JsonUploadButton, TextButton } from "./Button";
import __ from "./atoms";
import baseThemeConfig from "./baseThemeConfig";
import useBrowserState from "./useBrowserState";

function ThemeFrame({ theme, isSelected, children, onClick, isHidden }) {
  const style = parentBg => ({
    ...__.w100.h100.ba.br2.relative,
    boxShadow: `0 2px 10px ${parentBg.contrast(100).alpha(0.2)}`,
    overflow: "hidden"
  });

  const $el = useRef();
  const height = $el.current && $el.current.clientHeight;

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
  const theme = useContext(ThemeContext);
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

function Title({ children }) {
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
  const theme = useContext(ThemeContext);
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

function Section({ children }) {
  return (
    <>
      <Shadow />
      <Block style={__.flex}>
        <div style={__.pa2.w100.flex.flex_column}>{children}</div>
      </Block>
    </>
  );
}

const UnmodifiedThemePreview = React.memo(
  ({ config, isSelected, onClick, onRemove }) => {
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

function ModifiedThemePreview({ config, onReset, onCreate }) {
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

function ThemePreview({ configs, config, onSelectConfig, onConfigsChange }) {
  const [theme] = useContext(ThemeConfiguratorContext);
  const selectedConfig = theme.config;
  const isSelected = config.id === selectedConfig.id;
  const isSelectedAndModified =
    isSelected &&
    // TODO: consider deep comparison
    // http://www.mattzeunert.com/2016/01/28/javascript-deep-equal.html
    JSON.stringify(config) !== JSON.stringify(selectedConfig);

  const onSelect = () => onSelectConfig(config);

  const onRemove = () => {
    const i = configs.indexOf(config);
    const newConfigs = configs.filter(c => c.id !== config.id);
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

  const ref = useRef();
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

export default function Themes() {
  const [configs, setConfigs] = useBrowserState(defaultThemeConfigs);
  const [, setSelectedConfig] = useContext(ThemeConfiguratorContext);

  return (
    <VSpace size="3" style={__.pa3}>
      <JsonUploadButton
        onUpload={themeConfig => {
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
