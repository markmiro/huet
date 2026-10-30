import e from "chroma-js";
// src/core/color.ts
var t = (e) => Math.max(0, Math.min(1, e));
function n(e) {
	if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(e)) throw TypeError(`Expected an opaque hex color, got ${e}`);
	let t = e.length === 4 ? e.slice(1).split("").map((e) => e + e).join("") : e.slice(1);
	return [
		0,
		2,
		4
	].map((e) => parseInt(t.slice(e, e + 2), 16) / 255);
}
var r = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, i = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055;
function a(e) {
	let [t, i, a] = n(e).map(r);
	return .2126 * t + .7152 * i + .0722 * a;
}
function o(e, t) {
	let n = a(e), r = a(t);
	return (Math.max(n, r) + .05) / (Math.min(n, r) + .05);
}
function s(e, t, n) {
	e = r(e), t = r(t), n = r(n);
	let i = Math.cbrt(.4122214708 * e + .5363325363 * t + .0514459929 * n), a = Math.cbrt(.2119034982 * e + .6806995451 * t + .1073969566 * n), o = Math.cbrt(.0883024619 * e + .2817188376 * t + .6299787005 * n);
	return [
		.2104542553 * i + .793617785 * a - .0040720468 * o,
		1.9779984951 * i - 2.428592205 * a + .4505937099 * o,
		.0259040371 * i + .7827717662 * a - .808675766 * o
	];
}
function c(e) {
	return s(...n(e));
}
function l([e, t, n]) {
	let r = (e + .3963377774 * t + .2158037573 * n) ** 3, i = (e - .1055613458 * t - .0638541728 * n) ** 3, a = (e - .0894841775 * t - 1.291485548 * n) ** 3;
	return [
		4.0767416621 * r - 3.3077115913 * i + .2309699292 * a,
		-1.2684380046 * r + 2.6097574011 * i - .3413193965 * a,
		-.0041960863 * r - .7034186147 * i + 1.707614701 * a
	];
}
function u([e, n, r]) {
	e = t(e);
	let a = l([
		e,
		n,
		r
	]), o = (e) => e.every((e) => e >= -1e-7 && e <= 1 + 1e-7);
	if (!o(a)) {
		let t = 0, i = 1;
		for (let a = 0; a < 20; a++) {
			let a = (t + i) / 2;
			o(l([
				e,
				n * a,
				r * a
			])) ? t = a : i = a;
		}
		a = l([
			e,
			n * t,
			r * t
		]);
	}
	return a.map((e) => t(i(e)));
}
function d(e) {
	return "#" + u(e).map((e) => Math.round(e * 255).toString(16).padStart(2, "0")).join("");
}
function f(e, t, n) {
	if (!Number.isFinite(n) || n < 0 || n > 1) throw RangeError("Mix amount must be between 0 and 1");
	let r = c(e), i = c(t);
	return n === 0 ? e : n === 1 ? t : d(r.map((e, t) => e + (i[t] - e) * n));
}
// src/colorModel.ts
var p = {
	SIGNAL: "signal",
	DIRECT: "direct",
	FURTHEST: "furthest"
}, m = 20, h = 50, g = 60, _ = [
	[0, "red"],
	[1, "yellow"],
	[2, "green"],
	[4, "blue"],
	[5, "purple"]
], v = 60, y = Object.fromEntries(_.map(([t, n]) => [n, e.hcl(v * t + m, g, h).hex()])), b = Object.fromEntries(_.map(([, e]) => [e, {
	colors: [
		"black",
		e,
		"white"
	],
	mode: "signal"
}])), x = {
	id: 0,
	name: "Base",
	pallet: {
		black: "#000000",
		white: "#ffffff",
		...y
	},
	ramps: {
		gray: { colorModel: "lab" },
		white: {
			colors: ["white", "black"],
			classes: [
				0,
				.7,
				1
			],
			mode: "direct"
		},
		...b
	},
	bgRamp: "gray",
	bgRampValue: 1,
	startSignalLightness: .49,
	endSignalLightness: .49,
	contrastMultiplier: 1,
	rescaleContrastToGrayRange: !0
}, S = [
	"id",
	"name",
	"pallet",
	"ramps",
	"bgRamp",
	"bgRampValue",
	"startSignalLightness",
	"endSignalLightness",
	"contrastMultiplier",
	"rescaleContrastToGrayRange"
], C = {
	colors: ["black", "white"],
	colorModel: "lab",
	correctLightness: !0,
	mode: p.FURTHEST
}, w = class {
	constructor(e = x) {
		this.config = e;
		for (let t of Object.keys(e)) if (!S.includes(t)) throw Error(`${t} isn't allowed in Theme`);
		this.id = e.id, this.name = e.name, this.pallet = e.pallet, this.bgRamp = e.bgRamp, this.bgRampValue = e.bgRampValue, this.startSignalLightness = e.startSignalLightness, this.endSignalLightness = e.endSignalLightness, this.contrastMultiplier = e.contrastMultiplier, this.rescaleContrastToGrayRange = e.rescaleContrastToGrayRange, this.ramps = Object.fromEntries(Object.entries(e.ramps).map(([t, n]) => [t, T(e, n)]));
	}
};
function T(t, n) {
	let r = {
		...C,
		...n,
		colors: n.colors ?? C.colors,
		colorModel: n.colorModel ?? C.colorModel,
		correctLightness: n.correctLightness ?? C.correctLightness,
		mode: n.mode ?? C.mode
	}, i = r.colors.map((e) => {
		if (e in t.pallet) return t.pallet[e];
		throw Error(`Couldn't find color "${e}" in themeConfig.pallet`);
	}), a = e.scale(i);
	r.colorModel && a.mode(r.colorModel), r.classes && a.classes(r.classes);
	let o;
	switch (r.mode) {
		case p.DIRECT:
			o = O(a);
			break;
		case p.SIGNAL:
		default: r.correctLightness && a.correctLightness(), o = D(a);
	}
	return o.config = r, o;
}
function E(e) {
	return (t) => e(t).lab();
}
function D(e) {
	let t = E(e);
	return t.startL = H(e(0)), t.endL = H(e(1)), t;
}
function O(e) {
	return E(e);
}
// src/private/cache.ts
var k = "MISS";
function A(e, t, n) {
	let r = e;
	for (let e = 0; e < t.length; e++) {
		let i = t[e];
		e === t.length - 1 ? r.set(i, n) : (r.has(i) || r.set(i, /* @__PURE__ */ new Map()), r = r.get(i));
	}
}
function j(e, t) {
	let n = e;
	for (let e = 0; e < t.length; e++) {
		let r = t[e];
		if (!(n instanceof Map) || !n.has(r)) return k;
		n = n.get(r);
	}
	return n;
}
var M = class {
	constructor(e = 500) {
		this.resetAtItemCount = e, this.cached = /* @__PURE__ */ new Map(), this.itemCount = 0, this.tries = 0, this.hits = 0;
	}
	set(e, t) {
		this.itemCount > this.resetAtItemCount && this.reset(), A(this.cached, e, t), this.itemCount++;
	}
	get(e) {
		let t = j(this.cached, e);
		return this.tries++, t === k ? null : (this.hits++, t);
	}
	at(e, t) {
		let n = this.get(e);
		if (n) return n;
		let r = t();
		return this.set(e, r), r;
	}
	log() {
		console.log(`Size: ${this.itemCount}
Percent hits: ${Math.round(this.hits / this.tries * 100)}%
Hits: ${this.hits}
Misses: ${this.tries - this.hits}
Tries: ${this.tries}`);
	}
	reset() {
		this.cached = /* @__PURE__ */ new Map(), this.itemCount = 0, this.tries = 0, this.hits = 0;
	}
};
// src/private/mixSignal.ts
function N(e, t, n) {
	if (n === 0) return e;
	if (n === 1) return t;
	let r = a(e), i = a(t);
	if (Math.abs(i - r) < 1e-10) return f(e, t, n);
	let s = i > r, c = o(e, t) ** n, l = s ? (r + .05) * c - .05 : (r + .05) / c - .05, u = 0, d = 1, p = e, m = Math.abs(l - r);
	for (let n = 0; n < 18; n++) {
		let n = (u + d) / 2, r = f(e, t, n), i = a(r), o = Math.abs(i - l);
		o < m && (p = r, m = o), (s ? i < l : i > l) ? u = n : d = n;
	}
	return p;
}
// src/private/fadeColor.ts
function P(e, t, r) {
	if (r === 0) return e;
	if (r === 1) return t;
	let i = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, a = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055, o = n(e).map(i), s = n(t).map(i);
	return "#" + o.map((e, t) => Math.round(Math.max(0, Math.min(1, a(e + (s[t] - e) * r))) * 255).toString(16).padStart(2, "0")).join("");
}
// src/Color.ts
var F = new M(), I = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakMap(), R = /* @__PURE__ */ new WeakMap();
function z(t) {
	let n = R.get(t);
	return n || (n = Array.from({ length: 257 }, (n, r) => {
		let i = t(r / 256);
		return {
			lab: i,
			luminance: e(e.lab(...i).hex()).luminance()
		};
	}), R.set(t, n)), n;
}
var B = class {
	constructor(t) {
		if (!t) throw Error("`lab` is required");
		this.lab = t, this.hex = e.lab(...this.lab).hex();
	}
	alpha(t) {
		return e(this.hex).alpha(t).hex();
	}
	toString() {
		return this.hex;
	}
}, V = class t extends B {
	constructor({ theme: e, bgColor: t = null, lab: n, ramp: r = null, baseRamp: i = null }) {
		if (super(n), !e) throw Error("`theme` is required");
		if (i && (i.startL === void 0 || i.endL === void 0)) throw Error("`baseRamp` can't be a direct ramp");
		if (!i && (!t || t.baseRamp) && !e.ramps.gray) throw Error("No baseRamp");
		this.theme = e, this.bgColor = t, this.ramp = r, this.baseRamp = i || t && t.baseRamp || e.ramps.gray, this.lightness = n[0];
	}
	static fromTheme(e) {
		if (!(e instanceof w)) throw TypeError("Need to give me a Theme instance, not a \"theme config\"");
		let n = e.ramps[e.bgRamp], r = n(e.bgRampValue);
		return new t({
			theme: e,
			bgColor: null,
			lab: r,
			ramp: n,
			baseRamp: n
		});
	}
	contrast(n = 100, r = this.baseRamp) {
		return this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1 ? F.at([
			this,
			"fadeContrast",
			n,
			r
		], () => this.fadeEnabled(r, (e, t) => e.contrast(n, t))) : r.config.mode === "direct" ? this.direct(r) : F.at([
			this.hex,
			this.baseRamp,
			n,
			r
		], () => {
			let { theme: i } = this, o = r === i.ramps[i.bgRamp];
			if (o && i.rescaleContrastToGrayRange && n >= 0) {
				let a = Math.max(0, Math.min(1, n / 100 * i.contrastMultiplier));
				if (a === 0) return this;
				let o = r(0), s = 0, c, l = Infinity, u = z(r), d = e(this.hex).luminance(), f = (e) => (Math.max(d, e) + .05) / (Math.min(d, e) + .05), p = Math.min(u[0].luminance, u[u.length - 1].luminance), m = Math.max(u[0].luminance, u[u.length - 1].luminance), h = f(m) > f(p), g = Math.max(f(p), f(m));
				if (g <= 1 + 1e-10) return this;
				let _ = g ** a;
				for (let { lab: e, luminance: t } of u) {
					if (h ? t < d : t > d) continue;
					let n = (Math.max(d, t) + .05) / (Math.min(d, t) + .05);
					n > s && (o = e, s = n), n >= _ && n < l && (c = e, l = n);
				}
				return new t({
					theme: i,
					bgColor: this,
					lab: c ?? o,
					ramp: r
				});
			}
			if (r.config.mode === "furthest" && i.rescaleContrastToGrayRange && n >= 0) {
				let o = Math.max(0, Math.min(1, n / 100 * i.contrastMultiplier));
				if (o === 0) return this;
				let s = i.ramps[i.bgRamp], c = [0, 1].map((t) => e.lab(...s(t)).hex()).sort((e, t) => a(e) - a(t)), l = e.contrast(this.hex, c[1]) > e.contrast(this.hex, c[0]), u = [0, 1].map((t) => e.lab(...r(t)).hex()).sort((e, t) => a(e) - a(t))[+!!l], d = (l ? a(u) >= a(this.hex) : a(u) <= a(this.hex)) ? N(this.hex, u, o) : this.hex;
				return new t({
					theme: i,
					bgColor: this,
					lab: e(d).lab(),
					ramp: r
				});
			}
			if (r.config.mode === "signal" && i.rescaleContrastToGrayRange && n >= 0) {
				let o = Math.max(0, Math.min(1, n / 100 * i.contrastMultiplier));
				if (o === 0) return this;
				let s = i.ramps[i.bgRamp], [l, u] = [0, 1].map((t) => e.lab(...s(t)).hex()).sort((e, t) => a(e) - a(t)), f = e.contrast(this.hex, u) > e.contrast(this.hex, l), p = f ? i.endSignalLightness : i.startSignalLightness, [m, h, g] = c(e.lab(...r(p)).hex()), _ = c(l)[0], v = c(u)[0];
				if (Math.abs(v - _) < 1e-7) return this;
				let [y] = c(this.hex), b = Math.max(0, Math.min(1, f ? (m - _) / (v - _) : (v - m) / (v - _))), x = f ? v : _, S = y + (x - y) * b, C = d([
					S,
					h,
					g
				]), w = (e) => f ? a(e) >= a(this.hex) : a(e) <= a(this.hex);
				for (let e = 0; e < 24 && !w(C); e++) S = (S + x) / 2, C = d([
					S,
					h,
					g
				]);
				w(C) || (C = this.hex);
				let T = N(this.hex, C, o);
				return w(T) || (T = this.hex), new t({
					theme: i,
					bgColor: this,
					lab: e(T).lab(),
					ramp: r
				});
			}
			let [s, l] = this._getMinMax(r), [u, f] = this._getMinMax(this.ramp), p = (this.lightness - u) / (f - u), m = (() => {
				let e = (s + l) / 2;
				return (this.lightness < e ? 1 : -1) * ((l - s) / 100);
			})(), h = (() => {
				let e = 1, t = 1, n = 1;
				if ((o || i.contrastMultiplier < 1) && (e = i.contrastMultiplier), i.rescaleContrastToGrayRange && o && (t = Math.abs(p - .5) + .5), !o) {
					let e = (s + l) / 2;
					n = this.lightness < e ? i.endSignalLightness : 1 - i.startSignalLightness;
				}
				return e * t * n;
			})(), g = (this.lightness + n * m * h - (r.startL ?? NaN)) / ((r.endL ?? NaN) - (r.startL ?? NaN)), [_, v, y] = this.lab, [b, x, S] = r(g), C = o || i.contrastMultiplier > 1 ? 1 : i.contrastMultiplier, w = [
				_ + (b - _) * 1,
				v + (x - v) * C,
				y + (S - y) * C
			];
			return new t({
				theme: i,
				bgColor: this,
				lab: w,
				ramp: r
			});
		});
	}
	direct(e) {
		return this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1 ? F.at([
			this,
			"fadeDirect",
			e
		], () => this.fadeEnabled(e, (e, t) => e.direct(t))) : F.at([this.hex, e], () => {
			if (e.config.mode !== "direct") throw Error("Not allowed");
			let { theme: n, baseRamp: r } = this, [i, a, o] = e((this.lightness - (r.startL ?? NaN)) / ((r.endL ?? NaN) - (r.startL ?? NaN))), [s, c, l] = this.lab, u = Math.min(n.contrastMultiplier, 1), d = [
				s + (i - s) * u,
				c + (a - c) * u,
				l + (o - l) * u
			];
			return new t({
				theme: n,
				bgColor: this,
				lab: d,
				ramp: e
			});
		});
	}
	fadeEnabled(n, r) {
		let i = I.get(this.theme);
		i || (i = new w({
			...this.theme.config,
			contrastMultiplier: 1
		}), I.set(this.theme, i));
		let a = (e) => {
			if (!e) return null;
			let t = Object.keys(this.theme.ramps).find((t) => this.theme.ramps[t] === e);
			return t === void 0 ? e : i.ramps[t];
		}, o = L.get(this) ?? {
			color: new t({
				theme: i,
				lab: this.lab,
				ramp: a(this.ramp),
				baseRamp: a(this.baseRamp)
			}),
			origin: this.hex
		}, s = r(o.color, a(n)), c = P(o.origin, s.hex, this.theme.contrastMultiplier), l = new t({
			theme: this.theme,
			bgColor: this,
			lab: e(c).lab(),
			ramp: n
		});
		return L.set(l, {
			color: s,
			origin: o.origin
		}), l;
	}
	base(e) {
		let n = new t({
			theme: this.theme,
			bgColor: this.bgColor,
			lab: this.lab,
			ramp: this.ramp,
			baseRamp: e
		}), r = L.get(this);
		if (r) {
			let t = Object.keys(this.theme.ramps).find((t) => this.theme.ramps[t] === e), i = t === void 0 ? e : r.color.theme.ramps[t];
			L.set(n, {
				color: r.color.base(i),
				origin: r.origin
			});
		}
		return n;
	}
	alpha(t) {
		return e.lab(...this.lab).alpha(t * this.theme.contrastMultiplier).hex();
	}
	shadowColor(t = 1) {
		return e.lab(...this.theme.ramps.gray(0)).alpha(this.theme.contrastMultiplier * t);
	}
	_getMinMax(e) {
		let t = this.theme.ramps[this.theme.bgRamp];
		return !e || e.config.mode === "direct" ? [t.startL ?? NaN, t.endL ?? NaN] : [Math.max(e.startL ?? NaN, t.startL ?? NaN), Math.min(e.endL ?? NaN, t.endL ?? NaN)];
	}
};
function H(t) {
	return Math.max(0, e(t).get("lab.l"));
}
// src/core/relative.ts
function U(t, n, r, i = 1, a = !0) {
	if (!Number.isFinite(i) || i < 0 || i > 1) throw RangeError("contrast must be between 0 and 1");
	let o = Object.fromEntries(r.colors.slice(1, -1).map((e, t) => [`stop${t}`, e])), s = new w({
		...x,
		pallet: {
			...x.pallet,
			...n,
			...o,
			black: r.colors[0],
			white: r.colors[r.colors.length - 1]
		},
		ramps: a ? {
			...x.ramps,
			gray: {
				colors: [
					"black",
					...Object.keys(o),
					"white"
				],
				colorModel: r.colorModel
			}
		} : x.ramps,
		contrastMultiplier: i
	});
	return new V({
		theme: s,
		lab: e(t).lab(),
		ramp: s.ramps.gray
	});
}
// src/core/theme.ts
var W = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
], G = [
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
], K = {
	red: "#d14457",
	yellow: "#9d6f00",
	green: "#298830",
	blue: "#0082dc",
	purple: "#a359b9"
}, q = (e) => ({
	color: e,
	luminance: a(e)
}), J = (e, t) => (Math.max(e, t) + .05) / (Math.min(e, t) + .05);
function Y(e, t, n, r = e) {
	let i = t[0].color, o = 0, s = "", c = Infinity, l = a(e), u = a(r);
	for (let { color: e, luminance: r } of t) {
		let t = Math.min(J(l, r), J(u, r));
		t > o && (i = e, o = t), t >= n && t < c && (s = e, c = t);
	}
	return s || i;
}
function X(t) {
	let r = t.neutral !== void 0;
	if (r && (t.dark !== void 0 || t.light !== void 0)) throw TypeError("Pass either neutral.colors or dark/light, not both");
	let i = Object.freeze([...t.neutral?.colors ?? [t.dark ?? "#000000", t.light ?? "#ffffff"]]);
	if (i.length < 2) throw RangeError("neutral.colors needs at least two colors");
	for (let e of i) n(e);
	let o = i[0], s = i[i.length - 1];
	if (a(o) > a(s)) throw RangeError("dark must be darker than light");
	let c = t.neutral?.colorModel ?? "oklab";
	if (!G.includes(c)) throw TypeError(`Unknown color model: ${c}`);
	let l = e.scale([...i]).mode(c);
	return {
		custom: r,
		stops: i,
		dark: o,
		light: s,
		colorModel: c,
		ramp: (e) => {
			if (!Number.isFinite(e) || e < 0 || e > 1) throw RangeError("Mix amount must be between 0 and 1");
			return r ? l(e).hex() : f(o, s, e);
		}
	};
}
function Z(e = {}) {
	let { custom: t, stops: r, dark: i, light: s, colorModel: l, ramp: u } = X(e), p = u(e.background ?? 1), m = Object.freeze({
		...K,
		...e.colors
	});
	for (let e of Object.values(m)) n(e);
	let h = Array.from({ length: 257 }, (e, t) => q(u(t / 256))), g = h.map((e) => c(e.color)), _ = (e) => {
		let [t, n, r] = c(e), i = -1, a = Infinity;
		return g.forEach(([e, o, s], c) => {
			let l = Math.hypot(t - e, n - o, r - s);
			l < a && ([i, a] = [c, l]);
		}), a < .01 ? i / 256 : void 0;
	}, v = (e, n) => {
		let r = t ? _(e) : void 0;
		if (r === void 0) return (t) => f(e, n, t);
		let a = n === i ? 0 : 1;
		return (t) => t === 0 ? e : u(r + (a - r) * t);
	}, y = c(i)[0], b = c(s)[0], x = Object.fromEntries(W.map((e) => {
		let [, t, n] = c(m[e]);
		return [e, Array.from({ length: 257 }, (e, r) => q(d([
			y + (b - y) * r / 256,
			t,
			n
		])))];
	})), S = (e, t) => {
		let n = a(e), r = o(e, s) > o(e, i), c = x[t].filter((e) => r ? e.luminance >= n : e.luminance <= n);
		return c.length ? c : [q(e)];
	}, C = /* @__PURE__ */ new Map(), w = (e = p, t = e) => {
		n(e), n(t);
		let r = e + t, a = C.get(r);
		if (a) return a;
		let c = Math.max(o(e, i), o(e, s)), l = Math.min(1, (o(i, s) - 1) / 6), u = Object.freeze({
			background: e,
			foreground: Y(e, h, Math.min(7, c)),
			muted: Y(e, h, Math.min(4.5, c)),
			border: Y(e, h, 3, t),
			...Object.fromEntries(W.map((t) => [t, Y(e, S(e, t), 1 + 3.5 * l)]))
		});
		return C.size >= 512 && C.clear(), C.set(r, u), u;
	}, T = /* @__PURE__ */ new Map(), E = a(i), D = a(s), O = o(i, s) >= 4.5, k = (e) => Math.max(J(e, E), J(e, D)) >= 4.5, A = (e, t) => {
		let n = e + ":" + t, r = T.get(n);
		if (r) return r;
		let c;
		if (typeof t == "string") {
			if (!W.includes(t)) throw TypeError(`Unknown hue: ${t}`);
			let n = S(e, t), r = O ? n.filter((e) => k(e.luminance)) : n, a = Math.min(1, (o(i, s) - 1) / 6);
			c = Y(e, r.length ? r : n, 1 + 2 * a);
		} else {
			let n = o(e, i) >= o(e, s) ? i : s, r = v(e, n);
			if (c = r(t / 100), t !== 0 && O && !k(a(c))) {
				let e = Infinity;
				for (let n = 0; n <= 256; n++) {
					let i = r(n / 256), o = Math.abs(n / 256 - t / 100);
					o < e && k(a(i)) && (c = i, e = o);
				}
			}
		}
		return T.size >= 512 && T.clear(), T.set(n, c), c;
	}, j = Object.freeze({
		colors: r,
		colorModel: l
	}), M = U(p, m, j, e.contrast, t);
	return Object.freeze({
		background: p,
		dark: i,
		light: s,
		neutral: j,
		colors: m,
		ramp: u,
		tokens: w,
		surface: A,
		relative: M
	});
}
function Q(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [`--huet-${e}`, t]));
}
export { c as _, X as a, V as c, x as d, p as f, u as g, s as h, W as i, H as l, a as m, Z as n, Q as o, o as p, K as r, B as s, G as t, w as u };

//# sourceMappingURL=theme-C2LgQ8y2.js.map