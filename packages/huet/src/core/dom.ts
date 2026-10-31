import { classVariable, parseClassToken, parseColorClass, stateKey, validateClasses, type ColorClass, type Surface } from "./classes";
import { stepVariables } from "./css";
import type { Surface as Background } from "./steps";
import { resolveTheme, themeVariables, type BackgroundOptions, type ResolvedTheme, type Theme } from "./theme";
const selector = '[class*="huet-"]';
const mounted = new WeakSet<HTMLElement>();
const owners = new WeakMap<HTMLElement, () => void>();
const markerNames = ["data-huet-color-bg", "data-huet-color-text", "data-huet-color-border", "data-huet-color-outline", "data-huet-state"];
interface Pending { values: Record<string, string>; markers: Set<string> }
/** An element whose background changes with Tailwind variants. State 0 is its resting background. */
interface Dim { el: HTMLElement; keys: number[] }
/** Colors for every combination of the states of `dims`. The last dim varies fastest. */
interface Context { dims: Dim[]; bg: Background[]; tokens: Readonly<Record<string, string>>[] }
/** Each element's colors are computed for every combination of its ancestors' states. */
const maxCombinations = 256;
const resolve = (theme: ResolvedTheme, base: Background, spec: ColorClass) =>
  theme.step(base, spec.amount, spec.ramp);
const weight = (key: number) =>
  `max(0%, (1 - max(var(--huet-state) - ${key}, ${key} - var(--huet-state))) * 100%)`;
/**
 * Choose one entry per state in CSS. The active background utility sets --huet-state
 * to its key; exactly one weight is then 100%. No match leaves the resting entry.
 */
function select(dim: Dim, entries: string[]) {
  let value = entries[0];
  for (let i = 1; i < entries.length; i++)
    if (entries[i] !== entries[0])
      value = `color-mix(in srgb, ${entries[i]} ${weight(dim.keys[i])}, ${value})`;
  return value;
}
/**
 * Color `root` and the Huet classes under it with a theme, and keep them
 * colored as elements change. `background` places the root on the theme's
 * neutral ramp: 0 is dark, 1 (the default) is light. Mount once per independent
 * tree. Elements with Huet classes receive inline variables.
 */
export function mountTheme(root: HTMLElement, initialTheme: Theme, options: BackgroundOptions = {}) {
  let background = options.background ?? 1;
  let theme = resolveTheme(initialTheme, { background });
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
  let disposed = false;
  const originals = new Map<HTMLElement, Map<string, [string, string]>>();
  const originalAttributes = new Map<HTMLElement, Map<string, string | null>>();
  const writeValues = (el: HTMLElement, { values, markers }: Pending) => {
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
    for (const name of markerNames) {
      if (markers.has(name)) {
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
  const surface = (parent: Background, base: string) => {
    const spec = parseColorClass(base);
    const suffix = base.slice("huet-surface-".length);
    const bg = spec ? resolve(theme, parent, spec) : theme.derive(
      parent, theme.surface(parent.full.hex, (/^\d+$/.test(suffix) ? Number(suffix) : suffix) as Surface),
    );
    const values = { ...themeVariables(theme.tokensOn(bg, parent)), ...stepVariables(theme, bg) };
    return { bg, tokens: spec ? { ...values, "--huet-foreground": theme.step(bg, 100).hex } : values };
  };
  const fail = (message: string): never => {
    root.setAttribute("data-huet-error", message);
    throw new Error(message);
  };
  const refresh = () => {
    if (disposed) return;
    const elements = [root, ...root.querySelectorAll<HTMLElement>(selector)];
    // Check every element before writing, so an invalid class can't leave the tree
    // half-updated. Errors after mount have no caller, so the root records them too.
    // SVG elements expose className as an SVGAnimatedString.
    const errors = [...new Set(elements.flatMap((el) => validateClasses(el.getAttribute("class") ?? "")))];
    if (errors.length) fail(errors.join("\n"));
    const pending = new Map<HTMLElement, Pending>();
    const target = (el: HTMLElement) => {
      let entry = pending.get(el);
      if (!entry) pending.set(el, entry = { values: {}, markers: new Set() });
      return entry;
    };
    let count = 0;
    /**
     * CSS for one value per combination of the states of `dims`, used on `el`.
     * Each state is chosen on its own element: there --huet-state is that element's,
     * and descendants inherit the result with the choice already made.
     */
    const fold = (dims: Dim[], values: string[], el: HTMLElement) => {
      dims.forEach((dim, i) => {
        const n = dim.keys.length, size = values.length / n;
        values = Array.from({ length: size }, (_, rest) => {
          const entries = Array.from({ length: n }, (_, state) => values[state * size + rest]);
          const value = select(dim, entries);
          if (value === entries[0] || (dim.el === el && i === dims.length - 1)) return value;
          const name = `--huet-s${count++}`;
          target(dim.el).values[name] = value;
          return `var(${name})`;
        });
      });
      return values[0];
    };
    const rootColor = theme.root;
    const top: Context = {
      dims: [], bg: [rootColor],
      tokens: [{ ...themeVariables(theme.tokensOn(rootColor)), ...stepVariables(theme, rootColor) }],
    };
    const contexts = new Map<HTMLElement, Context>();
    for (const el of elements) {
      const names = [...el.classList].map(parseClassToken);
      const backgrounds = names.filter((x) => x.base.startsWith("huet-surface-") || parseColorClass(x.base)?.property === "bg");
      const colors = names.flatMap((x) => {
        const spec = parseColorClass(x.base);
        return spec && spec.property !== "bg" ? [{ ...x, spec }] : [];
      });
      if (el !== root && !backgrounds.length && !colors.length) continue;
      let ancestor = el.parentElement;
      while (ancestor && !contexts.has(ancestor)) ancestor = ancestor.parentElement;
      const parent = (el !== root && ancestor && contexts.get(ancestor)) || top;
      let context = parent;
      if (el === root || backgrounds.length) {
        // The resting background, or none, then each background a variant can switch to.
        const rest = backgrounds.find((x) => !x.variants)?.base;
        const states = [rest, ...new Set(backgrounds.filter((x) => x.variants && x.base !== rest).map((x) => x.base))];
        const dim = states.length > 1
          ? { el, keys: [-1, ...states.slice(1).map((x) => stateKey(parseColorClass(x!)!))] }
          : undefined;
        const bg: Background[] = [], tokens: Context["tokens"] = [];
        parent.bg.forEach((color, i) => {
          for (const state of states) {
            const result = state ? surface(color, state) : { bg: color, tokens: parent.tokens[i] };
            bg.push(result.bg);
            tokens.push(result.tokens);
          }
        });
        if (bg.length > maxCombinations)
          fail(`Too many background states above "${el.getAttribute("class")}": ${bg.length} combinations, at most ${maxCombinations}. Each enclosing element with Tailwind variants on its Huet background multiplies them. Remove variants from some of those backgrounds.`);
        context = { dims: dim ? [...parent.dims, dim] : parent.dims, bg, tokens };
        contexts.set(el, context);
        const entry = target(el);
        entry.markers.add("data-huet-color-bg");
        if (dim) entry.markers.add("data-huet-state");
        for (const name of Object.keys(tokens[0]))
          entry.values[name] = fold(context.dims, tokens.map((x) => x[name]), el);
      }
      for (const { variants, base, spec } of colors) {
        const entry = target(el);
        const from = spec.ownBackground ? context : parent;
        const value = entry.values[classVariable(base)] ??= fold(from.dims, from.bg.map((x) => resolve(theme, x, spec).hex), el);
        // Without Tailwind, styles.css reads the class without variants from a fixed name.
        if (!variants) {
          entry.values[`--huet-relative-${spec.property}`] = value;
          entry.markers.add(`data-huet-color-${spec.property}`);
        }
      }
    }
    root.removeAttribute("data-huet-error");
    for (const [el, entry] of pending) writeValues(el, entry);
    for (const el of originals.keys()) if (!pending.has(el)) restore(el);
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
    /** Recolor with another theme. `background` stays as it was unless given. */
    update(next: Theme, options: BackgroundOptions = {}) {
      if (disposed) throw new Error("Cannot update a destroyed Huet mount");
      const nextBackground = options.background ?? background;
      theme = resolveTheme(next, { background: nextBackground });
      background = nextBackground;
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
