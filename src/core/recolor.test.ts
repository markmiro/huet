import { describe, expect, it } from "vitest";
import { oklabFromRgb, rgb } from "./color";
import {
  applyLut,
  applyTransform,
  buildLut,
  coordinatesOf,
  recolorer,
  toCube,
} from "./recolor";
import { defaultColors } from "./theme";

const sunset = {
  dark: "#242744",
  light: "#ffe173",
  colors: { red: "#f20031", yellow: "#c16000", green: "#008d29", blue: "#12889d", purple: "#b555c8" },
};
function random(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

describe("theme coordinates", () => {
  it("places grays on the neutral ramp and anchors on their own hue", () => {
    const gray = coordinatesOf(rgb("#777777"));
    expect(gray.weights).toEqual({});
    expect(gray.t).toBeCloseTo(oklabFromRgb(...rgb("#777777"))[0], 6);
    const blue = coordinatesOf(rgb(defaultColors.blue));
    expect(blue.weights.blue).toBeCloseTo(1, 6);
    expect(Object.keys(blue.weights)).toEqual(["blue"]);
  });

  it("splits in-between hues across neighboring ramps", () => {
    const orange = coordinatesOf(rgb("#e87a2a")).weights;
    expect(Object.keys(orange).sort()).toEqual(["red", "yellow"]);
  });

  it("is the identity when the target is the source", () => {
    const same = recolorer({});
    const next = random(1);
    for (let i = 0; i < 500; i++) {
      const c = [next(), next(), next()] as const;
      same(...c).forEach((v, k) => expect(v).toBeCloseTo(c[k], 5));
    }
  });

  it("maps neutrals onto the target ramp and anchors onto target anchors", () => {
    const toSunset = recolorer(sunset);
    const hex = (x: readonly number[]) =>
      "#" + x.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
    expect(hex(toSunset(0, 0, 0))).toBe(sunset.dark);
    expect(hex(toSunset(1, 1, 1))).toBe(sunset.light);
    const [, a, b] = oklabFromRgb(...toSunset(...rgb(defaultColors.red)));
    const target = oklabFromRgb(...rgb(sunset.colors.red));
    const neutral = oklabFromRgb(...rgb(sunset.dark));
    // Hue of the added chroma matches the target's red anchor.
    expect(Math.atan2(b - neutral[2], a - neutral[1])).toBeCloseTo(
      Math.atan2(target[2], target[1]),
      0,
    );
  });

  it("keeps lightness direction unless asked to invert, and blends partially", () => {
    expect(recolorer({})(1, 1, 1)[0]).toBeCloseTo(1, 5);
    expect(recolorer({}, { invert: true })(1, 1, 1)[0]).toBeCloseTo(0, 5);
    const half = recolorer({ dark: "#ff0000", light: "#ff0000" }, { strength: 0 });
    half(0.2, 0.4, 0.6).forEach((v, i) => expect(v).toBeCloseTo([0.2, 0.4, 0.6][i], 5));
    expect(() => recolorer({}, { strength: 2 })).toThrow(RangeError);
    expect(() => recolorer({}, { tint: -1 })).toThrow(RangeError);
  });

  it("can keep the neutral tint off saturated colors", () => {
    const blue = rgb(defaultColors.blue);
    const anchor = oklabFromRgb(...rgb(sunset.colors.blue));
    const hue = (x: readonly number[]) => Math.atan2(x[2], x[1]);
    const untinted = oklabFromRgb(...recolorer(sunset, { tint: 0 })(...blue));
    const tinted = oklabFromRgb(...recolorer(sunset)(...blue));
    expect(Math.abs(hue(untinted) - hue(anchor))).toBeLessThan(0.05);
    expect(Math.abs(hue(tinted) - hue(anchor))).toBeGreaterThan(0.1);
    // Grays keep the full tint either way.
    expect(recolorer(sunset, { tint: 0 })(0.5, 0.5, 0.5)).toEqual(recolorer(sunset)(0.5, 0.5, 0.5));
  });
});

describe("lookup tables", () => {
  it("approximate the exact transform closely", () => {
    const transform = recolorer(sunset);
    const size = 33;
    const lut = buildLut(transform, size);
    const next = random(7);
    const pixels = new Uint8ClampedArray(4 * 4000).map(() => Math.floor(next() * 256));
    const exact = pixels.slice();
    applyTransform(exact, transform);
    applyLut(pixels, lut, size);
    let worst = 0,
      total = 0;
    for (let p = 0; p < pixels.length; p += 4) {
      const x = oklabFromRgb(pixels[p] / 255, pixels[p + 1] / 255, pixels[p + 2] / 255);
      const y = oklabFromRgb(exact[p] / 255, exact[p + 1] / 255, exact[p + 2] / 255);
      const d = Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
      worst = Math.max(worst, d);
      total += d;
      expect(pixels[p + 3]).toBe(exact[p + 3]);
    }
    // ΔE_OK of 0.02 is roughly a just-noticeable difference.
    expect(total / 4000).toBeLessThan(0.006);
    expect(worst).toBeLessThan(0.05);
  });

  it("serialize as .cube files", () => {
    const cube = toCube(buildLut(recolorer({}), 2), 2, 'say "hi"').trim().split("\n");
    expect(cube.slice(0, 2)).toEqual([`TITLE "say 'hi'"`, "LUT_3D_SIZE 2"]);
    expect(cube).toHaveLength(10);
    expect(cube[3]).toBe("1.000000 0.000000 0.000000");
  });
});
