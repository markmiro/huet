import chroma from "chroma-js";
import { describe, expect, it } from "vitest";

import { BaseColor, default as Color, getLightness } from "./Color";
import type { ThemeConfig } from "./colorModel";
import Theme from "./Theme";
import baseThemeConfig from "./private/baseThemeConfig";

function themeWith(overrides: Partial<ThemeConfig> = {}) {
  return new Theme({ ...baseThemeConfig, ...overrides });
}

describe("getLightness", () => {
  it("reads LAB lightness from hex and clamps the bottom at zero", () => {
    expect(getLightness("#000000")).toBe(0);
    expect(getLightness("#ffffff")).toBeCloseTo(100, 5);
    expect(getLightness("#808080")).toBeGreaterThan(40);
    expect(getLightness("#808080")).toBeLessThan(60);
  });
});

describe("BaseColor", () => {
  it("requires a lab triple and stringifies to its hex", () => {
    expect(
      () => new BaseColor(undefined as unknown as [number, number, number]),
    ).toThrow(/lab/);
    const color = new BaseColor([50, 20, -10]);
    expect(color.toString()).toBe(color.hex);
    expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
    expect(color.alpha(0.5)).toMatch(/^#[0-9a-f]{8}$/i);
  });
});

describe("Theme", () => {
  it("builds a gray ramp from black to white", () => {
    const theme = themeWith();
    const [dark] = theme.ramps.gray(0);
    const [mid] = theme.ramps.gray(0.5);
    const [light] = theme.ramps.gray(1);
    expect(dark).toBeCloseTo(0, 0);
    expect(light).toBeCloseTo(100, 0);
    expect(mid).toBeGreaterThan(dark);
    expect(mid).toBeLessThan(light);
  });

  it("spaces the generated pallet and skips the empty teal slot", () => {
    const theme = themeWith();
    expect(Object.keys(theme.pallet).sort()).toEqual(
      ["black", "blue", "green", "purple", "red", "white", "yellow"].sort(),
    );
    expect(theme.ramps.red.config.mode).toBe("signal");
    expect(theme.ramps.white.config.mode).toBe("direct");
    expect(theme.ramps.white.startL).toBeUndefined();
  });

  it("rejects unknown theme keys and unknown pallet colors", () => {
    expect(
      () => new Theme({ ...baseThemeConfig, extra: true } as ThemeConfig),
    ).toThrow(/isn't allowed/);
    expect(
      () =>
        new Theme({
          ...baseThemeConfig,
          ramps: {
            ...baseThemeConfig.ramps,
            bad: { colors: ["nope"] },
          },
        }),
    ).toThrow(/Couldn't find color "nope"/);
  });
});

describe("Color contrast", () => {
  it("fromTheme uses the background ramp and refuses a plain config object", () => {
    const theme = themeWith();
    const bg = Color.fromTheme(theme);
    expect(bg.lightness).toBeGreaterThan(95);
    expect(bg.hex).toMatch(/^#[0-9a-f]{6}$/i);
    expect(bg.theme).toBe(theme);
    expect(() => Color.fromTheme(baseThemeConfig as unknown as Theme)).toThrow(
      TypeError,
    );
  });

  it("moves toward the opposite lightness, and further as the amount grows", () => {
    const lightBg = Color.fromTheme(themeWith({ bgRampValue: 1 }));
    const darkBg = Color.fromTheme(themeWith({ bgRampValue: 0 }));
    const onLight = lightBg.contrast(100);
    const onDark = darkBg.contrast(100);
    expect(onLight.lightness).toBeLessThan(lightBg.lightness);
    expect(onDark.lightness).toBeGreaterThan(darkBg.lightness);

    const gap = (color: Color) => Math.abs(color.lightness - lightBg.lightness);
    expect(gap(lightBg.contrast(25))).toBeLessThan(gap(lightBg.contrast(50)));
    expect(gap(lightBg.contrast(50))).toBeLessThan(gap(lightBg.contrast(100)));
  });

  it("keeps a stable hex for the default light background at full contrast", () => {
    const bg = Color.fromTheme(themeWith());
    const red = bg.contrast(100, bg.theme.ramps.red);
    expect([bg.hex, bg.contrast(100).hex, red.hex]).toEqual([
      "#ffffff",
      "#000000",
      "#cd4355",
    ]);
    expect(bg.contrast(100)).toBe(bg.contrast(100));
  });

  it("pulls signal chroma toward the background when contrastMultiplier drops", () => {
    const full = themeWith({ contrastMultiplier: 1 });
    const muted = themeWith({ contrastMultiplier: 0.25 });
    const fullRed = Color.fromTheme(full).contrast(100, full.ramps.red);
    const mutedRed = Color.fromTheme(muted).contrast(100, muted.ramps.red);
    const chromaDistance = (color: Color) =>
      Math.hypot(color.lab[1], color.lab[2]);
    expect(chromaDistance(mutedRed)).toBeLessThan(chromaDistance(fullRed));
  });

  it("mixes direct ramps by contrastMultiplier", () => {
    const full = themeWith({ contrastMultiplier: 1 });
    const none = themeWith({ contrastMultiplier: 0 });
    const fullBg = Color.fromTheme(full);
    const noneBg = Color.fromTheme(none);
    const mixed = noneBg.direct(none.ramps.white);
    expect(mixed.lab[0]).toBeCloseTo(noneBg.lab[0], 5);
    expect(mixed.lab[1]).toBeCloseTo(noneBg.lab[1], 5);
    expect(mixed.lab[2]).toBeCloseTo(noneBg.lab[2], 5);
    expect(fullBg.direct(full.ramps.white).hex).not.toBe(fullBg.hex);
    expect(() => fullBg.direct(full.ramps.red)).toThrow(/Not allowed/);
  });

  it("base() keeps the color and rejects a direct ramp", () => {
    const bg = Color.fromTheme(themeWith());
    const based = bg.base(bg.theme.ramps.red);
    expect(based.hex).toBe(bg.hex);
    expect(based.baseRamp).toBe(bg.theme.ramps.red);
    expect(based.contrast(80).lab[1]).not.toBeCloseTo(
      bg.contrast(80).lab[1],
      0,
    );
    expect(() => bg.base(bg.theme.ramps.white)).toThrow(/direct ramp/);
  });

  it("scales alpha by contrastMultiplier and builds a shadow from the dark end of gray", () => {
    const theme = themeWith({ contrastMultiplier: 0.5 });
    const bg = Color.fromTheme(theme);
    const faded = bg.alpha(1);
    expect(faded).toMatch(/^#[0-9a-f]{8}$/i);
    expect(bg.shadowColor(0.5).alpha()).toBeCloseTo(0.25, 5);
  });

  it("requires a theme", () => {
    expect(
      () =>
        new Color({
          theme: undefined as unknown as Theme,
          lab: [50, 0, 0],
        }),
    ).toThrow(/theme/);
  });
});

describe("neutral midpoint regressions", () => {
  it("keeps secondary text readable on both sides of LAB 50", async () => {
    const chroma = (await import("chroma-js")).default;
    for (const bgRampValue of [0.49, 0.5, 0.51]) {
      const bg = Color.fromTheme(themeWith({ bgRampValue }));
      expect(
        chroma.contrast(bg.hex, bg.contrast(50).hex),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        chroma.contrast(bg.hex, bg.contrast(100).hex),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        chroma.contrast(bg.hex, bg.contrast(25).hex),
      ).toBeGreaterThanOrEqual(3);
      expect(bg.contrast(0).hex).toBe(bg.hex);
    }
  });
});

describe("semantic midpoint regressions", () => {
  it("uses a shared polarity for alerts and semantic text across the legacy slider", () => {
    for (const colors of [["black", "white"], ["white", "black"]]) {
    const theme = themeWith({ ramps: { ...baseThemeConfig.ramps, gray: { colors } } });
    for (let i = 0; i <= 100; i++) {
      const bg = new Color({ theme, lab: theme.ramps.gray(i / 100), ramp: theme.ramps.gray });
      const lighter = chroma.contrast(bg.hex, "#fff") > chroma.contrast(bg.hex, "#000");
      for (const hue of ["red", "yellow", "green", "blue", "purple"]) {
        for (const amount of [12, 25, 100]) {
          const color = bg.contrast(amount, theme.ramps[hue]);
          const delta = chroma(color.hex).luminance() - chroma(bg.hex).luminance();
          expect(lighter ? delta >= 0 : delta <= 0, bg.hex + " " + hue).toBe(true);

        }
      }
    }
    }
  });

});


describe("relative semantic scaling", () => {
  it("honors both signal-lightness controls at their named endpoints", () => {
    for (const [bgRampValue, setting] of [[0, "endSignalLightness"], [1, "startSignalLightness"]] as const) {
      const first = themeWith({ bgRampValue, [setting]: .3 });
      const second = themeWith({ bgRampValue, [setting]: .7 });
      const a = Color.fromTheme(first).contrast(100, first.ramps.red);
      const b = Color.fromTheme(second).contrast(100, second.ramps.red);
      expect(b.lightness - a.lightness).toBeGreaterThan(25);
    }
  });
  it("preserves the configured signal anchor at black and white", () => {
    for (const bgRampValue of [0, 1]) {
      const theme = themeWith({ bgRampValue });
      const bg = Color.fromTheme(theme);
      for (const hue of ["red", "yellow", "green", "blue", "purple"]) {
        expect(bg.contrast(100, theme.ramps[hue]).hex)
          .toBe(chroma.lab(...theme.ramps[hue](.49)).hex());
      }
    }
  });
});

describe("ramp progression", () => {
  it("moves monotonically on one side at every integer strength and background", () => {
    const theme = themeWith();
    for (let position = 0; position <= 100; position++) {
      const bg = new Color({ theme, ramp: theme.ramps.gray, lab: theme.ramps.gray(position / 100) });
      const lighter = chroma.contrast(bg.hex, "#fff") > chroma.contrast(bg.hex, "#000");
      for (const hue of ["gray", "red", "yellow", "green", "blue", "purple"]) {
        let previous = chroma(bg.hex).luminance();
        for (let amount = 0; amount <= 100; amount++) {
          const value = chroma(bg.contrast(amount, theme.ramps[hue]).hex).luminance();
          expect(lighter ? value >= previous : value <= previous,
            position + " " + hue + " " + amount).toBe(true);
          previous = value;
        }
      }
    }
  });
  it("keeps low semantic strengths visible on black and comparable to white", () => {
    const theme = themeWith();
    const black = new Color({ theme, lab: [0, 0, 0] });
    const white = new Color({ theme, lab: [100, 0, 0] });
    for (const hue of ["red", "yellow", "green", "blue", "purple"]) {
      for (const amount of [6.25, 12.5, 25]) {
        const onBlack = black.contrast(amount, theme.ramps[hue]);
        const onWhite = white.contrast(amount, theme.ramps[hue]);
        const blackDistance = getLightness(onBlack.hex);
        const whiteDistance = 100 - getLightness(onWhite.hex);
        expect(blackDistance).toBeGreaterThan(2);
        expect(blackDistance / whiteDistance).toBeGreaterThan(.65);
        expect(blackDistance / whiteDistance).toBeLessThan(1.5);
      }
    }
  });
});
