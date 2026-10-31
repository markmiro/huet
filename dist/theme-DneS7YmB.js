import e from "chroma-js";
// src/core/color.ts
var t = (e) => Math.max(0, Math.min(1, e));
function n(e) {
	if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(e)) throw TypeError(`Expected an opaque hex color, got ${e}`);
	let t = parseInt(e.slice(1), 16);
	return e.length === 4 ? [
		(t >> 8 & 15) / 15,
		(t >> 4 & 15) / 15,
		(t & 15) / 15
	] : [
		(t >> 16 & 255) / 255,
		(t >> 8 & 255) / 255,
		(t & 255) / 255
	];
}
var r = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, i = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055;
function a(e) {
	let [t, i, a] = n(e).map(r);
	return .2126 * t + .7152 * i + .0722 * a;
}
var o = 6 / 29, s = (e) => e > .20689655172413793 ? 1.16 * e - .16 : 24389 / 2700 * e ** 3, c = (e) => e > .08 ? (e + .16) / 1.16 : Math.cbrt(e * 2700 / 24389);
function l(e) {
	return s(_(e)[0]);
}
var u = /* @__PURE__ */ new Map();
function d(e) {
	let t = u.get(e);
	if (t !== void 0) return t;
	let [r, i, a] = n(e);
	return t = .2126729 * r ** 2.4 + .7151522 * i ** 2.4 + .072175 * a ** 2.4, t < .022 && (t += (.022 - t) ** 1.414), u.size >= 8192 && u.clear(), u.set(e, t), t;
}
function f(e, t) {
	return p(d(e), d(t));
}
function p(e, t) {
	if (Math.abs(t - e) < 5e-4) return 0;
	let n = t > e ? (t ** .56 - e ** .57) * 1.14 : (t ** .65 - e ** .62) * 1.14;
	return Math.sign(n) * Math.max(0, Math.abs(n) - .027) * 100;
}
var m = (e, t) => Math.abs(f(t, e));
function h(e, t, n) {
	return m(e, n) > m(e, t) ? n : t;
}
function g(e, t, n) {
	e = r(e), t = r(t), n = r(n);
	let i = Math.cbrt(.4122214708 * e + .5363325363 * t + .0514459929 * n), a = Math.cbrt(.2119034982 * e + .6806995451 * t + .1073969566 * n), o = Math.cbrt(.0883024619 * e + .2817188376 * t + .6299787005 * n);
	return [
		.2104542553 * i + .793617785 * a - .0040720468 * o,
		1.9779984951 * i - 2.428592205 * a + .4505937099 * o,
		.0259040371 * i + .7827717662 * a - .808675766 * o
	];
}
function _(e) {
	return g(...n(e));
}
function v([e, t, n]) {
	let r = (e + .3963377774 * t + .2158037573 * n) ** 3, i = (e - .1055613458 * t - .0638541728 * n) ** 3, a = (e - .0894841775 * t - 1.291485548 * n) ** 3;
	return [
		4.0767416621 * r - 3.3077115913 * i + .2309699292 * a,
		-1.2684380046 * r + 2.6097574011 * i - .3413193965 * a,
		-.0041960863 * r - .7034186147 * i + 1.707614701 * a
	];
}
var y = ([e, t, n]) => e >= -1e-7 && e <= 1 + 1e-7 && t >= -1e-7 && t <= 1 + 1e-7 && n >= -1e-7 && n <= 1 + 1e-7;
function b([e, n, r]) {
	e = t(e);
	let a = v([
		e,
		n,
		r
	]);
	if (!y(a)) {
		let t = 0, i = 1;
		for (let a = 0; a < 20; a++) {
			let a = (t + i) / 2;
			y(v([
				e,
				n * a,
				r * a
			])) ? t = a : i = a;
		}
		a = v([
			e,
			n * t,
			r * t
		]);
	}
	return [
		t(i(a[0])),
		t(i(a[1])),
		t(i(a[2]))
	];
}
var x = Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function S(e) {
	let [t, n, r] = b(e);
	return "#" + x[Math.round(t * 255)] + x[Math.round(n * 255)] + x[Math.round(r * 255)];
}
function C(e, t, n) {
	if (!Number.isFinite(n) || n < 0 || n > 1) throw RangeError("Mix amount must be between 0 and 1");
	let r = _(e), i = _(t);
	return n === 0 ? e : n === 1 ? t : S(r.map((e, t) => e + (i[t] - e) * n));
}
// src/core/steps.ts
var w = {
	onLight: .49,
	onDark: .49
}, T = .004, E = [
	0,
	.7,
	1
], D = (t) => {
	let n = Array.isArray(t) ? t : t.lab();
	return {
		hex: e.lab(...n).hex(),
		L: n[0]
	};
}, O = (t) => D(e(t).lab());
function k(e, t, n) {
	if (n === 0) return e;
	if (n === 1) return t;
	let r = l(e), i = l(t);
	if (Math.abs(i - r) < 1e-10) return C(e, t, n);
	let a = i > r, o = r + (i - r) * n, s = 0, c = 1, u = e, d = Math.abs(o - r);
	for (let n = 0; n < 18; n++) {
		let n = (s + c) / 2, r = C(e, t, n), i = l(r), f = Math.abs(i - o);
		f < d && (u = r, d = f), (a ? i < o : i > o) ? s = n : c = n;
	}
	return u;
}
function A(e, t, r) {
	if (r === 0) return e;
	if (r === 1) return t;
	let i = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, a = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055, o = n(e).map(i), s = n(t).map(i);
	return "#" + o.map((e, t) => Math.round(Math.max(0, Math.min(1, a(e + (s[t] - e) * r))) * 255).toString(16).padStart(2, "0")).join("");
}
function j({ neutral: t, colorModel: n, colors: r, contrast: i = 1, signalLightness: o = w }) {
	if (!Number.isFinite(i) || i < 0 || i > 2) throw RangeError("contrast must be between 0 and 2");
	let s = t[0], c = t[t.length - 1], u = e.scale([...t]).mode(n).correctLightness(), d = Array.from({ length: 257 }, (e, t) => {
		let n = D(u(t / 256));
		return {
			...n,
			lightness: l(n.hex),
			oklab: _(n.hex)
		};
	}), [f, p] = [d[0], d[256]].sort((e, t) => e.lightness - t.lightness), m = [d[0].hex, d[256].hex].sort((e, t) => a(e) - a(t)), g = Math.max(0, u(0).get("lab.l")), v = Math.max(0, u(1).get("lab.l")), y = e.scale([c, s]).mode("lab").classes(E), b = /* @__PURE__ */ new Map(), x = (t, n) => {
		let i = `${t}:${n}`, a = b.get(i);
		if (!a) {
			if (!(t in r)) throw TypeError(`Unknown ramp: ${t}`);
			let l = e.scale([
				s,
				r[t],
				c
			]).mode("lab").correctLightness(), u = n ? o.onDark : o.onLight;
			b.set(i, a = D(l(u)).hex);
		}
		return a;
	}, C = (e) => {
		let t = l(e.hex), n = d[0];
		for (let e of d) Math.abs(e.lightness - t) < Math.abs(n.lightness - t) && (n = e);
		let [, r, i] = _(e.hex);
		return Math.hypot(r - n.oklab[1], i - n.oklab[2]) >= T;
	}, j = (e, t) => {
		let n = h(e.hex, f.hex, p.hex) === p.hex, r = l(e.hex), i = Math.abs((n ? p : f).lightness - r);
		if (i <= 1e-10) return e;
		let a = i * t, o = d[0], s = -1, c, u = Infinity;
		for (let e of d) {
			if (n ? e.lightness < r : e.lightness > r) continue;
			let t = Math.abs(e.lightness - r);
			t > s && ([o, s] = [e, t]), t >= a && t < u && ([c, u] = [e, t]);
		}
		let m = c ?? o;
		if (!C(e)) return {
			hex: m.hex,
			L: m.L
		};
		let g = 1 - t ** 3, [, v, y] = _(e.hex), [b, x, w] = m.oklab;
		return O(S([
			b,
			x + (v - x) * g,
			w + (y - w) * g
		]));
	}, M = (e, t, n) => {
		let [r, i] = m, o = h(e.hex, r, i) === i, [s, c, l] = _(x(t, o)), u = _(r)[0], d = _(i)[0];
		if (Math.abs(d - u) < 1e-7) return e;
		let [f] = _(e.hex), p = Math.max(0, Math.min(1, o ? (s - u) / (d - u) : (d - s) / (d - u))), g = o ? d : u, v = f + (g - f) * p, y = S([
			v,
			c,
			l
		]), b = (t) => o ? a(t) >= a(e.hex) : a(t) <= a(e.hex);
		for (let e = 0; e < 24 && !b(y); e++) v = (v + g) / 2, y = S([
			v,
			c,
			l
		]);
		b(y) || (y = e.hex);
		let C = k(e.hex, y, n);
		return b(C) || (C = e.hex), O(C);
	}, N = (e) => D(y((e.L - g) / (v - g))), P = (e, t, n, r) => {
		if (n === "white") return N(e);
		let i = Math.max(0, Math.min(1, t / 100 * r));
		return i === 0 ? e : n === "gray" ? j(e, i) : M(e, n, i);
	}, F = (e) => {
		let t = O(e);
		return {
			...t,
			full: t,
			origin: t.hex
		};
	}, I = (e, t) => i >= 1 ? t : A(e.origin, t, i);
	return {
		surfaceOf: F,
		shown: I,
		derive(e, t) {
			let n = O(t);
			return i >= 1 ? {
				...n,
				full: n,
				origin: e.origin
			} : {
				...O(I(e, t)),
				full: n,
				origin: e.origin
			};
		},
		step(e, t, n = "gray") {
			if (i >= 1) {
				let r = P(e, t, n, i);
				return {
					...r,
					full: r,
					origin: e.origin
				};
			}
			let r = P(e.full, t, n, 1);
			return {
				...O(A(e.origin, r.hex, i)),
				full: r,
				origin: e.origin
			};
		}
	};
}
// src/core/theme.ts
var M = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
], N = [
	"oklab",
	"oklch",
	"lab",
	"lch",
	"hcl",
	"lrgb",
	"rgb",
	"hsl",
	"hsv",
	"hsi"
], P = [
	"neutral",
	"colorModel",
	"colors",
	"contrast",
	"signalLightness",
	"images",
	"svgs"
], F = [
	"pallet",
	"ramps",
	"bgRamp",
	"bgRampValue",
	"contrastMultiplier"
], I = (t) => typeof t == "string" && e.valid(t);
function L(e) {
	let t = (e) => {
		throw TypeError(`Invalid Huet theme: ${e}`);
	};
	(typeof e != "object" || !e || Array.isArray(e)) && t(`expected an object like { neutral: ["#000000", "#ffffff"] }, got ${JSON.stringify(e)}`);
	let n = e, r = Object.keys(n);
	r.some((e) => F.includes(e)) && t("this is the old ThemeConfig format (pallet, ramps, bgRampValue, ...). Themes are now { neutral, colorModel, colors, contrast }, and the background is passed when rendering.");
	let i = r.filter((e) => !P.includes(e));
	i.length && t(`unknown field${i.length > 1 ? "s" : ""} ${i.join(", ")}. Themes have ${P.join(", ")}.`);
	let { neutral: a, colorModel: o, colors: s, contrast: c } = n;
	(!Array.isArray(a) || a.length < 2) && t(`neutral must be an array of two or more colors, darkest first, got ${JSON.stringify(a)}`);
	for (let e of a) I(e) || t(`neutral has ${JSON.stringify(e)}, which isn't a color`);
	if (o !== void 0 && !N.includes(o) && t(`colorModel must be one of ${N.join(", ")}, got ${JSON.stringify(o)}`), s !== void 0) {
		(typeof s != "object" || !s || Array.isArray(s)) && t(`colors must be an object like { red: "#d14457" }, got ${JSON.stringify(s)}`);
		for (let [e, n] of Object.entries(s)) M.includes(e) || t(`colors.${e} isn't a hue. Hues are ${M.join(", ")}.`), I(n) || t(`colors.${e} is ${JSON.stringify(n)}, which isn't a color`);
	}
	c !== void 0 && !(typeof c == "number" && c >= 0 && c <= 2) && t(`contrast must be a number from 0 to 2, got ${JSON.stringify(c)}`);
	let l = (e) => typeof e == "number" && e >= 0 && e <= 1, { signalLightness: u } = n;
	if (u !== void 0) {
		let e = Object.keys(u ?? {});
		typeof u == "object" && u && e.sort().join() === "onDark,onLight" && l(u.onLight) && l(u.onDark) || t(`signalLightness must be { onLight, onDark }, each from 0 to 1, got ${JSON.stringify(u)}`);
	}
	for (let e of ["images", "svgs"]) {
		let r = n[e];
		r !== void 0 && (typeof r != "object" || !r || Object.keys(r).some((e) => e !== "strength" && e !== "tint") || r.strength !== void 0 && !l(r.strength) || r.tint !== void 0 && !l(r.tint)) && t(`${e} must be { strength, tint }, each from 0 to 1, got ${JSON.stringify(r)}`);
	}
}
function R({ neutral: e, colorModel: t = "oklab" }) {
	return e.length === 2 && t === "oklab" ? {
		dark: e[0],
		light: e[1]
	} : { neutral: {
		colors: e,
		colorModel: t
	} };
}
function z(e, { background: t = 1 } = {}) {
	if (L(e), typeof t != "number" || !(t >= 0 && t <= 1)) throw RangeError(`Huet: background must be a number from 0 (dark) to 1 (light), got ${JSON.stringify(t)}`);
	return $({
		...R(e),
		colors: e.colors,
		contrast: e.contrast,
		signalLightness: e.signalLightness,
		background: t
	});
}
var B = {
	red: "#d14457",
	yellow: "#9d6f00",
	green: "#298830",
	blue: "#0082dc",
	purple: "#a359b9"
}, V = (e) => ({
	color: e,
	y: d(e)
}), H = (e) => ({
	...V(e),
	luminance: a(e)
}), U = (e, { y: t }) => Math.abs(p(t, e)), W = {
	foreground: 90,
	muted: 60,
	border: 30
};
function G(e, t, n) {
	let r = d(e), i = t[0].color, a = -1, o = "", s = Infinity;
	for (let e of t) {
		let t = U(r, e);
		t > a && (i = e.color, a = t), t >= n && t < s && (o = e.color, s = t);
	}
	return o || i;
}
var K = 257;
function q(e, t, n) {
	for (let r = 0; r < K; r++) if (t(e(r)) >= n - 1e-9) return e(r).color;
}
function J(e, t) {
	let n = e[0](0), r = t(n);
	for (let i of e) for (let e = 0; e < K; e++) {
		let a = t(i(e));
		a > r && ([n, r] = [i(e), a]);
	}
	return n.color;
}
var Y = /* @__PURE__ */ new Map(), X = /* @__PURE__ */ new Map();
function Z(e, t, n = Y, r = 64) {
	if (n.has(e)) return n.get(e);
	let i = t();
	return n.size >= r && n.clear(), n.set(e, i), i;
}
function Q(t) {
	let r = t.neutral !== void 0;
	if (r && (t.dark !== void 0 || t.light !== void 0)) throw TypeError("Pass either neutral.colors or dark/light, not both");
	let i = Object.freeze([...t.neutral?.colors ?? [t.dark ?? "#000000", t.light ?? "#ffffff"]]);
	if (i.length < 2) throw RangeError("neutral.colors needs at least two colors");
	for (let e of i) n(e);
	let o = i[0], s = i[i.length - 1];
	if (a(o) > a(s)) throw RangeError("dark must be darker than light");
	let c = t.neutral?.colorModel ?? "oklab";
	if (!N.includes(c)) throw TypeError(`Unknown color model: ${c}`);
	let l = e.scale([...i]).mode(c), u = [];
	return {
		custom: r,
		stops: i,
		dark: o,
		light: s,
		colorModel: c,
		ramp: (e) => {
			if (!Number.isFinite(e) || e < 0 || e > 1) throw RangeError("Mix amount must be between 0 and 1");
			return r ? u[Math.floor(e * 1e4)] ??= l(e).hex() : C(o, s, e);
		}
	};
}
function $(e = {}) {
	let t = Q(e), { custom: r, stops: i, dark: o, light: s, colorModel: c } = t, l = `${c}:${r}:${i}`, { ramp: u } = Z(`ramp:${l}`, () => t), f = u(e.background ?? 1), p = Object.freeze({
		...B,
		...e.colors
	});
	for (let e of Object.values(p)) n(e);
	let g = Object.fromEntries(M.map((e) => [e, `${l}:${p[e]}`])), v = Z(`neutral:${l}`, () => Array.from({ length: 257 }, (e, t) => _(u(t / 256)))), y = (e) => {
		let [t, n, r] = _(e), i = -1, a = Infinity;
		for (let e = 0; e < v.length; e++) {
			let [o, s, c] = v[e], l = (t - o) ** 2 + (n - s) ** 2 + (r - c) ** 2;
			l < a && ([i, a] = [e, l]);
		}
		return a < .01 ** 2 ? i / 256 : void 0;
	}, b = (e) => {
		let t = e * 256, n = Math.min(255, Math.floor(t)), r = t - n;
		return v[n].map((e, t) => e + (v[n + 1][t] - e) * r);
	}, x = (e, t) => {
		let n = t === o ? 0 : 1, i = r ? y(e) : void 0;
		if (i !== void 0) return (t) => t === 0 ? e : u(i + (n - i) * t);
		let a = _(e), s = 0;
		v.forEach(([e], t) => {
			Math.abs(e - a[0]) < Math.abs(v[s][0] - a[0]) && (s = t);
		});
		let c = v[s];
		return (r) => {
			if (r === 0) return e;
			if (r === 1) return t;
			let i = b(s / 256 + (n - s / 256) * r), o = [
				1 - r,
				1 - r ** 3,
				1 - r ** 3
			];
			return S(i.map((e, t) => e + (a[t] - c[t]) * o[t]));
		};
	}, C = _(o)[0], w = _(s)[0], T = Object.fromEntries(M.map((e) => {
		let [, t, n] = _(p[e]);
		return [e, Z(`hue:${g[e]}`, () => Array.from({ length: 257 }, (e, r) => H(S([
			C + (w - C) * r / 256,
			t,
			n
		]))))];
	})), E = (e, t) => {
		let n = a(e), r = h(e, o, s) === s, i = T[t].filter((e) => r ? e.luminance >= n : e.luminance <= n);
		return i.length ? i : [H(e)];
	}, D = Math.min(m(o, s), m(s, o)), O = Math.min(1, D / W.foreground), k = /* @__PURE__ */ new Map(), A = (e, t) => {
		let n = e + t, r = k.get(n);
		if (!r) {
			let i = x(e, t), a = [];
			r = (e) => a[e] ??= V(i(e / 256)), k.size >= 512 && k.clear(), k.set(n, r);
		}
		return r;
	}, N = /* @__PURE__ */ new Map(), P = (e = f, t = e) => {
		n(e), n(t);
		let r = e + t, i = N.get(r);
		if (i) return i;
		let a = Object.freeze({
			...Z(`${l}|${e}|${t}`, () => F(e, t), X, 4096),
			...Object.fromEntries(M.map((t) => [t, Z(`${g[t]}|${e}`, () => G(e, E(e, t), W.muted * O), X, 4096)]))
		});
		return N.size >= 512 && N.clear(), N.set(r, a), a;
	};
	function F(e, t) {
		let n = h(e, o, s), r = A(e, n), i = d(e), a = d(t), c = (e) => U(i, e), l = Math.min(m(e, n), W.foreground), u = (e) => l * e / W.foreground, f = (e) => Math.min(c(e), U(a, e)), p = q(r, f, u(W.border));
		if (p === void 0) {
			let t = A(e, n === s ? o : s);
			p = q(t, f, u(W.border)) ?? J([r, t], f);
		}
		return {
			background: e,
			foreground: q(r, c, l) ?? n,
			muted: q(r, c, u(W.muted)) ?? n,
			border: p
		};
	}
	let I = /* @__PURE__ */ new Map(), L = D >= W.muted, R = (e) => Math.max(m(e, o), m(e, s)) >= W.muted, z = (e, t) => {
		let n = e + ":" + t, r = I.get(n);
		if (r) return r;
		let i;
		if (typeof t == "string") {
			if (!M.includes(t)) throw TypeError(`Unknown hue: ${t}`);
			let n = E(e, t), r = L ? n.filter((e) => R(e.color)) : n;
			i = G(e, r.length ? r : n, W.border * O);
		} else {
			let n = x(e, h(e, o, s));
			if (i = n(t / 100), t !== 0 && L && !R(i)) {
				let e = Infinity;
				for (let r = 0; r <= 256; r++) {
					let a = n(r / 256), o = Math.abs(r / 256 - t / 100);
					o < e && R(a) && (i = a, e = o);
				}
			}
		}
		return I.size >= 512 && I.clear(), I.set(n, i), i;
	}, K = Object.freeze({
		colors: i,
		colorModel: c
	}), Y = j({
		neutral: i,
		colorModel: r ? c : "lab",
		colors: p,
		contrast: e.contrast,
		signalLightness: e.signalLightness
	}), $ = Y.surfaceOf(f);
	return Object.freeze({
		background: f,
		dark: o,
		light: s,
		neutral: K,
		colors: p,
		ramp: u,
		tokens: P,
		tokensOn: (t, n = t) => {
			let r = P(t.full.hex, n.full.hex);
			return (e.contrast ?? 1) >= 1 ? r : Object.freeze(Object.fromEntries(Object.entries(r).map(([e, n]) => [e, e === "background" ? t.hex : Y.shown(t, n)])));
		},
		surface: z,
		root: $,
		step: Y.step,
		surfaceOf: Y.surfaceOf,
		derive: Y.derive
	});
}
function ee(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [`--huet-${e}`, t]));
}
export { Q as a, ee as c, o as d, g as f, _ as h, M as i, c as l, h as m, N as n, R as o, b as p, B as r, z as s, L as t, s as u };

//# sourceMappingURL=theme-DneS7YmB.js.map