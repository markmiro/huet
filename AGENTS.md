# huet: rules for AI agents

huet replaces Tailwind's color classes with contrast-based ones. Colors are never picked from a palette; they are an *amount of contrast* relative to the parent background, so the same markup works on light, dark and mid-gray themes.

## Class grammar (complete)

```
{root}-{n}%          root ∈ bg text border outline ring divide fill stroke placeholder accent caret decoration
{root}-{hue}-{n}%    hue  ∈ the theme's hues (default: red yellow green blue purple) or neutral
hue-{hue}            sets the hue for the element and its subtree
n ∈ 0 5 10 15 … 95 100
```

Anything else (`bg-7%`, `bg-gray-100`, `text-red-500`, `bg-red-10%/50`, `bg-[#fff]`) is invalid or not huet. Variants work as in Tailwind: `hover:bg-10%`, `focus:border-blue-100%`, `disabled:text-50%`.

## Rules

- Never use Tailwind palette colors (`bg-white`, `text-gray-500`, `border-slate-200`), hex values, or opacity tricks for color. Use amounts.
- Amounts are relative to the parent background. `bg-5%` inside `bg-5%` is a further 5% away; don't compensate manually.
- Text is automatically 100% contrast on every `bg-*`. Only add `text-*` to make it quieter (`text-60%`) or colored (`text-red-100%`).
- Borders: `border-*%` sets only the color. Add `border` (width) too: `border border-20%`.
- For a colored component, prefer `hue-{name}` on the container plus neutral amounts inside (`hue-red bg-10% border border-30%`) over repeating the hue on every class.
- To theme a subtree differently, put `data-theme` on it and set `--huet-bg` (0 = dark end, 1 = light end): `<aside data-theme style="--huet-bg: 0.1">`.
- To change themes at runtime, call `applyTheme(document.documentElement, { bg, dark, light, hues, contrast })` from `huet`. Don't add React context or state for colors.
- Disabled look: `[--huet-contrast:0.5]` on the element or container.
- Need a color in JS (canvas, charts)? `resolve(["bg-5%", "text-blue-100%"], theme).text` returns the hex the CSS produces.

## Recipes

| Element | Classes |
| --- | --- |
| Card / panel | `bg-5% border border-10% rounded p-4` |
| Nested card | `bg-5%` (again) |
| Muted text | `text-60%` (labels), `text-50%` (hints) |
| Input | `bg-0% border border-25% placeholder-50% focus:outline-blue-100%` |
| Primary button | `bg-blue-100% hover:bg-blue-90%` |
| Neutral solid button | `bg-100% hover:bg-90%` |
| Secondary button | `bg-10% hover:bg-15% border border-20%` |
| Error banner | `hue-red bg-10% border border-30% rounded p-3` |
| Error text | `text-red-100%` |
| Success text | `text-green-100%` |
| Badge | `bg-blue-15% text-blue-100% rounded px-1` |
| Link | `text-blue-100% underline decoration-blue-50%` |
| Divider list | `divide-y divide-10%` |
| Selected row | `bg-blue-100%` (text flips automatically) |
| Hover row | `hover:bg-5%` |
| Icon | `fill-60%` or `stroke-60%` |
| Checkbox / range | `accent-blue-100%` |

## Setup reference

```css
@import "tailwindcss";
@plugin "huet/tailwind";          /* or: @plugin "huet/tailwind" { bg: 0.95; red: #e5484d; } */
@theme { --color-*: initial; }    /* optional: removes Tailwind's palette */
```

Without Tailwind: `import "huet/huet.css"`.
