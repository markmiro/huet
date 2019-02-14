import React, { useState, useRef, useContext, useEffect } from "react";
import saveAs from "file-saver";
import defaultThemeConfigs from "../demo/themeConfigs";
import Theme from "../Theme";
import Block from "../Block";
import Arrow from "./Arrow";
import { ThemeContext, BackgroundContext } from "../reactContexts";
import __ from "./atoms";
import { ThemeConfiguratorContext } from "../Body";
import Button, { TextButton, JsonUploadButton } from "./Button";
import useBrowserState from "./useBrowserState";
import baseThemeConfig from "./baseThemeConfig";
import Input from "./Input";
import { HSpace } from "./AllExceptFirst";

function ThemeFrame({ theme, isSelected, children, onClick, isHidden }) {
  const style = parentBg => ({
    ...__.w100.h100.ba.br2.relative,
    boxShadow: `0 2px 10px ${parentBg.contrast(100).alpha(0.2)}`,
    overflow: "hidden"
  });

  const width = 22;

  return (
    <div
      style={{
        ...__.pv3.pl3.flex.relative,
        flexBasis: `${22}em`,
        flexShrink: 0,
        transitionProperty: "transform, margin, opacity",
        transitionDuration: "150ms",
        transitionTimingFunction: "ease-out",
        ...(isHidden && {
          pointerEvents: "none",
          transform: `scaleX(0)`,
          opacity: 0,
          marginLeft: `-${width / 2}em`,
          marginRight: `-${width / 2}em`
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
  const [isHidden, setIsHidden] = useState(false);
  const theme = new Theme(config);
  const isBaseTheme = config.id === baseThemeConfig.id;

  function startRemove() {
    setIsHidden(true);
    setTimeout(onRemove, 200);
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
  const [theme, setSelectedConfig] = useContext(ThemeConfiguratorContext);
  const selectedConfig = theme.config;

  const scrollContainerRef = useRef(null);

  // const isDirty =
  //   selectedConfig !==
  //   themeConfigs.find(config => config.id === selectedConfig.id);

  useEffect(() => {
    // Want to show the import dialog, so only show current them if it's not the default one
    // if (selectedConfig.id === baseThemeConfig.id) return;
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

  function exportTheme() {
    // Generating a random id
    const configWithNewId = { ...selectedConfig, id: Math.random() };
    const str = JSON.stringify(configWithNewId, null, "  ");
    const blob = new Blob([str], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, selectedConfig.name + " Huet Theme.json");
  }

  return (
    <>
      <div ref={scrollContainerRef} style={{ ...__.flex, overflowX: "scroll" }}>
        {themeConfigs.map((config, i) => {
          const setThemeConfigMemo = () => setSelectedConfig(config);
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
                setSelectedConfig(newConfig);
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
                    setSelectedConfig(
                      newThemeConfigs[Math.min(i, newThemeConfigs.length - 1)]
                    );
                  }}
                />
              </BackgroundContext.Provider>
            </ThemeContext.Provider>
          );
        })}
        <div style={__.pr3} />
      </div>
      <div style={__.ph3.pb3}>
        <Input
          label="Theme Name"
          style={__.flex_auto.mb2}
          value={selectedConfig.name}
          onChange={name => setSelectedConfig({ ...selectedConfig, name })}
        />
        <HSpace growEach>
          <Button onClick={exportTheme} style={__.w100}>
            Export Theme
          </Button>
          <JsonUploadButton
            onUpload={themeConfig => {
              setThemeConfigs([themeConfig, ...themeConfigs]);
              setSelectedConfig(themeConfig);
            }}
          >
            Import Theme
          </JsonUploadButton>
        </HSpace>
      </div>
    </>
  );
}
