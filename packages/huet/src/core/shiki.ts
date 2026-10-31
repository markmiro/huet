import { parseColorClass, type RelativeClass } from "./classes";

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

/** Structurally compatible with Shiki's `ThemeRegistration`; Huet doesn't depend on Shiki. */
export interface HuetShikiTheme {
  name: string;
  type: "light" | "dark";
  colors: Record<string, string>;
  fg: string;
  bg: string;
  tokenColors: { scope: string[]; settings: { foreground?: string; fontStyle?: string } }[];
}

export function huetShikiTheme({ name = "huet" }: { name?: string } = {}): HuetShikiTheme {
  return {
    name,
    // Shiki only uses `type` to pick a default `color-scheme`; Huet sets polarity per surface.
    type: "light",
    fg: color("foreground"),
    bg: color("background"),
    colors: {
      "editor.foreground": color("foreground"),
      "editor.background": color("background"),
    },
    tokenColors: rules.map(([scope, role, fontStyle]) => ({
      scope,
      settings: {
        ...(role && { foreground: color(role) }),
        ...(fontStyle && { fontStyle }),
      },
    })),
  };
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
