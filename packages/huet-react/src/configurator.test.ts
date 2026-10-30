// @vitest-environment happy-dom
import { compile, optimize } from "@tailwindcss/node";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React, { StrictMode, act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

import inlineCss from "./configurator.css?inline";
import { ThemeConfigurator } from "./index";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const src = dirname(fileURLToPath(import.meta.url));

// The files configurator.css lists with @source
const sources = [
  "ThemeConfigurator.tsx",
  "Themer.tsx",
  "EmbeddedThemeConfigurator.tsx",
  ...readdirSync(join(src, "private"))
    .filter((name) => /\.tsx?$/.test(name) && !name.includes(".test."))
    .map((name) => join("private", name)),
];
const candidates = [
  ...new Set(
    sources.flatMap(
      (file) => readFileSync(join(src, file), "utf8").match(/\bhc:[^\s"'`{}]+/g) ?? [],
    ),
  ),
];

async function build() {
  const compiler = await compile(readFileSync(join(src, "configurator.css"), "utf8"), {
    base: src,
    onDependency: () => {},
  });
  // What ships: nesting lowered, as the Vite plugin does
  return optimize(compiler.build(candidates)).code;
}

type Rule = { selector: string; declarations: string[]; at: string[] };

/** Flattens the compiled CSS into style rules with their enclosing at-rules. */
function styleRules(css: string, at: string[] = []): Rule[] {
  const rules: Rule[] = [];
  let i = 0;
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  while (i < css.length) {
    const open = css.indexOf("{", i);
    const semi = css.indexOf(";", i);
    if (open === -1) break;
    // Statements such as `@layer properties;`
    if (semi !== -1 && semi < open) {
      i = semi + 1;
      continue;
    }
    let depth = 1,
      j = open + 1;
    for (; depth > 0; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
    }
    const prelude = css.slice(i, open).trim();
    const body = css.slice(open + 1, j - 1);
    if (prelude.startsWith("@property")) {
      // Registers a --tw-* property; matches no elements
    } else if (prelude.startsWith("@")) {
      rules.push(...styleRules(body, [...at, prelude]));
    } else {
      const declarations = body
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean);
      rules.push({ selector: prelude, declarations, at });
    }
    i = j;
  }
  return rules;
}

/** Splits a selector list on top-level commas */
function selectors(list: string) {
  const out: string[] = [];
  let depth = 0,
    start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === "(" || list[i] === "[") depth++;
    else if (list[i] === ")" || list[i] === "]") depth--;
    else if (list[i] === "," && depth === 0 && list[i - 1] !== "\\") {
      out.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(list.slice(start).trim());
  return out;
}

const onlyVariables = (rule: Rule, pattern: RegExp) =>
  rule.declarations.every((declaration) => pattern.test(declaration));

describe("configurator.css", () => {
  it("only styles the configurator", async () => {
    const css = await build();
    const rules = styleRules(css);
    expect(rules.length).toBeGreaterThan(candidates.length);
    for (const rule of rules) {
      const list = selectors(rule.selector);
      // Theme variables, all prefixed
      if (list.join(",") === ":root,:host") {
        expect(onlyVariables(rule, /^--(hc|tw)-[\w-]+:/), rule.selector).toBe(true);
        continue;
      }
      // Tailwind's fallback for browsers without @property: initial values
      // for its own --tw-* variables, in `@layer properties`
      if (rule.at[0] === "@layer properties") {
        expect(list.map((x) => x.replace(/^:+/, "::"))).toEqual([
          "*",
          "::before",
          "::after",
          "::backdrop",
        ]);
        expect(onlyVariables(rule, /^--tw-[\w-]+:/)).toBe(true);
        continue;
      }
      expect(rule.at.filter((x) => x.startsWith("@layer")), rule.selector).toEqual([]);
      for (const selector of list)
        expect(selector, rule.selector).toMatch(/^(\[data-huet-configurator\]|\.hc\\:)/);
    }
  });

  it("emits a rule for every hc: class the panel uses", async () => {
    const css = await build();
    const escape = (name: string) => name.replace(/[^\w-]/g, "\\$&");
    const missing = candidates.filter((name) => !css.includes("." + escape(name)));
    expect(candidates.length).toBeGreaterThan(50);
    expect(missing).toEqual([]);
  });

  it("can be imported in tests", () => {
    expect(typeof inlineCss).toBe("string");
  });
});

describe("ThemeConfigurator portal", () => {
  it("renders into one container on body under StrictMode and removes it", async () => {
    localStorage.clear();
    const host = document.createElement("div");
    document.body.append(host);
    const roots = [createRoot(host), createRoot(document.createElement("div"))];
    const app = React.createElement(StrictMode, null, React.createElement(ThemeConfigurator));
    await act(async () => roots[0].render(app));

    const containers = document.querySelectorAll<HTMLElement>("[data-huet-configurator]");
    expect(containers).toHaveLength(1);
    const [container] = containers;
    expect(container.parentElement).toBe(document.body);
    expect(container.hasAttribute("data-huet-root")).toBe(true);
    // Nothing renders in place
    expect(host.childElementCount).toBe(0);
    // Huet classes inside resolve against the container's theme
    const panel = container.querySelector<HTMLElement>(".huet-bg-0")!;
    expect(panel.style.getPropertyValue("--huet-background")).toMatch(/^#/);

    // A second configurator shares the stylesheet
    await act(async () => roots[1].render(app));
    expect(document.querySelectorAll("[data-huet-configurator]")).toHaveLength(2);
    expect(document.querySelectorAll("style[data-huet-configurator-styles]")).toHaveLength(1);

    await act(async () => roots.forEach((root) => root.unmount()));
    expect(document.querySelectorAll("[data-huet-configurator]")).toHaveLength(0);
    expect(container.hasAttribute("data-huet-root")).toBe(false);
    expect(panel.isConnected).toBe(false);
  });
});
