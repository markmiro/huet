# Recoloring images with theme ramps

Experimental. Demo: `npm run dev`, then open `/recolor.html`. Code: `src/core/recolor.ts` (not exported from `huet/core` yet).

By default the theme picker also themes the demo page itself with `mountTheme`, so images and UI change together. Uncheck "Theme the page" to recolor only the images. "Invert theme" swaps the theme's background between its dark and light ends. Images keep their lightness; only the opt-in UI screenshot inversion follows the new polarity.

## Coordinates

A theme's ramps form a coordinate system. Each pixel is read in Huet's default theme (black → white, default hue anchors) as:

- `t`: position on the neutral dark → light ramp, in CIE lightness (L*). Above the darkest tones this is an affine function of OKLab L, so it matches Huet's OKLab ramps there.
- Chroma measured from the neutral ramp at `t`, written as weights on the two neighboring hue anchors (red/yellow, yellow/green, green/blue, blue/purple, purple/red). Weight 1 means as saturated as the anchor.

Recoloring puts the same coordinates on the target theme's ramps. Grays follow the target's neutral ramp, which may be tinted (e.g. Sunset's navy → yellow), and each hue moves to the target's anchor for that hue. Out-of-gamut results lose chroma while keeping hue and lightness, the same as the rest of the core. When the target is the source, the mapping is the identity.

Options:

- `strength` blends between the original image and the full mapping.
- `tint` controls how much a tinted neutral ramp also shifts saturated colors. At 1, Sunset turns blue skies teal (teal anchor plus yellow tint). At 0, saturated colors keep closer to the anchors.
- `invert` flips `t`. It is off by default, so light stays light and dark stays dark. The demo applies it only to images detected as UI screenshots (at least 50% flat light or dark background), and only for themes of the opposite polarity. Inverted photos read as negatives. Screenshots that mix a photo with UI, like the site's meta image, also invert the photo.

### Near black

OKLab's cube root is infinitely steep at black: sRGB 0 → 1 spans 6.7% of OKLab's lightness range but 0.27% of L*'s. When a theme lifts the dark end of the ramp (e.g. Sunset's navy), that invisible step became a visible band. The markmiro.com "Algo logo resize" thumbnail has a black background striped with (1, 1, 1) rows, which turned into stripes 6 levels apart. The lightness coordinate therefore uses L*, which is linear in luminance near black.

OKLab's a and b come from the same cube roots, so near-black pixels also look more colorful to it than they are. Chroma is scaled by `(L / toe)²` below L*'s toe on the way in and unscaled at the output lightness, like CIELAB's a* and b*. This also keeps 3D LUT cells near black smooth: their corners (black, dark red, dark green, dark blue) no longer land on very different colors. The worst-case LUT error for random colors dropped from ΔE_OK 0.035 to 0.015 at size 17, and from 0.019 to 0.011 at size 33.

## Cost

The mapping depends only on the RGB value, so it can be baked once per theme into a 3D LUT. Measurements are for a 1200×800 photo (0.96 MP) on an M-series MacBook in Chromium:

| Step | Where | Time |
| --- | --- | --- |
| Exact transform, every pixel | Worker | ~560 ms |
| Build 33³ LUT | Worker | ~16 ms per theme |
| Apply LUT (trilinear) | Worker, CPU | ~21 ms |
| Apply LUT | GPU, WebGL2 3D texture | ~1.3 ms |

The LUT differs from the exact transform by a mean ΔE_OK of 0.0001 (max 0.01; about 0.02 is just noticeable). All 22 demo images (21 MP) re-theme in about 100 ms of GPU time.

Ways to defer or bake:

- **Runtime, GPU:** build the LUT in a worker, then do one draw call per image. Fast enough to re-theme live.
- **Runtime, no GPU:** apply the LUT in a worker. The main thread stays free.
- **Bake:** the demo's "Download .cube" button exports the LUT in the standard `.cube` format. Apply it offline with `ffmpeg -i in.jpg -vf lut3d=theme.cube out.jpg`, or in any editor that reads `.cube` files. One LUT per theme covers every image.
