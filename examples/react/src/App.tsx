import { applyTheme, defaultTheme, type ThemeInput } from "huet";

const themes: Record<string, ThemeInput> = {
  default: defaultTheme,
  ocean: { dark: "#1d2a3a", light: "#e8f0ff", hues: { red: "#e5484d", blue: "#3e63dd" } },
};

// Keep the slider position when switching themes.
let theme = themes.default;
let bg = defaultTheme.bg;
const apply = () => applyTheme(document.documentElement, { ...theme, bg });

export default function App() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <div className="flex items-center gap-3 text-sm">
        <label className="flex flex-1 items-center gap-2">
          Background
          <input
            id="bg"
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={bg}
            className="flex-1 accent-100%"
            onInput={(e) => {
              bg = e.currentTarget.valueAsNumber;
              apply();
            }}
          />
        </label>
        <select
          id="theme"
          className="bg-0% border border-25% rounded px-2 py-1"
          onChange={(e) => {
            theme = themes[e.currentTarget.value];
            apply();
          }}
        >
          <option value="default">Black / white</option>
          <option value="ocean">Ocean</option>
        </select>
      </div>
      <section id="card" className="bg-5% border border-15% rounded p-4 flex flex-col gap-3">
        <h1 className="text-xl font-semibold">huet + React</h1>
        <p className="text-60%">Every color is a contrast amount relative to its parent background.</p>
        <input className="bg-0% border border-25% placeholder-50% rounded px-3 py-2" placeholder="Email address" />
        <button className="bg-100% rounded px-3 py-2 font-medium">Primary action</button>
        <div id="alert" className="hue-red bg-10% border border-30% rounded p-3">
          Something went wrong.
        </div>
        <div id="nested" className="bg-5% rounded p-3">Nested card, 5% away from the card.</div>
      </section>
    </main>
  );
}
