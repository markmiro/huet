import { describe, expect, it } from "vitest";

import { createTheme, defaultTheme, derive, themeVars } from "../src/theme.ts";

describe("createTheme", () => {
  it("fills in defaults", () => {
    expect(createTheme({ bg: 0.2 })).toEqual({ ...defaultTheme, bg: 0.2, hues: { ...defaultTheme.hues } });
  });

  it("replaces hues instead of merging them", () => {
    expect(Object.keys(createTheme({ hues: { teal: "#0f9" } }).hues)).toEqual(["teal"]);
  });

  it("extends a base theme", () => {
    const dark = createTheme({ bg: 0, dark: "#111" });
    expect(createTheme({ contrast: 0.5 }, dark)).toMatchObject({ bg: 0, dark: "#111", contrast: 0.5 });
  });

  it("validates", () => {
    expect(() => createTheme({ bg: 2 })).toThrow(/bg/);
    expect(() => createTheme({ contrast: -1 })).toThrow(/contrast/);
    expect(() => createTheme({ dark: "nope" })).toThrow();
    expect(() => createTheme({ hues: { Red: "#f00" } })).toThrow(/lowercase/);
    expect(() => createTheme({ hues: { neutral: "#f00" } })).toThrow(/reserved/);
  });
});

describe("derive", () => {
  it("puts the black/white flip point between the WCAG and APCA ties", () => {
    const { flip } = derive(defaultTheme);
    expect(flip).toBeGreaterThan(0.5);
    expect(flip).toBeLessThan(0.65);
  });

  it("accepts the ends in either order", () => {
    const a = derive(createTheme({ dark: "#000", light: "#fff" }));
    const b = derive(createTheme({ dark: "#fff", light: "#000" }));
    expect(b.flip).toBeCloseTo(a.flip, 9);
  });

  it("keeps hue key colors strictly inside the ramp", () => {
    const d = derive(createTheme({ hues: { white: "#fff", black: "#000" } }));
    for (const ramp of Object.values(d.ramps)) {
      expect(ramp.l).toBeGreaterThan(d.ld);
      expect(ramp.l).toBeLessThan(d.lw);
    }
  });
});

describe("themeVars", () => {
  it("emits the public and per-hue variables", () => {
    const vars = themeVars({ bg: 0.3 });
    expect(vars["--huet-bg"]).toBe("0.3");
    expect(vars["--huet-contrast"]).toBe("1");
    for (const name of ["neutral", ...Object.keys(defaultTheme.hues)]) {
      for (const suffix of ["", "-p", "-l", "-f"]) expect(vars).toHaveProperty(`--huet-hue-${name}${suffix}`);
    }
  });
});
