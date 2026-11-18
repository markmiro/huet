/*
  The Huet panel paints after React hydrates, so every page load, and every
  preview iframe (blocks, charts, /create, /typeset), would first show stock
  shadcn colors. The root layout runs FIRST_PAINT_SCRIPT in <head>, before
  the first paint: it replays the top page's last paint (savePaint in
  shadcn-adapter.ts), and keeps an iframe hidden until its own paint lands
  (revealPaint), since a preview's charts, images and picks differ from the
  top page's.
*/

/** localStorage key of the last paint: <html>'s inline colors, its dark class, and the adapter's <style>s. */
export const PAINT_KEY = "huet-shadcn-paint"

/** How long an iframe stays hidden if Huet never paints, so a failed load still shows its page. */
const REVEAL_AFTER_MS = 4000

export const FIRST_PAINT_SCRIPT = `(function () {
  var root = document.documentElement
  if (window.self !== window.top) {
    root.style.visibility = "hidden"
    setTimeout(function () { root.style.removeProperty("visibility") }, ${REVEAL_AFTER_MS})
  }
  try {
    var paint = JSON.parse(localStorage.getItem(${JSON.stringify(PAINT_KEY)}) || "null")
    if (!paint) return
    for (var name in paint.vars) root.style.setProperty(name, paint.vars[name])
    root.classList.toggle("dark", !!paint.dark)
    for (var id in paint.styles) {
      var style = document.createElement("style")
      style.id = id
      style.textContent = paint.styles[id]
      document.head.appendChild(style)
    }
  } catch (_) {}
})()`
