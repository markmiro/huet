import { classes, type Surface } from "./classes";
import { themeVariables, type HuetTheme } from "./theme";
const surfaceClasses = classes.filter((x) => x.startsWith("huet-surface-"));
const selector = surfaceClasses.map((x) => `.${x}`).join(",");
const mounted = new WeakSet<HTMLElement>();
const owners = new WeakMap<HTMLElement, () => void>();
/** Mount once per independent tree. Only background surfaces receive inline variables. */
export function mountTheme(root: HTMLElement, initialTheme: HuetTheme) {
  if (
    mounted.has(root) ||
    root.parentElement?.closest("[data-huet-root]") ||
    root.querySelector("[data-huet-root]")
  ) {
    throw new Error(
      "Huet theme roots must be independent, non-overlapping trees",
    );
  }
  mounted.add(root);
  const previousRoot = root.getAttribute("data-huet-root");
  root.setAttribute("data-huet-root", "");
  let theme = initialTheme,
    disposed = false;
  const originals = new Map<HTMLElement, Map<string, [string, string]>>();
  const write = (el: HTMLElement, bg: string, adjacent = bg) => {
    let original = originals.get(el);
    if (!original) {
      // A surface may move between independent roots before either observer runs.
      // Release its old ownership before capturing values for the new mount.
      owners.get(el)?.();
      original = new Map();
      originals.set(el, original);
      owners.set(el, () => restore(el));
    }
    for (const [key, value] of Object.entries(
      themeVariables(theme.tokens(bg, adjacent)),
    )) {
      if (!original.has(key))
        original.set(key, [
          el.style.getPropertyValue(key),
          el.style.getPropertyPriority(key),
        ]);
      if (el.style.getPropertyValue(key) !== value)
        el.style.setProperty(key, value);
    }
  };
  const restore = (el: HTMLElement) => {
    if (!originals.has(el)) return;
    for (const [key, [value, priority]] of originals.get(el) ?? []) {
      if (value) el.style.setProperty(key, value, priority);
      else el.style.removeProperty(key);
    }
    originals.delete(el);
    owners.delete(el);
  };
  const surface = (el: HTMLElement, parent: string) => {
    const name = surfaceClasses.find((x) => el.classList.contains(x));
    if (!name) return parent;
    const suffix = name.slice("huet-surface-".length);
    return theme.surface(
      parent,
      (/^\d+$/.test(suffix) ? Number(suffix) : suffix) as Surface,
    );
  };
  const refresh = () => {
    if (disposed) return;
    const rootBackground = surface(root, theme.background);
    const backgrounds = new Map<HTMLElement, string>([[root, rootBackground]]);
    write(root, rootBackground);
    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const active = new Set([root, ...elements]);
    for (const el of originals.keys()) if (!active.has(el)) restore(el);
    for (const el of elements) {
      let parent = el.parentElement;
      while (parent && !backgrounds.has(parent)) parent = parent.parentElement;
      const parentBg = backgrounds.get(parent ?? root) ?? theme.background;
      const bg = surface(el, parentBg);
      backgrounds.set(el, bg);
      write(el, bg, parentBg);
    }
  };
  // Observe structure/classes only: our variable writes never trigger another pass.
  const Observer = root.ownerDocument.defaultView!.MutationObserver;
  const observer = new Observer(refresh);
  refresh();
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  return {
    update(next: HuetTheme) {
      if (disposed) throw new Error("Cannot update a destroyed Huet mount");
      theme = next;
      refresh();
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      for (const el of originals.keys()) restore(el);
      if (previousRoot === null) root.removeAttribute("data-huet-root");
      else root.setAttribute("data-huet-root", previousRoot);
      mounted.delete(root);
    },
  };
}
