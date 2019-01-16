import React, { useContext } from "react";
import { BackgroundContext, Contrast } from "huet";
import Icon from "unstable/private/Icon";

export default function Github() {
  const parentBg = useContext(BackgroundContext);
  const borderColor = parentBg.contrast(20);

  return (
    <div className="flex-auto">
      <Contrast bg={5}>
        <Contrast bg={70} className="pa3 flex items-center">
          <Icon name="github" size="2em" className="mr3" />
          Pull requests &nbsp; Issues &nbsp; Marketplace &nbsp; Explore
        </Contrast>
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
                backgroundColor: parentBg,
                color: parentBg.contrast(100),
                borderLeftColor: borderColor,
                borderRightColor: borderColor,
                borderTopWidth: "0.2em",
                borderTopColor: parentBg.contrast(
                  60,
                  parentBg.theme.ramps.gold
                ),
                borderTopLeftRadius: ".2em",
                borderTopRightRadius: ".2em",
                transform: "translateY(1px)"
              }}
            >
              Code
            </div>
            <Contrast text={50} className="pa2 mr1">
              Issues
              <Contrast
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
              </Contrast>
            </Contrast>
            <Contrast text={50} className="pa2 mr1">
              Pull requests
            </Contrast>
          </div>
        </div>
      </Contrast>
      <div
        className="ph2 ph5-ns pv3"
        style={{
          minHeight: "100vh"
        }}
      >
        <Contrast
          bg={100}
          className="ph3 pv2 tc br3 f3"
          style={{ maxWidth: "100%" }}
        >
          Button
        </Contrast>
        <Experiments />
      </div>
    </div>
  );
}

function Experiments() {
  const parentBg = useContext(BackgroundContext);
  const theme = parentBg.theme;

  function gradient(contrast) {
    return `linear-gradient(to right, transparent, ${parentBg.contrast(
      contrast
    )}`;
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

      <Contrast
        bg={30}
        className="h2 mt2"
        style={{
          boxShadow: `0 5px 10px ${theme.ramps.gray(0).alpha(0.2)}`
        }}
      />

      <Contrast
        as="button"
        border={20}
        text={70}
        className="pa2 tc br2 ba mt3 w-100 f4"
        style={{
          background: `linear-gradient(transparent, ${parentBg.contrast(5)})`,
          boxShadow: `0 1px 2px ${theme.ramps.gray(0).alpha(0.15)}`,
          maxWidth: "100%"
        }}
      >
        Button
      </Contrast>
      <div className="flex mt3">
        {Object.keys(theme.ramps).map(key => (
          <Contrast
            key={key}
            className="pa1 mr1 tc w-100 f4"
            bg={100}
            bgRamp={key}
            textRamp="white"
          >
            {key}
          </Contrast>
        ))}
      </div>
      <div className="flex mt1">
        {Object.keys(theme.ramps).map(key => (
          <Contrast
            key={key}
            className="pa1 mr1 tc w-100 f4"
            bg={45}
            bgRamp={key}
            textRamp="white"
          >
            {key}
          </Contrast>
        ))}
      </div>
      <div className="flex mt1">
        {Object.keys(theme.ramps).map(key => (
          <Contrast
            key={key}
            className="pa1 mr1 tc w-100 f4"
            bgRamp={key}
            bg={5}
            textRamp="white"
          >
            {key}
          </Contrast>
        ))}
      </div>
    </div>
  );
}
