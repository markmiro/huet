import chroma from "chroma-js";
import { paletteOf } from "./images";
import { recolorer, type Palette, type RecolorOptions } from "./recolor";
import type { HuetTheme } from "./theme";

export interface MountSvgsOptions extends RecolorOptions {
  /** Defaults to svg[data-huet-recolor]. */
  selector?: string;
}

const paints = ["fill", "stroke", "stop-color"] as const;
const connected = /currentcolor|var\(|env\(|context-fill|context-stroke/i;

/** Recolor opted-in inline SVGs without rasterizing them. Updates always use
 * original paints. CSS currentColor and variable paints remain CSS-controlled.
 * Removing an SVG or its opt-in, or destroying the mount, restores its styles.
 */
export function mountSvgs(root: ParentNode & Node, theme: HuetTheme | Palette, options: MountSvgsOptions = {}) {
  const { selector = "svg[data-huet-recolor]", ...initial } = options;
  let settings = initial;
  let map = recolorer(paletteOf(theme), settings);
  let disposed = false;
  let frame: number | undefined;
  const saved = new Map<SVGElement, string | null>();
  const written = new Map<SVGElement, string | null>();
  const restore = (el: SVGElement, value: string | null) => {
    if (value === null) el.removeAttribute("style");
    else el.setAttribute("style", value);
  };
  // Read authored declarations too: computed styles resolve var() and currentColor,
  // losing the information that these paints must remain connected to CSS.
  const cssPaint = (el: Element, property: string): boolean => {
    if (connected.test(el.getAttribute(property) ?? "")) return true;
    if (el instanceof SVGElement && connected.test(el.style.getPropertyValue(property))) return true;
    const rules = (list: CSSRuleList): boolean => {
      for (const rule of Array.from(list)) {
        if ("selectorText" in rule && "style" in rule) {
          const styleRule = rule as CSSStyleRule;
          try {
            if (el.matches(styleRule.selectorText) && connected.test(styleRule.style.getPropertyValue(property))) return true;
          } catch { /* Unsupported selector. */ }
        } else if ("cssRules" in rule && rules((rule as CSSGroupingRule).cssRules)) return true;
      }
      return false;
    };
    for (const sheet of Array.from(el.ownerDocument.styleSheets)) {
      try { if (rules(sheet.cssRules)) return true; } catch { /* Cross-origin stylesheet. */ }
    }
    return el.parentElement ? cssPaint(el.parentElement, property) : false;
  };
  const observe = () => observer.observe(root, { subtree: true, childList: true, attributes: true });
  const flush = () => {
    if (disposed) return;
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    observer.disconnect();
    // Restore before reading computed styles so inherited paints are never mapped twice.
    for (const [el, original] of saved) {
      const current = el.getAttribute("style");
      if (current !== written.get(el)) {
        // Keep unrelated page edits without adopting our mapped paints as originals.
        const authored = el.ownerDocument.createElementNS(el.namespaceURI, "g") as SVGElement;
        const previous = el.ownerDocument.createElementNS(el.namespaceURI, "g") as SVGElement;
        restore(authored, original);
        restore(previous, written.get(el) ?? null);
        for (const property of paints) {
          if (el.style.getPropertyValue(property) !== previous.style.getPropertyValue(property) ||
              el.style.getPropertyPriority(property) !== previous.style.getPropertyPriority(property)) continue;
          const value = authored.style.getPropertyValue(property);
          if (value) el.style.setProperty(property, value, authored.style.getPropertyPriority(property));
          else el.style.removeProperty(property);
        }
        saved.set(el, el.getAttribute("style"));
      }
      restore(el, saved.get(el) ?? null);
    }
    const svgs = Array.from(root.querySelectorAll<SVGSVGElement>(selector));
    if (root instanceof SVGSVGElement && root.matches(selector)) svgs.unshift(root);
    const elements = new Set<SVGElement>();
    for (const svg of svgs) {
      elements.add(svg);
      for (const el of svg.querySelectorAll("*")) if (el instanceof SVGElement) elements.add(el);
    }
    for (const el of saved.keys()) if (!elements.has(el)) { saved.delete(el); written.delete(el); }
    const changes: Array<[SVGElement, string, string]> = [];
    for (const el of elements) {
      if (!saved.has(el)) saved.set(el, el.getAttribute("style"));
      const computed = getComputedStyle(el);
      for (const property of paints) {
        if (cssPaint(el, property)) continue;
        const paint = computed.getPropertyValue(property) || (property === "stroke" ? "none" : "black");
        if (/url\(|none|transparent/i.test(paint) || !chroma.valid(paint)) continue;
        const color = chroma(paint);
        const alpha = color.alpha();
        if (alpha === 0) continue;
        const [r, g, b] = color.rgb(false);
        const rgb = map(r / 255, g / 255, b / 255).map(v => Math.round(Math.max(0, Math.min(1, v)) * 255));
        changes.push([el, property, `rgba(${rgb.join(", ")}, ${alpha})`]);
      }
    }
    for (const [el, property, value] of changes) el.style.setProperty(property, value, "important");
    for (const el of elements) written.set(el, el.getAttribute("style"));
    observe();
  };
  const schedule = () => { if (!disposed && frame === undefined) frame = requestAnimationFrame(flush); };
  const observer = new MutationObserver(schedule);
  flush();
  return {
    update(next: HuetTheme | Palette, nextOptions?: RecolorOptions) {
      if (disposed) throw new Error("Cannot update a destroyed Huet SVG mount");
      if (nextOptions) settings = nextOptions;
      map = recolorer(paletteOf(next), settings);
      schedule();
    },
    async ready() { flush(); },
    destroy() {
      if (disposed) return;
      disposed = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer.disconnect();
      for (const [el, original] of saved) restore(el, original);
      saved.clear();
      written.clear();
    },
  };
}
