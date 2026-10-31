# Framework integration

Import `huet/styles.css` once globally (or `huet/tailwind.css` in your Tailwind entry). All examples mount a `Theme` with `mountTheme` from `huet`. Theme changes call the returned controller's `update(nextTheme, { background })`.

## React

```tsx
import { useEffect, useRef } from "react";
import { mountTheme, type Theme } from "huet";
import "huet/styles.css";
const theme: Theme = { neutral: ["#233b91", "#ffffff"] };

export function App() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const colors = mountTheme(root.current!, theme);
    return () => colors.destroy();
  }, []);
  return (
    <div ref={root}>
      <input className="huet-bg-5 huet-bg/border-60" aria-label="Name" />
    </div>
  );
}
```

Cleanup makes React Strict Mode's mount/cleanup/remount safe. The adapter never replaces nodes or controls input values. Use `useLayoutEffect` in client-only code if colors must be installed before paint; for SSR, pre-render the root's variables with `themeCss` (see Astro below).

## Vue

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { mountTheme, themes } from "huet";
import "huet/styles.css";
const root = ref<HTMLElement>();
let colors: ReturnType<typeof mountTheme> | undefined;
onMounted(() => {
  colors = mountTheme(root.value!, themes.Base);
});
onBeforeUnmount(() => colors?.destroy());
</script>
<template>
  <div ref="root">
    <input class="huet-bg-5 huet-bg/border-60" aria-label="Name" />
  </div>
</template>
```

## Svelte

```svelte
<script lang="ts">
import { mountTheme, themes, type Theme } from 'huet';
import 'huet/styles.css';
const theme = themes.Base;
function huet(node: HTMLElement, theme: Theme) {
  return mountTheme(node, theme); // Svelte action: update() and destroy()
}
</script>
<div use:huet={theme}>
  <input class="huet-bg-5 huet-bg/border-60" aria-label="Name">
</div>
```

## Astro

```astro
---
import { themeCss, themes } from 'huet';
import 'huet/styles.css';
// Light, and dark when the page has the `dark` class
const css = themeCss(themes.Base, { selector: '#themed-app' }) +
  themeCss(themes.Base, { background: 0, selector: '.dark #themed-app' });
---
<style is:inline set:html={css}></style>
<div id="themed-app" data-huet-root>
  <input class="huet-bg-5 huet-bg/border-60" aria-label="Name">
</div>
<script>
  import { mountTheme, themes } from 'huet';
  let colors: ReturnType<typeof mountTheme> | undefined;
  function mount() {
    colors?.destroy();
    const root = document.querySelector<HTMLElement>('#themed-app');
    const background = document.documentElement.classList.contains('dark') ? 0 : 1;
    colors = root ? mountTheme(root, themes.Base, { background }) : undefined;
  }
  mount();
  // Support ClientRouter navigation as well as ordinary full-page loads.
  document.addEventListener('astro:before-swap', () => colors?.destroy());
  document.addEventListener('astro:page-load', mount);
</script>
```

`themeCss` pre-renders the root's colors, so the page paints in its theme before the script runs. Nested `huet-bg-*` surfaces get their colors when `mountTheme` runs. Use the same theme and background on the server and the client. Portals / islands outside the mounted DOM tree need their own independent mount.
