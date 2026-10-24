/*
  Renders every test stack in a real browser and compares the computed colors with the
  JavaScript reference engine (`resolve`). Run with `npm run test:browser`.

  Two stylesheets are checked: the standalone `buildCss()` output, and CSS compiled by
  Tailwind v4 with the plugin. They're independent code paths over the same expressions.
*/
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { chromium, type Page } from "playwright";
import { compile } from "tailwindcss";

import { resolve, ROOTS } from "../src/engine.ts";
import { buildCss } from "../src/static.ts";
import huet from "../src/tailwind.ts";
import { themeVars, type Theme } from "../src/theme.ts";
import { stacks, themes } from "./cases.ts";

const TOLERANCE = 3; // max per-channel difference out of 255

const PROPERTY: Record<string, string> = {
  bg: "background-color",
  text: "color",
  border: "border-top-color",
  outline: "outline-color",
  fill: "fill",
  stroke: "stroke",
  accent: "accent-color",
  caret: "caret-color",
  decoration: "text-decoration-color",
};

async function tailwindCss(): Promise<string> {
  const require = createRequire(import.meta.url);
  const twDir = path.dirname(require.resolve("tailwindcss/package.json"));
  const candidates = new Set<string>();
  for (const stack of stacks) for (const list of stack) for (const c of list.split(/\s+/)) if (c) candidates.add(c);
  const compiler = await compile(`@import "tailwindcss/theme.css"; @import "tailwindcss/utilities.css"; @plugin "huet";`, {
    base: process.cwd(),
    loadStylesheet: async (id) => {
      const file = path.join(twDir, id.replace("tailwindcss/", ""));
      return { path: file, base: path.dirname(file), content: fs.readFileSync(file, "utf8") };
    },
    loadModule: async () => ({ path: "", base: "", module: huet }),
  });
  return compiler.build([...candidates]);
}

function page(css: string, theme: Theme): string {
  const vars = Object.entries(themeVars(theme)).map(([k, v]) => `${k}: ${v};`).join(" ");
  const cases = stacks
    .map((stack, i) => {
      let html = `<span data-case="${i}" style="border-style: solid; border-width: 1px; outline-style: solid; outline-width: 1px">x</span>`;
      for (let j = stack.length - 1; j >= 0; j--) {
        html = j === stack.length - 1
          ? `<div data-case="${i}" class="${stack[j]}" style="border-style: solid; border-width: 1px; outline-style: solid; outline-width: 1px">x</div>`
          : `<div class="${stack[j]}">${html}</div>`;
      }
      return html;
    })
    .join("\n");
  return `<!doctype html><html style="${vars}"><head><style>${css}</style></head><body>${cases}</body></html>`;
}

async function measure(p: Page): Promise<Record<string, string>[]> {
  return p.evaluate((props: Record<string, string>) => {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const toHex = (css: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
    };
    return [...document.querySelectorAll<HTMLElement>("div[data-case]")].map((el) => {
      const style = getComputedStyle(el);
      return Object.fromEntries(Object.entries(props).map(([k, prop]) => [k, toHex(style.getPropertyValue(prop))]));
    });
  }, PROPERTY);
}

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const diff = (a: string, b: string) => Math.max(...channels(a).map((c, i) => Math.abs(c - channels(b)[i])));

async function main() {
  const browser = await chromium.launch();
  const p = await browser.newPage();
  const sheets = { static: buildCss(), tailwind: await tailwindCss() };
  let failures = 0;
  let checks = 0;

  for (const [sheetName, css] of Object.entries(sheets)) {
    for (const [themeName, theme] of Object.entries(themes)) {
      await p.setContent(page(css, theme));
      const measured = await measure(p);
      stacks.forEach((stack, i) => {
        const expected = resolve(stack, theme);
        const last = stack[stack.length - 1];
        const roots = new Set(["text", ...last.split(/\s+/).map((c) => c.split("-")[0])]);
        for (const root of roots) {
          if (!(root in PROPERTY) || !(ROOTS as readonly string[]).includes(root)) continue;
          const want = expected[root as keyof typeof expected];
          if (!want) continue;
          checks++;
          const got = measured[i][root];
          if (diff(want, got) > TOLERANCE) {
            failures++;
            console.log(`✗ [${sheetName}/${themeName}] ${JSON.stringify(stack)} ${root}: expected ${want}, got ${got}`);
          }
        }
      });
    }
  }
  await browser.close();
  console.log(`${checks - failures}/${checks} computed colors match the reference engine`);
  if (failures) process.exit(1);
}

await main();
