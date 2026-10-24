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
