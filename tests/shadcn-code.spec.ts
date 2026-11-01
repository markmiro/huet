import { test, expect, type Page } from "@playwright/test";
import { contrast, toLch } from "../packages/huet/src/core/color";
import { themes } from "../packages/huet/src/core/themes";

/*
  The shadcn demo (scripts/shadcn-huet) runs as its own Next app:
  `pnpm shadcn:setup && pnpm shadcn:dev`, then
  `SHADCN_URL=http://localhost:4000 pnpm test:browser tests/shadcn-code.spec.ts`.
*/
const shadcn = process.env.SHADCN_URL;
test.skip(!shadcn, "Set SHADCN_URL to a running shadcn demo (scripts/shadcn-huet)");
// Pages compile on first visit in `next dev`.
test.setTimeout(300_000);

// Docs MDX with a title and a highlighted line; component source under a
// preview plus install commands; the registry's CodeBlock, including ANSI output.
const pages = ["/docs/javascript", "/docs/components/radix/button", "/docs/components/radix/code-block"];
const blocks = '[data-rehype-pretty-code-figure], [data-slot="code-block"]';

async function open(page: Page, path: string, theme: keyof typeof themes, background: number) {
  await page.addInitScript(
    (saved) => localStorage.setItem("huet-shadcn", saved),
    JSON.stringify({ theme: themes[theme], background }),
  );
  await page.goto(shadcn + path, { waitUntil: "domcontentloaded", timeout: 240_000 });
  await page.waitForSelector("#huet-code", { state: "attached", timeout: 120_000 });
  await page.locator(blocks).first().waitFor();
}

/** Each visible block's token colors and background, as hex. */
const tokens = (page: Page) =>
  page.evaluate((selector) => {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const hex = (css: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      // Translucent fills (dark:bg-input/30) barely tint what's under them.
      return a === 255 ? "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("") : null;
    };
    /** The nearest opaque background: the block's own, or what it sits on. */
    const backdrop = (el: Element | null): string => {
      for (; el; el = el.parentElement) {
        const bg = hex(getComputedStyle(el).backgroundColor);
        if (bg) return bg;
      }
      return "#ffffff";
    };
    return [...document.querySelectorAll(selector)]
      .filter((block) => block.getClientRects().length && block.querySelector("span[style]"))
      .map((block) => {
        const spans = [...block.querySelectorAll<HTMLElement>("span[style]")].filter(
          (s) => s.textContent!.trim() && !s.querySelector("span[style]"),
        );
        return {
          text: block.textContent!.trim().slice(0, 40),
          styles: spans.map((s) => s.getAttribute("style")!),
          colors: [...new Set(spans.map((s) => hex(getComputedStyle(s).color)))].filter((c): c is string => c !== null),
          // Hue-kept tokens compute to lch(L C H).
          lch: spans.flatMap((s) => {
            const match = /^lch\(([\d.]+) ([\d.]+) ([\d.]+)/.exec(getComputedStyle(s).color);
            return match ? [match.slice(1).map(Number)] : [];
          }),
          muted: getComputedStyle(spans[0] ?? block).getPropertyValue("--huet-muted").trim(),
          background: backdrop(block.querySelector("pre") ?? block),
        };
      });
  }, blocks);

for (const path of pages) {
  test(`every code block on ${path} follows the Huet theme, in both modes`, async ({ browser }) => {
    for (const background of [1, 0]) {
      const hues: Record<string, number[]> = {};
      for (const theme of ["Terminal", "Paperback"] as const) {
        const context = await browser.newContext();
        const page = await context.newPage();
        const errors: string[] = [];
        page.on("console", (m) => m.type() === "error" && m.text().startsWith("Huet:") && errors.push(m.text()));
        await open(page, path, theme, background);
        const found = await tokens(page);
        expect(found.length, "code blocks on the page").toBeGreaterThan(0);
        for (const block of found) {
          // Highlighted through huetShikiTheme(): Huet variables, no fixed Shiki colors.
          for (const style of block.styles) expect(style).not.toMatch(/#[\da-f]{3,8}\b|rgba?\(/i);
          // Solved for the block's own background, so every token stays readable.
          // Paperback's ramp is narrow, so its targets scale down with it.
          const lowest = Math.min(...block.colors.map((c) => contrast(block.background, c)));
          expect(lowest, `${theme} tokens on ${block.background} in "${block.text}": ${block.colors}`).toBeGreaterThanOrEqual(35);
          // Their lightness is Huet's: the CIE lightness of muted text on this block.
          for (const [L] of block.lch) expect(L, block.text).toBeCloseTo(toLch(block.muted)[0], 0);
        }
        hues[theme] = [...new Set(found.flatMap((b) => b.lch.filter(([, C]) => C > 0).map(([, , H]) => Math.round(H))))].sort((a, b) => a - b);
        expect(errors).toEqual([]);
        await context.close();
      }
      // Tokens keep shadcn's hues in any theme.
      expect(hues.Terminal.length, "hue-kept tokens").toBeGreaterThan(1);
      expect(hues.Paperback).toEqual(hues.Terminal);
    }
  });
}

test("a code block highlighted with a fixed Shiki theme is reported", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await open(page, "/docs/javascript", "Base", 1);
  await page.locator("[data-rehype-pretty-code-figure] code").first().evaluate((code) => {
    code.insertAdjacentHTML("beforeend", '<span data-line=""><span style="color:#D73A49;--shiki-dark:#F97583">const</span></span>');
  });
  await expect.poll(() => errors.find((e) => e.includes("fixed Shiki theme"))).toBeTruthy();
});
