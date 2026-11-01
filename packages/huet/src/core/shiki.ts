import { parseColorClass, type RelativeClass } from "./classes";
import { contrast, maxLchChroma, toLch, toOklab } from "./color";

/*
  A Shiki theme whose colors are Huet's per-surface CSS variables instead of
  hex values. Shiki writes `color: var(--huet-code-keyword, var(--huet-red))`
  into each token's inline style, so the highlighted HTML never changes:
  `mountTheme` (or serialized `themeVariables`) supplies the colors for the
  nearest Huet surface, and `update()` re-themes every block without touching
  the DOM. Token colors are Huet's semantic tokens, which are solved for
  readable contrast against the code block's own background.

  The scopes and their order follow GitHub's VS Code theme. Each scope maps to
  a role; override a role with `--huet-code-<role>` on the block or an ancestor.
*/

/** Token roles, each emitted as `var(--huet-code-<role>, <default>)`. */
export const codeRoles = {
  foreground: "var(--huet-foreground)",
  background: "var(--huet-background)",
  comment: "var(--huet-muted)",
  keyword: "var(--huet-red)",
  function: "var(--huet-purple)",
  constant: "var(--huet-blue)",
  // GitHub's strings are a deeper (light) or paler (dark) blue than its
  // constants. Mixing toward the foreground adds contrast in either polarity.
  string: "color-mix(in oklab, var(--huet-blue) 55%, var(--huet-foreground))",
  variable: "var(--huet-yellow)",
  tag: "var(--huet-green)",
  punctuation: "var(--huet-muted)",
  invalid: "var(--huet-red)",
  inserted: "var(--huet-green)",
  deleted: "var(--huet-red)",
  changed: "var(--huet-yellow)",
} as const;
export type CodeRole = keyof typeof codeRoles;

const color = (role: CodeRole) => `var(--huet-code-${role}, ${codeRoles[role]})`;

/**
 * Terminal colors for `ansi` blocks, each emitted as
 * `var(--huet-code-ansi-<name>, <default>)`. Without them Shiki falls back to
 * its own fixed palette, which ignores the theme. Huet has one color per hue
 * on a surface, so bright variants share their base color, and black and
 * white become muted and foreground text: readable in either polarity.
 */
export const ansiColors = {
  black: "var(--huet-muted)",
  red: "var(--huet-red)",
  green: "var(--huet-green)",
  yellow: "var(--huet-yellow)",
  blue: "var(--huet-blue)",
  magenta: "var(--huet-purple)",
  cyan: "color-mix(in oklab, var(--huet-blue), var(--huet-green))",
  white: "var(--huet-foreground)",
} as const;
export type AnsiColor = keyof typeof ansiColors;

/*
  Shiki accepts only hex for terminal colors. It swaps other values for
  placeholders by mutating the theme's `colors`, so a theme object highlighted
  twice (as Shiki's `codeToHtml` shorthand does) loses the mapping and renders the
  placeholders. Fixed hex sentinels, mapped back through the theme's own
  `colorReplacements` (which Shiki copies), survive any number of passes.
*/
const ansiKeys = Object.keys(ansiColors).flatMap((name) => {
  const key = name[0].toUpperCase() + name.slice(1);
  return [`terminal.ansi${key}`, `terminal.ansiBright${key}`];
});
function terminal(value: (key: string, name: AnsiColor) => string) {
  const colors: Record<string, string> = {};
  const colorReplacements: Record<string, string> = {};
  ansiKeys.forEach((key, i) => {
    const name = key.replace(/^terminal\.ansi(Bright)?/, "").toLowerCase() as AnsiColor;
    const sentinel = `#ffff${(i + 1).toString(16).padStart(4, "0")}`;
    colorReplacements[sentinel] = value(key, name);
    colors[key] = sentinel;
  });
  return { colors, colorReplacements };
}
const ansiRole = (name: AnsiColor) => `var(--huet-code-ansi-${name}, ${ansiColors[name]})`;

type FontStyle = "italic" | "bold" | "underline" | "strikethrough";
// In GitHub's order: equally specific scopes resolve to the later rule.
const rules: [scope: string[], role?: CodeRole, fontStyle?: FontStyle][] = [
  [["comment", "punctuation.definition.comment", "string.comment"], "comment"],
  [["constant", "entity.name.constant", "variable.other.constant", "variable.other.enummember", "variable.language"], "constant"],
  [["entity", "entity.name"], "function"],
  [["variable.parameter.function"], "foreground"],
  [["entity.name.tag"], "tag"],
  [["keyword", "storage", "storage.type"], "keyword"],
  [["storage.modifier.package", "storage.modifier.import", "storage.type.java"], "foreground"],
  [["string", "punctuation.definition.string", "string punctuation.section.embedded source"], "string"],
  [["support", "meta.property-name"], "constant"],
  [["variable"], "variable"],
  [["variable.other"], "foreground"],
  [["invalid.broken", "invalid.deprecated", "invalid.illegal", "invalid.unimplemented"], "invalid", "italic"],
  [["message.error"], "invalid"],
  [["string variable"], "constant"],
  [["source.regexp", "string.regexp", "string.regexp.character-class", "string.regexp constant.character.escape", "string.regexp source.ruby.embedded", "string.regexp string.regexp.arbitrary-repitition"], "string"],
  [["string.regexp constant.character.escape"], "tag", "bold"],
  [["support.constant", "support.variable", "meta.module-reference"], "constant"],
  [["punctuation.definition.list.begin.markdown"], "variable"],
  [["markup.heading", "markup.heading entity.name"], "constant", "bold"],
  [["markup.quote"], "tag"],
  [["markup.italic"], "foreground", "italic"],
  [["markup.bold"], "foreground", "bold"],
  [["markup.underline"], undefined, "underline"],
  [["markup.strikethrough"], undefined, "strikethrough"],
  [["markup.inline.raw"], "constant"],
  [["markup.deleted", "meta.diff.header.from-file", "punctuation.definition.deleted"], "deleted"],
  [["markup.inserted", "meta.diff.header.to-file", "punctuation.definition.inserted"], "inserted"],
  [["markup.changed", "punctuation.definition.changed"], "changed"],
  [["markup.ignored", "markup.untracked"], "comment"],
  [["meta.diff.range"], "function", "bold"],
  [["meta.diff.header"], "constant"],
  [["meta.separator"], "constant", "bold"],
  [["meta.output"], "constant"],
  [["brackethighlighter.tag", "brackethighlighter.curly", "brackethighlighter.round", "brackethighlighter.square", "brackethighlighter.angle", "brackethighlighter.quote"], "punctuation"],
  [["brackethighlighter.unmatched"], "invalid"],
  [["constant.other.reference.link", "string.other.link"], "string", "underline"],
];

type TokenSettings = { foreground?: string; background?: string; fontStyle?: string };
type TokenColor = { name?: string; scope?: string | string[]; settings: TokenSettings };
// Some published themes leave a rule's settings out.
type SourceTokenColor = Omit<TokenColor, "settings"> & { settings?: TokenSettings };

/** Structurally compatible with Shiki's `ThemeRegistration`; Huet doesn't depend on Shiki. */
export interface HuetShikiTheme {
  name: string;
  type: "light" | "dark";
  colors: Record<string, string>;
  /** Maps the hex sentinels in `colors` back to Huet's variables. */
  colorReplacements: Record<string, string>;
  fg: string;
  bg: string;
  tokenColors: TokenColor[];
}

/** A Shiki theme to take scopes and hues from, such as `shiki/themes/vesper.mjs`. */
export interface ShikiThemeSource {
  name?: string;
  type?: string;
  fg?: string;
  bg?: string;
  colors?: Record<string, string>;
  tokenColors?: SourceTokenColor[];
  settings?: SourceTokenColor[];
}

export interface HuetShikiThemeOptions {
  /** Shiki's theme name. Defaults to `"huet"`, or the `from` theme's name. */
  name?: string;
  /**
   * Keep this theme's scopes and the hue and chroma of each of its colors.
   * Huet only sets their lightness: each colored token takes the CIE
   * lightness, and so the luminance and contrast, of `--huet-muted` (override
   * with `--huet-code-lightness`), which the hue tokens match on the block.
   * Grays become `foreground` or `comment`.
   * Without it, tokens use Huet's own hues through the roles in `codeRoles`.
   */
  from?: ShikiThemeSource;
}

export function huetShikiTheme({ name, from }: HuetShikiThemeOptions = {}): HuetShikiTheme {
  const term = from ? terminal((key, ansi) => {
    const value = from.colors?.[key];
    return value ? keepHue(value, from, `colors["${key}"]`) : ansiRole(ansi);
  }) : terminal((_, ansi) => ansiRole(ansi));
  return {
    name: name ?? from?.name ?? "huet",
    // Shiki only uses `type` to pick a default `color-scheme`; Huet sets polarity per surface.
    type: from?.type === "dark" ? "dark" : "light",
    fg: color("foreground"),
    bg: color("background"),
    colors: {
      "editor.foreground": color("foreground"),
      "editor.background": color("background"),
      ...term.colors,
    },
    colorReplacements: term.colorReplacements,
    tokenColors: from
      ? (from.tokenColors ?? from.settings ?? []).map(({ settings = {}, ...rule }, i) => ({
          ...rule,
          settings: {
            ...settings,
            ...(settings.foreground && { foreground: keepHue(settings.foreground, from, `tokenColors[${i}].foreground`) }),
            ...(settings.background && { background: keepBackgroundHue(settings.background, from, `tokenColors[${i}].background`) }),
          },
        }))
      : rules.map(([scope, role, fontStyle]) => ({
          scope,
          settings: {
            ...(role && { foreground: color(role) }),
            ...(fontStyle && { fontStyle }),
          },
        })),
  };
}

/** Below this OKLCH chroma a color reads as gray, so it becomes a neutral role. */
const grayChroma = 0.03;

function oklchOf(value: string, where: string) {
  const match = /^#(?:([\da-f]{3})([\da-f])?|([\da-f]{6})([\da-f]{2})?)$/i.exec(value);
  if (!match)
    throw new TypeError(`huetShikiTheme: from.${where} is "${value}"; only hex colors (#rgb, #rgba, #rrggbb, #rrggbbaa) can keep their hue`);
  const hex = `#${match[1] ?? match[3]}`;
  const [, a, b] = toOklab(hex);
  const [, C, H] = toLch(hex);
  const alphaHex = match[2] ? match[2] + match[2] : match[4];
  const alpha = alphaHex ? parseInt(alphaHex, 16) / 255 : 1;
  return { hex, gray: Math.hypot(a, b) < grayChroma, C, H, alpha };
}
/** CIE chroma and hue, and alpha, for `lch(from … l <these>)`. */
const hueOf = ({ C, H, alpha }: { C: number; H: number; alpha: number }) =>
  `${chromaAt(C, H)} ${+H.toFixed(2)}${alpha < 1 ? ` / ${+alpha.toFixed(3)}` : ""}`;

/*
  A token keeps its chroma only where sRGB can show it at the lightness Huet
  picks. Past that edge browsers clip channels, which changes luminance and so
  contrast (GitHub's ANSI red loses a fifth of it on a dark block). The edge
  for a hue, as lines through samples of it, goes in a min() with the
  token's chroma, keeping the lines that bind for text lightness (L* 15–85).
  Where the edge isn't concave the lines can cut a little inside it: chroma
  gives way, hue and lightness don't.
*/
const textLightness = [15, 85] as const;
const edgeSamples = [15, 30, 45, 60, 75, 90];
const edges = new Map<number, [slope: number, intercept: number][]>();
function gamutEdge(H: number) {
  const key = Math.round(H * 100);
  let lines = edges.get(key);
  if (lines) return lines;
  let cusp = 50, peak = 0;
  for (let L = 1; L < 100; L++) {
    const C = maxLchChroma(L, H);
    if (C > peak) [cusp, peak] = [L, C];
  }
  const points = [...new Set([0, ...edgeSamples, cusp, 100])]
    .sort((a, b) => a - b)
    .map((L) => [L, L === 0 || L === 100 ? 0 : maxLchChroma(L, H)]);
  lines = points.slice(1).map(([L2, C2], i) => {
    const [L1, C1] = points[i];
    const slope = (C2 - C1) / (L2 - L1);
    return [+slope.toFixed(3), +(C1 - slope * L1).toFixed(2)];
  });
  edges.set(key, lines);
  return lines;
}
function chromaAt(C: number, H: number) {
  const chroma = +C.toFixed(2);
  const binding = gamutEdge(H).filter(([slope, intercept]) =>
    textLightness.some((L) => slope * L + intercept < chroma),
  );
  if (!binding.length) return `${chroma}`;
  const line = ([slope, intercept]: [number, number]) =>
    `l * ${slope} ${intercept < 0 ? "-" : "+"} ${Math.abs(intercept)}`;
  return `min(${chroma}, ${binding.map(line).join(", ")})`;
}

// Values that don't fix a color, which Shiki writes through as they are.
const passThrough = /^(?:inherit|initial|unset|currentcolor|transparent|var\(.+\))$/i;

function keepHue(value: string, from: ShikiThemeSource, where: string) {
  if (passThrough.test(value)) return value;
  const token = oklchOf(value, where);
  // CIE L* follows luminance alone, so the token reads exactly as strong as
  // muted text (which hue tokens match); OKLab L would dim saturated colors.
  if (!token.gray) return `lch(from var(--huet-code-lightness, var(--huet-muted)) l ${hueOf(token)})`;
  // Grays keep their place: text as strong as the theme's own is foreground, the rest muted.
  const { fg, bg } = editorColors(from);
  const back = oklchOf(bg, "editor.background").hex;
  return contrast(back, token.hex) >= 0.8 * contrast(back, oklchOf(fg, "editor.foreground").hex)
    ? color("foreground")
    : color("comment");
}

/** The theme's text and background, found the way Shiki finds them. */
function editorColors(from: ShikiThemeSource) {
  const global = (from.tokenColors ?? from.settings ?? []).find((rule) => !rule.scope && !rule.name)?.settings;
  const light = from.type === "light";
  return {
    fg: from.fg ?? global?.foreground ?? from.colors?.["editor.foreground"] ?? (light ? "#333333" : "#bbbbbb"),
    bg: from.bg ?? global?.background ?? from.colors?.["editor.background"] ?? (light ? "#fffffe" : "#1e1e1e"),
  };
}

/** Token backgrounds (diff rows) keep their hue at the block's own lightness, like a highlighter. */
function keepBackgroundHue(value: string, from: ShikiThemeSource, where: string) {
  if (passThrough.test(value)) return value;
  return `lch(from ${color("background")} l ${hueOf(oklchOf(value, where))})`;
}

interface HastNode {
  type: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/** A plain Huet background class, e.g. `huet-bg-5`, `huet-bg-90` or `huet-bg-blue-10`. No variants. */
export type SurfaceClass = Extract<RelativeClass, `huet-bg-${string}`>;

/**
 * Line classes from Shiki's diff notation (`// [!code ++]`, `// [!code --]` in
 * `@shikijs/transformers`) and the Huet background each row gets, relative to
 * the block. Rows start from the block's color, so inside a block of another
 * hue they drift toward it (an added row in a red block is olive at 15,
 * greener at 25). 20 balances hue against token contrast: higher amounts move
 * rows toward the middle of the ramp, where narrow themes like Paperback lose
 * token contrast.
 *
 * `// [!code highlight]` rows aren't mapped. A Huet yellow background moves
 * away from the block's lightness, which turns light themes' highlights tan.
 * Tint them at the block's lightness in CSS instead (see docs/code-blocks.md),
 * so the block's tokens stay readable on them; or map `highlighted` yourself.
 */
export const defaultLineSurfaces = {
  add: "huet-bg-green-20",
  remove: "huet-bg-red-20",
} as const satisfies Record<string, SurfaceClass>;

export interface HuetShikiTransformerOptions {
  /** The Huet background class on each `<pre>`. Defaults to `huet-bg-5`. */
  surface?: SurfaceClass;
  /**
   * Maps a line class to the Huet background class that row gets. Rows become
   * surfaces nested in the block, so their tokens are solved against the row.
   * Merged over `defaultLineSurfaces`; pass `false` to leave rows alone.
   */
  lines?: Partial<Record<string, SurfaceClass>> | false;
}

const classesOf = (node: HastNode) => {
  const current = node.properties?.class;
  return Array.isArray(current) ? current.map(String) : typeof current === "string" ? current.split(/\s+/).filter(Boolean) : [];
};
function checkSurface(option: string, value: string) {
  if (parseColorClass(value)?.property !== "bg")
    throw new TypeError(`huetShikiTransformer: ${option} must be a plain Huet background class like "huet-bg-5" or "huet-bg-green-10", got "${value}"`);
}

/**
 * A Shiki transformer that puts a Huet background class on each `<pre>`, so
 * the block becomes a surface: its token colors are solved against its own
 * background instead of the parent's. Highlighted rows become surfaces nested
 * in the block. Mount the theme on an ancestor.
 */
export function huetShikiTransformer({ surface = "huet-bg-5", lines = {} }: HuetShikiTransformerOptions = {}) {
  checkSurface("surface", surface);
  const rows: Record<string, string> = lines === false ? {} : { ...defaultLineSurfaces, ...lines };
  for (const [name, value] of Object.entries(rows)) checkSurface(`lines.${name}`, value);
  const visit = (node: HastNode) => {
    const names = classesOf(node);
    if (names.includes("line")) {
      const matches = [...new Set(names.flatMap((name) => (rows[name] ? [rows[name]] : [])))];
      // One background per element: a row can't be both added and highlighted.
      if (matches.length > 1)
        throw new Error(`huetShikiTransformer: a line has classes for more than one row background (${matches.join(", ")}); remove one notation`);
      if (matches.length) node.properties!.class = [...names, matches[0]].join(" ");
      return;
    }
    node.children?.forEach(visit);
  };
  return {
    name: "huet",
    pre(node: HastNode) {
      node.properties!.class = [...classesOf(node), surface].join(" ");
    },
    // Runs after every transformer's line and code hooks, so notation classes are in place.
    root(node: HastNode) {
      if (Object.keys(rows).length) visit(node);
    },
  };
}
