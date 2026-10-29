import React from "react";

import Block from "../Block";
import type { ThemeConfig } from "../colorModel";
import Contrast, { type ContrastProps } from "../Contrast";
import __ from "./atoms";
import displayError from "./displayError";
import isThemeConfig from "./isThemeConfig";
import { focusWithinClass, inputStyle, invisibleScreenClass } from "./styles";

export function JsonUploadButton({
  children,
  className,
  style,
  onUpload,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onUpload: (themeConfig: ThemeConfig) => void;
}) {
  return (
    <Button
      as="div"
      className={`${focusWithinClass} + ${className}`}
      style={{ ...__.relative, ...style }}
    >
      {children}
      <input
        type="file"
        className={invisibleScreenClass}
        onChange={(event) => {
          const reader = new FileReader();
          const eventListener = () => {
            if (typeof reader.result === "string") {
              let themeConfig: unknown;
              try {
                themeConfig = JSON.parse(reader.result);
              } catch {
                // Reported below
              }
              if (isThemeConfig(themeConfig)) {
                onUpload(themeConfig);
              } else {
                displayError("That file isn't a valid Huet theme.");
              }
            }
            reader.removeEventListener("load", eventListener);
          };
          reader.addEventListener("load", eventListener);

          const file = event.target.files?.[0];
          // Clear the selection so picking the same file again (say, after
          // fixing it) still fires `onChange`.
          event.target.value = "";
          if (!file) return;
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

function doubleCheck(
  boolOrMessage: boolean | string | undefined,
  cb?: (event: React.MouseEvent) => void
) {
  if (boolOrMessage && !cb) {
    throw new Error(
      "Need a callback, otherwise `doubleCheck(boolOrMessage, cb)` doesn't do anything."
    );
  }
  return (event: React.MouseEvent) => {
    if (boolOrMessage) {
      const didAccept = window.confirm(
        boolOrMessage === true ? "Are you sure?" : boolOrMessage
      );
      if (!didAccept) return;
    }
    cb?.(event);
  };
}

type ButtonProps = {
  as?: React.ElementType;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  isActive?: boolean;
  verify?: boolean | string;
  onClick?: (event: React.MouseEvent) => void;
} & Omit<ContrastProps, "as" | "style" | "children" | "onClick">;

export default function Button({
  as = "button",
  style,
  children,
  isActive,
  verify,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <Contrast
      as={as}
      bgRamp={isActive ? "blue" : "null"}
      bg={12}
      text={100}
      onClick={doubleCheck(verify, onClick)}
      {...rest}
      style={{
        ...inputStyle,
        borderColor: "transparent",
        ...__.flex.justify_center.items_center,
        ...style,
      }}
    >
      {children}
    </Contrast>
  );
}

export function TextButton({
  as = "button",
  onClick,
  style,
  verify,
  ...rest
}: {
  as?: React.ElementType;
  onClick?: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
  verify?: boolean | string;
} & Omit<React.ComponentProps<typeof Block>, "as" | "onClick" | "style">) {
  return (
    <Block
      as={as}
      base="blue"
      style={{
        backgroundColor: "transparent",
        padding: 0,
        border: 0,
        textDecoration: "underline",
        cursor: "pointer",
        ...style,
      }}
      onClick={doubleCheck(verify, onClick)}
      {...rest}
    />
  );
}
