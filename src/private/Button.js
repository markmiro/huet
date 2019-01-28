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
        ...__.flex.justify_center.bn,
        ...style
      }}
    >
      {children}
    </Contrast>
  );
}
