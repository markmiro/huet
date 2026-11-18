# Demo fonts

`twemoji-demo.woff2` holds the emoji the Images page shows, cut from [Twemoji Mozilla](https://github.com/mozilla/twemoji-colr) v0.7.0 with fontTools' `pyftsubset`. One change besides the cut: the variation selector's glyph (U+FE0F) has zero width, since Safari otherwise leaves a gap after emoji written with it.

`twemoji-demo.palette.json` is its palette, read with `huet-emoji palette twemoji-demo.woff2`.

The emoji art is from [Twemoji](https://github.com/twitter/twemoji), © Twitter, Inc. and other contributors, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
