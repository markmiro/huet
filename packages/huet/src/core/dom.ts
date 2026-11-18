import { classVariable, parseClassToken, parseColorClass, stateKey, validateClasses, type ClassToken, type ColorClass, type Surface } from "./classes";
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
/** What a `class` attribute asks of Huet. */
interface Parsed {
  errors: string[];
  /** Whether the element has a background class. */
  surface: boolean;
  /** The resting background, or none, then each background a variant can switch to. */
  states: (string | undefined)[];
  /** `--huet-state` for each of `states`, when there's more than one. */
  keys?: number[];
  colors: (ClassToken & { spec: ColorClass })[];
}
// Pages repeat a few hundred class lists, and every theme update reads them all again.
const parsedClasses = new Map<string, Parsed>();
function parse(value: string): Parsed {
  let parsed = parsedClasses.get(value);
  if (!parsed) {
    // As `classList` reads it: each class once
    const names = [...new Set(value.split(/\s+/).filter(Boolean))].map(parseClassToken);
    const backgrounds = names.filter((x) => x.base.startsWith("huet-surface-") || parseColorClass(x.base)?.property === "bg");
    const rest = backgrounds.find((x) => !x.variants)?.base;
    const states = [rest, ...new Set(backgrounds.filter((x) => x.variants && x.base !== rest).map((x) => x.base))];
    const errors = validateClasses(value);
    parsed = {
      errors,
      surface: backgrounds.length > 0,
      states,
      // An invalid class list never gets as far as its states
      keys: states.length > 1 && !errors.length ? [-1, ...states.slice(1).map((x) => stateKey(parseColorClass(x!)!))] : undefined,
      colors: names.flatMap((x) => {
        const spec = parseColorClass(x.base);
        return spec && spec.property !== "bg" ? [{ ...x, spec }] : [];
      }),
    };
    if (parsedClasses.size >= 4096) parsedClasses.clear();
    parsedClasses.set(value, parsed);
  }
  return parsed;
}
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
  /** What this mount last wrote on each element. */
  const written = new WeakMap<HTMLElement, { values: Record<string, string>; markers: Set<string> }>();
  /**
   * Write an element's variables and markers. With `trust`, values this mount
   * already wrote aren't read back from the element first: a theme update
   * changes hundreds of values on a large page, and most of the rest are as
   * they were.
   */
  const writeValues = (el: HTMLElement, { values, markers }: Pending, trust: boolean) => {
    let last = trust ? written.get(el) : undefined;
    written.set(el, { values, markers });
    // The page may have replaced the element's whole style since. One value tells.
    for (const key in last?.values) {
      if (el.style.getPropertyValue(key) !== last!.values[key]) last = undefined;
      break;
    }
    if (last) {
      let same = last.markers.size === markers.size;
      if (same) for (const name of markers) if (!last.markers.has(name)) { same = false; break; }
      if (same) {
        let count = 0;
        for (const key in values) {
          count++;
          if (!(key in last.values)) { same = false; break; }
        }
        if (same) for (const key in last.values) if (count-- <= 0) { same = false; break; }
      }
      // The same variables as last time: only the ones that changed need writing.
      if (same) {
        for (const key in values)
          if (values[key] !== last.values[key]) el.style.setProperty(key, values[key]);
        return;
      }
    }
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
    written.delete(el);
  };
  // Elements that share a background and a class share its colors, so each
  // is worked out once per theme.
  let surfaces = new Map<Background, Map<string, { bg: Background; tokens: Record<string, string> }>>();
  let colorsOn = new Map<Background, Map<string, string>>();
  let rootTokens: Record<string, string> | undefined;
  const forget = () => {
    surfaces = new Map();
    colorsOn = new Map();
    rootTokens = undefined;
  };
  const surface = (parent: Background, base: string) => {
    let known = surfaces.get(parent);
    if (!known) surfaces.set(parent, (known = new Map()));
    let result = known.get(base);
    if (!result) known.set(base, (result = solveSurface(parent, base)));
    return result;
  };
  const colorOn = (bg: Background, base: string, spec: ColorClass) => {
    let known = colorsOn.get(bg);
    if (!known) colorsOn.set(bg, (known = new Map()));
    let hex = known.get(base);
    if (hex === undefined) known.set(base, (hex = resolve(theme, bg, spec).hex));
    return hex;
  };
  const solveSurface = (parent: Background, base: string) => {
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
  /** An element Huet colors, as the last scan of the tree found it. */
  interface Item extends Parsed {
    el: HTMLElement;
    /** The nearest enclosing item with its own colors, by index. The root has none. */
    parent: number;
  }
  /** The tree's Huet elements, in document order, until the tree changes. */
  let plan: Item[] | undefined;
  const scan = () => {
    const elements = [root, ...root.querySelectorAll<HTMLElement>(selector)];
    // Check every element before writing, so an invalid class can't leave the tree
    // half-updated. Errors after mount have no caller, so the root records them too.
    // SVG elements expose className as an SVGAnimatedString.
    const classes = elements.map((el) => parse(el.getAttribute("class") ?? ""));
    const errors = [...new Set(classes.flatMap((x) => x.errors))];
    if (errors.length) fail(errors.join("\n"));
    const items: Item[] = [];
    const surfaced = new Map<HTMLElement, number>();
    elements.forEach((el, index) => {
      const parsed = classes[index];
      if (el !== root && !parsed.surface && !parsed.colors.length) return;
      let ancestor = el === root ? null : el.parentElement;
      while (ancestor && !surfaced.has(ancestor)) ancestor = ancestor.parentElement;
      if (el === root || parsed.surface) surfaced.set(el, items.length);
      items.push({ ...parsed, el, parent: ancestor ? surfaced.get(ancestor)! : -1 });
    });
    return items;
  };
  /**
   * Color the tree. `trust` is for a theme update: the tree is read again only
   * if it changed, and elements are taken to be as this mount left them.
   */
  const refresh = (trust = false) => {
    if (disposed) return;
    if (!trust) plan = undefined;
    const reused = plan !== undefined;
    const items = (plan ??= scan());
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
    rootTokens ??= { ...themeVariables(theme.tokensOn(rootColor)), ...stepVariables(theme, rootColor) };
    const top: Context = { dims: [], bg: [rootColor], tokens: [rootTokens] };
    const contexts: Context[] = [];
    items.forEach(({ el, parent: above, surface: hasBackground, states, keys, colors }, index) => {
      const parent = above < 0 ? top : contexts[above];
      let context = parent;
      if (el === root || hasBackground) {
        const dim = keys ? { el, keys } : undefined;
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
        contexts[index] = context;
        const entry = target(el);
        entry.markers.add("data-huet-color-bg");
        if (dim) entry.markers.add("data-huet-state");
        // Most surfaces have one state all the way up, so there's nothing to choose between.
        if (!context.dims.length) Object.assign(entry.values, tokens[0]);
        else
          for (const name of Object.keys(tokens[0]))
            entry.values[name] = fold(context.dims, tokens.map((x) => x[name]), el);
      }
      for (const { variants, base, spec } of colors) {
        const entry = target(el);
        const from = spec.ownBackground ? context : parent;
        const value = entry.values[classVariable(base)] ??= from.dims.length
          ? fold(from.dims, from.bg.map((x) => colorOn(x, base, spec)), el)
          : colorOn(from.bg[0], base, spec);
        // Without Tailwind, styles.css reads the class without variants from a fixed name.
        if (!variants) {
          entry.values[`--huet-relative-${spec.property}`] = value;
          entry.markers.add(`data-huet-color-${spec.property}`);
        }
      }
    });
    root.removeAttribute("data-huet-error");
    for (const [el, entry] of pending) writeValues(el, entry, reused);
    for (const el of originals.keys()) if (!pending.has(el)) restore(el);
  };
  const hasHuet = (value: string | null) => !!value && value.includes("huet-");
  /** Whether a change to the tree can change what Huet writes. Most don't: text, and elements without Huet classes. */
  const matters = (record: MutationRecord) => {
    if (record.type === "attributes")
      return hasHuet(record.oldValue) || hasHuet((record.target as Element).getAttribute("class"));
    for (const nodes of [record.addedNodes, record.removedNodes])
      for (const node of nodes)
        if (node.nodeType === 1 && ((node as Element).matches(selector) || (node as Element).querySelector(selector)))
          return true;
    return false;
  };
  // Observe structure/classes only: our variable writes never trigger another pass.
  const Observer = root.ownerDocument.defaultView!.MutationObserver;
  const observer = new Observer((records) => {
    if (records.some(matters)) refresh();
  });
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
    attributeOldValue: true,
  });
  return {
    /** Recolor with another theme. `background` stays as it was unless given. */
    update(next: Theme, options: BackgroundOptions = {}) {
      if (disposed) throw new Error("Cannot update a destroyed Huet mount");
      const nextBackground = options.background ?? background;
      theme = resolveTheme(next, { background: nextBackground });
      background = nextBackground;
      forget();
      // Changes the observer hasn't reported yet
      if (observer.takeRecords().some(matters)) plan = undefined;
      refresh(true);
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
