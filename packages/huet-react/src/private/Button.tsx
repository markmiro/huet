import React from "react";

import { checkTheme, type Theme } from "huet";
import cx from "./cx";
import displayError from "./displayError";
import { inputClass } from "./inputClass";

/**
 * Reads a theme from a JSON file and hands it to `onUpload` with a name from
 * the file's name: `Sunset Huet Theme.json` is `Sunset`. Shows an error for
 * anything that isn't a valid theme.
 */
export function readThemeFile(file: File, onUpload: (theme: Theme, name: string) => void) {
  const name = file.name.replace(/\.json$/i, "").replace(/ Huet Theme$/, "").trim() || "Imported";
  // Some browsers and OSes report an empty type for .json files, so the
  // extension counts too.
  const isJson = file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
  if (!isJson) {
    displayError("Only JSON files are accepted.");
    return;
  }
  file.text().then((text) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
      checkTheme(parsed);
    } catch (error) {
      displayError(`That file isn't a valid Huet theme. ${(error as Error).message}`);
      return;
    }
    onUpload(parsed, name);
  });
}

export function JsonUploadButton({
  children,
  className,
  onUpload,
}: {
  children?: React.ReactNode;
  className?: string;
  /** Called with the theme and a name from the file's name: `Sunset Huet Theme.json` is `Sunset`. */
  onUpload: (theme: Theme, name: string) => void;
}) {
  return (
    <Button
      as="div"
      data-focus-within=""
      className={cx("hc:relative", className)}
    >
      {children}
      <input
        type="file"
        accept=".json,application/json"
        className="hc:absolute hc:w-full hc:h-full hc:left-0 hc:top-0 hc:opacity-0"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Clear the selection so picking the same file again (say, after
          // fixing it) still fires `onChange`.
          event.target.value = "";
          if (file) readThemeFile(file, onUpload);
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
  /** Huet color classes, relative to the parent's background */
  colors?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  verify?: boolean | string;
  onClick?: (event: React.MouseEvent) => void;
} & Omit<React.AllHTMLAttributes<HTMLElement>, "as" | "className" | "style" | "children" | "onClick">;

export default function Button({
  as: As = "button",
  colors = "huet-bg-10",
  className,
  children,
  verify,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <As
      onClick={doubleCheck(verify, onClick)}
      {...rest}
      className={cx(
        inputClass,
        "hc:w-full hc:border-transparent hc:cursor-default hc:flex hc:justify-center hc:items-center",
        colors,
        className,
      )}
    >
      {children}
    </As>
  );
}

export function TextButton({
  onClick,
  className,
  verify,
  ...rest
}: {
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
  verify?: boolean | string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "className">) {
  return (
    <button
      {...rest}
      className={cx("hc:underline hc:cursor-pointer", className)}
      onClick={doubleCheck(verify, onClick)}
    />
  );
}
