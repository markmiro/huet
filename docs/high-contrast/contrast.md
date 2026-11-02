# Contrast levels

> **Proposal.** Nothing here is implemented yet. [Overview](README.md)

`contrast` is one number on the theme: 1 is your design as written, values below 1 fade it, and values above 1 strengthen it.

```ts
createTheme({ dark: "#1b2233", background: 1, contrast: 2 });
```

| `contrast: 0.9` (less) | `contrast: 1` | `contrast: 2` (more) |
| --- | --- | --- |
| ![Less contrast](images/mode-less.png) | ![Normal](images/mode-normal.png) | ![More contrast](images/mode-more.png) |

| Dark theme, `contrast: 1` | Dark theme, `contrast: 2` |
| --- | --- |
| ![Dark, normal](images/mode-normal-dark.png) | ![Dark, more contrast](images/mode-more-dark.png) |

## Above 1

Raising `contrast` above 1 does three things, all in proportion:

1. **Extends the ramp.** The end of the neutral ramp opposite the background moves toward black or white. At 2 it reaches black or white. The background color stays exactly where you put it, and every class keeps its proportion: `text-55` is still 55% of the way.
2. **Fades region fills.** Fills whose only job is marking off an area, such as panels, cards and zebra rows, fade toward their parent. At 2 they're at half their amount. State, control and data fills don't fade. See [Roles](roles.md).
3. **Requires every boundary to be visible.** Each boundary between two fills must reach Lc `30 × (contrast − 1)` by APCA, which is the border role's Lc 30 at 2. Where a fill doesn't reach that, Huet draws a **1px** line whose color is solved against both sides. Lines never get thicker. Only their color changes.

APCA Lc, measured with the real solver. The background stays fixed, and the opposite end moves all the way at `contrast: 2`:

| Theme | Body text (`text-100`) | Muted text (`text-55`) |
| --- | --- | --- |
| Default (`#1b2233`–`#ffffff`), light | 102.8 → 106.0 | 68.6 → 77.0 |
| Soft / paper (`#4a4f5c`–`#f4f1ea`), light | 80.1 → 97.8 | **48.9 → 70.9** |
| Sunset (navy → yellow, HCL), on navy | 85.7 → 104.1 | 34.1 → 42.5 |

Narrow, soft themes gain the most: on soft paper, muted text passes the muted role's Lc 60. On dark backgrounds `text-55` stays lower, as on Sunset, because explicit amounts step evenly in L\* and APCA rates mid-lightness text on dark backgrounds lower than on light ones. A ramp that already ends at black or white, such as the default theme on its dark background, doesn't change.

## Below 1

Below 1 is today's `contrast` option, unchanged. It fades every color toward its background. APCA Lc on the default theme's light background:

| `contrast` | 1 | 0.95 | 0.9 | 0.8 | 0.6 |
| --- | --- | --- | --- | --- | --- |
| Body text | 102.8 | 91.0 | 81.8 | 67.3 | 45.2 |
| Muted text | 68.6 | 63.5 | 58.6 | 50.0 | 34.5 |

Use **0.9** for `prefers-contrast: less`. Anything lower takes body text under Lc 75, APCA's minimum for body text.

## Choosing the value

Huet doesn't read the system preference itself. Map it in the place where you already create the theme (see [Quick start](README.md#quick-start)).

| System preference | `contrast` |
| --- | --- |
| none | 1 |
| `prefers-contrast: less` | 0.9 |
| `prefers-contrast: more` | 2 |
| `forced-colors: active` | Any value. The OS palette replaces the colors |

You can also expose `contrast` as an in-app slider, the same way apps expose zoom.
