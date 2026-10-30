# TODO

## Tailwind variants on Huet classes

Goal: anyone who knows Tailwind can write `hover:huet-bg-25`, `focus-visible:huet-outline-blue-80`, `md:huet-text-60`, `group-hover:…`, `aria-*:…`, `[&>svg]:…`, stacked variants, and so on, and it works. Nobody should need a list of which variants Huet supports.

Today these are errors (`validateClasses`, `mountTheme`, `huet check`), and each message says what to write instead. These already work (checked by hand in Chromium; not yet covered by the test suite):

- `huet-outline-blue-80 focus-visible:outline-2`: the outline color is always set, and Tailwind turns the outline on.
- Token utilities with any variant: `hover:text-huet-blue`, `focus-visible:outline-huet-blue`, `focus:ring-huet-fg`.

### Why it doesn't work yet

Tailwind adds a variant by wrapping a utility's CSS rule (`.hover\:x:hover { … }`). Huet classes have no rule to wrap. `mountTheme` computes each color in JavaScript against the parent's background and writes it inline (`--huet-background`, `--huet-foreground`, `--huet-relative-outline`, …). Inline values would also beat any variant rule.

### Plan

1. **Make every Huet class a Tailwind utility.** Generate `@utility huet-outline-blue-80 { outline-color: var(--huet-outline-blue-80); }` and so on for every class (about 2,800) into `tailwind.css`. Tailwind emits only the ones a project uses, and it handles every variant, including custom and arbitrary ones. Spike first: confirm that static `@utility` rules get variants and sort after the unprefixed classes.
2. **Compute colors per class in the runtime.**
   - Split each class at its last top-level `:` (`splitVariants` in `classes.ts` already does this).
   - Compute a color for every Huet base class, with or without variants.
   - Write each color to a variable named after the class.
   - Stop writing public token names (`--huet-foreground`, `--huet-muted`, …) inline. Instead the utility for `huet-bg-25` assigns `--huet-foreground: var(--huet-bg-25-foreground)` and the other tokens. Then `hover:huet-bg-25` also swaps the text color and every inherited token, and descendants that use tokens (`text-huet-fg`, `huet-muted`) follow the hover state for free.
3. **Decide how nested explicit amounts follow a state change.** This is the hard part. A `huet-text-80` inside a `hover:huet-bg-25` card is computed against the card's resting background. Options:
   - Compute descendants against each background state and switch between them in CSS (space toggles or chains of variable fallbacks). Spike it.
   - Document that explicit amounts resolve against the resting state.
4. **Validation.**
   - Accept variant-prefixed classes in `validateClasses`, `huet check` and the `HuetClass` types.
   - "One class per property" should conflict only within the same variant chain, so `huet-bg-10 hover:huet-bg-25` is fine.
   - Decide what `!important` and `/50` opacity modifiers do. Opacity voids the contrast guarantee.
5. **Without Tailwind.** Plain-CSS users don't write variant prefixes. Keep the current classes. Optionally, add a small fixed set of variants through data attributes in `styles.css`.
6. **Tests and docs.** Compile real Tailwind and check, in a browser: `focus-visible`, `hover`, `group-hover`, a responsive variant, an `aria-*` variant, an arbitrary variant, stacked variants, and nested children under a hovered surface. Update the "Static checking" section of `packages/huet/README.md`.
