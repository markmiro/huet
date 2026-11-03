import { fromLightness, fromOklab, lightness, toOklab } from "../../../packages/huet/src/core/color";

/*
  Fur for one element, drawn on a 2D canvas behind its label, in the color
  set by the element's `--fur-color`: a little darker in the shadows and
  between hairs, lighter where the light catches the tips.

  Cost: an element is a cached frame until it's hovered. Only the hovered
  element animates, so the live budget is one element at a time.
*/

/** How far, in CSS px, the fur can reach past the element's box, at a `--fur-scale` of 1. */
const halo = 32;
/** Lightness steps in the palette, and in the sheen's. */
const levels = 24;
const sheenLevels = 4;
/** Curves for the poof's rise and fall, from 0 to 1. Some overshoot, then come back. */
export const eases = {
  linear: (t: number) => t,
  /** Speeds up steadily, like something dropping. */
  gravity: (t: number) => t * t,
  "ease-in": (t: number) => t ** 3,
  "ease-out": (t: number) => 1 - (1 - t) ** 3,
  "ease-in-out": (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  "back-out": (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  "elastic-out": (t: number) =>
    t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin(((10 * t - 0.75) * 2 * Math.PI) / 3) + 1,
};
export type Ease = keyof typeof eases;
/** Where along `ease` (0–1) the curve first reaches `f`, by bisection. */
function easeInverse(ease: (t: number) => number, f: number) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < f) lo = mid;
    else hi = mid;
  }
  return hi;
}

/**
 * Every fur on the page shares these. Change them, then call `refreshFur`
 * (or `regrowFur` for the ones marked "regrows", which change the hairs
 * themselves).
 */
export const settings = {
  /** Palette: where its middle sits (L*, 0–1, from the color), how far it reaches below and above that. */
  shift: -0.25,
  darker: 0.32,
  lighter: 0.21,
  /** Chroma relative to the color. */
  saturation: 2.2,
  /** Hairs per area (regrows). */
  density: 1.65,
  /** Hair length (regrows). */
  length: 0.8,
  thickness: 0.75,
  /** How much hairs curl (regrows). */
  curl: 0.95,
  /** How much hairs droop under their weight. */
  droop: 0.4,
  /** How much hair lengths vary, 0 all the same (regrows). */
  lengthVariation: 1,
  /** How much hair directions vary from the combed flow (regrows). */
  messiness: 1,
  /** How far hairs along the outline lean out, making the fuzzy edge (regrows). */
  fuzz: 2,
  /** Tip width relative to the root. */
  taper: 0.31,
  /** How many hairs catch the light (regrows). */
  sheen: 0.9,
  /** How far the hairs stand at rest, with no hover: 0 is combed flat, 1 standing up. */
  static: 0,
  /** How much further the hairs stand when hovered, on top of `static` (up to 1). */
  hover: 0.35,
  /** The hover spring: how fast it moves (rad/s) and its damping ratio (lower bounces more, 1 doesn't overshoot). */
  hoverSpeed: 22,
  hoverDamping: 0.9,
  /**
   * Hovering out (without a click playing): the fur falls at `leaveFallSpeed`
   * along `leaveEase`, then lands and wobbles out like
   * e^(−settle·t)·cos(bounce·t).
   */
  leaveFallSpeed: 1.55,
  leaveEase: "gravity" as Ease,
  leaveSettle: 1.4,
  leaveBounce: 5.5,
  /** How much the hairs sway while hovered. */
  sway: 0.05,
  /**
   * How much longer the hairs grow as they rise to the hover lift: 0.5 makes
   * them half as long again (regrows, to make room).
   */
  hoverStretch: 0,
  /**
   * A click poofs the fur up by `poofHeight` over `poofRise` seconds, hangs
   * there for `poofHold` seconds, then falls at `poofFallSpeed` back to
   * where it rests (hovered, or flat if the pointer has left). It lands with
   * whatever speed the fall curve ends with, overshoots, and wobbles out like
   * e^(−settle·t)·cos(bounce·t).
   */
  poofHeight: 0.53,
  /** How much longer still the hairs grow at the top of a click, on top of `hoverStretch` (regrows). */
  clickStretch: 0,
  poofRise: 0.13,
  poofSettle: 3.1,
  poofBounce: 15,
  /** The curve of the poof's rise. */
  poofEase: "ease-out" as Ease,
  /** Seconds the fur hangs at the top of the poof. */
  poofHold: 0,
  /**
   * How fast the fall back down goes, and its curve. Speeds are in lift per
   * second: a full drop from upright (1) to flat (0) takes 1 ÷ speed seconds,
   * and a shorter drop takes proportionally less.
   */
  poofFallSpeed: 1.45,
  poofFallEase: "gravity" as Ease,
  /** How much the poof ripples out from the click point; 0 lifts all hairs at once. */
  wave: 0.3,
  /** How strongly the pointer brushes the hairs. */
  brush: 1.05,
  /** How brushed hairs spring back: speed (rad/s) and damping ratio (lower bounces more). */
  brushSpeed: 6,
  brushDamping: 0.32,
};
export type FurSettings = typeof settings;
export type EaseSetting = "poofEase" | "poofFallEase" | "leaveEase";
export type NumericSetting = { [K in keyof FurSettings]: FurSettings[K] extends number ? K : never }[keyof FurSettings];
export const defaultSettings: Readonly<FurSettings> = { ...settings };
/** Named starting points for the settings. The first is the default. */
export const presets: Record<string, Readonly<FurSettings>> = {
  /** Dense, short, neat fur with a springy click. */
  Plush: defaultSettings,
  /** Thin, long, curly, droopy hair with lots of shine and a softer click. */
  Shaggy: {
    ...defaultSettings,
    shift: -0.13,
    darker: 0.35,
    lighter: 0.12,
    saturation: 2.2,
    density: 1.25,
    length: 0.95,
    thickness: 0.3,
    curl: 1.7,
    droop: 2.05,
    lengthVariation: 1.4,
    messiness: 2.3,
    fuzz: 2,
    taper: 1,
    sheen: 2.2,
    hover: 0.34,
    hoverSpeed: 7.5,
    hoverDamping: 0.5,
    leaveFallSpeed: 1.15,
    leaveEase: "gravity",
    leaveSettle: 1.4,
    leaveBounce: 5.5,
    sway: 0.05,
    poofHeight: 0.19,
    poofRise: 0.16,
    poofSettle: 2.5,
    poofBounce: 7.5,
    poofEase: "ease-in-out",
    poofHold: 0.06,
    poofFallSpeed: 0.9,
    poofFallEase: "gravity",
    wave: 0.3,
    brush: 1.05,
    brushSpeed: 4.5,
    brushDamping: 0.32,
  },
  /** Short, thick, straight, matte fur in rich color, with a bouncy hover. */
  Teddy: {
    ...defaultSettings,
    shift: -0.11,
    darker: 0.36,
    lighter: 0.21,
    saturation: 3,
    density: 1.5,
    length: 0.4,
    thickness: 1.4,
    curl: 0.35,
    droop: 0.4,
    lengthVariation: 1,
    messiness: 0.45,
    fuzz: 1.8,
    taper: 0.31,
    sheen: 0,
    hover: 0.34,
    hoverSpeed: 22,
    hoverDamping: 0.25,
    leaveFallSpeed: 1.3,
    leaveEase: "gravity",
    leaveSettle: 2,
    leaveBounce: 3,
    sway: 0.14,
    poofHeight: 0.37,
    poofRise: 0.07,
    poofSettle: 3.1,
    poofBounce: 15,
    poofEase: "ease-out",
    poofHold: 0,
    poofFallSpeed: 1.45,
    poofFallEase: "gravity",
    wave: 0.3,
    brush: 1.05,
    brushSpeed: 6,
    brushDamping: 0.32,
  },
  /** Sparse, thick, straight, glossy strands that stand out messily. */
  Bristle: {
    ...defaultSettings,
    shift: -0.11,
    darker: 0.36,
    lighter: 0.12,
    saturation: 3,
    density: 0.8,
    length: 0.4,
    thickness: 2.05,
    curl: 0.25,
    droop: 0,
    lengthVariation: 1,
    messiness: 2.5,
    fuzz: 0,
    taper: 0.58,
    sheen: 2.7,
    hover: 0.34,
    hoverSpeed: 22,
    hoverDamping: 0.45,
    leaveFallSpeed: 1.3,
    leaveEase: "gravity",
    leaveSettle: 2,
    leaveBounce: 3,
    sway: 0.14,
    poofHeight: 0.29,
    poofRise: 0.15,
    poofSettle: 3.1,
    poofBounce: 15,
    poofEase: "ease-out",
    poofHold: 0,
    poofFallSpeed: 1.35,
    poofFallEase: "gravity",
    wave: 0.3,
    brush: 1.05,
    brushSpeed: 6,
    brushDamping: 0.32,
  },
};


const mounted = new Set<{ refresh: () => void; regrow: () => void }>();
/** Redraws every fur with the current settings. */
export function refreshFur() {
  for (const fur of mounted) fur.refresh();
}
/** Grows every fur's hairs again, for settings that change the hairs themselves. */
export function regrowFur() {
  for (const fur of mounted) fur.regrow();
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

// Reads any CSS color as hex by drawing it.
const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
function hexOf(css: string) {
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * The color's hue at L* `L` (0–1), with `saturation` times its chroma around
 * `middle`. Shadows get slightly more chroma, as color pools in the shade, and
 * highlights keep nearly all of it, so the light doesn't wash the fur out.
 * Yellows warm toward orange in the shade instead of going olive, as yellow
 * fur does. Colors past sRGB lose chroma to fit.
 */
function shadeOf(color: string, L: number, middle: number, saturation: number) {
  const [, a, b] = toOklab(color);
  const depth = clamp((middle - L) / 0.2, 0, 1);
  const k = saturation * (L < middle ? 1 + 0.6 * (middle - L) : 1);
  let hue = Math.atan2(b, a);
  const degrees = (hue * 180) / Math.PI;
  if (degrees > 60 && degrees < 125) hue -= ((22 * Math.PI) / 180) * depth * smoothstep(125, 95, degrees);
  const chroma = Math.hypot(a, b) * k;
  return fromOklab([fromLightness(clamp(L, 0, 1)), chroma * Math.cos(hue), chroma * Math.sin(hue)]);
}

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

interface Strands {
  n: number;
  x: Float32Array; y: Float32Array;
  /** Unit direction the hair lies in at rest, and how far it leans out of the outline. */
  restX: Float32Array; restY: Float32Array; leanX: Float32Array; leanY: Float32Array;
  /** Unit direction it stands toward: out of the outline, or (in the middle) toward the viewer. */
  standX: Float32Array; standY: Float32Array;
  len: Float32Array; curl: Float32Array; phase: Float32Array;
  rim: Float32Array; delay: Float32Array;
  /** How far the pointer has brushed each hair, and how fast that's changing. */
  bendX: Float32Array; bendY: Float32Array; bendVX: Float32Array; bendVY: Float32Array;
  /** Each frame's curve per hair: root, then the cubic's three points. */
  curve: Float32Array;
  /** Hair indices by palette level, underfur first, then the longer guard hairs. */
  groups: Uint32Array[][];
  /** A few light hairs that catch the light, by sheen level, drawn last. */
  sheen: Uint32Array[];
}

/**
 * Grows hairs over a w × h rounded rectangle, offset by `pad` for the canvas
 * margin. At a `scale` of 2 the hairs are twice as long and thick, and there
 * are fewer per area, so each one shows.
 */
function grow(w: number, h: number, radius: number, seed: number, scale: number, pad: number): Strands {
  const random = rng(seed);
  const cx = w / 2, cy = h / 2, r = Math.min(radius, w / 2, h / 2);
  // Signed distance to the rounded rectangle: negative inside.
  const sdf = (x: number, y: number) => {
    const qx = Math.abs(x - cx) - (w / 2 - r), qy = Math.abs(y - cy) - (h / 2 - r);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  const max = Math.round(((w * h) / scale ** 1.6 + ((w + h) * 7) / scale) * settings.density);
  const f = () => new Float32Array(max);
  const s = {
    x: f(), y: f(), restX: f(), restY: f(), leanX: f(), leanY: f(), standX: f(), standY: f(),
    len: f(), curl: f(), phase: f(), rim: f(), delay: f(),
    bendX: f(), bendY: f(), bendVX: f(), bendVY: f(), curve: new Float32Array(max * 8),
  };
  const lists: number[][][] = [0, 1].map(() => Array.from({ length: levels }, () => []));
  const sheen: number[][] = Array.from({ length: sheenLevels }, () => []);
  let n = 0;
  for (let tries = 0; n < max && tries < max * 4; tries++) {
    const x = random() * (w + 4) - 2, y = random() * (h + 4) - 2;
    const d = sdf(x, y);
    if (d > 0.5) continue;
    const rim = smoothstep(-9 * scale, 0, d);
    // Denser along the outline, where the fuzz shows.
    if (random() > 0.4 + 0.6 * rim) continue;
    const gx = sdf(x + 0.5, y) - sdf(x - 0.5, y), gy = sdf(x, y + 0.5) - sdf(x, y - 0.5);
    const g = Math.hypot(gx, gy) || 1;
    const outX = gx / g, outY = gy / g;
    // Hairs lie along the surface, combed away from the middle and down: the
    // part of "outward and down" that runs along the surface. On top they flow
    // sideways, on the ends and bottom they hang, and in the top middle they
    // lie down rather than stand up. Mirrored across the middle.
    const fromX = x - cx, fromY = y - cy;
    const side = Math.tanh(fromX / (12 * scale));
    const wantX = side * 0.6, wantY = 1;
    const along = wantX * outX + wantY * outY;
    let ax = (wantX - along * outX) * 1.4;
    let ay = (wantY - along * outY) * 1.4 + 0.3;
    const al = Math.hypot(ax, ay) || 1;
    ax /= al; ay /= al;
    const swirl = side * 0.2 * Math.sin((Math.abs(fromX) * 0.05 + y * 0.035) / scale) + 0.5 * settings.messiness * (random() - 0.5);
    s.restX[n] = ax * Math.cos(swirl) - ay * Math.sin(swirl);
    s.restY[n] = ax * Math.sin(swirl) + ay * Math.cos(swirl);
    // Outline hairs lean out a little to make the fuzzy edge; least on top, so it doesn't bristle.
    const lean = 0.32 * settings.fuzz * rim * (0.25 + 0.75 * smoothstep(-1, 0.2, outY));
    s.leanX[n] = outX * lean; s.leanY[n] = outY * lean;
    const stand = random() * Math.PI * 2;
    const guard = random() < 0.3 + 0.3 * rim ? 1 : 0;
    s.x[n] = x + pad; s.y[n] = y + pad;
    s.standX[n] = outX * rim + Math.cos(stand) * (1 - rim);
    s.standY[n] = outY * rim + Math.sin(stand) * (1 - rim);
    // Average length, plus a random part scaled by `lengthVariation`.
    const vary = (spread: number) => (random() - 0.5) * spread * settings.lengthVariation;
    const base = (guard ? 9.5 + vary(5) : 5.5 + vary(3)) + rim * (4 + vary(4));
    s.len[n] = Math.max(1, base) * scale * settings.length;
    s.curl[n] = (random() * 2 - 1) * (guard ? 0.9 : 0.6) * settings.curl;
    s.phase[n] = random() * Math.PI * 2;
    s.rim[n] = rim;
    // Soft light from above: a little lighter on top, a little darker
    // underneath and toward the ends. Guard hairs catch slightly more of it.
    const px = fromX / (w / 2), py = fromY / (h / 2);
    const occlusion = rim * Math.max(0, py) * 0.15;
    const shade = clamp(0.6 - 0.18 * py - 0.06 * px * px - occlusion + (random() - 0.5) * 0.32 + (guard ? 0.06 : -0.08), 0, 1);
    // Sheen: a few hairs catch the light, most in a soft band across the upper
    // part where the light falls, and some along the top edge.
    const band = Math.exp(-((py + 0.4) ** 2) / 0.12);
    const shine = (0.14 * band + 0.04 * smoothstep(0.4, -0.9, py) * rim) * settings.sheen;
    if (random() < shine) sheen[Math.floor(random() * sheenLevels)].push(n);
    else lists[guard][Math.round(shade * (levels - 1))].push(n);
    n++;
  }
  return {
    n, ...s,
    groups: lists.map((gs) => gs.map((list) => Uint32Array.from(list))),
    sheen: sheen.map((list) => Uint32Array.from(list)),
  };
}

export function mountFur(button: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.className = "fur-canvas";
  canvas.setAttribute("aria-hidden", "true");
  button.prepend(canvas);
  const ctx = canvas.getContext("2d")!;

  // `--fur-scale` sizes the hairs; `pad` is the canvas margin they can reach into.
  let scale = 1, pad = halo;
  let w = 0, h = 0, radius = 0, dpr = 1;
  let strands: Strands | null = null;
  let palette: string[] = [], sheenPalette: string[] = [];
  let undercoat: [string, string] = ["#000", "#000"];
  // Spring state: `lift` 0 is combed flat, 1 is standing up.
  let lift = clamp(settings.static, 0, 1), velocity = 0, target = lift, hovering = false;
  // A click's poof: which stage it's in and for how long, where the rise
  // started and peaks, and whether the landing uses the poof's bounce.
  let stage: "rise" | "hold" | "fall" | "leave" | null = null, stageTime = 0;
  let riseFrom = 0, risePeak = 0, leaveFrom = 0;
  // The rest a fall is heading for; when it changes mid-fall, the fall carries on from where it is.
  let fallTarget = NaN;
  // Which spring settles the fur: hovering in, a click's landing, or hovering out's landing.
  let spring: "hover" | "click" | "leave" = "hover";
  let pointerX = -1e3, pointerY = -1e3, brushing = 0;
  let frame = 0, last = 0, time = 0;

  const seed = [...(button.textContent ?? "")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

  function readColors() {
    const style = getComputedStyle(button);
    // The button's color, even once its flat background is hidden.
    const surface = hexOf(style.getPropertyValue("--fur-color").trim() || style.backgroundColor);
    const Ls = lightness(surface);
    const middle = clamp(Ls + settings.shift, 0.05, 0.95);
    const low = Math.max(0.02, middle - settings.darker), high = Math.min(0.97, middle + settings.lighter);
    // Level 0.6 of the way up is the middle, so most of the fur reads as the button's color.
    const at = (u: number) => (u < 0.6 ? middle - ((0.6 - u) / 0.6) * (middle - low) : middle + ((u - 0.6) / 0.4) * (high - middle));
    const color = (u: number) => shadeOf(surface, at(u), middle, settings.saturation);
    palette = Array.from({ length: levels }, (_, i) => color(i / (levels - 1)));
    undercoat = [color(0.46), color(0.3)];
    // Sheen: lighter than the brightest fur, with some of its color, so it reads as light on the hair.
    sheenPalette = Array.from({ length: sheenLevels }, (_, i) =>
      shadeOf(surface, Math.min(0.97, high + 0.03 + 0.02 * i), middle, settings.saturation * 0.8));
    button.toggleAttribute("data-fur-ready", true);
  }

  function layout() {
    const b = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    w = b.width; h = b.height;
    scale = parseFloat(style.getPropertyValue("--fur-scale")) || 1;
    // Room for the hairs at their longest, stretched by hovering and clicking.
    pad = Math.round(halo * scale * (1 + Math.max(0, settings.hoverStretch) + Math.max(0, settings.clickStretch)));
    Object.assign(canvas.style, { inset: `-${pad}px`, width: `calc(100% + ${pad * 2}px)`, height: `calc(100% + ${pad * 2}px)` });
    radius = parseFloat(style.borderTopLeftRadius) || 0;
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round((w + pad * 2) * dpr);
    canvas.height = Math.round((h + pad * 2) * dpr);
    strands = grow(w, h, radius, seed, scale, pad);
  }

  /** Works out every hair's curve for this frame into `strands.curve`. */
  function shape(s: Strands) {
    const c = s.curve;
    // Below 0 (a bounce swinging past rest), the hairs press flatter than they lie.
    const up = Math.max(-0.5, lift);
    const sway = reduceMotion.matches ? 0 : settings.sway * Math.min(1, Math.abs(up) * 3);
    const near = 2 * (22 * scale) ** 2;
    // The wave only spreads the motion away from the static lift, so at rest every hair stands the same.
    const base = clamp(settings.static, 0, 1), moved = up - base;
    // Stretch: hovering stretches hairs as they rise from rest to the hover
    // lift; a click stretches them further as they rise above it to its peak.
    // Without a click, a hover overshoot stretches a little past the hover amount.
    const hoverTop = Math.min(1, base + settings.hover);
    const clickTop = Math.min(1, hoverTop + settings.poofHeight);
    const clicking = stage === "rise" || stage === "hold" || stage === "fall" || spring === "click";
    const stretchAt = (l: number) => {
      const hovered = hoverTop - base > 1e-3 ? (l - base) / (hoverTop - base) : 0;
      if (!clicking) return settings.hoverStretch * clamp(hovered, 0, 1.3);
      const clicked = clickTop - hoverTop > 1e-3 ? (l - hoverTop) / (clickTop - hoverTop) : 0;
      return settings.hoverStretch * clamp(hovered, 0, 1) + settings.clickStretch * clamp(clicked, 0, 1.2);
    };
    for (let i = 0; i < s.n; i++) {
      const dx = s.x[i] - pointerX, dy = s.y[i] - pointerY;
      // A wave from where the pointer came in (or clicked), and a little more right under it.
      let l = clamp(base + moved * (1 + settings.wave) - s.delay[i] * settings.wave * moved, -0.5, 1.2);
      if (hovering) l += 0.12 * Math.exp(-(dx * dx + dy * dy) / near);
      const L = Math.min(1, l);
      const a = sway * Math.sin(time * 2.2 + s.phase[i]);
      let tx = (s.restX[i] + s.leanX[i]) * (1 - L) + s.standX[i] * L + s.bendX[i] - s.restY[i] * a;
      let ty = (s.restY[i] + s.leanY[i]) * (1 - L) + s.standY[i] * L + s.bendY[i] + s.restX[i] * a;
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl; ty /= tl;
      const r = s.rim[i];
      // Outline hairs reach out as they stand; middle ones point at you, so they look shorter.
      const len = s.len[i] * (1 + stretchAt(l)) * (1 + r * 0.3 * l - (1 - r) * 0.35 * L);
      const curl = s.curl[i] * (1 - 0.5 * L);
      // Hairs droop under their weight until they stand.
      const droop = 0.2 * settings.droop * (1 - L) * len;
      const px = -ty, py = tx;
      const x0 = s.x[i], y0 = s.y[i], k = i * 8;
      c[k] = x0; c[k + 1] = y0;
      c[k + 2] = x0 + tx * len * 0.34;
      c[k + 3] = y0 + ty * len * 0.34;
      c[k + 4] = x0 + tx * len * 0.68 + px * curl * len * 0.3;
      c[k + 5] = y0 + ty * len * 0.68 + py * curl * len * 0.3 + droop * 0.4;
      c[k + 6] = x0 + tx * len * 0.92 + px * curl * len * 0.55;
      c[k + 7] = y0 + ty * len * 0.92 + py * curl * len * 0.55 + droop;
    }
  }

  /** Strokes every hair: a darker, thicker root half, then a thin, lighter tip. */
  function strokeHairs(s: Strands) {
    const c = s.curve, t = 0.5, top = levels - 1;
    for (let pass = 0; pass < 2; pass++) {
      for (let g = 0; g < 2; g++) {
        s.groups[g].forEach((group, level) => {
          if (!group.length) return;
          if (pass === 0) {
            ctx.strokeStyle = palette[Math.max(0, level - 1)];
            ctx.lineWidth = (g ? 1.1 : 0.95) * scale * settings.thickness;
            ctx.globalAlpha = 1;
          } else {
            ctx.strokeStyle = palette[Math.min(top, level + 1)];
            ctx.lineWidth = (g ? 1.1 : 0.95) * settings.taper * scale * settings.thickness;
            ctx.globalAlpha = 0.75;
          }
          ctx.beginPath();
          for (const i of group) {
            const k = i * 8;
            const x0 = c[k], y0 = c[k + 1], x1 = c[k + 2], y1 = c[k + 3];
            const x2 = c[k + 4], y2 = c[k + 5], x3 = c[k + 6], y3 = c[k + 7];
            // de Casteljau split at t.
            const ax = x0 + (x1 - x0) * t, ay = y0 + (y1 - y0) * t;
            const bx = x1 + (x2 - x1) * t, by = y1 + (y2 - y1) * t;
            const ex = x2 + (x3 - x2) * t, ey = y2 + (y3 - y2) * t;
            const fx = ax + (bx - ax) * t, fy = ay + (by - ay) * t;
            const gx = bx + (ex - bx) * t, gy = by + (ey - by) * t;
            const mx = fx + (gx - fx) * t, my = fy + (gy - fy) * t;
            if (pass === 0) {
              ctx.moveTo(x0, y0);
              ctx.bezierCurveTo(ax, ay, fx, fy, mx, my);
            } else {
              ctx.moveTo(mx, my);
              ctx.bezierCurveTo(gx, gy, ex, ey, x3, y3);
            }
          }
          ctx.stroke();
        });
      }
    }
    ctx.globalAlpha = 1;
  }

  /** Strokes the sheen hairs: thin and translucent, so they read as light catching the fur. */
  function strokeSheen(s: Strands) {
    const c = s.curve;
    ctx.lineWidth = 0.7 * scale * settings.thickness;
    ctx.globalAlpha = 0.35;
    s.sheen.forEach((group, level) => {
      if (!group.length) return;
      ctx.strokeStyle = sheenPalette[level];
      ctx.beginPath();
      for (const i of group) {
        const k = i * 8;
        ctx.moveTo(c[k], c[k + 1]);
        ctx.bezierCurveTo(c[k + 2], c[k + 3], c[k + 4], c[k + 5], c[k + 6], c[k + 7]);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!strands || !palette.length) return;
    const s = strands;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w + pad * 2, h + pad * 2);
    // A soft shadow on the page underneath, so the fur sits on it.
    ctx.filter = `blur(${9 * scale}px)`;
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.beginPath();
    ctx.ellipse(pad + w / 2, pad + h - scale, w * 0.46, Math.min(10 * scale, h * 0.2), 0, 0, Math.PI * 2);
    ctx.fill();
    // The undercoat: the shade deep in the fur, between the hairs.
    const rr = Math.min(radius, w / 2, h / 2), inset = 3 * scale;
    const depth = ctx.createLinearGradient(0, pad, 0, pad + h);
    depth.addColorStop(0, undercoat[0]);
    depth.addColorStop(1, undercoat[1]);
    ctx.fillStyle = depth;
    ctx.filter = `blur(${2.5 * scale}px)`;
    ctx.beginPath();
    ctx.roundRect(pad + inset, pad + inset, w - inset * 2, h - inset * 2, Math.max(0, rr - inset));
    ctx.fill();
    ctx.filter = "none";
    ctx.lineCap = "round";
    shape(s);
    strokeHairs(s);
    strokeSheen(s);
  }

  /** Springs each brushed hair back toward where it lies; returns whether any is still moving. */
  function relax(dt: number) {
    if (!strands || brushing <= 0) return false;
    const s = strands;
    // Springy, so brushed hair bounces back up rather than lying flat like wet fur.
    const k = settings.brushSpeed ** 2, damping = 2 * settings.brushSpeed * settings.brushDamping;
    let moving = 0;
    for (let i = 0; i < s.n; i++) {
      let bx = s.bendX[i], by = s.bendY[i], vx = s.bendVX[i], vy = s.bendVY[i];
      if (bx === 0 && by === 0 && vx === 0 && vy === 0) continue;
      vx += (-k * bx - damping * vx) * dt;
      vy += (-k * by - damping * vy) * dt;
      bx += vx * dt;
      by += vy * dt;
      if (Math.abs(bx) + Math.abs(by) + Math.abs(vx) + Math.abs(vy) < 0.002) bx = by = vx = vy = 0;
      else moving++;
      s.bendX[i] = bx; s.bendY[i] = by; s.bendVX[i] = vx; s.bendVY[i] = vy;
    }
    brushing = moving;
    return moving > 0;
  }

  function tick(now: number) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    time += dt;
    if (reduceMotion.matches) {
      lift = target;
      velocity = 0;
      stage = null;
    } else if (stage === "rise") {
      // Up to the peak, along the rise curve.
      stageTime += dt;
      const duration = Math.max(0.01, settings.poofRise);
      const ease = eases[settings.poofEase] ?? eases["ease-out"];
      const u = Math.min(1, stageTime / duration);
      lift = riseFrom + (risePeak - riseFrom) * ease(u);
      velocity = 0;
      if (u >= 1) {
        stage = "hold";
        stageTime = 0;
      }
    } else if (stage === "hold") {
      // Hang at the top.
      stageTime += dt;
      lift = risePeak;
      velocity = 0;
      if (stageTime >= settings.poofHold) {
        stage = "fall";
        stageTime = 0;
        fallTarget = NaN;
      }
    } else if (stage === "fall" || stage === "leave") {
      // Down to where the fur rests now, along the fall curve: a click's fall
      // from its peak, or hovering out from wherever the fur was. The fall
      // keeps the same speed however far it goes, so a long drop (to flat)
      // takes longer than a short one (back to hovering).
      const click = stage === "fall";
      const from = click ? risePeak : leaveFrom;
      const speed = Math.max(0.05, click ? settings.poofFallSpeed : settings.leaveFallSpeed);
      const ease = eases[click ? settings.poofFallEase : settings.leaveEase] ?? eases.gravity;
      const duration = Math.max(0.01, Math.abs(target - from) / speed);
      if (target !== fallTarget) {
        // Just started, or the rest changed mid-fall (the pointer left or came
        // back): carry on from where the fur is now, at the same speed.
        const f = Math.abs(target - from) < 1e-6 ? 1 : clamp((lift - from) / (target - from), 0, 1);
        stageTime = easeInverse(ease, f) * duration;
        fallTarget = target;
      }
      stageTime += dt;
      const u = Math.min(1, stageTime / duration);
      lift = from + (target - from) * ease(u);
      if (u >= 1) {
        stage = null;
        spring = click ? "click" : "leave";
        // Land with the curve's final speed, so a curve that ends moving
        // (like gravity) overshoots and bounces.
        velocity = ((target - from) * (ease(1) - ease(0.98))) / (0.02 * duration);
      } else velocity = 0;
    } else {
      // A landing wobbles with its own settle and bounce, even if the target
      // changes on the way (the pointer leaves). Hovering in uses the hover spring.
      let k: number, damping: number;
      if (spring === "hover") {
        const w = settings.hoverSpeed;
        k = w * w;
        damping = 2 * w * settings.hoverDamping;
      } else {
        const a = spring === "click" ? settings.poofSettle : settings.leaveSettle;
        const b = spring === "click" ? settings.poofBounce : settings.leaveBounce;
        k = a * a + b * b;
        damping = 2 * a;
      }
      // Small steps, so stiff springs stay stable at low frame rates.
      const steps = Math.ceil(dt * 240);
      for (let i = 0; i < steps; i++) {
        velocity += (k * (target - lift) - damping * velocity) * (dt / steps);
        lift += velocity * (dt / steps);
      }
    }
    const moving = relax(dt);
    draw();
    const settled = stage === null && Math.abs(target - lift) < 0.002 && Math.abs(velocity) < 0.002 && !moving;
    if (settled) spring = "hover";
    if (settled && (!hovering || reduceMotion.matches)) {
      lift = target;
      draw();
      frame = 0;
      last = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  const run = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const aim = () => {
    const rest = clamp(settings.static, 0, 1);
    target = hovering || button.matches(":focus-visible") ? Math.min(1, rest + settings.hover) : rest;
    run();
  };
  /** Plays the click poof, rippling out from (x, y) in canvas px, or from everywhere at once. */
  const startPoof = (x?: number, y?: number) => {
    if (reduceMotion.matches) return;
    if (strands && x !== undefined && y !== undefined) {
      const s = strands, span = Math.hypot(w, h);
      for (let i = 0; i < s.n; i++) s.delay[i] = Math.min(1, Math.hypot(s.x[i] - x, s.y[i] - y) / span);
    } else strands?.delay.fill(0);
    stage = "rise";
    stageTime = 0;
    riseFrom = lift;
    // Capped where the hairs look fully upright: higher would just hang there
    // unseen and make the visible part of the fall look sudden. Hang time
    // controls the pause instead.
    risePeak = Math.max(lift, Math.min(1, Math.max(lift, target) + settings.poofHeight));
    spring = "click";
    run();
  };

  let lastX = 0, lastY = 0;
  const local = (event: PointerEvent) => {
    const rect = button.getBoundingClientRect();
    pointerX = event.clientX - rect.left + pad;
    pointerY = event.clientY - rect.top + pad;
  };
  button.addEventListener("pointerenter", (event) => {
    local(event);
    lastX = pointerX; lastY = pointerY;
    if (strands) {
      // Hairs nearest the pointer stand first.
      const s = strands, span = Math.hypot(w, h);
      for (let i = 0; i < s.n; i++) s.delay[i] = Math.min(1, Math.hypot(s.x[i] - pointerX, s.y[i] - pointerY) / span);
    }
    hovering = true;
    // Coming back while hovering out: rise again with the hover spring.
    if (stage === "leave" || spring === "leave") {
      stage = null;
      spring = "hover";
    }
    aim();
  });
  // Brushing: hairs near the pointer are pushed the way it moves, then spring back.
  button.addEventListener("pointermove", (event) => {
    local(event);
    if (!strands || reduceMotion.matches) return;
    let mx = pointerX - lastX, my = pointerY - lastY;
    lastX = pointerX; lastY = pointerY;
    const speed = Math.hypot(mx, my);
    if (speed < 0.01) return;
    // A fast flick (like leaving quickly) shouldn't comb the fur flat.
    const most = 16 * scale;
    if (speed > most) { mx *= most / speed; my *= most / speed; }
    // Movement is measured relative to the hair size, so big fur brushes like small fur.
    mx /= scale; my /= scale;
    // While a click plays, brush only lightly, so its bounce shows.
    const clicking = stage === "rise" || stage === "hold" || stage === "fall" || spring === "click";
    const s = strands, reach = 34 * scale, push = 0.09 * settings.brush * (clicking ? 0.3 : 1);
    for (let i = 0; i < s.n; i++) {
      const dx = s.x[i] - pointerX, dy = s.y[i] - pointerY;
      const d2 = dx * dx + dy * dy;
      if (d2 > reach * reach * 4) continue;
      const f = Math.exp(-d2 / (2 * reach * reach)) * push;
      s.bendVX[i] += mx * f * 4;
      s.bendVY[i] += my * f * 4;
      const v = Math.hypot(s.bendVX[i], s.bendVY[i]);
      if (v > 8) { s.bendVX[i] *= 8 / v; s.bendVY[i] *= 8 / v; }
      // Keep a brushed hair from folding over completely.
      const b = Math.hypot(s.bendX[i], s.bendY[i]);
      if (b > 1.1) { s.bendX[i] *= 1.1 / b; s.bendY[i] *= 1.1 / b; }
    }
    brushing = 1;
    run();
  });
  button.addEventListener("pointerleave", () => {
    hovering = false;
    pointerX = pointerY = -1e3;
    aim();
    // A click plays out on its own (its fall heads for the new rest);
    // otherwise hovering out falls and lands with its own settings.
    if (stage === null && !reduceMotion.matches && Math.abs(lift - target) > 0.002) {
      stage = "leave";
      stageTime = 0;
      leaveFrom = lift;
      fallTarget = NaN;
    }
  });
  button.addEventListener("pointerdown", (event) => {
    local(event);
    startPoof(pointerX, pointerY);
  });
  button.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    startPoof();
  });
  button.addEventListener("focus", () => {
    if (!button.matches(":focus-visible") || hovering) return;
    strands?.delay.fill(0);
    aim();
  });
  button.addEventListener("blur", aim);

  const refresh = () => {
    readColors();
    draw();
    // Settings may have moved where the fur rests or hovers: spring there.
    aim();
  };
  const regrow = () => {
    layout();
    refresh();
  };
  new ResizeObserver(regrow).observe(button);
  const handle = { refresh, regrow };
  mounted.add(handle);
  return handle;
}
