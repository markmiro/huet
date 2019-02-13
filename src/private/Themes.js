import React, { useState, useRef, useContext, useEffect, useMemo } from "react";
import defaultThemeConfigs from "../demo/themeConfigs";
import Theme from "../Theme";
import Block from "../Block.jsx";
import { ThemeContext, BackgroundContext } from "../reactContexts";
import __ from "./atoms";
import { ThemeConfiguratorContext } from "../Body.jsx";
import Button, { TextButton } from "./Button";
import useBrowserState from "./useBrowserState";
import baseThemeConfig from "./baseThemeConfig";

function Labeled({ title, children }) {
  return (
    <>
      <label style={__.i}>{title}</label>
      {children}
    </>
  );
}

function Arrow({ size = "1em", top = null, left = null, direction = "up" }) {
  const directionToAngle = {
    up: 45,
    right: 45 + 90,
    down: 45 + 180,
    left: 45 + 180 + 90
  };
  const angle = directionToAngle[direction];

  const positionStyle =
    top || left
      ? {
          ...__.absolute,
          top,
          left
        }
      : null;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "transparent",
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        borderColor: "transparent",
        borderWidth: `calc(${size} / 2)`,
        borderStyle: "solid",
        borderTopColor: "currentColor",
        borderLeftColor: "currentColor",
        ...positionStyle
      }}
    />
  );
}

function ThemeFrame({ theme, isSelected, children, onClick }) {
  const style = parentBg => ({
    ...__.w100.h100.ba.relative,
    boxShadow: `0 2px 10px ${parentBg.contrast(100).alpha(0.2)}`
  });
  return (
    <div style={{ ...__.pa2.flex.relative, flexBasis: "22em", flexShrink: 0 }}>
      {isSelected ? (
        <Block theme={theme} as="div" contrast="bg=0 b=100" style={style}>
          {children}
          <Arrow top="100%" left="50%" direction="up" />
        </Block>
      ) : (
        <Block
          theme={theme}
          as="button"
          onClick={onClick}
          contrast={"bg=0 b=12"}
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
      .filter(rampKey => theme.ramps[rampKey].config.mode === "colored")
      .map(rampKey => (
        <div key={rampKey} style={__.flex}>
          {[100, 75, 50, 25].map((contrastInner, i) => (
            <Block
              key={contrastInner}
              base={rampKey}
              contrast={`bg=${contrastInner}`}
              style={{
                ...__.w100,
                marginRight: i === 0 ? 1 : 0,
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

const ThemePreview = React.memo(({ config, isSelected, onClick, onRemove }) => {
  const theme = new Theme(config);
  const isBaseTheme = config.id === baseThemeConfig.id;
  return (
    <ThemeFrame theme={theme} isSelected={isSelected} onClick={onClick}>
      <Pallet />
      <Title>
        {theme.name}
        {isSelected && !isBaseTheme && (
          <TextButton base="red" onClick={onRemove} verify>
            Remove
          </TextButton>
        )}
      </Title>
      <Section>
        <ColorMatrix />
      </Section>
    </ThemeFrame>
  );
});

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

export default function Themes() {
  const [themeConfigs, setThemeConfigs] = useBrowserState(defaultThemeConfigs);
  const [theme, setThemeConfig] = useContext(ThemeConfiguratorContext);
  const selectedConfig = theme.config;

  const scrollContainerRef = useRef(null);

  // const isDirty =
  //   selectedConfig !==
  //   themeConfigs.find(config => config.id === selectedConfig.id);

  useEffect(() => {
    if (!scrollContainerRef.current.childNodes.length) {
      throw new Error("Expecting at least one child");
    }
    const width = scrollContainerRef.current.childNodes[0].getBoundingClientRect()
      .width;
    const currentIndex = themeConfigs.findIndex(
      config => config.id === selectedConfig.id
    );
    setTimeout(() => {
      scrollContainerRef.current.scrollTo({
        left: width * currentIndex,
        behavior: "smooth"
      });
    }, 100);
  }, [selectedConfig.id]);

  const isSelected = config => config.id === selectedConfig.id;
  const isSelectedAndModified = config =>
    isSelected(config) && config !== selectedConfig;

  return (
    <div>
      <div style={__.ma2.mb0}>
        <Labeled title="Themes" />
      </div>
      <div
        ref={scrollContainerRef}
        style={{ ...__.flex.pb1, overflowX: "scroll" }}
      >
        {themeConfigs.map(config => {
          const setThemeConfigMemo = () => setThemeConfig(config);
          return isSelectedAndModified(config) ? (
            <ModifiedThemePreview
              key={config.id}
              config={selectedConfig}
              onReset={setThemeConfigMemo}
              onCreate={() => {
                const newConfig = {
                  ...selectedConfig,
                  id: Math.random(),
                  name:
                    config.name === selectedConfig.name
                      ? config.name + " Copy"
                      : selectedConfig.name
                };
                setThemeConfigs([newConfig, ...themeConfigs]);
                setThemeConfig(newConfig);
              }}
            />
          ) : (
            <ThemeContext.Provider value={null} key={config.id}>
              <BackgroundContext.Provider value={null}>
                <ThemePreview
                  config={config}
                  isSelected={isSelected(config)}
                  onClick={setThemeConfigMemo}
                  onRemove={() => {
                    const newThemeConfigs = themeConfigs.filter(
                      config => !isSelected(config)
                    );
                    setThemeConfigs(newThemeConfigs);
                    setThemeConfig(newThemeConfigs[0]);
                  }}
                />
              </BackgroundContext.Provider>
            </ThemeContext.Provider>
          );
        })}
      </div>
    </div>
  );
}
