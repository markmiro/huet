import React from "react";
import Contrast from "../Contrast.jsx";
import __ from "./atoms";
import { inputStyle, invisibleScreenClass } from "./styles";
import displayError from "./displayError";

export function ButtonGroup({ children, className, style }) {
  const items = React.Children.map(children, (child, i) => {
    const isFirst = i === 0;
    return <div style={isFirst ? null : __.ml1}>{child}</div>;
  });

  return (
    <div className={className} style={{ ...__.flex, marginRight: 1, ...style }}>
      {items}
    </div>
  );
}

export function JsonUploadButton({ children, className, style, onUpload }) {
  return (
    <Button as="div" className={className} style={{ ...__.relative, ...style }}>
      {children}
      <input
        type="file"
        className={invisibleScreenClass}
        onChange={e => {
          const reader = new FileReader();
          reader.onload = () => onUpload(JSON.parse(reader.result));

          const file = e.target.files[0];
          if (file.type === "application/json") {
            reader.readAsText(file);
          } else {
            displayError("Only JSON files are accepted.");
          }
        }}
      />
    </Button>
  );
}

export default function Button({
  as = "button",
  className,
  style,
  children,
  isActive,
  verify,
  onClick,
  ...rest
}) {
  return (
    <Contrast
      as={as}
      bgRamp={isActive ? "blue" : "gray"}
      bg={10}
      text={50}
      onClick={e => {
        if (verify) {
          const didAccept = window.confirm(
            verify === true ? "Are you sure?" : verify
          );
          if (!didAccept) return;
        }
        onClick && onClick(e);
      }}
      {...rest}
      style={{
        ...inputStyle,
        ...__.flex.justify_center,
        ...style
      }}
    >
      {children}
    </Contrast>
  );
}

// <Block
//   huetStyle={{
//     base: "red",
//     bg: 50,
//     fgContrast: 10,
//     fgRamp: "red",
//     b: 5,
//     bRamp: "blue"
//   }}
// >
//   Hello
// </Block>;

// <div
//   style={parentBg.style({
//     base: "red",
//     bg: 50,
//     fgContrast: 10,
//     fgRamp: "red",
//     b: 5,
//     bRamp: "blue"
//   })}
// >
//   Hello
// </div>;

// <Block style={huet => huet(__.base_red.bgc1.fgc_2.bc1)}>Hello</Block>;

// <Body themeConfig={themeConfig} atoms={atoms}>
//   {/* Purely JS with React component */}
//   <Block
//     style={contrast => ({
//       backgroundColor: contrast(100),
//       color: contrast('backgroundColor', 100),
//     })}
//   >
//     Hello
//   </Block>
//   {/* For composability with existing styles */}
//   <Block
//     huetStyle={{
//       padding: '.5em',
//       $base: 'red',
//       '--bg': 100,
//       '--bgFg': 100,
//       '--fgBase':
//     }}
//   >
//     Hello
//   </Block>
//   {/* If not importing $ into current module */}
//   <Block atoms={$ => $.bg2.bgFg5}>Hello</Block>
//   {/* If importing $ into current module */}
//   <Block atoms={$.bg2.bgFg5}>Hello</Block>
// </Body>;

// <Body themeConfig={themeConfig} atoms={atoms} cssMode="inline">
//   <Block
//     css={contrast => ({
//       backgroundColor: contrast(100),
//       color: contrast(100, 'red'),
//       "::placeholder": {
//         color: contrast(80),
//       }
//     })}
//   >
//     Hello
//   </Block>
//   <Block atoms='$bg-2 $bg/fg2'>Hello</Block>
// </Body>;

// <Body themeConfig={themeConfig} atoms={atoms} cssMode="inline">
//   <Block
//     css={contrast => ({
//       backgroundColor: 'var(--bg)',
//       color: contrast(100, 'red'),
//       "::placeholder": {
//         color: 'var(--fg)',
//       }
//     })}
//   >
//     Hello
//   </Block>
//   <Block atoms='bg:2 bg/fg:2'>Hello</Block>
// </Body>;
