import { describe, expect, it } from "vitest";

import { chroma, hue, parseColor, wcag, type Oklab } from "../src/color.ts";
import { parseClass, resolve } from "../src/engine.ts";
import { createTheme, defaultTheme, type ThemeInput } from "../src/theme.ts";

const THEMES: Record<string, ThemeInput> = {
  base: {},
  paperback: { dark: "#2b2118", light: "#f4ecd8" },
  blueprint: { dark: "#0b1f3a", light: "#cfe3ff" },
};
const BGS = Array.from({ length: 101 }, (_, i) => i / 100);

/** Background and one color for a class list on a page at `bg`. */
function on(bg: number, classes: string, input: ThemeInput = {}, key: "text" | "border" = "text"): [Oklab, Oklab] {
  const r = resolve([`bg-0% ${classes}`], createTheme({ ...input, bg }));
  return [parseColor(r.bg!), parseColor(r[key]!)];
}

const distance = (a: Oklab, b: Oklab) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe("parseClass", () => {
  it("accepts the grammar", () => {
    expect(parseClass("bg-5%")).toEqual({ kind: "color", root: "bg", hue: null, amount: 5 });
    expect(parseClass("text-red-100%")).toEqual({ kind: "color", root: "text", hue: "red", amount: 100 });
    expect(parseClass("hue-blue")).toEqual({ kind: "hue", hue: "blue" });
    expect(parseClass("border-neutral-25%")).toMatchObject({ hue: "neutral" });
  });

  it("rejects everything else", () => {
    for (const c of ["bg-7%", "bg-105%", "bg-red-500", "bg-pink-10%", "hue-pink", "p-4", "border-25%/50"]) {
      expect(parseClass(c)).toBeNull();
    }
  });
});

describe.each(Object.entries(THEMES))("%s theme", (_, input) => {
  it("text always has usable contrast", () => {
    for (const bg of BGS) expect(wcag(...on(bg, "", input))).toBeGreaterThanOrEqual(3);
  });

  it("borders look the same on every background", () => {
    const ratios = BGS.map((bg) => wcag(...on(bg, "border-25%", input, "border")));
    expect(Math.min(...ratios)).toBeGreaterThan(1.6);
    expect(Math.max(...ratios) / Math.min(...ratios)).toBeLessThan(1.5);
  });

  it("hue text stays readable", () => {
    for (const bg of BGS) {
      const neutral = wcag(...on(bg, "", input));
      expect(wcag(...on(bg, "text-red-100%", input))).toBeGreaterThanOrEqual(Math.min(2.8, 0.65 * neutral));
    }
  });

  it("contrast grows with the amount", () => {
    for (const bg of [0, 0.3, 0.49, 0.51, 0.7, 1]) {
      let last = 1;
      for (const amount of [5, 10, 25, 50, 75, 100]) {
        const c = wcag(...on(bg, `text-${amount}%`, input));
        expect(c).toBeGreaterThan(last);
        last = c;
      }
    }
  });
});

describe("the mid-gray bug", () => {
  const classes = ["", "border-25%", "text-red-100%", "text-green-100%", "hue-red bg-10%", "bg-100%", "bg-5%"];

  it("49% and 51% backgrounds look alike", () => {
    for (const c of classes) {
      const a = resolve([`bg-0% ${c}`], createTheme({ bg: 0.49 }));
      const b = resolve([`bg-0% ${c}`], createTheme({ bg: 0.51 }));
      expect(distance(parseColor(a.text), parseColor(b.text))).toBeLessThan(0.05);
      if (a.bg) expect(distance(parseColor(a.bg), parseColor(b.bg!))).toBeLessThan(0.05);
    }
  });

  it("red stays red on every background", () => {
    const key = hue(parseColor(defaultTheme.hues.red));
    for (const bg of BGS) {
      const [, red] = on(bg, "text-red-100%");
      expect(chroma(red)).toBeGreaterThan(0.04);
      expect(Math.abs(hue(red) - key)).toBeLessThan(5);
    }
  });

  it("tints stay tints", () => {
    for (const bg of BGS) {
      const r = resolve(["bg-0%", "hue-red bg-10%"], createTheme({ bg }));
      expect(chroma(parseColor(r.bg!))).toBeLessThan(0.12);
    }
  });
});

describe("resolve", () => {
  it("contrast 0 makes everything the background", () => {
    const r = resolve(["bg-0% border-50% text-red-100%"], createTheme({ bg: 0.3, contrast: 0 }));
    expect(r.text).toBe(r.bg);
    expect(r.border).toBe(r.bg);
  });

  it("nested surfaces move away from their parent", () => {
    const t = createTheme({ bg: 1 });
    const outer = parseColor(resolve(["bg-5%"], t).bg!);
    const inner = parseColor(resolve(["bg-5%", "bg-5%"], t).bg!);
    expect(inner[0]).toBeLessThan(outer[0]);
  });

  it("borders contrast with what's behind the element, not its own background", () => {
    const t = createTheme({ bg: 1 });
    const plain = resolve(["border-25%"], t).border;
    const onButton = resolve(["bg-100% border-25%"], t).border;
    expect(onButton).toBe(plain);
  });
});
