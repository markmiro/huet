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
function v(e) {
	let [t, i, a] = n(e).map(r), o = (.4360747 * t + .3850649 * i + .1430804 * a) / .96422, s = .2225045 * t + .7168786 * i + .0606169 * a, c = (.0139322 * t + .0971045 * i + .7141733 * a) / .82521, l = (e) => e > 216 / 24389 ? Math.cbrt(e) : (24389 / 27 * e + 16) / 116, [u, d, f] = [
		l(o),
		l(s),
		l(c)
	], p = 500 * (u - d), m = 200 * (d - f);
	return [
		116 * d - 16,
		Math.hypot(p, m),
		(Math.atan2(m, p) * 180 / Math.PI + 360) % 360
	];
}
function y(e, t, n) {
	let r = (e + 16) / 116, i = r + t * Math.cos(n * Math.PI / 180) / 500, a = r - t * Math.sin(n * Math.PI / 180) / 200, o = (e) => e ** 3 > 216 / 24389 ? e ** 3 : (116 * e - 16) / (24389 / 27), s = o(i) * .96422, c = e > 8 ? r ** 3 : e / (24389 / 27), l = o(a) * .82521;
	return [
		3.1338561 * s - 1.6168667 * c - .4906146 * l,
		-.9787684 * s + 1.9161415 * c + .033454 * l,
		.0719453 * s - .2289914 * c + 1.4052427 * l
	];
}
function b(e, t) {
	let n = 0, r = 200;
	for (let i = 0; i < 30; i++) {
		let i = (n + r) / 2;
		y(e, i, t).every((e) => e >= 0 && e <= 1) ? n = i : r = i;
	}
	return n;
}
function x([e, t, n]) {
	let r = (e + .3963377774 * t + .2158037573 * n) ** 3, i = (e - .1055613458 * t - .0638541728 * n) ** 3, a = (e - .0894841775 * t - 1.291485548 * n) ** 3;
	return [
		4.0767416621 * r - 3.3077115913 * i + .2309699292 * a,
		-1.2684380046 * r + 2.6097574011 * i - .3413193965 * a,
		-.0041960863 * r - .7034186147 * i + 1.707614701 * a
	];
}
var S = ([e, t, n]) => e >= -1e-7 && e <= 1 + 1e-7 && t >= -1e-7 && t <= 1 + 1e-7 && n >= -1e-7 && n <= 1 + 1e-7;
function C([e, n, r]) {
	e = t(e);
	let a = x([
		e,
		n,
		r
	]);
	if (!S(a)) {
		let t = 0, i = 1;
		for (let a = 0; a < 20; a++) {
			let a = (t + i) / 2;
			S(x([
				e,
				n * a,
				r * a
			])) ? t = a : i = a;
		}
		a = x([
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
var w = Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function T(e) {
	let [t, n, r] = C(e);
	return "#" + w[Math.round(t * 255)] + w[Math.round(n * 255)] + w[Math.round(r * 255)];
}
function E(e, t, n) {
	if (!Number.isFinite(n) || n < 0 || n > 1) throw RangeError("Mix amount must be between 0 and 1");
	let r = _(e), i = _(t);
	return n === 0 ? e : n === 1 ? t : T(r.map((e, t) => e + (i[t] - e) * n));
}
// src/core/steps.ts
var D = {
	onLight: .49,
	onDark: .49
}, O = .004, k = [
	0,
	.7,
	1
], A = (t) => {
	let n = Array.isArray(t) ? t : t.lab();
	return {
		hex: e.lab(...n).hex(),
		L: n[0]
	};
}, j = (t) => A(e(t).lab());
function M(e, t, n) {
	if (n === 0) return e;
	if (n === 1) return t;
	let r = l(e), i = l(t);
	if (Math.abs(i - r) < 1e-10) return E(e, t, n);
	let a = i > r, o = r + (i - r) * n, s = 0, c = 1, u = e, d = Math.abs(o - r);
	for (let n = 0; n < 18; n++) {
		let n = (s + c) / 2, r = E(e, t, n), i = l(r), f = Math.abs(i - o);
		f < d && (u = r, d = f), (a ? i < o : i > o) ? s = n : c = n;
	}
	return u;
}
function N(e, t, r) {
	if (r === 0) return e;
	if (r === 1) return t;
	let i = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, a = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055, o = n(e).map(i), s = n(t).map(i);
	return "#" + o.map((e, t) => Math.round(Math.max(0, Math.min(1, a(e + (s[t] - e) * r))) * 255).toString(16).padStart(2, "0")).join("");
}
function P({ neutral: t, colorModel: n, colors: r, contrast: i = 1, signalLightness: o = D }) {
	if (!Number.isFinite(i) || i < 0 || i > 2) throw RangeError("contrast must be between 0 and 2");
	let s = t[0], c = t[t.length - 1], u = e.scale([...t]).mode(n).correctLightness(), d = Array.from({ length: 257 }, (e, t) => {
		let n = A(u(t / 256));
		return {
			...n,
			lightness: l(n.hex),
			oklab: _(n.hex)
		};
	}), [f, p] = [d[0], d[256]].sort((e, t) => e.lightness - t.lightness), m = [d[0].hex, d[256].hex].sort((e, t) => a(e) - a(t)), g = Math.max(0, u(0).get("lab.l")), v = Math.max(0, u(1).get("lab.l")), y = e.scale([c, s]).mode("lab").classes(k), b = /* @__PURE__ */ new Map(), x = (t, n) => {
		let i = `${t}:${n}`, a = b.get(i);
		if (!a) {
			if (!(t in r)) throw TypeError(`Unknown ramp: ${t}`);
			let l = e.scale([
				s,
				r[t],
				c
			]).mode("lab").correctLightness(), u = n ? o.onDark : o.onLight;
			b.set(i, a = A(l(u)).hex);
		}
		return a;
	}, S = (e) => {
		let t = l(e.hex), n = d[0];
		for (let e of d) Math.abs(e.lightness - t) < Math.abs(n.lightness - t) && (n = e);
		let [, r, i] = _(e.hex);
		return Math.hypot(r - n.oklab[1], i - n.oklab[2]) >= O;
	}, C = (e, t) => {
		let n = h(e.hex, f.hex, p.hex) === p.hex, r = l(e.hex), i = Math.abs((n ? p : f).lightness - r);
		if (i <= 1e-10) return e;
		let a = i * t, o = d[0], s = -1, c, u = Infinity;
		for (let e of d) {
			if (n ? e.lightness < r : e.lightness > r) continue;
			let t = Math.abs(e.lightness - r);
			t > s && ([o, s] = [e, t]), t >= a && t < u && ([c, u] = [e, t]);
		}
		let m = c ?? o;
		if (!S(e)) return {
			hex: m.hex,
			L: m.L
		};
		let g = 1 - t ** 3, [, v, y] = _(e.hex), [b, x, C] = m.oklab;
		return j(T([
			b,
			x + (v - x) * g,
			C + (y - C) * g
		]));
	}, w = (e, t, n) => {
		let [r, i] = m, o = h(e.hex, r, i) === i, [s, c, l] = _(x(t, o)), u = _(r)[0], d = _(i)[0];
		if (Math.abs(d - u) < 1e-7) return e;
		let [f] = _(e.hex), p = Math.max(0, Math.min(1, o ? (s - u) / (d - u) : (d - s) / (d - u))), g = o ? d : u, v = f + (g - f) * p, y = T([
			v,
			c,
			l
		]), b = (t) => o ? a(t) >= a(e.hex) : a(t) <= a(e.hex);
		for (let e = 0; e < 24 && !b(y); e++) v = (v + g) / 2, y = T([
			v,
			c,
			l
		]);
		b(y) || (y = e.hex);
		let S = M(e.hex, y, n);
		return b(S) || (S = e.hex), j(S);
	}, E = (e) => A(y((e.L - g) / (v - g))), P = (e, t, n, r) => {
		if (n === "white") return E(e);
		let i = Math.max(0, Math.min(1, t / 100 * r));
		return i === 0 ? e : n === "gray" ? C(e, i) : w(e, n, i);
	}, F = (e) => {
		let t = j(e);
		return {
			...t,
			full: t,
			origin: t.hex
		};
	}, I = (e, t) => i >= 1 ? t : N(e.origin, t, i);
	return {
		surfaceOf: F,
		shown: I,
		derive(e, t) {
			let n = j(t);
			return i >= 1 ? {
				...n,
				full: n,
				origin: e.origin
			} : {
				...j(I(e, t)),
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
				...j(N(e.origin, r.hex, i)),
				full: r,
				origin: e.origin
			};
		}
	};
}
// src/core/theme.ts
var F = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
], I = [
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
], L = [
	"neutral",
	"colorModel",
	"colors",
	"contrast",
	"signalLightness",
	"images",
	"svgs"
], R = [
	"pallet",
	"ramps",
	"bgRamp",
	"bgRampValue",
	"contrastMultiplier"
], z = (t) => typeof t == "string" && e.valid(t);
function B(e) {
	let t = (e) => {
		throw TypeError(`Invalid Huet theme: ${e}`);
	};
	(typeof e != "object" || !e || Array.isArray(e)) && t(`expected an object like { neutral: ["#000000", "#ffffff"] }, got ${JSON.stringify(e)}`);
	let n = e, r = Object.keys(n);
	r.some((e) => R.includes(e)) && t("this is the old ThemeConfig format (pallet, ramps, bgRampValue, ...). Themes are now { neutral, colorModel, colors, contrast }, and the background is passed when rendering.");
	let i = r.filter((e) => !L.includes(e));
	i.length && t(`unknown field${i.length > 1 ? "s" : ""} ${i.join(", ")}. Themes have ${L.join(", ")}.`);
	let { neutral: a, colorModel: o, colors: s, contrast: c } = n;
	(!Array.isArray(a) || a.length < 2) && t(`neutral must be an array of two or more colors, darkest first, got ${JSON.stringify(a)}`);
	for (let e of a) z(e) || t(`neutral has ${JSON.stringify(e)}, which isn't a color`);
	if (o !== void 0 && !I.includes(o) && t(`colorModel must be one of ${I.join(", ")}, got ${JSON.stringify(o)}`), s !== void 0) {
		(typeof s != "object" || !s || Array.isArray(s)) && t(`colors must be an object like { red: "#d14457" }, got ${JSON.stringify(s)}`);
		for (let [e, n] of Object.entries(s)) F.includes(e) || t(`colors.${e} isn't a hue. Hues are ${F.join(", ")}.`), z(n) || t(`colors.${e} is ${JSON.stringify(n)}, which isn't a color`);
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
function V({ neutral: e, colorModel: t = "oklab" }) {
	return e.length === 2 && t === "oklab" ? {
		dark: e[0],
		light: e[1]
	} : { neutral: {
		colors: e,
		colorModel: t
	} };
}
function H(e, { background: t = 1 } = {}) {
	if (B(e), typeof t != "number" || !(t >= 0 && t <= 1)) throw RangeError(`Huet: background must be a number from 0 (dark) to 1 (light), got ${JSON.stringify(t)}`);
	return ne({
		...V(e),
		colors: e.colors,
		contrast: e.contrast,
		signalLightness: e.signalLightness,
		background: t
	});
}
var U = {
	red: "#d14457",
	yellow: "#9d6f00",
	green: "#298830",
	blue: "#0082dc",
	purple: "#a359b9"
}, W = (e) => ({
	color: e,
	y: d(e)
}), G = (e) => ({
	...W(e),
	luminance: a(e)
}), K = (e, { y: t }) => Math.abs(p(t, e)), q = {
	foreground: 90,
	muted: 60,
	border: 30
};
function J(e, t, n) {
	let r = d(e), i = t[0].color, a = -1, o = "", s = Infinity;
	for (let e of t) {
		let t = K(r, e);
		t > a && (i = e.color, a = t), t >= n && t < s && (o = e.color, s = t);
	}
	return o || i;
}
var Y = 257;
function X(e, t, n) {
	for (let r = 0; r < Y; r++) if (t(e(r)) >= n - 1e-9) return e(r).color;
}
function ee(e, t) {
	let n = e[0](0), r = t(n);
	for (let i of e) for (let e = 0; e < Y; e++) {
		let a = t(i(e));
		a > r && ([n, r] = [i(e), a]);
	}
	return n.color;
}
var te = /* @__PURE__ */ new Map(), Z = /* @__PURE__ */ new Map();
function Q(e, t, n = te, r = 64) {
	if (n.has(e)) return n.get(e);
	let i = t();
	return n.size >= r && n.clear(), n.set(e, i), i;
}
function $(t) {
	let r = t.neutral !== void 0;
	if (r && (t.dark !== void 0 || t.light !== void 0)) throw TypeError("Pass either neutral.colors or dark/light, not both");
	let i = Object.freeze([...t.neutral?.colors ?? [t.dark ?? "#000000", t.light ?? "#ffffff"]]);
	if (i.length < 2) throw RangeError("neutral.colors needs at least two colors");
	for (let e of i) n(e);
	let o = i[0], s = i[i.length - 1];
	if (a(o) > a(s)) throw RangeError("dark must be darker than light");
	let c = t.neutral?.colorModel ?? "oklab";
	if (!I.includes(c)) throw TypeError(`Unknown color model: ${c}`);
	let l = e.scale([...i]).mode(c), u = [];
	return {
		custom: r,
		stops: i,
		dark: o,
		light: s,
		colorModel: c,
		ramp: (e) => {
			if (!Number.isFinite(e) || e < 0 || e > 1) throw RangeError("Mix amount must be between 0 and 1");
			return r ? u[Math.floor(e * 1e4)] ??= l(e).hex() : E(o, s, e);
		}
	};
}
function ne(e = {}) {
	let t = $(e), { custom: r, stops: i, dark: o, light: s, colorModel: c } = t, l = `${c}:${r}:${i}`, { ramp: u } = Q(`ramp:${l}`, () => t), f = u(e.background ?? 1), p = Object.freeze({
		...U,
		...e.colors
	});
	for (let e of Object.values(p)) n(e);
	let g = Object.fromEntries(F.map((e) => [e, `${l}:${p[e]}`])), v = Q(`neutral:${l}`, () => Array.from({ length: 257 }, (e, t) => _(u(t / 256)))), y = (e) => {
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
			return T(i.map((e, t) => e + (a[t] - c[t]) * o[t]));
		};
	}, S = _(o)[0], C = _(s)[0], w = Object.fromEntries(F.map((e) => {
		let [, t, n] = _(p[e]);
		return [e, Q(`hue:${g[e]}`, () => Array.from({ length: 257 }, (e, r) => G(T([
			S + (C - S) * r / 256,
			t,
			n
		]))))];
	})), E = (e, t) => {
		let n = a(e), r = h(e, o, s) === s, i = w[t].filter((e) => r ? e.luminance >= n : e.luminance <= n);
		return i.length ? i : [G(e)];
	}, D = Math.min(m(o, s), m(s, o)), O = Math.min(1, D / q.foreground), k = /* @__PURE__ */ new Map(), A = (e, t) => {
		let n = e + t, r = k.get(n);
		if (!r) {
			let i = x(e, t), a = [];
			r = (e) => a[e] ??= W(i(e / 256)), k.size >= 512 && k.clear(), k.set(n, r);
		}
		return r;
	}, j = /* @__PURE__ */ new Map(), M = (e = f, t = e) => {
		n(e), n(t);
		let r = e + t, i = j.get(r);
		if (i) return i;
		let a = Object.freeze({
			...Q(`${l}|${e}|${t}`, () => N(e, t), Z, 4096),
			...Object.fromEntries(F.map((t) => [t, Q(`${g[t]}|${e}`, () => J(e, E(e, t), q.muted * O), Z, 4096)]))
		});
		return j.size >= 512 && j.clear(), j.set(r, a), a;
	};
	function N(e, t) {
		let n = h(e, o, s), r = A(e, n), i = d(e), a = d(t), c = (e) => K(i, e), l = Math.min(m(e, n), q.foreground), u = (e) => l * e / q.foreground, f = (e) => Math.min(c(e), K(a, e)), p = X(r, f, u(q.border));
		if (p === void 0) {
			let t = A(e, n === s ? o : s);
			p = X(t, f, u(q.border)) ?? ee([r, t], f);
		}
		return {
			background: e,
			foreground: X(r, c, l) ?? n,
			muted: X(r, c, u(q.muted)) ?? n,
			border: p
		};
	}
	let I = /* @__PURE__ */ new Map(), L = D >= q.muted, R = (e) => Math.max(m(e, o), m(e, s)) >= q.muted, z = (e, t) => {
		let n = e + ":" + t, r = I.get(n);
		if (r) return r;
		let i;
		if (typeof t == "string") {
			if (!F.includes(t)) throw TypeError(`Unknown hue: ${t}`);
			let n = E(e, t), r = L ? n.filter((e) => R(e.color)) : n;
			i = J(e, r.length ? r : n, q.border * O);
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
	}, B = Object.freeze({
		colors: i,
		colorModel: c
	}), V = P({
		neutral: i,
		colorModel: r ? c : "lab",
		colors: p,
		contrast: e.contrast,
		signalLightness: e.signalLightness
	}), H = V.surfaceOf(f);
	return Object.freeze({
		background: f,
		dark: o,
		light: s,
		neutral: B,
		colors: p,
		ramp: u,
		tokens: M,
		tokensOn: (t, n = t) => {
			let r = M(t.full.hex, n.full.hex);
			return (e.contrast ?? 1) >= 1 ? r : Object.freeze(Object.fromEntries(Object.entries(r).map(([e, n]) => [e, e === "background" ? t.hex : V.shown(t, n)])));
		},
		surface: z,
		root: H,
		step: V.step,
		surfaceOf: V.surfaceOf,
		derive: V.derive
	});
}
function re(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [`--huet-${e}`, t]));
}
export { v as _, $ as a, re as c, s as d, o as f, h as g, C as h, F as i, m as l, g as m, I as n, V as o, b as p, U as r, H as s, B as t, c as u, _ as v };

//# sourceMappingURL=theme-CZOtr1TP.js.map