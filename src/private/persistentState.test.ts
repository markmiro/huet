// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import defaultThemeConfigs from "../demo/themeConfigs";
import baseThemeConfig from "./baseThemeConfig";
import isThemeConfig, { parseThemeConfig } from "./isThemeConfig";
import usePersistentState, {
  asBoolean,
  asNumber,
  asOneOf,
  clearStored,
  flushStored,
  readStored,
  writeStored,
} from "./persistentState";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  clearStored();
  vi.restoreAllMocks();
});

describe("readStored", () => {
  it("returns the fallback when nothing is saved", () => {
    expect(readStored("missing", 5, asNumber)).toBe(5);
  });

  it("returns valid saved values", () => {
    localStorage.setItem("huet:count", "12");
    expect(readStored("count", 5, asNumber)).toBe(12);
  });

  it("discards corrupt JSON and values of the wrong shape", () => {
    localStorage.setItem("huet:corrupt", "{not json");
    localStorage.setItem("huet:wrongType", JSON.stringify(["THEMES"]));
    expect(readStored("corrupt", true, asBoolean)).toBe(true);
    expect(readStored("wrongType", "THEMES", asOneOf(["THEMES", "EDIT"]))).toBe(
      "THEMES"
    );
    expect(localStorage.getItem("huet:corrupt")).toBeNull();
    expect(localStorage.getItem("huet:wrongType")).toBeNull();
  });
});

describe("writing", () => {
  it("batches writes until flushed", () => {
    writeStored("a", 1);
    writeStored("a", 2);
    expect(localStorage.getItem("huet:a")).toBeNull();
    flushStored();
    expect(localStorage.getItem("huet:a")).toBe("2");
  });

  it("survives storage errors", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    writeStored("a", 1);
    expect(() => flushStored()).not.toThrow();
  });

  it("clears only Huet's keys", () => {
    localStorage.setItem("hostApp", "keep me");
    localStorage.setItem("useBrowserState_huet_3_", "true");
    writeStored("a", 1);
    flushStored();
    clearStored();
    expect(localStorage.getItem("huet:a")).toBeNull();
    expect(localStorage.getItem("useBrowserState_huet_3_")).toBeNull();
    expect(localStorage.getItem("hostApp")).toBe("keep me");
  });
});

describe("usePersistentState", () => {
  function render(element: React.ReactElement) {
    const container = document.createElement("div");
    const root = createRoot(container);
    act(() => root.render(element));
    return { container, unmount: () => act(() => root.unmount()) };
  }

  let setFlag: (value: boolean) => void = () => {};
  function Flag({ storageKey }: { storageKey: string }) {
    const [flag, set] = usePersistentState(storageKey, false, asBoolean);
    setFlag = set;
    return React.createElement("span", null, String(flag));
  }

  it("loads saved values and saves changes", () => {
    localStorage.setItem("huet:flag", "true");
    const { container, unmount } = render(
      React.createElement(Flag, { storageKey: "flag" })
    );
    expect(container.textContent).toBe("true");

    act(() => setFlag(false));
    flushStored();
    expect(localStorage.getItem("huet:flag")).toBe("false");
    unmount();
  });

  it("doesn't write on mount, even in strict mode", () => {
    const { unmount } = render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(Flag, { storageKey: "flag" })
      )
    );
    flushStored();
    expect(localStorage.getItem("huet:flag")).toBeNull();
    unmount();
  });

  it("saves a value that was changed back to what was loaded", () => {
    localStorage.setItem("huet:flag", "true");
    const { unmount } = render(
      React.createElement(Flag, { storageKey: "flag" })
    );
    act(() => setFlag(false));
    flushStored();
    act(() => setFlag(true));
    flushStored();
    expect(localStorage.getItem("huet:flag")).toBe("true");
    unmount();
  });
});

describe("isThemeConfig", () => {
  it("accepts the built-in themes", () => {
    expect(isThemeConfig(baseThemeConfig)).toBe(true);
    for (const config of defaultThemeConfigs) {
      expect(isThemeConfig(config)).toBe(true);
    }
  });

  it("rejects configs that can't build a theme", () => {
    expect(isThemeConfig(null)).toBe(false);
    expect(isThemeConfig([])).toBe(false);
    expect(isThemeConfig({ ...baseThemeConfig, bgRampValue: "1" })).toBe(false);
    expect(isThemeConfig({ ...baseThemeConfig, bgRamp: "nope" })).toBe(false);
    expect(isThemeConfig({ ...baseThemeConfig, unknownKey: 1 })).toBe(false);
    expect(
      isThemeConfig({
        ...baseThemeConfig,
        ramps: { ...baseThemeConfig.ramps, gray: { colors: ["missing"] } },
      })
    ).toBe(false);
  });
});

describe("parseThemeConfig", () => {
  // Saved by versions that had the "Rescale signal saturation" setting
  const legacyConfig = { ...baseThemeConfig, rescaleSaturationToGrayRange: true };

  it("drops removed settings from older saved themes and imports", () => {
    expect(isThemeConfig(legacyConfig)).toBe(false);
    expect(parseThemeConfig(legacyConfig)).toEqual(baseThemeConfig);
  });

  it("loads a saved theme that still has a removed setting", () => {
    localStorage.setItem("huet:theme", JSON.stringify(legacyConfig));
    expect(readStored("theme", undefined, parseThemeConfig)).toEqual(
      baseThemeConfig
    );
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("still rejects configs that are invalid for other reasons", () => {
    expect(parseThemeConfig(null)).toBeUndefined();
    expect(parseThemeConfig({ ...legacyConfig, unknownKey: 1 })).toBeUndefined();
  });
});
