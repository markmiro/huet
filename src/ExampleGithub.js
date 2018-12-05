import React, { useContext } from "react";
import huet from "./huet";
import H from "./Contrast";

const { ThemeContext } = huet;

export default function Github() {
  const ctx = useContext(ThemeContext);
  return (
    <>
      <div className="flex-auto">
        <H bg={10}>
          <H bg={85} className="pa3">
            🚀 Pull requests | Issues | Marketplace | Explore
          </H>
          <H border={20} className="ph2 ph5-ns bb">
            <div className="db pv3">loremperson/some-crazy-project</div>
            <div className="flex">
              <ThemeContext.Provider value={ctx}>
                <H
                  bg={0}
                  border={20}
                  className="pa2 mr1 bt bl br"
                  style={{
                    transform: "translateY(1px)"
                  }}
                >
                  Code
                </H>
              </ThemeContext.Provider>
              <H text={50} className="pa2 mr1">
                Issues
                <H
                  bg={10}
                  text={50}
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
          </H>
        </H>
        <div
          className="ph2 ph5-ns pv3"
          style={{
            minHeight: "100vh"
          }}
        >
          <H bg={100} className="ph3 pv2 tc br3 f3">
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
        <H
          key={contrast}
          className="f7 pa1"
          style={{
            background: gradient(contrast)
          }}
        >
          {contrast}%
        </H>
      ))}

      <H
        bg={30}
        className="h2 mt2"
        style={{
          boxShadow: `0 5px 10px ${theme.plainColor({
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
          boxShadow: `0 1px 2px ${theme.plainColor({ alpha: 0.15 })}`
        }}
      >
        Button
      </H>
      <div className="flex mt3">
        {Object.keys(ctx.ramps).map(key => (
          <H className="pa1 mr1 tc w-100 f4" bg={45} bgRamp={key}>
            {key}
          </H>
        ))}
      </div>
      <div className="flex mt1">
        {Object.keys(ctx.ramps).map(key => (
          <H className="pa1 mr1 tc w-100 f4" bgRamp={key} bg={5}>
            {key}
          </H>
        ))}
      </div>
    </div>
  );
}
