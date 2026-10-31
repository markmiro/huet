# Code blocks (Shiki)

Experimental. Demo: `pnpm dev`, then open the example demos' Code page (`/code`). Code: `packages/huet/src/core/shiki.ts`, exported from `huet`.

`huetShikiTheme()` is a Shiki theme whose colors are Huet's CSS variables instead of hex values. Shiki writes them into each token's inline style:

```html
<pre class="astro-code huet huet-bg-5" style="background-color:var(--huet-code-background, var(--huet-background));color:var(--huet-code-foreground, var(--huet-foreground))">
  <code><span style="color:var(--huet-code-keyword, var(--huet-red))">const</span> …</code>
</pre>
```

`mountTheme` fills in the variables for the nearest Huet surface, so:

- Token colors are Huet's semantic tokens (`--huet-red`, `--huet-muted`, …), solved for readable contrast against the block's own background, in either polarity.
- The highlighted HTML is produced once (at build time, or on the server). Switching themes with `update()` only changes variables. Nothing is re-highlighted or re-rendered.
- `huetShikiTransformer()` adds a Huet background class (`huet-bg-5` by default) to each `<pre>`, so the block is a surface: tokens are solved against the block, not the page. It takes a plain background class only; Tailwind variants such as `dark:huet-bg-90` are rejected.
- The block can sit on the page's side of the ramp (`huet-bg-0` to `huet-bg-25`) or the opposite side (`huet-bg-75` to `huet-bg-100`), e.g. `huet-bg-90` for dark code on a light page, like `github-dark`. Tokens flip with the block. The demo's slider skips 26–74, which land on mid-ramp grays with the least contrast to spare.

## Astro

Astro's Markdown and MDX use Shiki. Pass the theme and transformer in `astro.config.mjs`:

```js
import { huetShikiTheme, huetShikiTransformer } from "huet";

export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: huetShikiTheme(),
      transformers: [huetShikiTransformer({ surface: "huet-bg-5" })],
    },
  },
});
```

Then mount a Huet theme on an ancestor of the content (see [framework integration](frameworks.md)). Code blocks then follow the page theme. Without a mounted theme (or `themeCss`), the variables are undefined and tokens fall back to the inherited text color.

Astro's `<Code>` component takes the same props, which is how the demo page highlights at build time:

```astro
---
import { Code } from "astro:components";
import { huetShikiTheme, huetShikiTransformer } from "huet";
---
<Code code={source} lang="jsx" theme={huetShikiTheme()} transformers={[huetShikiTransformer()]} />
```

## Highlighted rows

Shiki's notation transformers mark rows with classes: `// [!code ++]` and `// [!code --]` from `transformerNotationDiff()` add `diff add` and `diff remove`, and `// [!code highlight]` from `transformerNotationHighlight()` adds `highlighted`. `huetShikiTransformer` gives diff rows a Huet background class, so each is a surface nested in the block, and the tokens on it are solved against the row:

| Line class | Default (`defaultLineSurfaces`) |
| --- | --- |
| `add` | `huet-bg-green-20` |
| `remove` | `huet-bg-red-20` |
| `highlighted` | none: tint it in CSS, below |

```js
import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";

const transformers = [
  transformerNotationDiff(),
  transformerNotationHighlight(),
  // Merged over the defaults. `lines: false` leaves rows alone.
  huetShikiTransformer({ surface: "huet-bg-red-10", lines: { highlighted: "huet-bg-25" } }),
];
```

Put the notation transformers first or last; the Huet transformer marks rows in Shiki's `root` hook, after every other transformer has run. A row matching two mapped classes fails the build. Rows are inline `<span>`s, so stretch them across the block yourself:

```css
pre .line {
  display: inline-block;
  box-sizing: border-box;
  min-width: calc(100% + 2.5rem); /* the pre's horizontal padding, twice */
  margin-inline: -1.25rem;
  padding-inline: 1.25rem;
}
/* A highlighter yellow at the block's lightness, plus a bar in the block's yellow token. */
pre { --code-block-bg: var(--huet-background); }
pre .line.highlighted {
  background-color: oklch(from var(--code-block-bg) l 0.11 95);
  box-shadow: inset 0.3rem 0 var(--huet-yellow);
}
pre.has-diff .line::before { content: "  "; }
pre.has-diff .line.add::before { content: "+ "; color: var(--huet-green); }
pre.has-diff .line.remove::before { content: "- "; color: var(--huet-red); }
```

The demo's Highlighted rows example reports the lowest contrast of the tokens on the block, the tokens on the rows, and the +/− markers. The block itself can also be colored (`surface: "huet-bg-red-10"`).

Row backgrounds are relative to the block, so they start from its color. In a block of another hue they drift toward it: an added row in a red block is olive at 15 and greener at 25, and a removed row in a green block is tan. Higher amounts keep more of the row's hue but move it toward the middle of the ramp, which costs token contrast in narrow themes such as Paperback, so they default to 20. Highlights aren't Huet surfaces, because a Huet yellow background moves away from the block's lightness: in a light theme it turns tan, then brown, and costs token contrast. The CSS above keeps the block's lightness and adds yellow chroma instead, so light themes get a highlighter yellow, dark themes a deep amber, and the block's tokens stay readable without being re-solved. They aren't solved for the yellow itself, so they can dip a little: on a `huet-bg-90` block, the lowest token on a row is APCA Lc 56 in Terminal (60 on the block), 55 in Deep Dive (56) and 43 in Paperback (44). `--code-block-bg` has to be set on the `<pre>` so it captures the block's background before rows inherit it. The hue (95) is fixed rather than the theme's yellow, because CSS can't take lightness from one color and hue from another. For a Huet-solved highlight instead, map it: `lines: { highlighted: "huet-bg-yellow-25" }`.

Color the +/− markers with the row's own tokens, `var(--huet-green)` and `var(--huet-red)`. The row is a surface, so they're solved for Lc 60 against it (scaled down for narrow ramps), like the code.

## Without a mount

The variables can come from anywhere, so a server-rendered page can write them with `themeCss`. A code block that should always be dark, whatever the page's mode, is the same theme on a dark background:

```ts
import { themeCss, themes } from "huet";

const css =
  themeCss(themes.Sunset, { background: 1 }) +
  // Blocks near the dark end of the ramp in both modes
  themeCss(themes.Sunset, { background: 0.05, selector: "pre.astro-code" });
```

Highlight those blocks without the transformer, so a mounted page doesn't also treat them as its surfaces. A block at a contrast amount from its parent (`huet-bg-5` on the page) needs `mountTheme`, which works that color out against the parent. The demo's "Every theme" grid sits inside a page that's already mounted, and Huet roots can't nest, so it writes each card's colors inline with Huet's internals instead.

## Roles

Scopes and their order follow GitHub's VS Code theme. Each scope maps to a role:

| Role | Default | Examples |
| --- | --- | --- |
| `foreground` | `--huet-foreground` | identifiers, parameters |
| `comment` | `--huet-muted` | comments |
| `keyword` | `--huet-red` | `const`, `return`, operators |
| `function` | `--huet-purple` | function and class names, attribute names |
| `constant` | `--huet-blue` | numbers, `true`, `const` bindings, CSS properties |
| `string` | blue mixed 45% toward the foreground | strings, regular expressions |
| `variable` | `--huet-yellow` | `variable` scopes, e.g. parameters in some grammars |
| `tag` | `--huet-green` | JSX/HTML tags, quotes |
| `invalid`, `deleted` | `--huet-red` | diff deletions |
| `inserted` | `--huet-green` | diff insertions |
| `changed` | `--huet-yellow` | diff changes |
| `punctuation` | `--huet-muted` | bracket highlights |

Terminal output (`lang: "ansi"`) uses the theme's ANSI colors, exported as `ansiColors` and overridable with `--huet-code-ansi-<name>`:

| ANSI color | Default |
| --- | --- |
| `black` | `--huet-muted` |
| `red`, `green`, `yellow`, `blue` | the Huet token of that name |
| `magenta` | `--huet-purple` |
| `cyan` | blue and green, mixed evenly |
| `white` | `--huet-foreground` |

Bright variants share their base color, since a surface has one token per hue, and black and white become text colors so they stay readable in either polarity. Shiki only accepts hex terminal colors, so the theme gives it fixed sentinels and maps them back to the variables with its `colorReplacements`. Dim text (`\x1b[2m`) isn't dimmed.

GitHub's strings are a deeper (light theme) or paler (dark theme) blue than its constants. Huet has one blue per surface, so strings mix it toward the foreground with `color-mix(in oklab, …)`, which raises contrast in either polarity. Every other role is a single Huet token.

Override any role with `--huet-code-<role>` on the block or an ancestor, e.g. `pre { --huet-code-string: var(--huet-green); }`. Values like `var(--huet-green)` resolve where they're declared, so set overrides on the surface (the `<pre>`) when they reference Huet's variables.

## Limits

- All five hue tokens target the same contrast (APCA Lc 60 against the block, scaled down for narrow ramps), so the roles differ by hue, not by lightness. GitHub's themes also vary lightness.
- On saturated mid-tone backgrounds, the hue tokens lose chroma and converge toward the foreground. Blueprint's dark blocks (`huet-bg-90` and up) land at Lc 55.
- Amounts measure contrast from the page, not ramp position, so `huet-bg-25` and `huet-bg-75` already sit fairly close to mid gray (Base: `#b8b8b8` and `#3b3b3b`), and that's where token contrast dips first. Comments dip most, because they're muted text at ⅔ of the block's text contrast: Blueprint's reach Lc 38 at `huet-bg-25` and 48 at `huet-bg-75`, and Base's 44 at `huet-bg-25`. Themes whose page background is itself mid-ramp (Radioactive, Orange Boost, Faded Future) stay low contrast at every amount.
- Themes with little contrast range lose a little more on rows: in a `huet-bg-5` block, Blueprint's rows reach Lc 53 (55 on the block) and Faded Future's 39 (40).
- Only Shiki (or anything that accepts a TextMate theme) can use this. Other highlighters, and third-party embeds, would need the generic approach: remap the colors already rendered, as `recolor.ts` does for images.
