// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

  it("reads writes that haven't been flushed yet", () => {
    writeStored("a", 1);
    expect(readStored("a", 0, asNumber)).toBe(1);
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

  it("keeps hooks with the same key in sync", () => {
    // Parsing copies the value, as real parsers do
    const asCopy = (stored: unknown) =>
      typeof stored === "object" && stored !== null
        ? { ...(stored as { n: number }) }
        : undefined;
    const setters: ((value: { n: number }) => void)[] = [];
    function Count({ index }: { index: number }) {
      const [count, set] = usePersistentState("count", { n: 0 }, asCopy);
      setters[index] = set;
      return React.createElement("span", null, count.n);
    }
    const writes = vi.spyOn(localStorage, "setItem");
    const { container, unmount } = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Count, { index: 0 }),
        React.createElement(Count, { index: 1 })
      )
    );

    act(() => setters[0]({ n: 1 }));
    expect(container.textContent).toBe("11");
    act(() => setters[1]({ n: 2 }));
    expect(container.textContent).toBe("22");
    act(() => setters[0]({ n: 3 }));
    expect(container.textContent).toBe("33");

    // Bouncing values between the hooks would never settle inside act()
    flushStored();
    expect(writes).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("huet:count")).toBe('{"n":3}');
    unmount();
  });

  it("doesn't take back its own unsaved value when another key changes", () => {
    // Like the configurator: the theme (parent) and the theme list (child)
    // change together, while the previous theme edit is still unsaved
    let setTheme: (value: number) => void = () => {};
    let setList: (value: number) => void = () => {};
    function List() {
      const [list, set] = usePersistentState("list", 0, asNumber);
      setList = set;
      return React.createElement("span", null, list);
    }
    function Theme() {
      const [theme, set] = usePersistentState("theme", 0, asNumber);
      setTheme = set;
      return React.createElement("span", null, theme, React.createElement(List));
    }
    const { container, unmount } = render(React.createElement(Theme));

    act(() => setTheme(1));
    act(() => {
      setList(1);
      setTheme(2);
    });
    expect(container.textContent).toBe("21");

    // A primitive value we wrote earlier still syncs once another hook wrote over it
    const toggles: ((value: boolean) => void)[] = [];
    function Toggle({ index }: { index: number }) {
      const [on, set] = usePersistentState("toggle", false, asBoolean);
      toggles[index] = set;
      return React.createElement("span", null, String(on));
    }
    const pair = render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Toggle, { index: 0 }),
        React.createElement(Toggle, { index: 1 })
      )
    );
    act(() => toggles[0](true));
    act(() => toggles[1](false));
    act(() => toggles[1](true));
    expect(pair.container.textContent).toBe("truetrue");
    pair.unmount();
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
