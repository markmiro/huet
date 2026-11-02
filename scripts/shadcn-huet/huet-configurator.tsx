"use client"

import chroma from "chroma-js"
import { usePathname } from "next/navigation"
import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { checkTheme, themes as presets, type Theme } from "huet"
import { ThemeConfigurator, type PageColor } from "huet-react"

import {
  applyHuet,
  embedded,
  onPageColors,
  PAGE_COLORS_MESSAGE,
  pageColors,
  sameColors,
  samePageColors,
  type Edits,
  type PageColors,
} from "./shadcn-adapter"

type Saved = {
  theme: Theme
  background: number
  themes: Record<string, Theme>
  /** The Huet panel's edits to the page's accent and chart colors. */
  pageColors?: Edits
}
const storageKey = "huet-shadcn"
const fallback: Saved = { theme: presets.Base, background: 1, themes: presets }

/** Saved edits to the page's colors, without any that aren't lists of colors. */
function validEdits(value: unknown): Edits {
  const colors = (list: unknown): list is string[] =>
    Array.isArray(list) && list.length > 0 && list.every((color) => typeof color === "string" && chroma.valid(color))
  return Object.fromEntries(
    Object.entries(typeof value === "object" && value !== null ? value : {}).filter(
      ([, edit]) => colors(edit?.own) && colors(edit?.colors),
    ),
  )
}

/** The saved theme, background and theme list, or the defaults if there are none or they're invalid. */
function load(): Saved {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null")
    if (!saved) return fallback
    checkTheme(saved.theme)
    for (const listed of Object.values(saved.themes ?? {})) checkTheme(listed)
    return { ...fallback, ...saved, pageColors: validEdits(saved.pageColors) }
  } catch (error) {
    console.error("Huet: the saved theme is invalid, so it was reset.", error)
    return fallback
  }
}


/**
 * The page's own accent and chart colors, for the Huet panel: this page's,
 * or on /create, the ones its preview iframe sends up for the picked theme
 * and chart color.
 */
function useOwnColors() {
  const [own, setOwn] = useState(pageColors)
  const [preview, setPreview] = useState<PageColors>()
  const pathname = usePathname()
  // A preview from another page doesn't belong to this one.
  useEffect(() => setPreview(undefined), [pathname])
  useEffect(() => {
    if (embedded) return
    const keep = (next: PageColors) => (current: PageColors | undefined) =>
      samePageColors(current, next) ? current : next
    const stop = onPageColors((next) => setOwn(keep(next)))
    const current = pageColors()
    if (current) setOwn(keep(current))
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.data?.type !== PAGE_COLORS_MESSAGE) return
      setPreview(keep(event.data.colors))
    }
    window.addEventListener("message", receive)
    return () => {
      stop()
      window.removeEventListener("message", receive)
    }
  }, [])
  return preview ?? own
}

/** Floating Huet editor. Edits repaint every shadcn color token, in this page and its preview iframes. */
export function HuetConfigurator() {
  // Loaded in the browser: the server has no localStorage
  const [saved, setSaved] = useState<Saved>()
  useLayoutEffect(() => {
    setSaved(load())
    if (!embedded) return
    // Same origin, so every save by the top page arrives here as a storage event.
    const follow = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) setSaved(load())
    }
    window.addEventListener("storage", follow)
    return () => window.removeEventListener("storage", follow)
  }, [])
  const change = (changes: Partial<Saved>) =>
    setSaved((current) => current && { ...current, ...changes })
  const own = useOwnColors()
  // Each color as the panel shows it: the page's own, or an edit made from them.
  const pageColors = useMemo(() => {
    const shown: Record<string, PageColor> = {}
    for (const [name, colors] of Object.entries(own ?? {})) {
      const edit = saved?.pageColors?.[name]
      shown[name] = edit && sameColors(edit.own, colors) ? { colors: edit.colors, own: colors } : { colors }
    }
    return shown
  }, [own, saved?.pageColors])
  const editPageColor = (name: string, colors: string[] | undefined) =>
    setSaved((current) => {
      if (!current) return current
      const { [name]: _, ...rest } = current.pageColors ?? {}
      const pageOwn = own?.[name]
      return {
        ...current,
        pageColors: colors && pageOwn ? { ...rest, [name]: { own: pageOwn, colors } } : rest,
      }
    })
  useLayoutEffect(() => {
    if (!saved) return
    try {
      applyHuet(saved.theme, saved.background, { edits: saved.pageColors })
    } catch (error) {
      // A throw here takes down the whole Next page. Keep the colors already
      // painted, and don't save a theme that can't render.
      console.error("Huet: couldn't apply this theme, so the page keeps the last one.", error)
      return
    }
    if (!embedded) localStorage.setItem(storageKey, JSON.stringify(saved))
  }, [saved])
  if (!saved || embedded) return null
  return (
    <ThemeConfigurator
      value={saved.theme}
      onChange={(theme) => change({ theme })}
      themes={saved.themes}
      onThemesChange={(themes) => change({ themes })}
      background={saved.background}
      onBackgroundChange={(background) => change({ background })}
      pageColors={pageColors}
      onPageColorChange={editPageColor}
    />
  )
}
