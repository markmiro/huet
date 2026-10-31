/** Code blocks from markmiro.com posts, plus a few languages the posts don't cover. */
export const post = {
  sales: {
    lang: "jsx",
    source: "How I learned to code",
    code: `var sales = (
  <sales vendor="John">
    <item type="peas" price="4" quantity="6"/>
    <item type="carrot" price="3" quantity="10"/>
    <item type="chips" price="5" quantity="3"/>
  </sales>
);`,
  },
  scope: {
    lang: "js",
    source: "Scope creep",
    code: `export function first() {
  const bla = 2;
  return second(3, bla);
}

const second = (a, bla) => {
  const foobar = a + bla;
  return third(3, foobar);
};`,
  },
  tailwind: {
    lang: "html",
    source: "Too much Tailwind",
    code: `<div class="bg-slate-100 rounded-xl p-8 dark:bg-slate-800">
  <!-- ... -->
</div>`,
  },
} as const;

export const languages = [
  {
    lang: "ts",
    code: `import { createTheme, mountTheme } from "huet/core";

// Relative colors: 25% contrast against the parent background.
const theme = createTheme({ dark: "#233b91", background: 1 });
const colors = mountTheme(document.querySelector<HTMLElement>("#app")!, theme);
colors.update(createTheme({ dark: "#233b91", background: 0 }));`,
  },
  {
    lang: "css",
    code: `.huet-bg-blue-20 {
  /* Supplied by mountTheme for this surface */
  background-color: var(--huet-background);
  padding: 0.5rem 1rem;
}
@media (prefers-color-scheme: dark) {
  :root { color-scheme: dark; }
}`,
  },
  {
    lang: "diff",
    code: `@@ -1,4 +1,6 @@
 export default defineConfig({
-  integrations: [react(), mdx()],
+  integrations: [react(), mdx()],
+  markdown: {
+    shikiConfig: { theme: huetShikiTheme(), transformers: [huetShikiTransformer()] },
+  },
 });`,
  },
  {
    lang: "json",
    code: `{
  "name": "huet",
  "version": "1.0.0-beta.3",
  "sideEffects": ["**/*.css"],
  "private": false
}`,
  },
] as const;

export const card = {
  lang: "jsx",
  code: `const App = () => {
  // Hello from every theme
  return <p className="hi">Hello, {name}!</p>;
};`,
};

/** The "Scope creep" refactor, with Shiki notation comments for highlighted rows. */
export const rows = {
  lang: "js",
  code: `const second = (a, bla) => { // [!code highlight]
  const foobar = a + bla;
  const third = (b) => { // [!code --]
    return foobar + b; // [!code --]
  }; // [!code --]
  return third(3, foobar);
};
const third = (b, foobar) => foobar + b; // [!code ++]`,
};
