// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { createTheme } from "./theme";
import { mountTheme } from "./dom";
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
  it("rejects variant-only classes at mount and leaves no changes", () => {
    const root = document.createElement("div");
    root.innerHTML = '<p class="huet-bg-10"></p><p class="hover:huet-bg-25"></p>';
    expect(() => mountTheme(root, createTheme())).toThrow("don't support Tailwind variants yet: hover:huet-bg-25");
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
    second.className = "huet-bg-10 hover:huet-bg-25";
    // The bad class comes after valid changes, which must not be written either.
    expect(() => mount.update(createTheme({ background: 0 }))).toThrow("hover:huet-bg-25");
    expect(background(root)).toBe(rootBackground);
    expect(background(first)).toBe(light);
    expect(background(second)).toBe(light);
    expect(root.getAttribute("data-huet-error")).toContain("hover:huet-bg-25");
    second.className = "huet-bg-10";
    const dark = createTheme({ background: 0 });
    mount.update(dark);
    expect(background(first)).toBe(dark.relative.contrast(50).hex);
    expect(root.hasAttribute("data-huet-error")).toBe(false);
    first.className = "hover:huet-text-60";
    expect(() => mount.update(dark)).toThrow();
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
      <button class="huet-bg-blue-25 huet-text-100 huet-border-red-60">Save</button>
      <input class="huet-bg-10 huet-bg/text-80 huet-bg/border-red-60 huet-outline-blue-35">
      <article class="huet-bg-purple-49"></article>
    </div></section>`;
    const theme = createTheme();
    const mount = mountTheme(root, theme);
    const parent = theme.relative.contrast(40, theme.relative.theme.ramps.gray);
    const button = root.querySelector("button")!;
    const input = root.querySelector("input")!;
    const buttonBg = parent.contrast(25, parent.theme.ramps.blue);
    const inputBg = parent.contrast(10);
    expect(background(button)).toBe(buttonBg.hex);
    expect(button.style.getPropertyValue("--huet-foreground")).toBe(buttonBg.contrast(100).hex);
    expect(button.style.getPropertyValue("--huet-relative-text")).toBe(parent.contrast(100).hex);
    expect(button.style.getPropertyValue("--huet-relative-border")).toBe(parent.contrast(60, parent.theme.ramps.red).hex);
    expect(input.style.getPropertyValue("--huet-relative-text")).toBe(inputBg.contrast(80).hex);
    expect(input.style.getPropertyValue("--huet-relative-border")).toBe(inputBg.contrast(60, parent.theme.ramps.red).hex);
    expect(input.style.getPropertyValue("--huet-relative-outline")).toBe(parent.contrast(35, parent.theme.ramps.blue).hex);
    expect(background(root.querySelector("article")!)).toBe(parent.contrast(49, parent.theme.ramps.purple).hex);
    mount.destroy();
  });
  it("updates classes, reparenting, global contrast and cleanup without replacing nodes", async () => {
    const root = document.createElement("div");
    root.innerHTML = '<section class="huet-bg-60"><input class="huet-bg-blue-25 huet-bg/text-100"></section>';
    const theme = createTheme();
    const input = root.querySelector("input")!;
    input.style.setProperty("--huet-relative-text", "pink");
    const mount = mountTheme(root, theme);
    input.value = "unsaved";
    const faded = createTheme({ contrast: .3 });
    mount.update(faded);
    const bg = faded.relative.contrast(60).contrast(25, faded.relative.theme.ramps.blue);
    expect(background(input)).toBe(bg.hex);
    expect(input.style.getPropertyValue("--huet-relative-text")).toBe(bg.contrast(100).hex);
    root.append(input);
    await tick();
    expect(background(input)).toBe(faded.relative.contrast(25, faded.relative.theme.ramps.blue).hex);
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
