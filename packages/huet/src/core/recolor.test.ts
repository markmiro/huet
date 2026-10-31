import { describe, expect, it } from "vitest";
import { oklabFromRgb, rgb } from "./color";
import {
  applyLut,
  applyTransform,
  buildLut,
  coordinatesOf,
  rampColor,
  recolorer,
  toCube,
} from "./recolor";
import { defaultColors } from "./theme";

const base = { neutral: ["#000000", "#ffffff"] };
const sunset = {
  neutral: ["#242744", "#ffe173"],
  colors: { red: "#f20031", yellow: "#c16000", green: "#008d29", blue: "#12889d", purple: "#b555c8" },
};
/** Evaluate a transform through a 33³ LUT, as the demo renders it. */
function buildLutTransform(transform: ReturnType<typeof recolorer>) {
  const lut = buildLut(transform, 33);
  return (r: number, g: number, b: number) => {
    const pixel = new Uint8ClampedArray([r * 255, g * 255, b * 255, 255]);
    applyLut(pixel, lut, 33);
    return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255] as const;
  };
}
function random(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

describe("theme coordinates", () => {
  it("places grays on the neutral ramp and anchors on their own hue", () => {
    const gray = coordinatesOf(rgb("#777777"));
    expect(gray.weights).toEqual({});
    // #777777 is the classic CIE L* = 50 middle gray.
    expect(gray.t).toBeCloseTo(0.5, 3);
    const blue = coordinatesOf(rgb(defaultColors.blue));
    expect(blue.weights.blue).toBeCloseTo(1, 6);
    expect(Object.keys(blue.weights)).toEqual(["blue"]);
  });

  it("splits in-between hues across neighboring ramps", () => {
    const orange = coordinatesOf(rgb("#e87a2a")).weights;
    expect(Object.keys(orange).sort()).toEqual(["red", "yellow"]);
  });

  it("is the identity when the target is the source", () => {
    const same = recolorer(base);
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
    expect(hex(toSunset(0, 0, 0))).toBe(sunset.neutral[0]);
    expect(hex(toSunset(1, 1, 1))).toBe(sunset.neutral[1]);
    const [, a, b] = oklabFromRgb(...toSunset(...rgb(defaultColors.red)));
    const target = oklabFromRgb(...rgb(sunset.colors.red));
    const neutral = oklabFromRgb(...rgb(sunset.neutral[0]));
    // Hue of the added chroma matches the target's red anchor.
    expect(Math.atan2(b - neutral[2], a - neutral[1])).toBeCloseTo(
      Math.atan2(target[2], target[1]),
      0,
    );
  });

  it("keeps lightness direction unless asked to invert, and blends partially", () => {
    expect(recolorer(base)(1, 1, 1)[0]).toBeCloseTo(1, 5);
    expect(recolorer(base, { invert: true })(1, 1, 1)[0]).toBeCloseTo(0, 5);
    const half = recolorer({ neutral: ["#ff0000", "#ff0000"], images: { strength: 0 } });
    half(0.2, 0.4, 0.6).forEach((v, i) => expect(v).toBeCloseTo([0.2, 0.4, 0.6][i], 5));
    // Image settings are part of the theme, checked with it
    expect(() => recolorer({ ...base, images: { strength: 2 } })).toThrow(/images must be/);
    expect(() => recolorer({ ...base, images: { tint: -1 } })).toThrow(/images must be/);
  });

  it("can keep the neutral tint off saturated colors", () => {
    const blue = rgb(defaultColors.blue);
    const anchor = oklabFromRgb(...rgb(sunset.colors.blue));
    const hue = (x: readonly number[]) => Math.atan2(x[2], x[1]);
    const untinted = oklabFromRgb(...recolorer({ ...sunset, images: { tint: 0 } })(...blue));
    const tinted = oklabFromRgb(...recolorer(sunset)(...blue));
    expect(Math.abs(hue(untinted) - hue(anchor))).toBeLessThan(0.05);
    expect(Math.abs(hue(tinted) - hue(anchor))).toBeGreaterThan(0.1);
    // Grays keep the full tint either way.
    expect(recolorer({ ...sunset, images: { tint: 0 } })(0.5, 0.5, 0.5)).toEqual(recolorer(sunset)(0.5, 0.5, 0.5));
  });
});

describe("multi-hue neutral ramps", () => {
  const astro = { neutral: ["#040816", "#ffb980", "#ffffff"], colorModel: "hcl" as const };
  const chroma = (x: readonly number[]) => {
    const [, a, b] = oklabFromRgb(x[0], x[1], x[2]);
    return Math.hypot(a, b);
  };

  it("passes grays through a middle stop at that stop's lightness", () => {
    const peach = rgb("#ffb980");
    // The default gray with the same relative lightness as the peach stop.
    const { t } = coordinatesOf(peach, astro);
    const gray = rampColor(base, t);
    const mapped = recolorer(astro)(...gray);
    mapped.forEach((v, i) => expect(Math.abs(v - peach[i]) * 255).toBeLessThan(2));
    // Ramp endpoints still map to the ramp's endpoints.
    expect(recolorer(astro)(0, 0, 0).map((v) => Math.round(v * 255))).toEqual([4, 8, 22]);
    expect(recolorer(astro)(1, 1, 1).map((v) => Math.round(v * 255))).toEqual([255, 255, 255]);
  });

  it("keeps HCL midtones saturated where OKLab passes through gray", () => {
    const hcl = { neutral: sunset.neutral, colorModel: "hcl" as const };
    const oklab = { neutral: sunset.neutral };
    expect(chroma(recolorer(hcl)(0.5, 0.5, 0.5))).toBeGreaterThan(
      chroma(recolorer(oklab)(0.5, 0.5, 0.5)) + 0.03,
    );
  });

  it("round-trips images in a multi-hue source theme and rejects ambiguous ramps", () => {
    const same = recolorer(astro, { source: astro });
    const next = random(3);
    for (let i = 0; i < 200; i++) {
      const c = [next(), next(), next()] as const;
      same(...c).forEach((v, k) => expect(v).toBeCloseTo(c[k], 4));
    }
    expect(() => recolorer({ neutral: ["#000000"] })).toThrow(TypeError);
  });
});

describe("near black", () => {
  it("does not amplify 1/255 steps into bands when the dark end is lifted", () => {
    // Regression: a black background dithered with (1,1,1) rows turned into
    // stripes 6 levels apart, because OKLab lightness is steepest at black.
    for (const transform of [recolorer(sunset), buildLutTransform(recolorer(sunset))]) {
      const a = transform(0, 0, 0).map((v) => v * 255);
      const b = transform(1 / 255, 1 / 255, 1 / 255).map((v) => v * 255);
      for (let i = 0; i < 3; i++) expect(Math.abs(a[i] - b[i])).toBeLessThanOrEqual(1);
    }
  });

  it("keeps LUT cells near black smooth for every neutral step", () => {
    const deepDive = {
      neutral: ["#001b4f", "#b6e8e8"],
      colors: { red: "#ff6669", yellow: "#a09c5c", green: "#319647", blue: "#496eff", purple: "#af5bff" },
    };
    const deltaE = (x: readonly number[], y: readonly number[]) => {
      const [a, b] = [oklabFromRgb(x[0], x[1], x[2]), oklabFromRgb(y[0], y[1], y[2])];
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    };
    for (const target of [sunset, deepDive]) {
      const exact = recolorer(target),
        lut = buildLutTransform(exact);
      for (let v = 0; v <= 24; v++) {
        const [x, y] = [v / 255, (v + 1) / 255];
        // ΔE_OK ≈ 0.02 is just noticeable; the original bands were 0.020 apart.
        expect(deltaE(lut(x, x, x), lut(y, y, y))).toBeLessThan(0.01);
        expect(deltaE(exact(x, x, x), lut(x, x, x))).toBeLessThan(0.01);
      }
    }
  });

  it("round-trips exactly through the identity LUT", () => {
    const pixels = Uint8ClampedArray.from({ length: 256 * 4 }, (_, i) => (i % 4 === 3 ? 255 : i >> 2));
    const copy = pixels.slice();
    applyLut(copy, buildLut(recolorer(base), 33), 33);
    expect([...copy]).toEqual([...pixels]);
  });

  it("keeps lightness affine in OKLab above the toe", () => {
    // Above sRGB ≈ 25, ramp positions are linear in OKLab lightness.
    const L = (v: number) => oklabFromRgb(v, v, v)[0];
    const [x, y, z] = [0.2, 0.5, 0.9].map((v) => coordinatesOf([v, v, v]).t);
    expect((y - x) / (z - x)).toBeCloseTo((L(0.5) - L(0.2)) / (L(0.9) - L(0.2)), 6);
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
    const cube = toCube(buildLut(recolorer(base), 2), 2, 'say "hi"').trim().split("\n");
    expect(cube.slice(0, 2)).toEqual([`TITLE "say 'hi'"`, "LUT_3D_SIZE 2"]);
    expect(cube).toHaveLength(10);
    expect(cube[3]).toBe("1.000000 0.000000 0.000000");
  });
});
