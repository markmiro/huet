import chroma from "chroma-js";
import { useEffect, useReducer, useRef } from "react";

export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export type Hsv = { h: number; s: number; v: number };

/** HSV for a color. Grays have no hue, so they keep `previousHue`. */
export function toHsv(color: string, previousHue = 0): Hsv {
  const [h, s, v] = chroma(color).hsv();
  return { h: Number.isNaN(h) ? previousHue : h, s, v };
}

export const fromHsv = ({ h, s, v }: Hsv) => chroma.hsv(h, s, v).hex();

/**
 * The most OKLCH chroma that stays in sRGB at lightness `l` and hue `h`.
 * Saturation sliders work as a fraction of it, so every hue reaches its own
 * most vivid color at 100%.
 */
export function maxChroma(l: number, h: number) {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (chroma.oklch(l, mid, h).clipped()) hi = mid;
    else lo = mid;
  }
  return lo;
}

export type Lsh = { l: number; s: number; h: number };

/** OKLCH lightness, saturation (as a fraction of `maxChroma`) and hue. */
export function toLsh(color: string, previousHue = 0): Lsh {
  const [l, c, h] = chroma(color).oklch();
  const hue = Number.isNaN(h) ? previousHue : h;
  const max = maxChroma(l, hue);
  return { l, h: hue, s: max > 0 ? clamp01(c / max) : 0 };
}

export const fromLsh = ({ l, s, h }: Lsh) => chroma.oklch(l, s * maxChroma(l, h), h).hex();

/** A CSS gradient through `count + 1` samples of `color(t)` for t from 0 to 1. */
export function gradient(color: (t: number) => string, count = 12) {
  const stops = Array.from({ length: count + 1 }, (_, i) => color(i / count));
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

/**
 * Calls `fn` with the latest value at most once per frame. Each change
 * rebuilds the theme, and pointer drags can fire faster than the screen
 * refreshes.
 */
export function useFrameThrottle<T>(fn: (value: T) => void) {
  const latest = useRef({ fn, value: undefined as T, frame: undefined as number | undefined });
  latest.current.fn = fn;
  useEffect(() => () => cancelAnimationFrame(latest.current.frame ?? 0), []);
  return (value: T) => {
    latest.current.value = value;
    latest.current.frame ??= requestAnimationFrame(() => {
      latest.current.frame = undefined;
      latest.current.fn(latest.current.value);
    });
  };
}

/**
 * Local state for a color being dragged. It shows each pick right away, sends
 * the theme the latest one once per frame, and picks up outside changes (such
 * as Reset) without losing what a hex can't hold, like a gray's hue.
 */
export function useDraggedColor<S>(
  color: string,
  onChange: (color: string) => void,
  parse: (color: string, previous?: S) => S,
  format: (state: S) => string,
) {
  const state = useRef<{ value: S; prop: string; echoes: Set<string> }>(undefined);
  state.current ??= { value: parse(color), prop: color, echoes: new Set() };
  const current = state.current;
  if (color !== current.prop) {
    current.prop = color;
    // Our own pick coming back through the theme isn't an outside change
    if (current.echoes.has(color.toLowerCase())) current.echoes.delete(color.toLowerCase());
    else current.value = parse(color, current.value);
  }
  const send = useFrameThrottle((hex: string) => {
    current.echoes.add(hex.toLowerCase());
    if (current.echoes.size > 8) current.echoes.delete(current.echoes.values().next().value!);
    onChange(hex);
  });
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const set = (value: S) => {
    current.value = value;
    forceRender();
    send(format(value));
  };
  return [current.value, set] as const;
}
