import { canDecompress as e, readFontPalette as t } from "./palette.js";
import { recolorer as n } from "huet/images";
// src/css.ts
var r = (e, t) => {
	if (t !== void 0 && !(typeof t == "number" && t >= 0 && t <= 1)) throw RangeError(`${e} must be a number from 0 to 1, got ${JSON.stringify(t)}`);
};
function i(e, { strength: t = 1, tint: i = 1 } = {}) {
	r("strength", t), r("tint", i);
	let a = n({
		...e,
		images: {
			strength: t,
			tint: i
		}
	}), o = /* @__PURE__ */ new Map();
	return (e) => {
		let t = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i.exec(e);
		if (!t) throw TypeError(`palette colors must be #rrggbb or #rrggbbaa, as readFontPalette returns them, got ${JSON.stringify(e)}`);
		let n = t.slice(1, 4).join(""), r = o.get(n);
		if (!r) {
			let [e, i, s] = t.slice(1, 4).map((e) => parseInt(e, 16) / 255);
			r = a(e, i, s).map((e) => Math.round(Math.min(1, Math.max(0, e)) * 255).toString(16).padStart(2, "0")).join(""), o.set(n, r);
		}
		return `#${r}${t[4] ?? ""}`;
	};
}
function a(e, { family: t, colors: n }, { name: r = "--huet-fonts", ...a } = {}) {
	if (!/^--[\w-]+$/.test(r)) throw TypeError(`name must be a dashed identifier such as --huet-fonts, got ${JSON.stringify(r)}`);
	let o = i(e, a);
	if (a.strength === 0 || !n.length) return "";
	let s = n.map((e, t) => `${t} ${o(e)}`).join(", ");
	return `@font-palette-values ${r} {\n  font-family: ${JSON.stringify(t)};\n  override-colors: ${s};\n}\n`;
}
// src/dom.ts
var o = (e) => e.trim().replace(/^(["'])(.*)\1$/, "$2").toLowerCase();
function s(e, t, n) {
	let r = o(t), i = [], a = (e, t) => {
		for (let n of e) if (n instanceof CSSFontFaceRule) {
			if (o(n.style.getPropertyValue("font-family")) !== r) continue;
			let e = [];
			for (let [, r, i, a, o] of n.style.getPropertyValue("src").matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)([^,]*)/g)) e.push({
				url: new URL(r ?? i ?? a, t).href,
				hint: o
			});
			e.length && i.push(e);
		} else "cssRules" in n && a(n.cssRules, t);
	};
	for (let t of [...e.styleSheets, ...e.adoptedStyleSheets ?? []]) try {
		a(t.cssRules, t.href ?? n);
	} catch {}
	return i;
}
var c = 0;
function l(n, r, o) {
	let { fonts: l, ...u } = o, d = "documentElement" in n ? n.documentElement : n, f = d.getRootNode(), p = "host" in f, m = `--huet-fonts-${++c}`, h = r, g = u, _ = !1;
	i(r, g);
	let v = d.ownerDocument.createElement("style");
	v.setAttribute("data-huet-fonts", ""), (p ? f : d.ownerDocument.head).append(v);
	let y = [d.style.getPropertyValue("font-palette"), d.style.getPropertyPriority("font-palette")], b = /* @__PURE__ */ new Map(), x = () => {
		d.style.getPropertyValue("font-palette") === m && (y[0] ? d.style.setProperty("font-palette", y[0], y[1]) : d.style.removeProperty("font-palette"));
	}, S = () => {
		_ || (v.textContent = [...b].map(([e, t]) => a(h, {
			family: e,
			colors: t
		}, {
			...g,
			name: m
		})).join(""), v.textContent ? d.style.setProperty("font-palette", m) : x());
	}, C = async (e, n) => {
		let r = await fetch(e);
		if (!r.ok) throw Error(`${e} responded with ${r.status}`);
		return t(await r.arrayBuffer(), { palette: n });
	}, w = async (t, n) => {
		let r = ({ url: e, hint: t }) => /woff2/i.test(t) || /\.woff2$/i.test(new URL(e).pathname), i = e("brotli") ? t : t.filter((e) => !r(e));
		if (!i.length) throw Error("this browser can't read WOFF2 files from a script. Add a WOFF or TTF source to its @font-face rule, or pass its palette as `colors` (from `npx huet-emoji palette <font file>`).");
		let a;
		for (let { url: e } of i) try {
			return await C(e, n);
		} catch (e) {
			a = e;
		}
		throw a;
	}, T = async (e, t, n) => {
		if (t) return C(new URL(t, d.baseURI).href, n);
		let r = s(f, e, d.baseURI);
		if (p && r.push(...s(d.ownerDocument, e, d.baseURI)), !r.length) throw Error("no readable stylesheet has an @font-face rule for it. Pass its file as `src`, or its palette as `colors`.");
		let i = [...new Map(r.map((e) => [e.map(({ url: e }) => e).join(" "), e])).values()], a = await Promise.all(i.map((e) => w(e, n)));
		if (a.some((e) => e.join() !== a[0].join())) throw Error("its @font-face rules load files with different palettes, and a palette applies to the whole family. Give each file its own font-family name.");
		return a[0];
	}, E = [];
	for (let e of l) {
		let { family: t, colors: n, src: r, palette: i } = typeof e == "string" ? { family: e } : e;
		n ? b.set(t, n) : (b.set(t, []), E.push(T(t, r, i).then((e) => {
			b.set(t, e), S();
		}, (e) => {
			b.delete(t), reportError(Error(`Huet couldn't theme the font "${t}", so it keeps its own colors: ${e instanceof Error ? e.message : String(e)}`, { cause: e }));
		})));
	}
	return S(), {
		update(e, t) {
			if (_) throw Error("Cannot update a destroyed Huet font mount");
			i(e, t ?? g), h = e, t && (g = t), S();
		},
		async ready() {
			await Promise.all(E);
		},
		destroy() {
			_ || (_ = !0, v.remove(), x());
		}
	};
}
// src/range.ts
var u = "U+200D, U+FE0F, U+20E3, U+231A-23FF, U+2600-27BF, U+2B05-2B55, U+1F000-1FAFF, U+E0020-E007F";
export { u as emojiRange, a as fontPaletteCss, l as mountFonts, t as readFontPalette };

//# sourceMappingURL=index.js.map