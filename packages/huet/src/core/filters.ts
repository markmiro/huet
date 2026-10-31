import type { Triple } from "./color";
import type { Transform } from "./recolor";

/*
  A CSS `filter` runs after an element paints, so it also changes colors Huet
  recolored: `grayscale` on a logo's wrapper turns the theme's tinted ramp back
  into plain gray. The filter's color functions are fixed functions of sRGB,
  so they can run on each color before recoloring instead, and the filter
  itself can be lifted from the element. Browsers apply these functions in
  sRGB, with each step clamped, as the Filter Effects spec defines them.
*/

type Step = (rgb: [number, number, number]) => void;
type Matrix = readonly [number, number, number, number, number, number, number, number, number];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const matrix =
  (m: Matrix): Step =>
  (c) => {
    const [r, g, b] = c;
    c[0] = clamp(m[0] * r + m[1] * g + m[2] * b);
    c[1] = clamp(m[3] * r + m[4] * g + m[5] * b);
    c[2] = clamp(m[6] * r + m[7] * g + m[8] * b);
  };
const linear =
  (slope: number, intercept: number): Step =>
  (c) => {
    for (let i = 0; i < 3; i++) c[i] = clamp(slope * c[i] + intercept);
  };

// Rec. 709 luma weights, as the spec's matrices use.
const saturate = (s: number): Matrix => [
  0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
];

const steps: Record<string, (amount: number) => Step> = {
  grayscale: (a) => {
    const k = 1 - Math.min(1, a);
    return matrix([
      0.2126 + 0.7874 * k, 0.7152 - 0.7152 * k, 0.0722 - 0.0722 * k,
      0.2126 - 0.2126 * k, 0.7152 + 0.2848 * k, 0.0722 - 0.0722 * k,
      0.2126 - 0.2126 * k, 0.7152 - 0.7152 * k, 0.0722 + 0.9278 * k,
    ]);
  },
  sepia: (a) => {
    const k = 1 - Math.min(1, a);
    return matrix([
      0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k,
      0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k,
      0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k,
    ]);
  },
  saturate: (s) => matrix(saturate(s)),
  "hue-rotate": (degrees) => {
    const cos = Math.cos((degrees * Math.PI) / 180),
      sin = Math.sin((degrees * Math.PI) / 180);
    return matrix([
      0.213 + cos * 0.787 - sin * 0.213, 0.715 - cos * 0.715 - sin * 0.715, 0.072 - cos * 0.072 + sin * 0.928,
      0.213 - cos * 0.213 + sin * 0.143, 0.715 + cos * 0.285 + sin * 0.14, 0.072 - cos * 0.072 - sin * 0.283,
      0.213 - cos * 0.213 - sin * 0.787, 0.715 - cos * 0.715 + sin * 0.715, 0.072 + cos * 0.928 + sin * 0.072,
    ]);
  },
  invert: (a) => linear(1 - 2 * Math.min(1, a), Math.min(1, a)),
  brightness: (a) => linear(a, 0),
  contrast: (a) => linear(a, 0.5 - 0.5 * a),
};

/** The functions a filter applies, with their arguments, outside nested parentheses. */
function functionsOf(filter: string) {
  const found: { name: string; args: string; text: string }[] = [];
  const pattern = /([a-z-]+)\(/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(filter))) {
    let depth = 1,
      i = pattern.lastIndex;
    for (; i < filter.length && depth; i++)
      if (filter[i] === "(") depth++;
      else if (filter[i] === ")") depth--;
    found.push({
      name: match[1].toLowerCase(),
      args: filter.slice(pattern.lastIndex, i - 1).trim(),
      text: filter.slice(match.index, i),
    });
    pattern.lastIndex = i;
  }
  return found;
}

function amount(name: string, args: string) {
  const value = parseFloat(args);
  if (name === "hue-rotate") {
    if (!args) return 0;
    if (args.endsWith("grad")) return value * 0.9;
    if (args.endsWith("rad")) return (value * 180) / Math.PI;
    if (args.endsWith("turn")) return value * 360;
    return value;
  }
  if (!args) return 1;
  return args.endsWith("%") ? value / 100 : value;
}

/** Whether a computed `filter` value changes colors, rather than only blurring, shadowing, or fading. */
export const changesColor = (filter: string) => functionsOf(filter).some(({ name }) => name in steps);

/**
 * Split a computed CSS `filter` value into its color functions (`grayscale()`,
 * `sepia()`, `saturate()`, `hue-rotate()`, `invert()`, `brightness()`, and
 * `contrast()`), as one transform of sRGB channels (0–1), and the rest
 * (`blur()`, `drop-shadow()`, `opacity()`, and `url()` references), which
 * don't recolor what's painted and can stay on the element. `apply` is null
 * when there are no color functions.
 */
export function colorFilter(filter: string): { apply: Transform | null; rest: string } {
  const chain: Step[] = [],
    rest: string[] = [];
  for (const { name, args, text } of functionsOf(filter)) {
    const step = steps[name];
    if (step) chain.push(step(amount(name, args)));
    else rest.push(text);
  }
  return {
    apply: chain.length
      ? (r, g, b) => {
          const c: [number, number, number] = [r, g, b];
          for (const step of chain) step(c);
          return c as unknown as Triple;
        }
      : null,
    rest: rest.join(" ") || "none",
  };
}

/** One element's computed filter, as the page sets it, with any override lifted. */
export function pageFilter(el: Element) {
  const lifted = lifts.get(el);
  if (!lifted) return getComputedStyle(el).filter;
  const { style } = el as HTMLElement;
  style.setProperty("filter", lifted.value, lifted.priority);
  const filter = getComputedStyle(el).filter;
  style.setProperty("filter", lifted.written, "important");
  return filter;
}

/**
 * The color filters that paint over `media`: its own and its ancestors', in
 * the order they apply. An ancestor's filter can only be folded in when the
 * ancestor is recolored media itself (`isMedia`) or wraps nothing else, since
 * lifting it would also change whatever else it paints. Those that can't are
 * in `stuck`.
 */
export function filtersOver(media: Element, isMedia: (el: Element) => boolean) {
  const folded: { el: Element; filter: string }[] = [],
    stuck: { el: Element; filter: string }[] = [];
  for (let el: Element | null = media; el; el = el.parentElement) {
    const filter = pageFilter(el);
    if (filter === "none" || !changesColor(filter)) continue;
    (el === media || isMedia(el) || wrapsOnly(el, isMedia) ? folded : stuck).push({ el, filter });
  }
  return { folded, stuck, key: folded.map(({ filter }) => filter).join(" ") };
}

/** Whether everything an element shows is recolored media, possibly inside more wrappers. */
function wrapsOnly(wrapper: Element, isMedia: (el: Element) => boolean): boolean {
  let media = false;
  for (const node of wrapper.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent!.trim()) return false;
    } else if (node instanceof Element) {
      if (isMedia(node)) media = true;
      else if (getComputedStyle(node).display === "none") continue;
      else if (wrapsOnly(node, isMedia)) media = true;
      else return false;
    }
  }
  return media;
}

interface Lift {
  /** The page's inline value and priority, to put back. */
  value: string;
  priority: string;
  /** The page's `style` attribute and what it parsed to, to put back as written when nothing else changed. */
  attribute: string | null;
  cssText: string;
  written: string;
  holders: Set<object>;
}
// Shared, so mounts that recolor media under the same wrapper don't put back each other's override.
const lifts = new Map<Element, Lift>();

/**
 * Replace an element's filter with what's left once its color functions are
 * folded into recoloring, until every holder lets go.
 */
export function liftFilter(el: Element, holder: object, filter: string) {
  const written = colorFilter(filter).rest;
  let lifted = lifts.get(el);
  if (!lifted) {
    const style = (el as HTMLElement).style;
    lifts.set(
      el,
      (lifted = {
        value: style.getPropertyValue("filter"),
        priority: style.getPropertyPriority("filter"),
        attribute: el.getAttribute("style"),
        cssText: style.cssText,
        written,
        holders: new Set(),
      }),
    );
  }
  lifted.holders.add(holder);
  lifted.written = written;
  (el as HTMLElement).style.setProperty("filter", written, "important");
}

/** Let go of an element's filter, putting the page's back when no one else holds it. */
export function dropFilter(el: Element, holder: object) {
  const lifted = lifts.get(el);
  if (!lifted || !lifted.holders.delete(holder) || lifted.holders.size) return;
  lifts.delete(el);
  const style = (el as HTMLElement).style;
  if (style.getPropertyValue("filter") !== lifted.written) return;
  if (lifted.value) style.setProperty("filter", lifted.value, lifted.priority);
  else style.removeProperty("filter");
  if (style.cssText !== lifted.cssText) return;
  if (lifted.attribute === null) el.removeAttribute("style");
  else el.setAttribute("style", lifted.attribute);
}

/** Describe an element for an error message: its tag, id, and classes. */
export function describe(el: Element) {
  const id = el.id ? `#${el.id}` : "";
  // SVG elements' className isn't a string.
  const names = el.getAttribute("class")?.trim();
  const classes = names ? `.${names.split(/\s+/).join(".")}` : "";
  return `<${el.tagName.toLowerCase()}${id}${classes}>`;
}

/**
 * Raise an error for a color filter that Huet can't fold in, once per pair of
 * media and filtered ancestor, without stopping the rest of the recoloring.
 */
export function reportStuck(reported: WeakMap<Element, Set<Element>>, media: Element, stuck: { el: Element; filter: string }[]) {
  for (const { el, filter } of stuck) {
    let seen = reported.get(media);
    if (!seen) reported.set(media, (seen = new Set()));
    if (seen.has(el)) continue;
    seen.add(el);
    reportError(
      new Error(
        `Huet recolored ${describe(media)}, but its ancestor ${describe(el)} has \`filter: ${filter}\`, ` +
          "which recolors it again after Huet. Huet can't lift that filter, since the ancestor also shows other content. " +
          "Move the filter onto the image or SVG (or a wrapper around only it), or remove it.",
      ),
    );
  }
}
