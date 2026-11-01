The shadcn demo runs Huet in the upstream app pinned at `vendor/shadcn-ui`.

```sh
git submodule update --init vendor/shadcn-ui
pnpm shadcn:setup
pnpm shadcn:dev
```

`shadcn:setup` can be rerun. It:

- applies `integration.patch` to the submodule, unless it's already applied: surface and chart fixes, the /create preview's Live Audio Waveform drawn in `text-muted-foreground` instead of a fixed gray, `data-huet-recolor` opt-ins on the home page's QR code SVG and on the registry directory's logos, and `huetShikiTheme({ from })` around every highlighter's themes (docs MDX, component, block and chart source, and the registry's CodeBlock)
- copies `huet-configurator.tsx` into `apps/v4/components/huet/` and mounts it in the root layout
- builds and packs the local `huet` and `huet-react` packages, installs them in the app, and builds the registry

The gitlink only pins the upstream commit, so edits made inside `vendor/shadcn-ui` aren't saved with this repo. Edit `huet-configurator.tsx` here, and regenerate the patch after changing other vendor files:

```sh
git -C vendor/shadcn-ui diff --abbrev=7 -- apps/v4/app/globals.css 'apps/v4/app/(app)/(root)/cards/qr-connect.tsx' … > scripts/shadcn-huet/integration.patch
```

Leave `layout.tsx` and `theme-provider.tsx` out of it, since `setup.mjs` edits those itself.

`pnpm test:shadcn` checks the result in the browser: every chart's paints must change with the theme, in light and dark mode, and the parts below follow it too. It starts `pnpm shadcn:dev` on port 4000, or set `SHADCN_URL` to use a server that's already running.

## Colors

`huet-configurator.tsx` writes shadcn's color roles (`--background`, `--card`, `--muted`…) on `<html>`, and moves every Tailwind swatch onto the theme:

- Grays and white take the neutral ramp's color at the same position.
- Colored swatches take the theme's hues the way Huet recolors SVGs, and their shade scale is pinned to the theme's own color: `fill-green-500` (dashboard-01's "Done" check) is the theme's green, lighter shades run to the ramp's light end and darker ones to its dark end.
- Elements shadcn keeps dark on a light page with `className="dark"` (the /create and /typeset side menus, their bottom toolbars, dialogs) get the theme's dark roles from a `.dark` rule, with primary as their max-contrast invert, since globals.css would give them shadcn's own grays. On a dark page they inherit the page's colors, picked accent included.

## Code blocks

Every highlighter on the site wraps shadcn's own Shiki themes (vesper and GitHub) in `huetShikiTheme({ from })`, so tokens keep shadcn's hues and take their lightness from Huet's CSS variables (see [code blocks](../../docs/code-blocks.md#keeping-another-themes-hues)). The site doesn't mount Huet, so `huet-configurator.tsx` writes those variables itself: solved against shadcn's `--code` fill inside `[data-rehype-pretty-code-figure]`, and against the page everywhere else, such as the registry's `CodeBlock`. It also logs a `console.error` for any code block whose tokens still carry fixed colors (hex or `rgb()`), for example after a submodule update adds a highlighter: wrap its theme in `huetShikiTheme({ from })` too.

## Theme and chart colors

On `/create`, the Theme (accent) and Chart Color pickers work with Huet. The preview iframe reads shadcn's picks from `#design-system-theme-vars`, keeps each one's hue and chroma, and lets Huet choose the lightness, on ramps from the Huet theme's dark end through the picked colors to its light end (`rampThrough` in `huet/internal`):

- **Primary** (and the sidebar's) is the step on the accent's ramp nearest the picked color where text in the page color reads at Lc 75. A gray theme keeps primary as the max-contrast invert. Menu Accent: Bold uses the same color for menus.
- **`--chart-1` to `--chart-5`** spread evenly in contrast with the page, from Lc 90 to Lc 45, on the chart palette's ramp. A gray chart color takes the theme's own steps, from the text color to muted.

The iframe sends both picks up to the top page. The Huet panel's Edit Theme tab shows them under **Page colors** as Accent and Chart, and you can edit them there with the same hue and saturation sliders as the hues. An edit to the chart palette turns and saturates all five colors together, so amber's yellow-to-brown shape survives. Edits are saved with the Huet theme in `localStorage` (`huet-shadcn`, under `pageColors`). Each one keeps the colors it was made from, so a new pick on `/create` replaces it, and Default goes back to the pick.

Elsewhere on the site, the page colors are the site's own: a gray accent, so primary stays the invert until you give it a color, and the blue chart palette. `.theme-*` classes place their primary on the accent's kind of ramp too. `tests/shadcn/create.spec.ts` covers all of this.

## Deploying

The demo is live at https://shadcn-huet.vercel.app, from the Vercel project `shadcn-huet`. It isn't connected to Git, so nothing deploys on push. Deploys are manual: you build locally and upload the output. A Vercel build can't do it, because `setup.mjs` installs Huet from tarballs that only exist on your machine.

Build from current `master`, then run `vercel` from `vendor/shadcn-ui`, the pnpm root, not from `apps/v4`:

```sh
git switch master && git pull
pnpm shadcn:setup
cd vendor/shadcn-ui
vercel link --yes --project shadcn-huet   # only if vendor/shadcn-ui/.vercel is missing
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod --archive=tgz
```

- `shadcn:setup` only builds the registry when `apps/v4/styles/base-nova/ui` is missing. After a patch changes files under `apps/v4/registry/`, rebuild it from `vendor/shadcn-ui/apps/v4` with `bun run ./scripts/build-registry.mts --style all`.
- If `setup` reports a conflict with `integration.patch` after you pull, the submodule still has the old patch applied. Discard it with `git -C vendor/shadcn-ui checkout -- .` and rerun setup.
- The project's Root Directory is `apps/v4`. The built functions point into the root `node_modules`, so deploying from `apps/v4` fails with `File does not exist: node_modules/.pnpm/…`.
- The build has about 39,000 files, more than Vercel's 15,000-file upload limit, so `--archive=tgz` is required.
- The project uses Node 24.x. `vercel build` rejected 26.x.
- Production sets `NEXT_PUBLIC_APP_URL=https://shadcn-huet.vercel.app` and `NEXT_PUBLIC_V0_URL=https://v0.dev`.
- `vendor/shadcn-ui/.vercel` holds the link and the build output. Upstream ignores it, so it never shows up in the submodule's diff.
