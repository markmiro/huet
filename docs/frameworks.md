# Framework integration

Import `huet/styles.css` once globally (or `huet/tailwind.css` in your Tailwind entry). All examples use `createTheme` and `mountTheme` from `huet/core`. Keep `createTheme()` outside render functions when possible. Theme changes call the returned controller's `update(nextTheme)`.

## React

```tsx
import { useEffect, useRef } from "react";
import { createTheme, mountTheme } from "huet/core";
import "huet/styles.css";
const theme = createTheme({ dark: "#233b91" });

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

Cleanup makes React Strict Mode's mount/cleanup/remount safe. The adapter never replaces nodes or controls input values. Use `useLayoutEffect` in client-only code if colors must be installed before paint; for SSR, pre-render token variables.

## Vue

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createTheme, mountTheme } from "huet/core";
import "huet/styles.css";
const root = ref<HTMLElement>();
let colors: ReturnType<typeof mountTheme> | undefined;
onMounted(() => {
  colors = mountTheme(root.value!, createTheme());
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
import { createTheme, mountTheme, type HuetTheme } from 'huet/core';
import 'huet/styles.css';
const theme = createTheme();
function huet(node: HTMLElement, theme: HuetTheme) {
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
import { createTheme, themeVariables } from 'huet/core';
import 'huet/styles.css';
const theme = createTheme();
const rootStyle = Object.entries(themeVariables(theme.tokens()))
  .map(([key, value]) => `${key}:${value}`).join(';');
---
<div id="themed-app" data-huet-root style={rootStyle}>
  <input class="huet-bg-5 huet-bg/border-60" aria-label="Name">
</div>
<script>
  import { createTheme, mountTheme } from 'huet/core';
  let colors: ReturnType<typeof mountTheme> | undefined;
  function mount() {
    colors?.destroy();
    const root = document.querySelector<HTMLElement>('#themed-app');
    colors = root ? mountTheme(root, createTheme()) : undefined;
  }
  mount();
  // Support ClientRouter navigation as well as ordinary full-page loads.
  document.addEventListener('astro:before-swap', () => colors?.destroy());
  document.addEventListener('astro:page-load', mount);
</script>
```

This pre-renders root variables from the compatibility token API. To avoid a first-paint color change for nested surfaces, also compute their tokens server-side using `theme.relative.contrast(amount)` and `the resulting Color and its contrast(100) foreground`. Use the same theme configuration on server and client. Portals / islands outside the mounted DOM tree need their own independent mount.
