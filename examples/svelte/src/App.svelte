<script>
  import { applyTheme, defaultTheme } from "huet";

  const themes = {
    default: defaultTheme,
    ocean: { dark: "#1d2a3a", light: "#e8f0ff", hues: { red: "#e5484d", blue: "#3e63dd" } },
  };

  // Keep the slider position when switching themes.
  let theme = themes.default;
  let bg = defaultTheme.bg;
  const apply = () => applyTheme(document.documentElement, { ...theme, bg });
</script>

<main class="mx-auto flex max-w-md flex-col gap-4 p-8">
  <div class="flex items-center gap-3 text-sm">
    <label class="flex flex-1 items-center gap-2">
      Background
      <input
        id="bg"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={defaultTheme.bg}
        class="flex-1 accent-100%"
        oninput={(e) => ((bg = e.currentTarget.valueAsNumber), apply())}
      />
    </label>
    <select id="theme" class="bg-0% border border-25% rounded px-2 py-1" onchange={(e) => ((theme = themes[e.currentTarget.value]), apply())}>
      <option value="default">Black / white</option>
      <option value="ocean">Ocean</option>
    </select>
  </div>
  <section id="card" class="bg-5% border border-15% rounded p-4 flex flex-col gap-3">
    <h1 class="text-xl font-semibold">huet + Svelte</h1>
    <p class="text-60%">Every color is a contrast amount relative to its parent background.</p>
    <input class="bg-0% border border-25% placeholder-50% rounded px-3 py-2" placeholder="Email address" />
    <button class="bg-100% rounded px-3 py-2 font-medium">Primary action</button>
    <div id="alert" class="hue-red bg-10% border border-30% rounded p-3">Something went wrong.</div>
    <div id="nested" class="nested">Nested card, 5% away from the card (scoped @apply).</div>
  </section>
</main>

<style>
  @reference "./app.css";
  .nested {
    @apply bg-5% rounded p-3;
  }
</style>
