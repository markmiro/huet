import { describe, it, expect } from "vitest";
import { contrast, lightness, luminance, textEnd, toOklab } from "./color";
import { resolveTheme, type ResolvedTheme, type Theme } from "./theme";
import { themes } from "./themes";
import type { StepRamp, Surface } from "./steps";

const hues = ["red", "yellow", "green", "blue", "purple"] as const;
const distance = (a: string, b: string) => Math.abs(lightness(a) - lightness(b));
const at = (theme: Theme, background: number) => resolveTheme(theme, { background });

describe("explicit steps", () => {
  it("keep each preset's colors", () => {
    // Every class amount on a few backgrounds and parents, for every preset.
    // These matched the original Color engine before it was removed, apart from
    // later changes: gray steps on colored parents keep their tint, and each
    // preset's own signal lightness.
    const rows = Object.entries(themes).flatMap(([name, theme]) =>
      [0, 0.5, 1].flatMap((background) =>
        [1, 0.5, 2].map((contrast) => {
          const t = at({ ...theme, contrast }, background);
          const ramps: StepRamp[] = ["gray", ...hues, "white"];
          const parents = [t.root, t.step(t.root, 25, "blue"), t.surfaceOf(t.surface(t.root.hex, 25))];
          const colors = parents.flatMap((parent) =>
            ramps.flatMap((ramp) => [10, 25, 60, 100].map((amount) => t.step(parent, amount, ramp).hex.slice(1))),
          );
          return `${name} ${background} ${contrast}: ${colors.join(" ")}`;
        }),
      ),
    );
    expect(rows).toMatchSnapshot();
  });

  it("reach each hue's anchor at full strength on black and white", () => {
    const base = at(themes.Base, 1);
    expect([base.root.hex, base.step(base.root, 100).hex, base.step(base.root, 100, "red").hex]).toEqual([
      "#ffffff",
      "#000000",
      "#cd4355",
    ]);
    // Steps are values, so asking twice gives the same color
    expect(base.step(base.root, 100)).toEqual(base.step(base.root, 100));
  });

  it("keep full-strength text readable on both sides of the middle", () => {
    for (const background of [0.49, 0.5, 0.51]) {
      const t = at(themes.Base, background);
      const bg = t.root.hex;
      expect(t.step(t.root, 100).hex).toBe(textEnd(bg, "#000000", "#ffffff"));
      expect(contrast(bg, t.step(t.root, 100).hex)).toBeGreaterThanOrEqual(60);
      expect(distance(bg, t.step(t.root, 25).hex)).toBeLessThan(distance(bg, t.step(t.root, 50).hex));
      expect(distance(bg, t.step(t.root, 50).hex)).toBeLessThan(distance(bg, t.step(t.root, 100).hex));
      expect(t.step(t.root, 0).hex).toBe(bg);
    }
  });

  it("move every hue and the neutral ramp the same way, monotonically, across the ramp", () => {
    for (let position = 0; position <= 100; position += 4) {
      const t = at(themes.Base, position / 100);
      const lighter = textEnd(t.root.hex, "#000000", "#ffffff") === "#ffffff";
      for (const ramp of ["gray", ...hues] as const) {
        let previous = luminance(t.root.hex);
        for (let amount = 0; amount <= 100; amount++) {
          const value = luminance(t.step(t.root, amount, ramp).hex);
          expect(lighter ? value >= previous : value <= previous, `${position} ${ramp} ${amount}`).toBe(true);
          previous = value;
        }
      }
    }
  });

  it("keep low hue strengths visible on black and comparable to white", () => {
    const [black, white] = [at(themes.Base, 0), at(themes.Base, 1)];
    for (const hue of hues)
      for (const amount of [6.25, 12.5, 25]) {
        const onBlack = lightness(black.step(black.root, amount, hue).hex) * 100;
        const onWhite = 100 - lightness(white.step(white.root, amount, hue).hex) * 100;
        expect(onBlack).toBeGreaterThan(2);
        expect(onBlack / onWhite).toBeGreaterThan(0.65);
        expect(onBlack / onWhite).toBeLessThan(1.5);
      }
  });

  it("keep a colored surface's tint on its gray steps, fading it out by the end", () => {
    const chroma = (hex: string) => Math.hypot(...toOklab(hex).slice(1));
    const angle = (hex: string) => Math.atan2(toOklab(hex)[2], toOklab(hex)[1]);
    for (const theme of [themes.Base, themes.Sunset, themes.Paperback])
      for (const background of [0, 1])
        for (const hue of hues) {
          const t = at(theme, background);
          const card = t.step(t.root, 30, hue);
          const steps = Array.from({ length: 21 }, (_, i) => t.step(card, i * 5).hex);
          const label = `${background} ${hue}`;
          // Gray just off the card keeps the card's hue
          const turn = Math.abs(angle(steps[2]) - angle(card.hex));
          expect(Math.min(turn, 2 * Math.PI - turn), label).toBeLessThan(0.5);
          expect(chroma(steps[2]), label).toBeGreaterThan(0.6 * chroma(card.hex));
          // Still evenly spaced in L*, toward the same end as on a neutral card
          for (let i = 1; i < steps.length; i++)
            expect(distance(card.hex, steps[i]), `${label} ${i * 5}`).toBeGreaterThanOrEqual(distance(card.hex, steps[i - 1]) - 0.002);
          // and the end of the ramp at 100
          expect([t.dark, t.light], label).toContain(steps[20]);
        }
  });

  it("space neutral steps evenly in L* over the whole available range", () => {
    for (const background of [0, 1]) {
      const t = at(themes.Base, background);
      for (const row of [20, 40, 60, 80]) {
        const bg = t.step(t.root, row);
        const full = distance(bg.hex, t.step(bg, 100).hex);
        const colors = [0, 20, 40, 60, 80, 100].map((amount) => t.step(bg, amount).hex);
        expect(new Set(colors).size).toBe(6);
        colors.forEach((color, i) => expect(Math.abs(distance(bg.hex, color) / full - i / 5)).toBeLessThan(0.025));
      }
    }
  });
});

describe("contrast below 1", () => {
  const tree = (t: ResolvedTheme): Surface[] => {
    const dark = t.step(t.root, 100);
    const middle = t.step(t.root, 60);
    const colored = t.step(middle, 25, "blue");
    return [
      t.root, dark, t.step(dark, 100), t.step(dark, 100, "red"),
      middle, t.step(middle, 100), colored, t.step(colored, 100),
      t.step(colored, 100, "red"), t.step(colored, 0, "white"),
      t.step(t.step(colored, 0), 100, "green"),
    ];
  };

  it("fades every color toward the page together, keeping light/dark sides", () => {
    for (const background of [0, 0.5, 1]) {
      const full = tree(at(themes.Base, background));
      const origin = luminance(full[0].hex);
      for (let step = 0; step <= 100; step++) {
        const amount = step / 100;
        const current = tree(at({ ...themes.Base, contrast: amount }, background));
        current.forEach((node, i) => {
          const expected = origin + (luminance(full[i].hex) - origin) * amount;
          expect(Math.abs(luminance(node.hex) - expected), `${background} ${step} node ${i}`).toBeLessThan(0.005);
          if (step === 0) expect(node.hex).toBe(full[0].hex);
          if (step === 100) expect(node.hex).toBe(full[i].hex);
        });
        // A child lighter than its parent at full contrast never becomes darker
        for (const [parent, child] of [[1, 2], [1, 3], [4, 5], [6, 7]]) {
          const sign = Math.sign(luminance(full[child].hex) - luminance(full[parent].hex));
          const delta = luminance(current[child].hex) - luminance(current[parent].hex);
          expect(delta * sign).toBeGreaterThanOrEqual(-0.005);
        }
      }
    }
  });

  it("fades role colors with everything else", () => {
    const full = at(themes.Base, 1);
    const roles = Object.keys(full.tokensOn(full.root)).filter((key) => key !== "background");
    for (const contrast of [0, 0.5, 1]) {
      const t = at({ ...themes.Base, contrast }, 1);
      const pairs = [
        [t.root, full.root],
        [t.step(t.root, 25, "blue"), full.step(full.root, 25, "blue")],
      ] as const;
      for (const [bg, fullBg] of pairs) {
        const tokens = t.tokensOn(bg, t.root) as unknown as Record<string, string>;
        const fullTokens = full.tokensOn(fullBg, full.root) as unknown as Record<string, string>;
        expect(tokens.background).toBe(bg.hex);
        for (const role of roles) {
          const expected = luminance(t.root.hex) + (luminance(fullTokens[role]) - luminance(t.root.hex)) * contrast;
          expect(Math.abs(luminance(tokens[role]) - expected), `${contrast} ${role}`).toBeLessThan(0.005);
        }
      }
    }
    // At 0, the whole page is its background
    const flat = at({ ...themes.Base, contrast: 0 }, 1);
    expect(new Set(Object.values(flat.tokensOn(flat.root)))).toEqual(new Set([flat.root.hex]));
  });

  it("keeps surfaces apart when their faded colors coincide", () => {
    const t = at({ ...themes.Base, contrast: 0.00001 }, 1);
    const [a, b] = [t.step(t.root, 25), t.step(t.root, 100)];
    expect(a.hex).toBe(b.hex);
    expect(t.step(a, 100).full.hex).not.toBe(t.step(b, 100).full.hex);
  });
});
