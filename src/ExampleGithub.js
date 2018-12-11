import React, { useContext } from "react";
import huet from "./huet";
import H from "./Contrast";
import Icon from "./Icon";

const { ThemeContext } = huet;

export default function Github() {
  const ctx = huet.useTheme();
  const borderColor = ctx.contrast(20);
  debugger;
  return (
    <>
      <div className="flex-auto">
        <H bg={5}>
          <H bg={70} className="pa3 flex items-center">
            <Icon name="github" size="2em" className="mr3" />
            Pull requests &nbsp; Issues &nbsp; Marketplace &nbsp; Explore
          </H>
          <div
            className="ph2 ph5-ns bb"
            style={{
              borderColor
            }}
          >
            <div className="db pv3">loremperson/some-crazy-project</div>
            <div className="flex">
              <div
                className="pa2 mr1 bt bl br"
                style={{
                  backgroundColor: ctx.value.color,
                  color: ctx.contrast(100),
                  borderLeftColor: borderColor,
                  borderRightColor: borderColor,
                  borderTopWidth: "0.2em",
                  borderTopColor: ctx.contrast(30, { ramp: "gold" }),
                  borderTopLeftRadius: ".2em",
                  borderTopRightRadius: ".2em",
                  transform: "translateY(1px)"
                }}
              >
                Code
              </div>
              <H text={50} className="pa2 mr1">
                Issues
                <H
                  bg={10}
                  text={60}
                  className="ml2 inline-flex justify-center items-center"
                  style={{
                    fontSize: ".7em",
                    padding: "2px 6px",
                    borderRadius: "1em"
                  }}
                >
                  22
                </H>
              </H>
              <H text={50} className="pa2 mr1">
                Pull requests
              </H>
            </div>
          </div>
        </H>
        <div
          className="ph2 ph5-ns pv3"
          style={{
            minHeight: "100vh"
          }}
        >
          <H
            bg={100}
            className="ph3 pv2 tc br3 f3"
            style={{ maxWidth: "100%" }}
          >
            Button
          </H>
          <Experiments />
        </div>
      </div>
    </>
  );
}

function Experiments() {
  const ctx = useContext(ThemeContext);
  const theme = huet.useTheme();

  function gradient(contrast) {
    return `linear-gradient(to right, transparent, ${theme.contrast(contrast)}`;
  }
  return (
    <div className="mt2">
      {[100, 75, 50, 25].map(contrast => (
        <div
          key={contrast}
          className="f7 pa1"
          style={{
            background: gradient(contrast)
          }}
        >
          {contrast}%
        </div>
      ))}

      <H
        bg={30}
        className="h2 mt2"
        style={{
          boxShadow: `0 5px 10px ${theme.darkColor({
            alpha: 0.2
          })}`
        }}
      />

      <H
        as="button"
        border={20}
        text={70}
        className="pa2 tc br2 ba mt3 w-100 f4"
        style={{
          background: `linear-gradient(transparent, ${theme.contrast(5)})`,
          boxShadow: `0 1px 2px ${theme.darkColor({ alpha: 0.15 })}`,
          maxWidth: "100%"
        }}
      >
        Button
      </H>
      <div className="flex mt3">
        {Object.keys(ctx.ramps).map(key => (
          <H key={key} className="pa1 mr1 tc w-100 f4" bg={45} bgRamp={key}>
            {key}
          </H>
        ))}
      </div>
      <div className="flex mt1">
        {Object.keys(ctx.ramps).map(key => (
          <H key={key} className="pa1 mr1 tc w-100 f4" bgRamp={key} bg={5}>
            {key}
          </H>
        ))}
      </div>
    </div>
  );
}
