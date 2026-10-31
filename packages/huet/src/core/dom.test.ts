// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { createTheme } from "./theme";
import { mountTheme } from "./dom";
import { stateKey } from "./classes";
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const background = (el: HTMLElement) =>
  el.style.getPropertyValue("--huet-background");
describe("framework-independent surfaces", () => {
  it("inherits through wrappers, updates without replacing nodes, and cleans up", async () => {
    const root = document.createElement("div");
    document.body.append(root);
    root.innerHTML =
      '<section class="huet-surface-25"><div><input class="huet-surface-10 huet-border" value="kept"></div></section>';
    const panel = root.querySelector("section")!,
      input = root.querySelector("input")!;
    const theme = createTheme();
    const mount = mountTheme(root, theme);
    expect(background(panel)).toBe(theme.surface(theme.background, 25));
    expect(background(input)).toBe(theme.surface(background(panel), 10));
    input.value = "unsaved edit";
    input.focus();
    const dark = createTheme({ background: 0 });
    mount.update(dark);
    expect(background(panel)).toBe(dark.surface(dark.background, 25));
    expect(input.value).toBe("unsaved edit");
    expect(document.activeElement).toBe(input);
    const extra = document.createElement("article");
    extra.className = "huet-surface-50";
    panel.append(extra);
    await tick();
    expect(background(extra)).toBe(dark.surface(background(panel), 50));
    panel.className = "huet-surface-75";
    await tick();
    expect(background(extra)).toBe(dark.surface(background(panel), 50));
    root.append(extra);
    await tick();
    expect(background(extra)).toBe(dark.surface(dark.background, 50));
    extra.className = "";
    await tick();
    expect(background(extra)).toBe("");
    mount.destroy();
    expect(background(root)).toBe("");
    expect(background(input)).toBe("");
    expect(root.hasAttribute("data-huet-root")).toBe(false);
    expect(() => mount.update(theme)).toThrow();
    root.remove();
  });
  it("rejects invalid variants at mount and leaves no changes", () => {
    const root = document.createElement("div");
    root.innerHTML = '<p class="huet-bg-10"></p><p class="hover:huet-surface-25"></p>';
    expect(() => mountTheme(root, createTheme())).toThrow('Tailwind variants work on huet-bg-AMOUNT classes, not huet-surface-*: hover:huet-surface-25. Use an amount, e.g. "hover:huet-bg-20".');
    expect(background(root.querySelector("p")!)).toBe("");
    expect(root.hasAttribute("data-huet-root")).toBe(false);
    expect(root.hasAttribute("data-huet-error")).toBe(false);
  });
  it("checks every class before writing, and records errors on the root", () => {
    const root = document.createElement("div");
    root.innerHTML = '<p class="huet-bg-10"></p><p class="huet-bg-10"></p>';
    const [first, second] = root.querySelectorAll("p");
    const mount = mountTheme(root, createTheme());
    const light = background(first);
    const rootBackground = background(root);
    first.className = "huet-bg-50";
    second.className = "huet-bg-10 huet-bg-20/50";
    // The bad class comes after valid changes, which must not be written either.
    expect(() => mount.update(createTheme({ background: 0 }))).toThrow("huet-bg-20/50");
    expect(background(root)).toBe(rootBackground);
    expect(background(first)).toBe(light);
    expect(background(second)).toBe(light);
    expect(root.getAttribute("data-huet-error")).toContain("opacity modifiers");
    second.className = "huet-bg-10 hover:huet-bg-20";
    const dark = createTheme({ background: 0 });
    mount.update(dark);
    expect(background(first)).toBe(dark.relative.contrast(50).hex);
    expect(root.hasAttribute("data-huet-error")).toBe(false);
    first.className = "[&>p]:huet-bg-60";
    expect(() => mount.update(dark)).toThrow("Background variants must style the element with the class");
    mount.destroy();
    expect(root.hasAttribute("data-huet-error")).toBe(false);
  });
  it("restores pre-existing values and rejects overlapping roots", () => {
    const root = document.createElement("div");
    const child = document.createElement("div");
    root.append(child);
    root.style.setProperty("--huet-background", "pink", "important");
    const mount = mountTheme(root, createTheme());
    expect(() => mountTheme(root, createTheme())).toThrow();
    expect(() => mountTheme(child, createTheme())).toThrow();
    mount.destroy();
    expect(background(root)).toBe("pink");
    expect(root.style.getPropertyPriority("--huet-background")).toBe(
      "important",
    );
    mountTheme(root, createTheme()).destroy();
  });
  it("adopts SSR tokens, supports a root surface, and transfers ownership between roots", async () => {
    const a = document.createElement("div"),
      b = document.createElement("div");
    document.body.append(a, b);
    a.setAttribute("data-huet-root", "ssr");
    a.className = "huet-surface-25";
    const item = document.createElement("div");
    item.className = "huet-surface-10";
    a.append(item);
    const light = createTheme(),
      dark = createTheme({ background: 0 });
    const mountB = mountTheme(b, dark),
      mountA = mountTheme(a, light);
    expect(background(a)).toBe(light.surface(light.background, 25));
    b.append(item);
    await tick();
    expect(background(item)).toBe(dark.surface(dark.background, 10));
    mountA.destroy();
    expect(background(item)).toBe(dark.surface(dark.background, 10));
    expect(a.getAttribute("data-huet-root")).toBe("ssr");
    mountB.destroy();
    expect(background(item)).toBe("");
    a.remove();
    b.remove();
  });
});

describe("explicit contrast classes", () => {
  it("matches original calculations, including parent versus own-background references", () => {
    const root = document.createElement("div");
    root.innerHTML = `<section class="huet-bg-gray-40"><div>
      <button class="huet-bg-blue-20 huet-text-100 huet-border-red-60">Save</button>
      <input class="huet-bg-10 huet-bg/text-80 huet-bg/border-red-60 huet-outline-blue-30">
      <article class="huet-bg-purple-40"></article>
    </div></section>`;
    const theme = createTheme();
    const mount = mountTheme(root, theme);
    const parent = theme.relative.contrast(40, theme.relative.theme.ramps.gray);
    const button = root.querySelector("button")!;
    const input = root.querySelector("input")!;
    const buttonBg = parent.contrast(20, parent.theme.ramps.blue);
    const inputBg = parent.contrast(10);
    expect(background(button)).toBe(buttonBg.hex);
    expect(button.style.getPropertyValue("--huet-foreground")).toBe(buttonBg.contrast(100).hex);
    expect(button.style.getPropertyValue("--huet-relative-text")).toBe(parent.contrast(100).hex);
    expect(button.style.getPropertyValue("--huet-relative-border")).toBe(parent.contrast(60, parent.theme.ramps.red).hex);
    expect(input.style.getPropertyValue("--huet-relative-text")).toBe(inputBg.contrast(80).hex);
    expect(input.style.getPropertyValue("--huet-relative-border")).toBe(inputBg.contrast(60, parent.theme.ramps.red).hex);
    expect(input.style.getPropertyValue("--huet-relative-outline")).toBe(parent.contrast(30, parent.theme.ramps.blue).hex);
    expect(background(root.querySelector("article")!)).toBe(parent.contrast(40, parent.theme.ramps.purple).hex);
    mount.destroy();
  });
  it("updates classes, reparenting, global contrast and cleanup without replacing nodes", async () => {
    const root = document.createElement("div");
    root.innerHTML = '<section class="huet-bg-60"><input class="huet-bg-blue-20 huet-bg/text-100"></section>';
    const theme = createTheme();
    const input = root.querySelector("input")!;
    input.style.setProperty("--huet-relative-text", "pink");
    const mount = mountTheme(root, theme);
    input.value = "unsaved";
    const faded = createTheme({ contrast: .3 });
    mount.update(faded);
    const bg = faded.relative.contrast(60).contrast(20, faded.relative.theme.ramps.blue);
    expect(background(input)).toBe(bg.hex);
    expect(input.style.getPropertyValue("--huet-relative-text")).toBe(bg.contrast(100).hex);
    root.append(input);
    await tick();
    expect(background(input)).toBe(faded.relative.contrast(20, faded.relative.theme.ramps.blue).hex);
    input.className = "huet-text-red-70";
    await tick();
    expect(background(input)).toBe("");
    expect(input.style.getPropertyValue("--huet-relative-text")).toBe(faded.relative.contrast(70, faded.relative.theme.ramps.red).hex);
    input.className = "";
    await tick();
    expect(input.style.getPropertyValue("--huet-relative-text")).toBe("pink");
    expect(input.value).toBe("unsaved");
    mount.destroy();
  });
  it("gives colored surfaces tinted muted and border tokens", () => {
    const root = document.createElement("div");
    root.innerHTML = '<fieldset class="huet-bg-blue-25"></fieldset>';
    const theme = createTheme();
    const mount = mountTheme(root, theme);
    const fieldset = root.querySelector("fieldset")!;
    const token = (name: string) => fieldset.style.getPropertyValue(`--huet-${name}`);
    expect(token("muted")).toBe(theme.tokens(background(fieldset), theme.background).muted);
    // Not neutral gray: red, green and blue channels differ.
    for (const name of ["muted", "border"]) expect(new Set(token(name).match(/[\da-f]{2}/g)).size, name).toBe(3);
    mount.destroy();
  });
  it("colors SVG elements", () => {
    const root = document.createElement("div");
    root.innerHTML = '<svg><rect class="huet-text-red-100" fill="currentColor"></rect></svg>';
    document.body.append(root);
    const theme = createTheme();
    const mount = mountTheme(root, theme);
    const rect = root.querySelector("rect")!;
    expect(rect.style.getPropertyValue("--huet-relative-text")).toBe(
      theme.relative.contrast(100, theme.relative.theme.ramps.red).hex,
    );
    mount.destroy();
    root.remove();
  });
});

/**
 * Evaluates mountTheme's inline CSS the way a browser would. `states` gives the
 * --huet-state that the active background utility sets on an element; elements
 * with data-huet-state that aren't listed are at rest.
 */
function computed(el: HTMLElement, name: string, states: Map<Element, number>): string {
  let owner: HTMLElement | null = el;
  while (owner && !owner.style.getPropertyValue(name)) owner = owner.parentElement;
  if (!owner) throw new Error(`${name} is not set on or above ${el.outerHTML}`);
  // var() resolves on the element that declares the property, then the result inherits.
  const state = states.get(owner) ?? (owner.hasAttribute("data-huet-state") ? -1 : NaN);
  const css = owner.style.getPropertyValue(name).replace(/var\((--[\w-]+)\)/g, (_, x: string) =>
    x === "--huet-state" ? String(state) : computed(owner.parentElement!, x, states));
  if (/^#[\da-f]{6}$/.test(css)) return css;
  const js = css.replaceAll("color-mix(in srgb, ", "mix(").replaceAll(" max(0%", ", max(0%")
    .replaceAll("max(", "Math.max(").replaceAll("%", "").replace(/#[\da-f]{6}/g, (x) => `"${x}"`);
  const mix = (a: string, weight: number, b: string) => {
    if (weight !== 0 && weight !== 100) throw new Error(`Partial mix in ${css}`);
    return weight ? a : b;
  };
  return new Function("mix", `return ${js}`)(mix);
}
describe("Tailwind variants", () => {
  it("computes every color for every combination of nested background states", () => {
    const root = document.createElement("div");
    root.innerHTML = `<section class="huet-bg-10 hover:huet-bg-20 focus-within:huet-bg-blue-50">
      <p class="huet-text-80 hover:huet-text-red-100"></p>
      <div><article class="group-hover:huet-bg-40 huet-bg/text-70 huet-bg/border-green-60">
        <aside class="huet-bg-5"><span class="huet-outline-30 focus:huet-bg/outline-90"></span></aside>
      </article></div>
    </section>`;
    const section = root.querySelector("section")!, p = root.querySelector("p")!;
    const article = root.querySelector("article")!, aside = root.querySelector("aside")!;
    const span = root.querySelector("span")!;
    const theme = createTheme();
    const mount = mountTheme(root, theme);
    const rel = theme.relative, ramps = rel.theme.ramps;
    // Rest may be unset (-1) or the resting class's key.
    const blue = stateKey({ property: "bg", ownBackground: false, ramp: "blue", amount: 50 });
    for (const [sectionKey, sectionBg] of [[-1, 10], [10, 10], [20, 20], [blue, "blue"]] as const)
      for (const articleKey of [-1, 40]) {
        const states = new Map<Element, number>([[section, sectionKey], [article, articleKey]]);
        const outer = sectionBg === "blue" ? rel.contrast(50, ramps.blue) : rel.contrast(sectionBg);
        const middle = articleKey === 40 ? outer.contrast(40) : outer;
        const inner = middle.contrast(5);
        const label = `section ${sectionKey}, article ${articleKey}`;
        expect(computed(section, "--huet-background", states), label).toBe(outer.hex);
        expect(computed(p, "--huet-text-80", states), label).toBe(outer.contrast(80).hex);
        expect(computed(p, "--huet-relative-text", states), label).toBe(outer.contrast(80).hex);
        expect(computed(p, "--huet-text-red-100", states), label).toBe(outer.contrast(100, ramps.red).hex);
        expect(computed(article, "--huet-background", states), label).toBe(middle.hex);
        expect(computed(article, "--huet-foreground", states), label).toBe(middle.contrast(100).hex);
        expect(computed(article, "--huet-muted", states), label).toBe(theme.tokens(middle.hex, articleKey === 40 ? outer.hex : rel.hex).muted);
        expect(computed(article, "--huet-bg-text-70", states), label).toBe(middle.contrast(70).hex);
        expect(computed(article, "--huet-bg-border-green-60", states), label).toBe(middle.contrast(60, ramps.green).hex);
        expect(computed(aside, "--huet-background", states), label).toBe(inner.hex);
        expect(computed(span, "--huet-outline-30", states), label).toBe(inner.contrast(30).hex);
        expect(computed(span, "--huet-bg-outline-90", states), label).toBe(inner.contrast(90).hex);
      }
    expect(section.hasAttribute("data-huet-state")).toBe(true);
    expect(article.hasAttribute("data-huet-state")).toBe(true);
    expect(aside.hasAttribute("data-huet-state")).toBe(false);
    // Only classes without variants use the fixed names that styles.css reads.
    expect(p.hasAttribute("data-huet-color-text")).toBe(true);
    expect(span.hasAttribute("data-huet-color-outline")).toBe(true);
    expect(article.hasAttribute("data-huet-color-text")).toBe(true);
    // Removing the variants leaves plain colors, and destroy() removes everything.
    section.className = "huet-bg-10";
    article.className = "";
    return tick().then(() => {
      expect(section.hasAttribute("data-huet-state")).toBe(false);
      expect(article.hasAttribute("data-huet-color-bg")).toBe(false);
      expect(background(section)).toBe(rel.contrast(10).hex);
      expect(background(aside)).toBe(rel.contrast(10).contrast(5).hex);
      expect(section.getAttribute("style")).not.toContain("--huet-s");
      mount.destroy();
      for (const el of [section, p, article, aside, span]) {
        expect(el.getAttribute("style") ?? "").toBe("");
        expect([...el.attributes].map((x) => x.name).filter((x) => x.startsWith("data-huet"))).toEqual([]);
      }
    });
  });
  it("keeps variant-only text classes off the fixed names and rejects too many state combinations", () => {
    const root = document.createElement("div");
    root.innerHTML = '<a class="hover:huet-text-100 [&>svg]:huet-bg/text-60"></a>';
    const theme = createTheme();
    const mount = mountTheme(root, theme);
    const a = root.querySelector("a")!;
    expect(a.style.getPropertyValue("--huet-text-100")).toBe(theme.relative.contrast(100).hex);
    expect(a.style.getPropertyValue("--huet-bg-text-60")).toBe(theme.relative.contrast(60).hex);
    expect(a.style.getPropertyValue("--huet-relative-text")).toBe("");
    expect(a.hasAttribute("data-huet-color-text")).toBe(false);
    mount.destroy();
    const states = "hover:huet-bg-10 focus:huet-bg-20 active:huet-bg-30";
    root.innerHTML = Array(6).fill(`<div class="${states}">`).join("") + "</div>".repeat(6);
    expect(() => mountTheme(root, theme)).toThrow("Too many background states");
    root.innerHTML = Array(4).fill(`<div class="${states}">`).join("") + "</div>".repeat(4);
    mountTheme(root, theme).destroy();
  });
});
