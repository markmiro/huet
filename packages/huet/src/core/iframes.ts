import { overlay, type Overlay } from "./overlay";
import { recolorer, type RecolorOptions } from "./recolor";
import type { Theme } from "./theme";

/*
  A page can't read the pixels of another site's iframe, so iframes can't go
  through a theme's lookup table like images and videos. Browsers won't run an
  SVG `url()` filter over one either: Chromium paints a cross-origin iframe
  unfiltered. They do blend layers on top of it, though. Two layers, one that
  multiplies and one that screens, map each channel x to

    screen(x · m, s) = s + x · m · (1 − s)

  a straight line from s at black to s + m · (1 − s) at white. Choosing s and
  m from where the theme puts black and white lands both exactly, so an
  embed's background and text take on the theme's neutral ramp. Everything
  between is an approximation: midtones are off by however much the theme's
  mapping curves, and saturated colors move per channel instead of to the
  theme's hues, so a red stays red.
*/

export interface BlendLayers {
  /** The color of the layer with `mix-blend-mode: multiply`, painted first. */
  multiply: string;
  /** The color of the layer with `mix-blend-mode: screen`, painted over it. */
  screen: string;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const rgb = (channels: number[]) => `rgb(${channels.map((c) => Math.round(clamp(c) * 255)).join(" ")})`;

/**
 * The colors of two blend layers that move black and white to where `theme`
 * puts them, for content Huet can't read, such as another site's iframe.
 * Paint a `multiply` layer of the first color over the content, then a
 * `screen` layer of the second. `mountIframes` does this for you; this is for
 * CSS, including CSS generated at build time.
 *
 * A channel the theme makes darker at white than at black can't be drawn this
 * way, so it stays at the black end's value.
 */
export function blendLayers(theme: Theme, options: Pick<RecolorOptions, "source"> = {}): BlendLayers {
  const map = recolorer(theme, options);
  const black = map(0, 0, 0).map(clamp);
  const white = map(1, 1, 1).map(clamp);
  const multiply = white.map((w, i) => (black[i] < 1 ? clamp((w - black[i]) / (1 - black[i])) : 1));
  return { multiply: rgb(multiply), screen: rgb(black) };
}

export interface MountIframesOptions extends Pick<RecolorOptions, "source"> {
  /**
   * Which iframes to recolor. Defaults to `iframe[data-huet-recolor], [data-huet-recolor] iframe`:
   * marked iframes, and every iframe inside a marked element.
   */
  selector?: string;
  /** Show the original iframe while the pointer is over it, which is also when it's used. */
  hoverOriginal?: boolean;
}

interface Entry {
  layer: Overlay;
  layers: HTMLElement[];
  listeners: [string, EventListener][];
}

/**
 * Approximate a theme over matching `<iframe>` elements under `root`, with
 * the two blend layers from `blendLayers` laid over each iframe's content
 * box. Black and white land exactly where the theme puts them; midtones and
 * saturated colors only approximately (see `blendLayers`). The layers ignore
 * the pointer, so the iframe stays usable. Iframes added later are picked
 * up, and `destroy` removes the layers.
 *
 * The layers blend with whatever shows through the iframe, so an iframe with
 * a transparent background also shifts the page behind it. A theme
 * `contrast` below 1 doesn't fade iframes.
 */
export function mountIframes(
  root: ParentNode & Node,
  theme: Theme,
  options: MountIframesOptions = {},
) {
  const { selector = "iframe[data-huet-recolor], [data-huet-recolor] iframe", hoverOriginal = false, ...recolor } = options;
  let settings: Pick<RecolorOptions, "source"> = recolor,
    colors = blendLayers(theme, settings),
    disposed = false;
  const entries = new Map<HTMLIFrameElement, Entry>();

  const paint = (entry: Entry) => {
    entry.layers[0].style.background = colors.multiply;
    entry.layers[1].style.background = colors.screen;
  };

  const adopt = (iframe: HTMLIFrameElement) => {
    const layers = (["multiply", "screen"] as const).map((mode) => {
      const layer = document.createElement("div");
      layer.setAttribute("data-huet-iframe", mode);
      layer.style.mixBlendMode = mode;
      return layer;
    });
    const entry: Entry = { layer: overlay(iframe, layers), layers, listeners: [] };
    paint(entry);
    if (hoverOriginal) {
      const show = (shown: boolean) => () => {
        for (const layer of layers) layer.style.visibility = shown ? "" : "hidden";
      };
      entry.listeners.push(["pointerenter", show(false)], ["pointerleave", show(true)]);
      for (const [type, listener] of entry.listeners) iframe.addEventListener(type, listener);
    }
    iframe.setAttribute("data-huet-recolored", "");
    entries.set(iframe, entry);
  };
  const restore = (iframe: HTMLIFrameElement, entry: Entry) => {
    for (const [type, listener] of entry.listeners) iframe.removeEventListener(type, listener);
    entry.layer.remove();
    iframe.removeAttribute("data-huet-recolored");
    entries.delete(iframe);
  };

  const scan = () => {
    if (disposed) return;
    const found = new Set<HTMLIFrameElement>();
    if (root instanceof HTMLIFrameElement && root.matches(selector)) found.add(root);
    for (const iframe of root.querySelectorAll(selector))
      if (iframe instanceof HTMLIFrameElement) found.add(iframe);
    for (const [iframe, entry] of entries)
      if (!found.has(iframe)) restore(iframe, entry);
      // Moved iframes take their layers along.
      else if (iframe.nextSibling !== entry.layers[0]) entry.layer.place();
    for (const iframe of found) if (!entries.has(iframe)) adopt(iframe);
  };

  const observer = new MutationObserver(scan);
  scan();
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-huet-recolor"],
  });

  return {
    /** Move every iframe's layers to a new theme, optionally with new options. */
    update(next: Theme, nextOptions?: Pick<RecolorOptions, "source">) {
      if (disposed) throw new Error("Cannot update a destroyed Huet iframe mount");
      if (nextOptions) settings = nextOptions;
      colors = blendLayers(next, settings);
      for (const entry of entries.values()) paint(entry);
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      for (const [iframe, entry] of entries) restore(iframe, entry);
    },
  };
}
