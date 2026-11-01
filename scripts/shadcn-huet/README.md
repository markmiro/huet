The shadcn demo runs Huet in the upstream app pinned at `vendor/shadcn-ui`.

```sh
git submodule update --init vendor/shadcn-ui
pnpm shadcn:setup
pnpm shadcn:dev
```

`shadcn:setup` can be rerun. It:

- applies `integration.patch` to the submodule, unless it's already applied: surface and chart fixes, `data-huet-recolor` opt-ins on the home page's QR code SVG and on the registry directory's logos, and `huetShikiTheme({ from })` around every highlighter's themes (docs MDX, component, block and chart source, and the registry's CodeBlock)
- copies `huet-configurator.tsx` into `apps/v4/components/huet/` and mounts it in the root layout
- builds and packs the local `huet` and `huet-react` packages, installs them in the app, and builds the registry

The gitlink only pins the upstream commit, so edits made inside `vendor/shadcn-ui` aren't saved with this repo. Edit `huet-configurator.tsx` here, and regenerate the patch after changing other vendor files:

```sh
git -C vendor/shadcn-ui diff --abbrev=7 -- apps/v4/app/globals.css 'apps/v4/app/(app)/(root)/cards/qr-connect.tsx' … > scripts/shadcn-huet/integration.patch
```

Leave `layout.tsx` and `theme-provider.tsx` out of it, since `setup.mjs` edits those itself.

`pnpm test:shadcn` checks the result in the browser: every chart's paints must change with the theme, in light and dark mode. It starts `pnpm shadcn:dev` on port 4000, or set `SHADCN_URL` to use a server that's already running.

## Code blocks

Every highlighter on the site wraps shadcn's own Shiki themes (vesper and GitHub) in `huetShikiTheme({ from })`, so tokens keep shadcn's hues and take their lightness from Huet's CSS variables (see [code blocks](../../docs/code-blocks.md#keeping-another-themes-hues)). The site doesn't mount Huet, so `huet-configurator.tsx` writes those variables itself: solved against shadcn's `--code` fill inside `[data-rehype-pretty-code-figure]`, and against the page everywhere else, such as the registry's `CodeBlock`. It also logs a `console.error` for any code block whose tokens still carry fixed colors (hex or `rgb()`), for example after a submodule update adds a highlighter: wrap its theme in `huetShikiTheme({ from })` too.
