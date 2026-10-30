import Color from "../Color";
import chroma from "chroma-js";
import { classes, parseColorClass, validateClasses, type Surface } from "./classes";
import { themeVariables, type HuetTheme } from "./theme";
const surfaceClasses = classes.filter((x) => x.startsWith("huet-surface-"));
const selector = '[class*="huet-"]';
const mounted = new WeakSet<HTMLElement>();
const owners = new WeakMap<HTMLElement, () => void>();
/** Mount once per independent tree. Only background surfaces receive inline variables. */
export function mountTheme(root: HTMLElement, initialTheme: HuetTheme) {
  if (
    mounted.has(root) ||
    root.parentElement?.closest("[data-huet-root]") ||
    root.querySelector("[data-huet-root]")
  ) {
    throw new Error(
      "Huet theme roots must be independent, non-overlapping trees",
    );
  }
  mounted.add(root);
  const previousRoot = root.getAttribute("data-huet-root");
  root.setAttribute("data-huet-root", "");
  let theme = initialTheme,
    disposed = false;
  const originals = new Map<HTMLElement, Map<string, [string, string]>>();
  const originalAttributes = new Map<HTMLElement, Map<string, string | null>>();
  const markers = {
    "--huet-background": "data-huet-color-bg",
    "--huet-relative-text": "data-huet-color-text",
    "--huet-relative-border": "data-huet-color-border",
    "--huet-relative-outline": "data-huet-color-outline",
  };
  const writeValues = (el: HTMLElement, values: Record<string, string>) => {
    let original = originals.get(el);
    if (!original) {
      // A surface may move between independent roots before either observer runs.
      // Release its old ownership before capturing values for the new mount.
      owners.get(el)?.();
      original = new Map();
      originals.set(el, original);
      owners.set(el, () => restore(el));
    }
    for (const [key, [value, priority]] of original) {
      if (key in values) continue;
      if (value) el.style.setProperty(key, value, priority);
      else el.style.removeProperty(key);
      original.delete(key);
    }
    let attributes = originalAttributes.get(el);
    if (!attributes) originalAttributes.set(el, attributes = new Map());
    for (const [key, name] of Object.entries(markers)) {
      if (key in values) {
        if (!attributes.has(name)) attributes.set(name, el.getAttribute(name));
        el.setAttribute(name, "");
      } else if (attributes.has(name)) {
        const value = attributes.get(name)!;
        if (value === null) el.removeAttribute(name);
        else el.setAttribute(name, value);
        attributes.delete(name);
      }
    }
    for (const [key, value] of Object.entries(values)) {
      if (!original.has(key))
        original.set(key, [
          el.style.getPropertyValue(key),
          el.style.getPropertyPriority(key),
        ]);
      if (el.style.getPropertyValue(key) !== value)
        el.style.setProperty(key, value);
    }
  };
  const restore = (el: HTMLElement) => {
    if (!originals.has(el)) return;
    for (const [key, [value, priority]] of originals.get(el) ?? []) {
      if (value) el.style.setProperty(key, value, priority);
      else el.style.removeProperty(key);
    }
    for (const [name, value] of originalAttributes.get(el) ?? []) {
      if (value === null) el.removeAttribute(name);
      else el.setAttribute(name, value);
    }
    originalAttributes.delete(el);
    originals.delete(el);
    owners.delete(el);
  };
  const surface = (el: HTMLElement, parent: string) => {
    const name = surfaceClasses.find((x) => el.classList.contains(x));
    if (!name) return parent;
    const suffix = name.slice("huet-surface-".length);
    return theme.surface(
      parent,
      (/^\d+$/.test(suffix) ? Number(suffix) : suffix) as Surface,
    );
  };
  const refresh = () => {
    if (disposed) return;
    const active = new Set<HTMLElement>();
    const backgrounds = new Map<HTMLElement, Color>();
    const elements = [root, ...root.querySelectorAll<HTMLElement>(selector)];
    // Check every element before writing, so an invalid class can't leave the tree
    // half-updated. Errors after mount have no caller, so the root records them too.
    // SVG elements expose className as an SVGAnimatedString.
    const errors = [...new Set(elements.flatMap((el) => validateClasses(el.getAttribute("class") ?? "")))];
    if (errors.length) {
      root.setAttribute("data-huet-error", errors.join("\n"));
      throw new Error(errors.join("\n"));
    }
    root.removeAttribute("data-huet-error");
    for (const el of elements) {
      const names = [...el.classList];
      const specs = names.map(parseColorClass).filter(x => x !== undefined);
      const legacySurface = names.some(x => surfaceClasses.includes(x as typeof surfaceClasses[number]));
      if (el !== root && !specs.length && !legacySurface) continue;
      let parent = el.parentElement;
      while (parent && !backgrounds.has(parent)) parent = parent.parentElement;
      const parentColor = backgrounds.get(parent!) ?? theme.relative;
      const bgSpec = specs.find(x => x.property === "bg");
      const resolve = (base: Color, spec: typeof specs[number]) => base.contrast(
        spec.amount, spec.ramp ? base.theme.ramps[spec.ramp] : undefined);
      let bg = bgSpec ? resolve(parentColor, bgSpec) : parentColor;
      if (legacySurface) bg = new Color({
        theme: parentColor.theme, bgColor: parentColor,
        lab: chroma(surface(el, parentColor.hex)).lab(),
      });
      const values: Record<string, string> = {};
      if (el === root || bgSpec || legacySurface) {
        backgrounds.set(el, bg);
        Object.assign(values, themeVariables(theme.tokens(bg.hex, parentColor.hex)));
        if (bgSpec) values["--huet-foreground"] = bg.contrast(100).hex;
      }
      for (const spec of specs) {
        if (spec.property === "bg") continue;
        const color = resolve(spec.ownBackground ? bg : parentColor, spec);
        values[`--huet-relative-${spec.property}`] = color.hex;
      }
      active.add(el);
      writeValues(el, values);
    }
    for (const el of originals.keys()) if (!active.has(el)) restore(el);
  };
  // Observe structure/classes only: our variable writes never trigger another pass.
  const Observer = root.ownerDocument.defaultView!.MutationObserver;
  const observer = new Observer(refresh);
  try {
    refresh();
  } catch (error) {
    for (const el of originals.keys()) restore(el);
    root.removeAttribute("data-huet-error");
    if (previousRoot === null) root.removeAttribute("data-huet-root");
    else root.setAttribute("data-huet-root", previousRoot);
    mounted.delete(root);
    throw error;
  }
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  return {
    update(next: HuetTheme) {
      if (disposed) throw new Error("Cannot update a destroyed Huet mount");
      theme = next;
      refresh();
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      for (const el of originals.keys()) restore(el);
      root.removeAttribute("data-huet-error");
      if (previousRoot === null) root.removeAttribute("data-huet-root");
      else root.setAttribute("data-huet-root", previousRoot);
      mounted.delete(root);
    },
  };
}
