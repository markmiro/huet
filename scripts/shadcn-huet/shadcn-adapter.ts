/*
  Paints a Huet theme onto a page styled with shadcn's CSS variables
  (--background, --primary, --chart-1…) and Tailwind's palette. No framework:
  the shadcn site's Huet panel (huet-configurator.tsx) and the Huet demo's
  shadcn pages (src/demo/shadcn) both call applyHuet.
*/
import chroma from "chroma-js"
import { themes as presets, type Hue, type Theme } from "huet"
import { coordinatesOf, mountImages, mountSvgs, recolorer } from "huet/images"
// shadcn's tokens need amounts and ramp positions that no class has, so this
// adapter uses Huet's solver directly.
import {
  contrast,
  rampThrough,
  resolveTheme,
  themeVariables,
  type ResolvedTheme,
} from "huet/internal"

/**
 * Neutrals (background, text, borders, fills) come from Huet. Every Tailwind
 * swatch moves onto the same position of the theme's neutral ramp, and a
 * colored one onto the theme's hues: `fill-green-500` becomes the theme's
 * green. Shade 50 stays the light step, 950 the dark one, so `dark:` variants
 * still pick the dark end.
 */

const STEPS = new Set(["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"])

type Swatch = { key: string; l: number; c: number; h: number }

let palette: Swatch[] | null = null
let ring: Swatch | null = null

export type ApplyOptions = {
  /** The Huet panel's edits to the page's accent and chart colors. */
  edits?: Edits
  /** Recolor the page's images and `data-huet-recolor` SVGs too. Defaults to true. */
  images?: boolean
  /** Keep every <header> on the page background, as the shadcn site's needs. Defaults to true. */
  header?: boolean
}

/** Paint `picked` at `pageBackground` (0 dark end, 1 light end) onto the whole document. */
export function applyHuet(
  picked: Theme,
  pageBackground: number,
  { edits: pageEdits = {}, images = true, header = true }: ApplyOptions = {},
) {
  edits = pageEdits
  stealPalette()
  const theme = resolveTheme(picked, { background: pageBackground })
  const page = roleColors(theme)
  const { isDark, background, foreground, mutedForeground, surface, accent, tokens, ink, fill } = page
  // A copy: the dark-island rule below takes only the role colors.
  const vars = { ...page.vars }
  // Tailwind swatches move onto the theme's ramp and hues (see placePalette).
  const place = swatchPlacer(picked, theme.ramp)
  Object.assign(vars, placePalette(palette ?? [], place, theme.ramp, isDark))
  // Plain white and black are not on the radioactive ramp. Use the ramp ends,
  // hue included, so `bg-white` becomes the theme's light color.
  vars["--color-white"] = theme.ramp(1)
  vars["--color-black"] = theme.ramp(0)
  // Chart steps stay on the readable side of this background: the text color
  // down to muted. A copied gray or blue ramp puts the dark steps on a dark
  // page and the light steps on a light page, so part of the series vanishes.
  const chartSteps = chartScale(foreground, mutedForeground)

  const root = document.documentElement
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value)
  root.style.backgroundColor = background
  painted = { theme, foreground, background, menuAccent: accent, chartSteps }
  paintBrand()
  paintDarkIslands(isDark ? null : roleColors(darkIsland(picked, pageBackground)), Object.keys(page.vars))
  paintThemeHues(theme, place, foreground, background, tokens.red, ink(fill("red")))
  paintChartConfigs(foreground, mutedForeground)
  if (header) paintTopNav(background)
  paintCode(theme, background, surface)
  if (images) {
    paintImages(picked)
    paintSvgs(picked)
  }
  root.classList.toggle("dark", isDark)
  root.style.colorScheme = isDark ? "dark" : "light"
}

/** Dark mode follows Huet's own polarity: the page is dark when its text is lighter. */
function isDarkTheme(theme: ResolvedTheme) {
  return luminance(theme.step(theme.root, 100).hex) > luminance(theme.tokens().background)
}

/**
 * shadcn's color roles (background, card, muted, sidebar…) on one of the
 * theme's backgrounds, plus the pieces the page builds on. Primary, accent
 * and charts come from the page's picks (paintBrand).
 */
function roleColors(theme: ResolvedTheme) {
  const tokens = theme.tokens()
  // Match the configurator: primary and foreground use the full contrast range.
  const foreground = theme.step(theme.root, 100).hex
  const isDark = isDarkTheme(theme)
  // shadcn's dark page is near-black; its light page is the ramp endpoint.
  const background = isDark ? theme.step(theme.root, 2.75).hex : tokens.background
  const page = theme.surfaceOf(background)
  // Steps, not theme.surface(): its readability nudge jumps far off mid-tone pages.
  const fill = (amount: Parameters<typeof theme.surface>[1]) =>
    typeof amount === "number" ? theme.step(page, amount).hex : theme.surface(background, amount)
  const mutedForeground = theme.step(theme.root, isDark ? 66 : 51.5).hex
  const ink = (surface: string) => theme.surface(surface, 100)

  const card = fill(isDark ? 5 : 0)
  const muted = fill(isDark ? 13 : 3.5)
  const accent = fill(isDark ? 25 : 3.5)
  const secondary = muted
  const sidebar = fill(isDark ? 5 : 1.75)
  const surface = fill(isDark ? 5 : 2.3)
  const border = isDark
    ? `color-mix(in srgb, ${theme.ramp(1)} 10%, transparent)`
    : fill(9)
  const themedRing = ring ? theme.ramp(clamp01(ring.l)) : tokens.border

  const vars: Record<string, string> = {
    "--background": background,
    "--foreground": foreground,
    "--card": card,
    "--card-foreground": ink(card),
    "--popover": card,
    "--popover-foreground": foreground,
    "--secondary": secondary,
    "--secondary-foreground": ink(secondary),
    "--muted": muted,
    "--muted-foreground": mutedForeground,
    "--destructive": tokens.red,
    "--destructive-foreground": ink(fill("red")),
    "--border": border,
    "--input": isDark ? `color-mix(in srgb, ${theme.ramp(1)} 15%, transparent)` : border,
    "--ring": themedRing,
    "--sidebar": sidebar,
    "--sidebar-foreground": ink(sidebar),
    "--sidebar-accent": accent,
    "--sidebar-accent-foreground": ink(accent),
    "--sidebar-border": border,
    "--sidebar-ring": themedRing,
    "--surface": surface,
    // Light surfaces keep the page's text color. Muted gray made the card
    // title as dim as the body copy.
    "--surface-foreground": foreground,
    "--code": surface,
    "--code-foreground": foreground,
    "--code-highlight": fill(isDark ? 13 : 4.6),
    "--code-number": mutedForeground,
    "--selection": foreground,
    "--selection-foreground": background,
    // Tinted bubbles take their hue from --primary and their lightness from these.
    "--huet-bubble-tint": rampLightness(theme.ramp, 0.93),
    "--huet-bubble-tint-hover": rampLightness(theme.ramp, 0.88),
    "--huet-bubble-tint-dark": rampLightness(theme.ramp, 0.3),
    "--huet-bubble-tint-dark-hover": rampLightness(theme.ramp, 0.35),
  }
  return { vars, isDark, background, foreground, mutedForeground, surface, accent, tokens, ink, fill }
}

/**
 * The theme on a dark background, for the parts of a light page that shadcn
 * keeps dark (`className="dark"`): the /create and /typeset side menus, the
 * bottom toolbars, and dialogs. The same distance from the dark end as the
 * page is from the light one, and at least as dark as shadcn's own.
 */
function darkIsland(picked: Theme, pageBackground: number) {
  const position = Math.min(1 - pageBackground, 0.25)
  const island = resolveTheme(picked, { background: position })
  if (isDarkTheme(island)) return island
  // A ramp that runs light to dark has its dark end at the other side.
  return resolveTheme(picked, { background: 1 - position })
}

/** The roles paintBrand sets on <html>, which globals.css's .dark rule also overrides. */
const BRAND_ROLES = [
  "--primary",
  "--primary-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--accent",
  "--accent-foreground",
]

/**
 * globals.css gives every `.dark` element shadcn's own near-black grays, which
 * beat the Huet colors inherited from <html>. On a light page they get the
 * theme's dark roles (`island`), with primary as their max-contrast invert.
 * On a dark page they inherit the page's, picked accent included.
 */
function paintDarkIslands(island: ReturnType<typeof roleColors> | null, roles: string[]) {
  let style = document.getElementById("huet-dark")
  if (!style) {
    style = document.createElement("style")
    style.id = "huet-dark"
    document.head.append(style)
  }
  const vars: Record<string, string> = island
    ? {
        ...island.vars,
        "--primary": island.foreground,
        "--primary-foreground": island.background,
        "--sidebar-primary": island.foreground,
        "--sidebar-primary-foreground": island.background,
        "--accent": island.accent,
        "--accent-foreground": island.ink(island.accent),
      }
    : Object.fromEntries([...roles, ...BRAND_ROLES].map((name) => [name, "inherit"]))
  const decls = Object.entries(vars).map(([name, value]) => `${name}:${value}!important`)
  // <html> takes the page's colors inline; only the elements inside it are islands.
  style.textContent = `.dark:not(html){${decls.join(";")}}`
}

/** What applyHuet painted last: the picked theme and chart colors are placed against it. */
let painted: {
  theme: ResolvedTheme
  foreground: string
  background: string
  /** The neutral fill menus highlight with, unless they use the accent. */
  menuAccent: string
  /** The readable chart steps, from the text color to muted. */
  chartSteps: string[]
} | null = null

/** The page's own color picks: shadcn's theme (accent) color and chart color. */
type Brand = {
  /** The theme color primary takes. A gray one leaves primary the invert. */
  accent: string
  /** Menu Accent: Bold, where menus highlight with the accent too. */
  boldMenus: boolean
  /** The chart palette, chart-1 first. */
  chart: string[]
}

/** The page's own colors by name, as the Huet panel shows them. */
export type PageColors = Record<string, string[]>
/** Edits made in the Huet panel, each with the page's own colors it replaces. */
export type Edits = Record<string, { own: string[]; colors: string[] }>

/** The Huet panel's edits to the page's colors, from the saved state. */
let edits: Edits = {}

export const sameColors = (a: readonly string[] | undefined, b: readonly string[] | undefined) =>
  JSON.stringify(a) === JSON.stringify(b)

/**
 * An edit replaces the page's own colors it was made from. When the page's
 * own change, such as a new pick on /create, the edit no longer applies.
 */
function edited(name: string, own: string[]) {
  const edit = edits[name]
  return edit && sameColors(edit.own, own) ? edit.colors : own
}

/** Where /create's preview writes the picked base color, theme and chart color. */
const DESIGN_SYSTEM = "design-system-theme-vars"

/** Stylesheets the site ships, without /create's picks or this adapter's own repaints. */
function pageSheets() {
  return Array.from(document.styleSheets).filter((sheet: CSSStyleSheet) => {
    const id = sheet.ownerNode instanceof Element ? sheet.ownerNode.id : ""
    return id !== DESIGN_SYSTEM && !id.startsWith("huet-")
  })
}

/** The light-mode variables /create's preview picked, if this is that preview. */
function designSystemVars() {
  const element = document.getElementById(DESIGN_SYSTEM)
  const sheet = element instanceof HTMLStyleElement ? element.sheet : null
  for (const rule of sheet?.cssRules ?? []) {
    if (!(rule instanceof CSSStyleRule) || rule.selectorText !== ":root") continue
    const vars = new Map<string, string>()
    for (let i = 0; i < rule.style.length; i++) {
      const prop = rule.style.item(i)
      vars.set(prop, rule.style.getPropertyValue(prop).trim())
    }
    return vars
  }
}

const hexOf = (swatch: Swatch) => chroma.oklch(swatch.l, swatch.c, swatch.h).hex()
const isGray = (color: string) => !(chroma(color).oklch()[1] >= 0.02)

/** What the site's gray primary stands for: a mid gray, so a saturation edit has room to show. */
const GRAY_ACCENT = "#737373"

/**
 * On /create, the theme and chart color picked there. Huet keeps their hue
 * and chroma and picks their lightness. Elsewhere, the site's own: a gray
 * primary, so primary stays the invert, and the blue chart palette.
 */
function readBrand(): Brand {
  const vars = designSystemVars()
  const color = (prop: string, raw = vars?.get(prop)) => {
    const swatch = raw ? readSwatch(prop, raw) : undefined
    return swatch ? [hexOf(swatch)] : []
  }
  if (!vars) {
    const blue = [300, 500, 600, 700, 800].map((step) =>
      palette?.find((swatch) => swatch.key === `--color-blue-${step}`),
    )
    return {
      accent: GRAY_ACCENT,
      boldMenus: false,
      chart: blue.flatMap((swatch) => (swatch ? [hexOf(swatch)] : [])),
    }
  }
  const [primary = GRAY_ACCENT] = color("--primary")
  return {
    accent: primary,
    // shadcn's Bold menu accent copies primary into accent.
    boldMenus: Boolean(vars.get("--accent")) && vars.get("--accent") === vars.get("--primary"),
    chart: [1, 2, 3, 4, 5].flatMap((i) => color(`--chart-${i}`)),
  }
}

/**
 * The accent as a fill (primary) under text in the page color
 * (primary-foreground). Of the steps on its ramp where that text reads at
 * Lc 75, or as close as the theme's range allows, the one nearest the
 * picked color's own lightness.
 */
function accentFill(theme: ResolvedTheme, color: string, text: string, foreground: string) {
  const ramp = rampThrough(theme.dark, theme.light, [color])
  const target = Math.min(75, (contrast(text, foreground) * 75) / 90)
  const [picked] = chroma(color).oklch()
  let nearest: string | undefined
  let gap = Infinity
  let strongest = color
  let strongestLc = -1
  for (let i = 0; i <= 256; i++) {
    const step = ramp(i / 256)
    const lc = contrast(step, text)
    if (lc > strongestLc) [strongest, strongestLc] = [step, lc]
    const distance = Math.abs(chroma(step).oklch()[0] - picked)
    if (lc >= target && distance < gap) [nearest, gap] = [step, distance]
  }
  return nearest ?? strongest
}

/**
 * Five chart series from a palette, chart-1 first. A gray palette takes the
 * theme's own readable steps (text color to muted). A colored one sits on
 * its ramp (rampThrough), keeping the palette's hue and
 * chroma: the series spread evenly in contrast with the page, from Lc 90
 * (text) to Lc 45 (large graphics), scaled down on themes that can't reach
 * Lc 90.
 * The steps themselves start at the theme's end color, which has no hue.
 */
function chartSeries(colors: string[]) {
  if (!painted) return []
  const { theme, background, foreground, chartSteps } = painted
  if (colors.every(isGray)) return chartSteps
  const ramp = rampThrough(theme.dark, theme.light, colors)
  // Just short of the text on narrow themes, where only the gray end color reaches it.
  const strongest = Math.min(90, contrast(background, foreground) * 0.9)
  const weakest = Math.min(45, strongest / 2)
  // Walk from the page's lightness toward the text: the first step that reaches each target.
  const [from] = chroma(background).oklch()
  const [to] = chroma(foreground).oklch()
  const path = Array.from({ length: 257 }, (_, i) => ramp.at(from + ((to - from) * i) / 256))
  return [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const target = strongest + (weakest - strongest) * t
    return path.find((color) => contrast(background, color) >= target) ?? path[path.length - 1]
  })
}

/**
 * Primary, menu accents and charts from the page's picks (readBrand), or the
 * Huet panel's edits of them. /create changes its picks without a reload, so
 * this repaints whenever they change.
 */
function paintBrand() {
  if (!painted) return
  const { theme, foreground, background, menuAccent, chartSteps } = painted
  const brand = readBrand()
  const [accent] = edited("Accent", [brand.accent])
  // A gray accent keeps primary as the max-contrast invert of the background.
  const primary = isGray(accent) ? foreground : accentFill(theme, accent, background, foreground)
  const chart = chartSeries(edited("Chart", brand.chart))
  const vars: Record<string, string> = {
    "--primary": primary,
    "--primary-foreground": background,
    "--sidebar-primary": primary,
    "--sidebar-primary-foreground": background,
    "--accent": brand.boldMenus ? primary : menuAccent,
    "--accent-foreground": brand.boldMenus ? background : theme.surface(menuAccent, 100),
  }
  chart.forEach((color, index) => (vars[`--chart-${index + 1}`] = color))
  const root = document.documentElement
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value)
  paintCharts(chartSteps, chart)
  publishPageColors({ Accent: [brand.accent], Chart: brand.chart })
  watchBrand()
}

let brandWatch: MutationObserver | null = null
const isDesignSystem = (node: Node) =>
  (node instanceof Element ? node : node.parentElement)?.id === DESIGN_SYSTEM

function watchBrand() {
  if (brandWatch) return
  brandWatch = new MutationObserver((records) => {
    const changed = records.some(
      (record) =>
        isDesignSystem(record.target) ||
        [...record.addedNodes, ...record.removedNodes].some(isDesignSystem),
    )
    if (changed) paintBrand()
  })
  brandWatch.observe(document.head, { subtree: true, childList: true, characterData: true })
}

export const PAGE_COLORS_MESSAGE = "huet-shadcn-page-colors"
let ownColors: PageColors | undefined
let showOwnColors: ((colors: PageColors) => void) | null = null

/**
 * Block, chart and component previews load the shadcn site in iframes, and
 * each one mounts the layout. Only the top page shows the Huet panel.
 */
export const embedded = typeof window !== "undefined" && window.self !== window.top

/** The page's own accent and chart colors, last painted. */
export const pageColors = () => ownColors

/** Call `listener` with the page's own colors each time they're painted. Returns an unsubscribe. */
export function onPageColors(listener: (colors: PageColors) => void) {
  showOwnColors = listener
  return () => {
    if (showOwnColors === listener) showOwnColors = null
  }
}

/**
 * Show the page's own accent and chart colors in the Huet panel. The /create
 * preview paints in an iframe, so it sends its colors up to the top page's
 * panel.
 */
function publishPageColors(colors: PageColors) {
  if (embedded) {
    if (designSystemVars()) window.parent.postMessage({ type: PAGE_COLORS_MESSAGE, colors }, location.origin)
    return
  }
  ownColors = colors
  showOwnColors?.(colors)
}

export const samePageColors = (a: PageColors | undefined, b: PageColors | undefined) =>
  JSON.stringify(a) === JSON.stringify(b)

/** Read each Tailwind swatch once, before inline overrides replace it. */
function stealPalette() {
  if (palette) return
  const specified = new Map<string, string>()
  const visit = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText
        if (selector.includes(".dark") || selector.includes("theme-")) continue
        const style = rule.style
        for (let i = 0; i < style.length; i++) {
          const prop = style.item(i)
          if (specified.has(prop)) continue
          const step = prop.slice(prop.lastIndexOf("-") + 1)
          const isSwatch = prop.startsWith("--color-") && STEPS.has(step)
          const isRole = prop === "--ring"
          if (!isSwatch && !isRole) continue
          const value = style.getPropertyValue(prop).trim()
          if (!value || value.includes("var(")) continue
          specified.set(prop, value)
        }
      } else if (rule instanceof CSSGroupingRule) {
        visit(rule.cssRules)
      }
    }
  }
  for (const sheet of pageSheets()) {
    try {
      visit(sheet.cssRules)
    } catch {
      // Ignore sheets the browser will not expose.
    }
  }
  palette = []
  for (const [key, raw] of specified) {
    const swatch = readSwatch(key, raw)
    if (!swatch) continue
    if (key === "--ring") ring = swatch
    else palette.push(swatch)
  }
}

function readSwatch(key: string, raw: string): Swatch | undefined {
  const oklch = raw.match(/oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)/i)
  if (oklch) {
    let l = Number(oklch[1].replace("%", ""))
    if (oklch[1].includes("%")) l /= 100
    return { key, l, c: Number(oklch[2]), h: Number(oklch[3]) }
  }
  try {
    const [l, c, h] = chroma(raw).oklch()
    if (!Number.isFinite(l)) return
    return { key, l, c: Number.isFinite(c) ? c : 0, h: Number.isFinite(h) ? h : 0 }
  } catch {
    return
  }
}

type Place = ((swatch: Swatch) => string) & {
  oklchOf: (swatch: Swatch, darkPage?: number) => [number, number, number]
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const lightnessOf = (color: string) => clamp01(chroma(color).oklch()[0] || 0)

/** Gamma-encoded sRGB channels (0–1) of an OKLCH swatch. */
function channels({ l, c, h }: Swatch) {
  const [r, g, b] = chroma.oklch(l, c, h).rgb(false)
  return [r / 255, g / 255, b / 255] as const
}

/**
 * Where a Tailwind swatch lands in the theme. A gray or white one takes the
 * ramp color at the same position, so a theme like Radioactive does not
 * collapse back to plain white.
 *
 * A colored one moves onto the theme's hues the way Huet recolors SVGs (a
 * green onto the theme's green, a sky blue between its green and blue), and
 * its shade scale is pinned to the theme's own color: the 500 of the nearest
 * Tailwind hue takes that color's lightness, lighter shades run up to the
 * ramp's light end and darker ones down to its dark end. So
 * `fill-green-500` is the theme's green, not Tailwind's bright one at the
 * theme's lightness.
 */
function swatchPlacer(picked: Theme, ramp: (amount: number) => string): Place {
  // Tint 0 keeps the neutral ramp's cast out of saturated colors.
  const toTheme = recolorer({ ...picked, svgs: { strength: 1, tint: 0 } }, {}, "svgs")
  // Base's colors are Huet's defaults, which a theme without its own uses.
  const colors: Partial<Record<Hue, string>> = { ...presets.Base.colors, ...picked.colors }
  const [dark, light] = [lightnessOf(ramp(0)), lightnessOf(ramp(1))].sort((a, b) => a - b)
  const fives = (palette ?? []).filter((swatch) => swatch.key.endsWith("-500") && swatch.c >= 0.02)
  const anchorCache = new Map<Swatch, number>()
  /** Lightness of the theme's color at this 500 shade's hue, between the ramp ends. */
  const anchorOf = (five: Swatch) => {
    let cached = anchorCache.get(five)
    if (cached !== undefined) return cached
    const { weights } = coordinatesOf(channels(five) as [number, number, number])
    let sum = 0
    let total = 0
    for (const [hue, weight] of Object.entries(weights) as [Hue, number][]) {
      const color = colors[hue]
      if (!color || !weight) continue
      sum += weight * lightnessOf(color)
      total += weight
    }
    cached = Math.min(light, Math.max(dark, total ? sum / total : five.l))
    anchorCache.set(five, cached)
    return cached
  }
  /**
   * The OKLCH a colored swatch lands on. `darkPage` is the lightness that maps
   * to the ramp's dark end: 0 for a lone color, shadcn's dark page for
   * Tailwind's palette (see placePalette).
   */
  const oklchOf = (swatch: Swatch, darkPage = 0): [number, number, number] => {
    const [, mappedC, mappedH] = chroma.gl(...toTheme(...channels(swatch)), 1).oklch()
    const [c, h] =
      Number.isFinite(mappedH) && mappedC >= 0.02 ? [mappedC, mappedH] : [swatch.c, swatch.h]
    const five = nearestHue(fives, swatch.h)
    const fromDark = (l: number) => clamp01((l - darkPage) / (1 - darkPage))
    if (!five || five.l <= 0 || five.l >= 1) return [lightnessOf(ramp(fromDark(swatch.l))), c, h]
    const anchor = anchorOf(five)
    const lightness =
      swatch.l <= five.l
        ? dark + clamp01((swatch.l - darkPage) / (five.l - darkPage)) * (anchor - dark)
        : anchor + ((swatch.l - five.l) / (1 - five.l)) * (light - anchor)
    return [lightness, c, h]
  }
  const place = (swatch: Swatch) =>
    swatch.c < 0.02 ? ramp(clamp01(swatch.l)) : inGamut(...oklchOf(swatch))
  return Object.assign(place, { oklchOf })
}

/** Tailwind's gray families. Their slight tint only flavors the stock neutrals. */
const NEUTRAL_FAMILIES = new Set(["slate", "gray", "zinc", "neutral", "stone", "mauve", "olive", "mist", "taupe"])

/**
 * Tailwind's palette was made for shadcn's pages: white, and this lightness in
 * dark mode. Measuring from those two puts the page-adjacent shades next to
 * the theme's page in both modes. From 0, a 950 fill sat twice as far from a
 * dark page as on stock shadcn.
 */
const STOCK_DARK_PAGE = 0.145

/** A Tailwind OKLCH lightness as a position on the theme's neutral ramp. */
const rampPosition = (lightness: number) => clamp01((lightness - STOCK_DARK_PAGE) / (1 - STOCK_DARK_PAGE))

/** Chroma at which a shade beside the page stops taking on the ramp's tint. Most 300s are past it. */
const FULL_CHROMA = 0.1

/**
 * Tailwind's palette (`--color-red-50` …) on the theme. Grays take the neutral
 * ramp's color. Colored shades go through `place` (the theme's hues, pinned to
 * its colors) and take the hue of their family's most colorful shade, then:
 *
 * - Beside the page (50 on a light page, 950 on a dark one), a shade has at
 *   most as much color as its distance from the page, like `huet-bg-red-10`:
 *   a quarter of the way to its family's most colorful shade gets at most a
 *   quarter of that chroma. It keeps the ramp's tint, the more the paler it
 *   is, so `bg-red-50` on a lime page is the page with a little red.
 * - On the far side, text shades (900 on a light page, 50 on a dark one) keep
 *   no tint and are at least as colorful as their mirror beside the page (50
 *   as 950). Tailwind makes every 50 nearly white, so dark-mode alert text
 *   lost the alert's color.
 */
function placePalette(swatches: Swatch[], place: Place, ramp: (amount: number) => string, isDark: boolean) {
  const vars: Record<string, string> = {}
  const families = new Map<string, Swatch[]>()
  for (const swatch of swatches) {
    const family = swatch.key.match(/^--color-([a-z]+)-\d+$/)?.[1]
    if (!family) vars[swatch.key] = place(swatch)
    else families.set(family, [...(families.get(family) ?? []), swatch])
  }
  const tint = rampTint(ramp)
  for (const [family, shades] of families) {
    if (NEUTRAL_FAMILIES.has(family)) {
      for (const shade of shades) vars[shade.key] = ramp(rampPosition(shade.l))
      continue
    }
    const placed = new Map(shades.map((shade) => [shade.key, place.oklchOf(shade, STOCK_DARK_PAGE)]))
    const peak = shades.reduce((best, shade) => (shade.c > best.c ? shade : best))
    // Recoloring a near-white or near-black shade lands on the ramp's own hue
    // (lime for red-50 on Radioactive), so every shade takes the family's.
    const [, peakChroma, hue] = placed.get(peak.key)!
    /** Chroma of a shade beside the page, capped by its distance from the page. */
    const besidePage = (shade: Swatch) => {
      const position = rampPosition(shade.l)
      const peakPosition = rampPosition(peak.l)
      const fromPage = position >= peakPosition
        ? (1 - position) / Math.max(1e-6, 1 - peakPosition)
        : position / Math.max(1e-6, peakPosition)
      return Math.min(placed.get(shade.key)![1], Math.min(1, fromPage) * peakChroma)
    }
    const byStep = new Map(shades.map((shade) => [Number(shade.key.slice(shade.key.lastIndexOf("-") + 1)), shade]))
    for (const [step, shade] of byStep) {
      const [l, placedChroma] = placed.get(shade.key)!
      const far = isDark ? step < 500 : step > 500
      const mirror = byStep.get(1000 - step)
      const c = far ? Math.max(placedChroma, mirror ? besidePage(mirror) : 0) : besidePage(shade)
      const keep = far ? 0 : 1 - Math.min(1, c / FULL_CHROMA)
      vars[shade.key] = tinted(l, c, hue, tint(l), keep)
    }
  }
  return vars
}

/** The neutral ramp's OKLab tint (a, b) at a lightness. */
function rampTint(ramp: (amount: number) => string) {
  const ascending = lightnessOf(ramp(1)) >= lightnessOf(ramp(0))
  return (lightness: number): [number, number] => {
    let low = 0
    let high = 1
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2
      if (lightnessOf(ramp(mid)) < lightness === ascending) low = mid
      else high = mid
    }
    const [, a, b] = chroma(ramp((low + high) / 2)).oklab()
    return [a, b]
  }
}

/** OKLCH plus `keep` of a tint, with chroma reduced until it fits sRGB so its hue holds. */
function tinted(l: number, c: number, h: number, [tintA, tintB]: [number, number], keep: number) {
  const angle = (h * Math.PI) / 180
  const at = (amount: number) =>
    chroma.oklab(clamp01(l), tintA * keep + amount * Math.cos(angle), tintB * keep + amount * Math.sin(angle))
  let color = at(c)
  for (let i = 0; i < 24 && color.clipped(); i++) color = at((c *= 0.9))
  return color.hex()
}

function nearestHue(swatches: Swatch[], hue: number) {
  let best: Swatch | undefined
  let bestDistance = Infinity
  for (const swatch of swatches) {
    const distance = Math.abs(((swatch.h - hue + 540) % 360) - 180)
    if (distance < bestDistance) [best, bestDistance] = [swatch, distance]
  }
  return best
}

/** An OKLCH color, with chroma reduced until it fits sRGB so its hue holds. */
function inGamut(lightness: number, c: number, h: number) {
  const l = Math.min(1, Math.max(0, lightness))
  if (!chroma.oklch(l, c, h).clipped()) return chroma.oklch(l, c, h).hex()
  let low = 0
  let high = c
  for (let i = 0; i < 16; i++) {
    const mid = (low + high) / 2
    if (chroma.oklch(l, mid, h).clipped()) high = mid
    else low = mid
  }
  return chroma.oklch(l, low, h).hex()
}

function rampLightness(ramp: (amount: number) => string, position: number) {
  const [lightness] = chroma(ramp(position)).oklch()
  return String(Math.min(1, Math.max(0, lightness)))
}

const NEUTRALS = new Set([
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--border",
  "--input",
  "--ring",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
])

let themeRules: Map<string, Map<string, string>> | null = null

const INVERT = new Set(["--primary", "--sidebar-primary"])
const INVERT_TEXT = new Set(["--primary-foreground", "--sidebar-primary-foreground"])

/** Five stops from the text color toward muted, so every step stays readable. */
function chartScale(foreground: string, muted: string) {
  return [0, 0.25, 0.5, 0.75, 1].map((t) => mixOklch(foreground, muted, t))
}

function mixOklch(from: string, to: string, t: number) {
  const [l1, c1, h1] = chroma(from).oklch()
  const [l2, c2, h2] = chroma(to).oklch()
  const startC = Number.isFinite(c1) ? c1 : 0
  const endC = Number.isFinite(c2) ? c2 : 0
  const startH = Number.isFinite(h1) ? h1 : Number.isFinite(h2) ? h2 : 0
  const endH = Number.isFinite(h2) ? h2 : startH
  let dh = endH - startH
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  return chroma
    .oklch(
      Math.min(1, Math.max(0, l1 + (l2 - l1) * t)),
      Math.max(0, startC + (endC - startC) * t),
      startH + dh * t,
    )
    .hex()
}

/** A color, or a var() naming one of Tailwind's swatches, as a swatch. */
function resolveSwatch(raw: string) {
  const ref = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (ref) return palette?.find((swatch) => swatch.key === ref[1])
  return readSwatch("chart", raw)
}

let chartRules: Map<string, Map<string, string>> | null = null

/** Rules for the whole page, which the picked chart color (readBrand) decides. */
const pageWide = /^(?::root|html|\.dark|:root\.dark|html\.dark)$/

/**
 * Home-page cards and chart pages restamp --chart-* with a gray or blue
 * palette. Repaint each rule's series from its own palette (chartSeries),
 * so they stay readable on the theme. The page-wide rules take `chart`, the
 * picked palette, as the root does.
 */
function paintCharts(steps: string[], chart: string[]) {
  if (!chartRules) chartRules = collectChartRules()
  let css = ""
  for (const [selector, props] of chartRules) {
    const own = pageWide.test(selector)
      ? chart
      : chartSeries(
          [...props.values()].flatMap((raw) => {
            const swatch = resolveSwatch(raw)
            return swatch ? [hexOf(swatch)] : []
          }),
        )
    const decls: string[] = []
    for (const prop of props.keys()) {
      const index = Number(prop.slice("--chart-".length)) - 1
      const color = own[index] ?? own[own.length - 1] ?? steps[index]
      if (!color) continue
      decls.push(`${prop}: ${color} !important`)
    }
    if (decls.length) css += `${selector}{${decls.join(";")}}`
  }
  let style = document.getElementById("huet-charts")
  if (!style) {
    style = document.createElement("style")
    style.id = "huet-charts"
    document.head.append(style)
  }
  style.textContent = css
}

function collectChartRules() {
  const rules = new Map<string, Map<string, string>>()
  const visit = (list: CSSRuleList) => {
    for (const rule of list) {
      if (rule instanceof CSSStyleRule) {
        const style = rule.style
        let props = rules.get(rule.selectorText)
        for (let i = 0; i < style.length; i++) {
          const prop = style.item(i)
          if (!/^--chart-\d+$/.test(prop)) continue
          const value = style.getPropertyValue(prop).trim()
          if (!value) continue
          if (!props) rules.set(rule.selectorText, (props = new Map()))
          props.set(prop, value)
        }
      } else if (rule instanceof CSSGroupingRule) {
        visit(rule.cssRules)
      }
    }
  }
  for (const sheet of pageSheets()) {
    try {
      visit(sheet.cssRules)
    } catch {
      // Ignore sheets the browser will not expose.
    }
  }
  return rules
}

/** A series' hue and chroma at a readable step's lightness. A gray series takes the step. */
function tintChart(step: string, swatch: Swatch) {
  if (swatch.c < 0.02) return step
  const [lightness] = chroma(step).oklch()
  if (!Number.isFinite(lightness)) return step
  return chroma.oklch(Math.min(1, Math.max(0, lightness)), swatch.c, swatch.h).hex()
}

let chartConfigColor: ((swatch: Swatch, t: number) => string) | null = null
let chartConfigWatch: MutationObserver | null = null
const reportedChartColors = new Set<string>()

/** Paints that already follow the theme through CSS. */
const followsCss = /var\(|currentcolor|inherit/i

const isChartStyle = (node: Node) =>
  node instanceof HTMLStyleElement && (node.textContent ?? "").includes("[data-chart=")
const holdsChartStyle = (node: Node) =>
  isChartStyle(node) ||
  (node instanceof Element && [...node.querySelectorAll("style")].some(isChartStyle))

/**
 * ChartContainer writes each chart's config into its own <style>, as
 * `[data-chart=…] { --color-desktop: … }`. A config color given as a CSS
 * variable already follows the theme. Literal ones, such as the docs'
 * `#2563eb` and `#60a5fa`, spread over the same readable scale as
 * --chart-N, darkest at the text color and lightest at muted, so the
 * series stay apart. Each keeps its hue.
 */
function paintChartConfigs(foreground: string, muted: string) {
  // Unlike a --chart-N palette, a config's colors can be unrelated hues, such
  // as red and green series, so each keeps its own hue instead of a shared ramp.
  chartConfigColor = (swatch, t) => tintChart(mixOklch(foreground, muted, t), swatch)
  if (!chartConfigWatch) {
    // Charts mount, unmount and change config after the theme is applied.
    chartConfigWatch = new MutationObserver((records) => {
      const touched = records.some(
        (record) =>
          isChartStyle(record.target) ||
          (record.target.parentNode !== null && isChartStyle(record.target.parentNode)) ||
          [...record.addedNodes, ...record.removedNodes].some(holdsChartStyle),
      )
      if (touched) writeChartConfigs()
    })
    chartConfigWatch.observe(document.body, { subtree: true, childList: true, characterData: true })
  }
  writeChartConfigs()
}

function writeChartConfigs() {
  const color = chartConfigColor
  if (!color) return
  let css = ""
  for (const element of document.querySelectorAll("style")) {
    if (!isChartStyle(element) || !element.sheet) continue
    for (const rule of element.sheet.cssRules) {
      if (!(rule instanceof CSSStyleRule)) continue
      const literal: Swatch[] = []
      for (let i = 0; i < rule.style.length; i++) {
        const prop = rule.style.item(i)
        if (!prop.startsWith("--color-")) continue
        const raw = rule.style.getPropertyValue(prop).trim()
        if (!raw || followsCss.test(raw)) continue
        const swatch = readSwatch(prop, raw)
        if (!swatch) {
          const report = `${rule.selectorText} ${prop}: ${raw}`
          if (!reportedChartColors.has(report)) {
            reportedChartColors.add(report)
            console.error(
              `Huet can't theme the chart color ${prop}: ${raw} (${rule.selectorText}). ` +
                "Give the chart config a CSS color or a var(), such as var(--chart-1).",
            )
          }
          continue
        }
        literal.push(swatch)
      }
      if (!literal.length) continue
      literal.sort((a, b) => a.l - b.l)
      const last = Math.max(1, literal.length - 1)
      const decls = literal.map((swatch, i) => `${swatch.key}: ${color(swatch, i / last)} !important`)
      css += `${rule.selectorText}{${decls.join(";")}}`
    }
  }
  let style = document.getElementById("huet-chart-configs")
  if (!style) {
    style = document.createElement("style")
    style.id = "huet-chart-configs"
    document.head.append(style)
  }
  if (style.textContent !== css) style.textContent = css
}

/** The site header stays on the theme background instead of a hardcoded white. */
function paintTopNav(background: string) {
  let style = document.getElementById("huet-top-nav")
  if (!style) {
    style = document.createElement("style")
    style.id = "huet-top-nav"
    document.head.append(style)
  }
  style.textContent = `header{background-color:${background}!important}`
}

/**
 * Every highlighter on the site wraps its Shiki themes in huetShikiTheme()
 * (integration.patch): tokens keep shadcn's hues and take their lightness from
 * Huet's variables, which no mount sets here. Write them for
 * the surfaces code sits on: shadcn's --code fill under rehype-pretty-code
 * figures (docs, install commands, component, block and chart source), and the
 * page everywhere else, such as the registry's CodeBlock.
 */
function paintCode(theme: ResolvedTheme, page: string, code: string) {
  const on = (background: string) =>
    Object.entries(themeVariables(theme.tokensOn(theme.surfaceOf(background))))
      .map(([name, value]) => `${name}:${value}`)
      .join(";")
  let style = document.getElementById("huet-code")
  if (!style) {
    style = document.createElement("style")
    style.id = "huet-code"
    document.head.append(style)
  }
  style.textContent = `:root{${on(page)}}[data-rehype-pretty-code-figure]{${on(code)}}`
  watchCode()
}

// Shiki's inline token colors. A fixed theme writes hex, which React and the
// browser may turn into rgb(); Huet's are oklch(from var(--huet-…)) or var().
const tokenSelector = "pre span[style], [data-slot=code-block-content] span[style]"
const fixedColor = /#[\da-f]{3,8}\b|rgba?\(/i
const reported = new WeakSet<Element>()
let codeWatch: MutationObserver | null = null

/**
 * Report code highlighted with a fixed Shiki theme (a new highlighter, or one
 * added upstream): its colors can't follow the theme, and nothing else fails.
 */
function checkCode(root: Element | Document) {
  const tokens = [...root.querySelectorAll<HTMLElement>(tokenSelector)]
  if (root instanceof HTMLElement && root.matches(tokenSelector)) tokens.push(root)
  for (const token of tokens) {
    // Only the token's own color: Huet surfaces also carry their variables inline.
    const style = token.style.getPropertyValue("color")
    if (!fixedColor.test(style)) continue
    const block = token.closest("pre, [data-slot=code-block]") ?? token
    if (reported.has(block)) continue
    reported.add(block)
    console.error(
      `Huet: this code block was highlighted with a fixed Shiki theme ("${style}"), so it won't follow the Huet theme. ` +
        "Wrap its theme in huetShikiTheme({ from }) from \"huet\" (see scripts/shadcn-huet/integration.patch and docs/code-blocks.md).",
      block,
    )
  }
}

function watchCode() {
  if (codeWatch) return
  checkCode(document)
  codeWatch = new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes) if (node instanceof Element) checkCode(node)
  })
  codeWatch.observe(document.body, { subtree: true, childList: true })
}

/**
 * Theme classes such as theme-blue paint a fixed blue primary over Huet, and
 * the legacy ones (`.theme-red .theme-container`) a Tailwind swatch such as
 * var(--color-red-600).
 * Primary keeps its hue on the accent ramp, as /create's picks do, and a
 * gray primary becomes the max-contrast invert. Other hues move onto the
 * theme's hues (swatchPlacer). Neutrals fall back to Huet.
 */
function paintThemeHues(
  theme: ResolvedTheme,
  place: Place,
  foreground: string,
  background: string,
  destructiveColor: string,
  destructiveText: string,
) {
  if (!themeRules) themeRules = collectThemeRules()
  let css = ""
  for (const [selector, props] of themeRules) {
    const decls: string[] = []
    for (const [prop, raw] of props) {
      const swatch = resolveSwatch(raw)
      if (!swatch || prop.startsWith("--chart-")) continue
      const value = INVERT.has(prop)
        ? isGray(hexOf(swatch))
          ? foreground
          : accentFill(theme, hexOf(swatch), background, foreground)
        : INVERT_TEXT.has(prop)
          ? background
          : prop === "--destructive"
            ? destructiveColor
            : prop === "--destructive-foreground"
              ? destructiveText
              : NEUTRALS.has(prop) || swatch.c < 0.02
                ? "inherit"
                : place(swatch)
      decls.push(`${prop}: ${value} !important`)
    }
    if (decls.length) css += `${selector}{${decls.join(";")}}`
  }
  let style = document.getElementById("huet-theme-hues")
  if (!style) {
    style = document.createElement("style")
    style.id = "huet-theme-hues"
    document.head.append(style)
  }
  style.textContent = css
}

/**
 * `.theme-blue`, or a legacy `.theme-red .theme-container` with its popper
 * twin, each light or dark.
 */
const themeSelector =
  /^\.theme-[\w-]+(?: \.theme-container| \[data-radix-popper-content-wrapper\])?(?::is\(\.dark \*\))?$/
const swatchRef = /^var\(\s*--color-[\w-]+\s*\)$/

function collectThemeRules() {
  const rules = new Map<string, Map<string, string>>()
  const visit = (list: CSSRuleList) => {
    for (const rule of list) {
      if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText
        if (selector.split(",").every((part) => themeSelector.test(part.trim()))) {
          let props = rules.get(selector)
          if (!props) rules.set(selector, (props = new Map()))
          const style = rule.style
          for (let i = 0; i < style.length; i++) {
            const prop = style.item(i)
            const value = style.getPropertyValue(prop).trim()
            if (value && (!value.includes("var(") || swatchRef.test(value))) props.set(prop, value)
          }
        }
      } else if (rule instanceof CSSGroupingRule) {
        visit(rule.cssRules)
      }
    }
  }
  for (const sheet of pageSheets()) {
    try {
      visit(sheet.cssRules)
    } catch {
      // Ignore sheets the browser will not expose.
    }
  }
  return rules
}

/** sRGB relative luminance, enough to choose the site's .dark variant. */
function luminance(hex: string) {
  const value = Number.parseInt(hex.slice(1, 7), 16)
  const channel = (byte: number) => {
    const s = byte / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const r = channel((value >> 16) & 255)
  const g = channel((value >> 8) & 255)
  const b = channel(value & 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

let imageMount: ReturnType<typeof mountImages> | null = null
let imageWatch: MutationObserver | null = null

/** Let Huet read cross-origin pixels, and give attribute-sized images a size the canvas can copy. */
function prepareImage(img: HTMLImageElement) {
  if (img.dataset.huetPrepared) return
  img.dataset.huetPrepared = ""
  img.setAttribute("data-huet-recolor", "")
  // Lazy images never finish loading while Huet is waiting to recolor them,
  // so the themed copy would stay blank until the photo scrolled into view.
  if (img.loading === "lazy") img.loading = "eager"
  if (!img.crossOrigin && img.src) {
    try {
      const origin = new URL(img.currentSrc || img.src, location.href).origin
      if (origin !== location.origin) img.crossOrigin = "anonymous"
    } catch {
      // An empty or relative src can wait until it has a URL.
    }
  }
  const sizedByClass = /\b(?:w-|h-|size-|max-w-|min-w-|basis-)/.test(img.className)
  const width = img.getAttribute("width")
  if (!sizedByClass && width && !img.style.width) {
    img.style.width = `${width}px`
    img.style.height = "auto"
  }
}

function prepareTree(node: Node) {
  if (node instanceof HTMLImageElement) prepareImage(node)
  if (node instanceof Element) {
    for (const img of node.querySelectorAll("img")) prepareImage(img)
  }
}

/**
 * Recolor every image into the theme. Originals stay hidden until the
 * recolored canvas is ready, then that canvas fades in. Later theme edits
 * redraw the same canvas, so the fade does not replay.
 */
function paintImages(theme: Theme) {
  if (!imageWatch) {
    imageWatch = new MutationObserver((records) => {
      let added = false
      for (const record of records) {
        for (const node of record.addedNodes) {
          prepareTree(node)
          added = true
        }
      }
      // mountImages adopts the new <img> in its own observer, which runs
      // before this microtask. Draw those too, including ones below the fold.
      if (added) queueMicrotask(() => void imageMount?.ready())
    })
    imageWatch.observe(document.body, { subtree: true, childList: true })
  }
  prepareTree(document.body)
  if (!imageMount) {
    imageMount = mountImages(document.body, theme)
    void imageMount.ready()
  } else imageMount.update(theme)
}

let svgMount: ReturnType<typeof mountSvgs> | null = null

/**
 * Recolor inline SVGs marked `data-huet-recolor`, such as the home page's QR
 * code, as vectors. Paints that use currentColor or a CSS variable already
 * follow the theme tokens and are left alone.
 */
function paintSvgs(theme: Theme) {
  if (!svgMount) svgMount = mountSvgs(document.body, theme)
  else svgMount.update(theme)
}

