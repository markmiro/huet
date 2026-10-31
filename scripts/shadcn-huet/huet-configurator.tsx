"use client"

import chroma from "chroma-js"
import { themeFromConfig, type ThemeConfig } from "huet/config"
import { mountImages } from "huet/images"
import { ThemeConfigurator } from "huet-react"

/**
 * Neutrals (background, text, borders, fills) come from Huet. Every Tailwind
 * swatch keeps the hue and chroma it shipped with; only its lightness moves,
 * onto the same position of the theme's neutral ramp. Shade 50 stays the
 * light step, 950 the dark one, so `dark:` variants still pick the dark end.
 */

const STEPS = new Set(["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"])

type Swatch = { key: string; l: number; c: number; h: number }

let palette: Swatch[] | null = null
let ring: Swatch | null = null

function applyHuet(config: ThemeConfig) {
  const theme = themeFromConfig(config)
  const tokens = theme.tokens()
  const isDark = luminance(tokens.background) < 0.4
  // shadcn's dark page is near-black; its light page is the ramp endpoint.
  const background = isDark ? theme.surface(tokens.background, 2.75) : tokens.background
  const fill = (amount: number) => theme.surface(background, amount)
  // Explicit contrast keeps Base light text and primary buttons at true black.
  // Role tokens target APCA Lc 90, which stops at dark gray on white.
  const foreground = fill(isDark ? 98 : 100)
  const mutedForeground = fill(isDark ? 65 : 51.5)
  const ink = (surface: string) => theme.surface(surface, 100)
  stealPalette()

  const card = fill(isDark ? 5 : 0)
  const muted = fill(isDark ? 13 : 3.5)
  const accent = fill(isDark ? 25 : 3.5)
  const secondary = muted
  const sidebar = fill(isDark ? 5 : 1.75)
  const surface = fill(isDark ? 5 : 2.3)
  const border = isDark
    ? `color-mix(in srgb, ${theme.ramp(1)} 10%, transparent)`
    : fill(9)
  const adapt = (swatch: Swatch) => placeOnRamp(theme.ramp, swatch)

  const vars: Record<string, string> = {
    "--background": background,
    "--foreground": foreground,
    "--card": card,
    "--card-foreground": ink(card),
    "--popover": card,
    "--popover-foreground": foreground,
    // Primary is the max-contrast invert of the background, not the theme blue.
    "--primary": isDark ? fill(90.7) : foreground,
    "--primary-foreground": background,
    "--secondary": secondary,
    "--secondary-foreground": ink(secondary),
    "--muted": muted,
    "--muted-foreground": mutedForeground,
    "--accent": accent,
    "--accent-foreground": ink(accent),
    "--destructive": tokens.red,
    "--destructive-foreground": ink(fill("red")),
    "--border": border,
    "--input": isDark ? `color-mix(in srgb, ${theme.ramp(1)} 15%, transparent)` : border,
    "--ring": ring ? adapt(ring) : tokens.border,
    "--sidebar": sidebar,
    "--sidebar-foreground": ink(sidebar),
    "--sidebar-primary": foreground,
    "--sidebar-primary-foreground": background,
    "--sidebar-accent": accent,
    "--sidebar-accent-foreground": ink(accent),
    "--sidebar-border": border,
    "--sidebar-ring": ring ? adapt(ring) : tokens.border,
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

  for (const swatch of palette ?? []) vars[swatch.key] = adapt(swatch)
  // Plain white and black are not on the radioactive ramp. Use the ramp ends,
  // hue included, so `bg-white` becomes the theme's light color.
  vars["--color-white"] = theme.ramp(1)
  vars["--color-black"] = theme.ramp(0)
  // Chart steps stay on the readable side of this background: the text color
  // down to muted. A copied gray or blue ramp puts the dark steps on a dark
  // page and the light steps on a light page, so part of the series vanishes.
  const chartSteps = chartScale(foreground, mutedForeground)
  const blue = [300, 500, 600, 700, 800].map((step) =>
    palette?.find((swatch) => swatch.key === `--color-blue-${step}`),
  )
  chartSteps.forEach((neutral, index) => {
    vars[`--chart-${index + 1}`] = tintChart(neutral, blue[index])
  })

  const root = document.documentElement
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value)
  root.style.backgroundColor = background
  paintThemeHues(theme.ramp, foreground, background, tokens.red, ink(fill("red")))
  paintCharts(chartSteps)
  paintTopNav(background)
  paintImages(theme)
  const dark = luminance(background) < 0.4
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
}

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
      } else if ("cssRules" in rule && rule.cssRules) {
        try {
          visit(rule.cssRules)
        } catch {
          // A cross-origin sheet has no rules to read.
        }
      }
    }
  }
  for (const sheet of document.styleSheets) {
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

/**
 * Same position on the theme's neutral ramp. A chromatic swatch keeps its
 * hue. A gray or white one takes the ramp's own color, so a theme like
 * Radioactive does not collapse back to plain white.
 */
function placeOnRamp(ramp: (amount: number) => string, swatch: Swatch) {
  const position = Math.min(1, Math.max(0, swatch.l))
  const themed = ramp(position)
  if (swatch.c < 0.02) return themed
  const [lightness] = chroma(themed).oklch()
  return chroma.oklch(Math.min(1, Math.max(0, lightness)), swatch.c, swatch.h).hex()
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

/** A gray series takes the theme color. A chromatic series keeps its hue. */
function tintChart(neutral: string, swatch?: Swatch) {
  if (!swatch || swatch.c < 0.02) return neutral
  const [lightness] = chroma(neutral).oklch()
  if (!Number.isFinite(lightness)) return neutral
  return chroma.oklch(Math.min(1, Math.max(0, lightness)), swatch.c, swatch.h).hex()
}

function resolveChartSwatch(raw: string) {
  const ref = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (ref) return palette?.find((swatch) => swatch.key === ref[1])
  return readSwatch("chart", raw)
}

let chartRules: Map<string, Map<string, string>> | null = null

/**
 * Home-page cards and chart pages restamp --chart-* with a gray or blue
 * ramp. Repaint each series on the readable theme scale, keeping its hue.
 */
function paintCharts(steps: string[]) {
  if (!chartRules) chartRules = collectChartRules()
  let css = ""
  for (const [selector, props] of chartRules) {
    const decls: string[] = []
    for (const [prop, raw] of props) {
      const index = Number(prop.slice("--chart-".length)) - 1
      const neutral = steps[index] ?? steps[steps.length - 1]
      if (!neutral) continue
      decls.push(`${prop}: ${tintChart(neutral, resolveChartSwatch(raw))} !important`)
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
      } else if ("cssRules" in rule && rule.cssRules) {
        try {
          visit(rule.cssRules)
        } catch {
          // Ignore sheets the browser will not expose.
        }
      }
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      visit(sheet.cssRules)
    } catch {
      // Ignore sheets the browser will not expose.
    }
  }
  return rules
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
 * Theme classes such as theme-blue paint a fixed blue primary over Huet.
 * Primary becomes the max-contrast invert instead. Other hues keep their
 * hue, with lightness from the ramp. Neutrals fall back to Huet.
 */
function paintThemeHues(
  ramp: (amount: number) => string,
  invert: string,
  invertText: string,
  destructiveColor: string,
  destructiveText: string,
) {
  if (!themeRules) themeRules = collectThemeRules()
  let css = ""
  for (const [selector, props] of themeRules) {
    const decls: string[] = []
    for (const [prop, raw] of props) {
      const swatch = readSwatch(prop, raw)
      if (!swatch || prop.startsWith("--chart-")) continue
      const value = INVERT.has(prop)
        ? invert
        : INVERT_TEXT.has(prop)
          ? invertText
          : prop === "--destructive"
            ? destructiveColor
            : prop === "--destructive-foreground"
              ? destructiveText
              : NEUTRALS.has(prop) || swatch.c < 0.02
                ? "inherit"
                : placeOnRamp(ramp, swatch)
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

function collectThemeRules() {
  const rules = new Map<string, Map<string, string>>()
  const visit = (list: CSSRuleList) => {
    for (const rule of list) {
      if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText
        if (/^\.theme-[\w-]+(?::is\(\.dark \*\))?$/.test(selector)) {
          let props = rules.get(selector)
          if (!props) rules.set(selector, (props = new Map()))
          const style = rule.style
          for (let i = 0; i < style.length; i++) {
            const prop = style.item(i)
            const value = style.getPropertyValue(prop).trim()
            if (value && !value.includes("var(")) props.set(prop, value)
          }
        }
      } else if ("cssRules" in rule && rule.cssRules) {
        try {
          visit(rule.cssRules)
        } catch {
          // Ignore sheets the browser will not expose.
        }
      }
    }
  }
  for (const sheet of document.styleSheets) {
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
function paintImages(theme: ReturnType<typeof themeFromConfig>) {
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

/** Floating Huet editor. Edits repaint every shadcn color token. */
export function HuetConfigurator() {
  return <ThemeConfigurator onChange={applyHuet} />
}
