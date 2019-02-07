import React from "react";
import __ from "./atoms";
import themeConfigs from "../demo/themeConfigs";
import Theme from "../Theme";
import Block from "../Block";
import Checkbox from "./Checkbox";
import useBrowserState from "./useBrowserState";

function Labeled({ title, children }) {
  return (
    <>
      <label style={__.i.mb1}>{title}</label>
      {children}
    </>
  );
}

const ThemePreview = React.memo(
  ({ config, showMiddle = false, onClick = () => {} }) => {
    const theme = new Theme(config);
    return (
      <Block
        as="button"
        theme={theme}
        contrast="bg=0 b=12"
        style={parentBg => ({
          ...__.w100.ba,
          boxShadow: `0 2px 20px ${parentBg.contrast(100).alpha(0.2)}`
        })}
        onClick={() => onClick(config.name)}
      >
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
        <h1 style={__.b.mh2.pv2}>{theme.name}</h1>
        <Block
          style={parentBg => ({
            marginTop: "-.5rem",
            height: ".5rem",
            background: `linear-gradient(${parentBg}, ${parentBg.contrast(12)})`
          })}
        />
        <Block style={__.flex}>
          {(showMiddle ? [0, 49, 51, 100] : [0]).map(contrast => (
            <Block
              key={contrast}
              contrast={`bg=${contrast}`}
              style={__.pa2.w100.flex.flex_column}
            >
              {Object.keys(theme.ramps)
                .filter(
                  rampKey => theme.ramps[rampKey].config.mode === "colored"
                )
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
                ))}
            </Block>
          ))}
        </Block>
      </Block>
    );
  }
);

export default function Themes({ onConfigSelect }) {
  const finalConfigs = themeConfigs;
  const [showMiddleGrays, setShowMiddleGrays] = useBrowserState(false);
  const [selectedConfigName, setSelectedConfigName] = useBrowserState(
    themeConfigs[0].name
  );
  return (
    <div style={__.pa2}>
      <Labeled title="Themes" />
      <Checkbox
        label="Show middle grays"
        value={showMiddleGrays}
        onChange={setShowMiddleGrays}
      />
      {finalConfigs.map(config => (
        <div key={config.name} style={__.mt2.relative}>
          {config.name === selectedConfigName && (
            <>
              <Block
                contrast="bg=100"
                style={{
                  ...__.absolute,
                  width: ".5rem",
                  height: ".5rem",
                  top: "50%",
                  left: "-.75rem",
                  transform: "translateY(-50%) rotate(45deg)"
                }}
              />
              <Block
                contrast="bg=100"
                style={{
                  ...__.absolute,
                  width: ".5rem",
                  height: ".5rem",
                  top: "50%",
                  right: "-.75rem",
                  transform: "translateY(-50%) rotate(45deg)"
                }}
              />
            </>
          )}
          <ThemePreview
            config={config}
            showMiddle={showMiddleGrays}
            isSelected={config.name === selectedConfigName}
            onClick={() => {
              setSelectedConfigName(config.name);
              onConfigSelect(config);
            }}
          />
        </div>
      ))}
    </div>
  );
}
