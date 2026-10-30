import { RelativeClass } from './classes';
/** Token roles, each emitted as `var(--huet-code-<role>, <default>)`. */
export declare const codeRoles: {
    readonly foreground: "var(--huet-foreground)";
    readonly background: "var(--huet-background)";
    readonly comment: "var(--huet-muted)";
    readonly keyword: "var(--huet-red)";
    readonly function: "var(--huet-purple)";
    readonly constant: "var(--huet-blue)";
    readonly string: "color-mix(in oklab, var(--huet-blue) 55%, var(--huet-foreground))";
    readonly variable: "var(--huet-yellow)";
    readonly tag: "var(--huet-green)";
    readonly punctuation: "var(--huet-muted)";
    readonly invalid: "var(--huet-red)";
    readonly inserted: "var(--huet-green)";
    readonly deleted: "var(--huet-red)";
    readonly changed: "var(--huet-yellow)";
};
export type CodeRole = keyof typeof codeRoles;
/** Structurally compatible with Shiki's `ThemeRegistration`; Huet doesn't depend on Shiki. */
export interface HuetShikiTheme {
    name: string;
    type: "light" | "dark";
    colors: Record<string, string>;
    fg: string;
    bg: string;
    tokenColors: {
        scope: string[];
        settings: {
            foreground?: string;
            fontStyle?: string;
        };
    }[];
}
export declare function huetShikiTheme({ name }?: {
    name?: string;
}): HuetShikiTheme;
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
 * rows toward the middle of the ramp, where narrow themes like Paperback drop
 * below 4.5:1.
 *
 * `// [!code highlight]` rows aren't mapped. A Huet yellow background moves
 * away from the block's lightness, which turns light themes' highlights tan.
 * Tint them at the block's lightness in CSS instead (see docs/code-blocks.md),
 * so the block's tokens stay readable on them; or map `highlighted` yourself.
 */
export declare const defaultLineSurfaces: {
    readonly add: "huet-bg-green-20";
    readonly remove: "huet-bg-red-20";
};
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
/**
 * A Shiki transformer that puts a Huet background class on each `<pre>`, so
 * the block becomes a surface: its token colors are solved against its own
 * background instead of the parent's. Highlighted rows become surfaces nested
 * in the block. Mount the theme on an ancestor.
 */
export declare function huetShikiTransformer({ surface, lines }?: HuetShikiTransformerOptions): {
    name: string;
    pre(node: HastNode): void;
    root(node: HastNode): void;
};
export {};
