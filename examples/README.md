# huet examples

Minimal smoke-test apps that use huet from this repo through `"huet": "file:../.."`. Run `npm run build:lib` in the repo root first so `dist/` exists.
Each app shows the same card, input, button, alert and nested card, plus a slider and a theme select that call `applyTheme`.

- **react**: React 19 + TypeScript + Tailwind v4 (`@plugin "huet/tailwind"`).
  `cd examples/react && npm install && npm run dev` (`npm run build && npm run preview` for the production build).
- **vue**: Vue 3 SFC + TypeScript + Tailwind v4.
  `cd examples/vue && npm install && npm run dev`
- **svelte**: Svelte 5 + Tailwind v4. Also shows `@apply bg-5%` inside a scoped `<style>` (with `@reference "./app.css"`).
  `cd examples/svelte && npm install && npm run dev`
- **astro**: Astro + Tailwind v4 (`@tailwindcss/vite` in `vite.plugins`). Theme controls live in a `<script>` in `src/pages/index.astro`.
  `cd examples/astro && npm install && npm run dev`
- **vanilla**: Vite + TypeScript, no Tailwind. Uses `import "huet/huet.css"` plus a few lines of layout CSS.
  `cd examples/vanilla && npm install && npm run dev`

