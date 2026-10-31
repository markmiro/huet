import { describe, dropFilter, filtersOver, liftFilter, reportStuck } from "./filters";
import { recolorImage } from "./images";
import { recolorer, type RecolorOptions, type Transform } from "./recolor";
import type { Theme } from "./theme";

export interface MountSvgsOptions extends RecolorOptions {
  /**
   * Which SVG elements to recolor, with everything inside them. Defaults to
   * `svg[data-huet-recolor], [data-huet-recolor] svg`: marked SVGs, and every
   * SVG inside a marked element, for markup that can't carry the attribute.
   */
  selector?: string;
}

type Paint = "fill" | "stroke" | "stop-color";
type Rgba = readonly [number, number, number, number];

/** Paints that CSS keeps current by itself. Mapping them would cut them off from the page's theme. */
const live = /currentcolor|var\(|context-(?:fill|stroke)/i;
const inherited = /^\s*(?:inherit|unset)\s*$/i;
/** Attributes inside a recolored SVG that can change its paints, or its rasters' sources. */
const paintAttributes = new Set(["fill", "stroke", "stop-color", "style", "class", "href"]);

interface Rule {
  selector: string;
  paint: Paint;
  value: string;
  important: boolean;
  media: MediaQueryList[];
}

// Reading every rule is slow on large sites, so each sheet's paint rules are
// kept until the sheet gains or loses rules.
const sheetRules = new WeakMap<CSSStyleSheet, { size: number; rules: Rule[] }>();
function rulesOf(sheet: CSSStyleSheet): Rule[] {
  let list: CSSRuleList;
  try {
    list = sheet.cssRules;
  } catch {
    // Cross-origin sheets can't be read, so their paints are taken as solid colors.
    return [];
  }
  const cached = sheetRules.get(sheet);
  if (cached?.size === list.length) return cached.rules;
  const rules: Rule[] = [];
  const visit = (list: CSSRuleList, media: MediaQueryList[]) => {
    for (const rule of list) {
      if (rule instanceof CSSStyleRule) {
        for (const paint of ["fill", "stroke", "stop-color"] as const) {
          const value = rule.style.getPropertyValue(paint);
          if (value)
            rules.push({
              selector: rule.selectorText,
              paint,
              value,
              important: rule.style.getPropertyPriority(paint) === "important",
              media,
            });
        }
      } else if (rule instanceof CSSMediaRule) {
        visit(rule.cssRules, [...media, matchMedia(rule.media.mediaText)]);
      } else if (rule instanceof CSSSupportsRule) {
        if (CSS.supports(rule.conditionText)) visit(rule.cssRules, media);
      } else if (rule instanceof CSSGroupingRule && rule.constructor.name !== "CSSStartingStyleRule") {
        // @layer, @container, and @scope: their conditions are taken as met.
        visit(rule.cssRules, media);
      }
    }
  };
  visit(list, []);
  sheetRules.set(sheet, { size: list.length, rules });
  return rules;
}

const matches = (el: Element, selector: string) => {
  try {
    return el.matches(selector);
  } catch {
    return false;
  }
};

/** Read a computed color as sRGB channels (0–255) and alpha (0–1). */
let probe: CanvasRenderingContext2D | undefined;
function parseColor(value: string): Rgba | null {
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)(%?))?\s*\)$/i.exec(value);
  if (rgb) {
    const alpha = rgb[4] === undefined ? 1 : Number(rgb[4]) / (rgb[5] ? 100 : 1);
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), alpha];
  }
  // oklch(), color(), and other modern syntaxes keep their own form when computed.
  if (!/^(?:oklch|oklab|lch|lab|hwb|hsla?|color)\(/i.test(value)) return null;
  if (!probe) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    probe = canvas.getContext("2d", { willReadFrequently: true })!;
  }
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "transparent";
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

/** Where an element's paint comes from: what wins the cascade, or nothing when it inherits. */
type Source = "style" | "rule" | "attribute" | "";

/** What a mount writes: paints, and a raster `<image>`'s recolored `href` or its `visibility` while that renders. */
type Written = Paint | "href" | "visibility";

interface Write {
  /** The presentation attribute, or the inline style when CSS outranks it. */
  via: "attribute" | "style";
  /** The page's value and priority before this mount wrote, or null if it had none. */
  value: string | null;
  priority: string;
  written: string;
}

interface Override {
  /** Whether the element had a `style` attribute before this mount wrote to it. */
  hadStyle: boolean;
  paints: Map<Written, Write>;
}

/**
 * Recolor matching inline SVGs under `root` into a theme, keeping them as
 * vectors, with the theme's `svgs` settings. At strength 0 they keep their
 * own paints. Solid fills, strokes, and gradient stops are mapped like image
 * pixels, including SVG's implicit black fill; their alpha, `none`, paint
 * servers (`url(#…)`), and opacity are kept. Paints that use `currentColor`
 * or a CSS variable are left alone, since the page's CSS already themes them.
 *
 * Mapped paints are written where the original came from: presentation
 * attributes (`fill="…"`) for attribute and default paints, so the page's CSS
 * rules, `:hover` included, still outrank them; and inline styles for paints
 * set by CSS. They go on the SVG, on each element that declares its own paint,
 * and on gradient stops. Children that inherit a paint follow their parent. Every theme update maps the original
 * paints, never the previous theme's. SVGs that are added later, or whose
 * paints change, are recolored at the next frame; removed or opted-out SVGs,
 * and every SVG on `destroy`, get their own inline styles back.
 *
 * To tell CSS-driven paints apart, stylesheet rules are matched in document
 * order, with `!important` first; specificity and layers aren't compared, and
 * cross-origin stylesheets can't be read.
 *
 * Raster `<image>` elements inside are recolored like `mountImages` does, into
 * a recolored copy their `href` points to while mounted; until the first copy
 * is ready they're hidden. Ones that can't be read (cross-origin without CORS)
 * keep their colors and are reported as errors.
 *
 * Color functions of a CSS `filter` on the SVG, such as `grayscale(1)`, are
 * applied to its colors before mapping and lifted from it, since they would
 * otherwise wash out the theme. So are filters on ancestors that wrap only
 * recolored SVGs. A color filter on an ancestor that also shows other content
 * can't be lifted, so it's reported as an error, once per SVG.
 */
export function mountSvgs(
  root: ParentNode & Node,
  theme: Theme,
  options: MountSvgsOptions = {},
) {
  const { selector = "svg[data-huet-recolor], [data-huet-recolor] svg", ...recolor } = options;
  let settings: RecolorOptions = recolor,
    target = theme,
    /** The mapping for each chain of folded filters, for the current theme. */
    maps = new Map<string, Transform>(),
    off = theme.svgs?.strength === 0,
    mapped = new Map<string, string>(),
    /** Recolored copies of rasters by filter chain and `href`, for the current theme: a URL, or a render in progress. */
    rasters = new Map<string, string | Promise<void>>(),
    frame: number | undefined,
    disposed = false;
  const overrides = new Map<SVGElement, Override>();
  /** Elements whose filters this mount lifted at the last flush. */
  let lifted: Element[] = [];
  const holder = {};
  const reported = new WeakMap<Element, Set<Element>>();
  /** Rasters that couldn't be read, by `href`. */
  const unreadable = new Set<string>();
  /** The copy each raster showed last, kept while the next theme's copy renders, so it doesn't flash. */
  const shown = new WeakMap<SVGImageElement, { href: string; url: string }>();
  const pending = new Set<Promise<void>>();
  // Check the settings now, so a bad theme throws here rather than at the first frame.
  recolorer(theme, settings, "svgs");
  /** The SVGs recolored at the last flush. */
  let svgs = new Set<SVGElement>();

  /** Put back the page's paints, except those the page has replaced since. */
  const release = (el: SVGElement, { hadStyle, paints }: Override) => {
    for (const [paint, { via, value, priority, written }] of paints) {
      if (via === "attribute") {
        if (el.getAttribute(paint) !== written) continue;
        if (value === null) el.removeAttribute(paint);
        else el.setAttribute(paint, value);
        continue;
      }
      if (el.style.getPropertyValue(paint) !== written) continue;
      if (value) el.style.setProperty(paint, value, priority);
      else el.style.removeProperty(paint);
    }
    if (!hadStyle && el.getAttribute("style") === "") el.removeAttribute("style");
  };

  const mapFor = (filter: string) => {
    let map = maps.get(filter);
    if (!map) maps.set(filter, (map = recolorer(target, filter ? { ...settings, filter } : settings, "svgs")));
    return map;
  };
  const toTheme = ([r, g, b, a]: Rgba, filter: string) => {
    const key = `${filter}|${r} ${g} ${b} ${a}`;
    let color = mapped.get(key);
    if (!color) {
      const channels = mapFor(filter)(r / 255, g / 255, b / 255).map((v) =>
        Math.round(Math.min(1, Math.max(0, v)) * 255),
      );
      color = a === 1 ? `rgb(${channels.join(", ")})` : `rgba(${channels.join(", ")}, ${a})`;
      mapped.set(key, color);
    }
    return color;
  };

  const flush = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    if (disposed) return;
    // Read the page's own paints, so a theme is never mapped from the last one.
    for (const [el, override] of overrides) release(el, override);
    overrides.clear();
    for (const el of lifted) dropFilter(el, holder);
    lifted = [];

    svgs = new Set();
    if (off) {
      observer.takeRecords();
      return;
    }
    if (root instanceof SVGElement && root.matches(selector)) svgs.add(root);
    for (const el of root.querySelectorAll(selector)) if (el instanceof SVGElement) svgs.add(el);

    const node = root.getRootNode() as Document | ShadowRoot;
    const allRules = [...node.styleSheets, ...node.adoptedStyleSheets]
      .flatMap(rulesOf)
      .filter((rule) => rule.media.every((query) => query.matches));

    /** The paint an element declares, as the cascade picks it, and where it comes from. */
    const declared = (el: Element, paint: Paint, rules: Rule[]): [string, Source, boolean] => {
      const style = (el as SVGElement).style;
      const inline = style?.getPropertyValue(paint) ?? "";
      if (inline && style.getPropertyPriority(paint) === "important") return [inline, "style", true];
      let normal = "",
        important = "";
      for (const rule of rules)
        if (rule.paint === paint && matches(el, rule.selector))
          if (rule.important) important = rule.value;
          else normal = rule.value;
      if (important) return [important, "rule", true];
      if (inline) return [inline, "style", false];
      if (normal) return [normal, "rule", false];
      const attribute = el instanceof SVGElement ? el.getAttribute(paint) : null;
      return attribute ? [attribute, "attribute", false] : ["", "", false];
    };
    const following = new Map<string, Map<Element, boolean>>();
    /** Whether an element's paint follows CSS, by declaring it or inheriting it from an element that does. */
    const followsCss = (el: Element, paint: Paint, svg: SVGElement, rules: Rule[]): boolean => {
      let memo = following.get(paint);
      if (!memo) following.set(paint, (memo = new Map()));
      let result = memo.get(el);
      if (result !== undefined) return result;
      const [value] = declared(el, paint, svg.contains(el) ? rules : allRules);
      if (value && !inherited.test(value)) result = live.test(value);
      // stop-color isn't inherited: an undeclared stop is black.
      else if (paint === "stop-color" && !value) result = false;
      else result = el.parentElement ? followsCss(el.parentElement, paint, svg, rules) : false;
      memo.set(el, result);
      return result;
    };

    // Read every original before writing, since a mapped parent changes what its children compute.
    const writes: [SVGElement, Paint, Rgba, Source, boolean, string][] = [];
    const images: [SVGImageElement, string][] = [];
    const seen = new Set<Element>();
    const folded = new Map<Element, string>();
    for (const svg of svgs) {
      const filters = filtersOver(svg, (el) => svgs.has(el as SVGElement));
      reportStuck(reported, svg, filters.stuck);
      for (const { el, filter } of filters.folded) folded.set(el, filter);
      // Only rules that match something in this SVG can apply inside it.
      const rules = allRules.filter(
        ({ selector }) => matches(svg, selector) || svg.querySelector(selector) !== null,
      );
      for (const el of [svg, ...svg.querySelectorAll("*")]) {
        if (!(el instanceof SVGElement) || seen.has(el)) continue;
        seen.add(el);
        if (el instanceof SVGImageElement) {
          images.push([el, filters.key]);
          continue;
        }
        const paints: Paint[] = el instanceof SVGStopElement ? ["stop-color"] : ["fill", "stroke"];
        for (const paint of paints) {
          const [own, source, important] = declared(el, paint, rules);
          // Inherited paints follow their (mapped) parent, except at the SVG's edge.
          if ((!own || inherited.test(own)) && paint !== "stop-color" && !svgs.has(el)) continue;
          if (followsCss(el, paint, svg, rules)) continue;
          // `none`, `url(#…)` paint servers, and keywords don't parse as colors.
          const color = parseColor(getComputedStyle(el).getPropertyValue(paint));
          if (color && color[3] > 0) writes.push([el, paint, color, source, important, filters.key]);
        }
      }
    }
    const overrideOf = (el: SVGElement) => {
      let override = overrides.get(el);
      if (!override) overrides.set(el, (override = { hadStyle: el.hasAttribute("style"), paints: new Map() }));
      return override;
    };
    const setAttribute = (el: SVGElement, name: Written, value: string) => {
      overrideOf(el).paints.set(name, { via: "attribute", value: el.getAttribute(name), priority: "", written: value });
      el.setAttribute(name, value);
    };
    for (const [el, paint, color, source, important, filter] of writes) {
      const override = overrideOf(el);
      const value = toTheme(color, filter);
      // An inherited or default paint becomes the element's own, at the lowest precedence.
      if (source === "attribute" || source === "") {
        override.paints.set(paint, { via: "attribute", value: el.getAttribute(paint), priority: "", written: value });
        el.setAttribute(paint, value);
      } else {
        const original = el.style.getPropertyValue(paint);
        const priority = el.style.getPropertyPriority(paint);
        el.style.setProperty(paint, value, important ? "important" : "");
        override.paints.set(paint, { via: "style", value: original || null, priority, written: el.style.getPropertyValue(paint) });
      }
    }
    for (const [el, filter] of images) {
      // `href` wins over the older `xlink:href`.
      const href = el.getAttribute("href") ?? el.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      if (!href || unreadable.has(href)) continue;
      const id = `${filter}|${href}`;
      let copy = rasters.get(id);
      if (copy === undefined) rasters.set(id, (copy = render(el, href, filter, id)));
      const last = shown.get(el);
      const url = typeof copy === "string" ? copy : last?.href === href ? last.url : undefined;
      if (url) {
        shown.set(el, { href, url });
        setAttribute(el, "href", url);
      } else setAttribute(el, "visibility", "hidden");
    }
    for (const [el, filter] of folded) {
      liftFilter(el, holder, filter);
      lifted.push(el);
    }
    // Drop the records of this mount's own writes.
    observer.takeRecords();
  };

  /** Recolor a raster into a copy for the current theme, then show it at the next flush. */
  const render = (el: SVGImageElement, href: string, filter: string, id: string) => {
    // A theme update starts a new set of copies, and this one is no longer wanted.
    const copies = rasters;
    const promise = (async () => {
      const image = new Image();
      const url = new URL(href, el.baseURI);
      if (url.protocol !== "data:" && url.origin !== location.origin) image.crossOrigin = "anonymous";
      image.src = url.href;
      try {
        await image.decode();
        if (rasters !== copies) return;
        // A raster inside an SVG takes the theme's SVG settings, like the rest of the SVG.
        const canvas = recolorImage(image, { ...target, images: target.svgs }, filter ? { ...settings, filter } : settings);
        copies.set(id, canvas.toDataURL());
      } catch (error) {
        unreadable.add(href);
        reportError(
          new Error(
            `Huet couldn't read the raster <image> inside ${describe(el.ownerSVGElement ?? el)}, so it keeps its own colors. ` +
              "Cross-origin images need CORS headers.",
            { cause: error },
          ),
        );
      }
      schedule();
    })();
    pending.add(promise);
    void promise.finally(() => pending.delete(promise));
    return promise;
  };

  const schedule = () => {
    if (!disposed && frame === undefined) frame = requestAnimationFrame(flush);
  };

  /** Whether a mutation can change which SVGs are recolored or what their original paints are. */
  const relevant = ({ type, target, attributeName, addedNodes, removedNodes }: MutationRecord) => {
    if (!(target instanceof Element)) return false;
    const inside = target.closest(selector) !== null;
    if (type === "attributes") {
      // Any attribute might be what the selector matches on, so it can opt an SVG in or out.
      if (svgs.has(target as SVGElement) || target.matches(selector)) return true;
      if (inside) return paintAttributes.has(attributeName!);
      // An ancestor's class can change what an SVG inherits.
      return attributeName === "class" && target.querySelector(selector) !== null;
    }
    if (inside) return true;
    for (const node of [...addedNodes, ...removedNodes])
      if (node instanceof Element && (node.matches(selector) || node.querySelector(selector) !== null))
        return true;
    return false;
  };
  const observer = new MutationObserver((records) => {
    if (records.some(relevant)) schedule();
  });
  observer.observe(root, { subtree: true, childList: true, attributes: true });
  flush();

  return {
    /** Recolor every SVG into a new theme, optionally with new options, at the next frame. */
    update(next: Theme, nextOptions?: RecolorOptions) {
      if (disposed) throw new Error("Cannot update a destroyed Huet SVG mount");
      if (nextOptions) settings = nextOptions;
      recolorer(next, settings, "svgs");
      target = next;
      maps = new Map();
      off = next.svgs?.strength === 0;
      mapped = new Map();
      rasters = new Map();
      schedule();
    },
    /** Resolves once pending updates and DOM changes are recolored, without waiting for a frame. */
    async ready() {
      if (disposed) return;
      if (frame !== undefined || observer.takeRecords().some(relevant)) flush();
      // Rasters render after the flush that found them; show them once they're ready.
      while (pending.size && !disposed) {
        await Promise.all(pending);
        flush();
      }
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer.disconnect();
      for (const [el, override] of overrides) release(el, override);
      overrides.clear();
      for (const el of lifted) dropFilter(el, holder);
      lifted = [];
      svgs.clear();
    },
  };
}
