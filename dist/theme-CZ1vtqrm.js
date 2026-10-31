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
// src/colorModel.ts
var w = {
	SIGNAL: "signal",
	DIRECT: "direct",
	FURTHEST: "furthest"
}, T = 20, E = 50, D = 60, O = [
	[0, "red"],
	[1, "yellow"],
	[2, "green"],
	[4, "blue"],
	[5, "purple"]
], k = 60, A = Object.fromEntries(O.map(([t, n]) => [n, e.hcl(k * t + T, D, E).hex()])), j = Object.fromEntries(O.map(([, e]) => [e, {
	colors: [
		"black",
		e,
		"white"
	],
	mode: "signal"
}])), M = {
	id: 0,
	name: "Base",
	pallet: {
		black: "#000000",
		white: "#ffffff",
		...A
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
		...j
	},
	bgRamp: "gray",
	bgRampValue: 1,
	startSignalLightness: .49,
	endSignalLightness: .49,
	contrastMultiplier: 1,
	rescaleContrastToGrayRange: !0
}, N = /* @__PURE__ */ new WeakMap(), P = [
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
], F = {
	colors: ["black", "white"],
	colorModel: "lab",
	correctLightness: !0,
	mode: w.FURTHEST
}, I = class {
	constructor(e = M) {
		this.config = e;
		for (let t of Object.keys(e)) if (!P.includes(t)) throw Error(`${t} isn't allowed in Theme`);
		this.id = e.id, this.name = e.name, this.pallet = e.pallet, this.bgRamp = e.bgRamp, this.bgRampValue = e.bgRampValue, this.startSignalLightness = e.startSignalLightness, this.endSignalLightness = e.endSignalLightness, this.contrastMultiplier = e.contrastMultiplier, this.rescaleContrastToGrayRange = e.rescaleContrastToGrayRange, this.ramps = Object.fromEntries(Object.entries(e.ramps).map(([t, n]) => [t, ee(e, n)]));
	}
};
function ee(e, t) {
	let n = {
		...F,
		...t,
		colors: t.colors ?? F.colors,
		colorModel: t.colorModel ?? F.colorModel,
		correctLightness: t.correctLightness ?? F.correctLightness,
		mode: t.mode ?? F.mode
	}, r = n.colors.map((t) => {
		if (t in e.pallet) return e.pallet[t];
		throw Error(`Couldn't find color "${t}" in themeConfig.pallet`);
	}), i = JSON.stringify([r, n]), a = L.get(i);
	a || (L.size >= 256 && L.clear(), L.set(i, a = R(r, n)));
	let { sample: o, startL: s, endL: c } = a, l = ((e) => [...o(e)]);
	return n.mode !== w.DIRECT && Object.assign(l, {
		startL: s,
		endL: c
	}), l.config = n, N.set(l, i), l;
}
var L = /* @__PURE__ */ new Map();
function R(t, n) {
	let r = e.scale(t);
	n.colorModel && r.mode(n.colorModel), n.classes && r.classes(n.classes), n.mode !== w.DIRECT && n.correctLightness && r.correctLightness();
	let i = /* @__PURE__ */ new Map(), a = (e) => {
		let t = i.get(e);
		return t || (i.size >= 4096 && i.clear(), i.set(e, t = r(e).lab())), t;
	};
	return n.mode === w.DIRECT ? { sample: a } : {
		sample: a,
		startL: K(r(0)),
		endL: K(r(1))
	};
}
// src/private/cache.ts
var z = "MISS";
function te(e, t, n) {
	let r = e;
	for (let e = 0; e < t.length; e++) {
		let i = t[e];
		e === t.length - 1 ? r.set(i, n) : (r.has(i) || r.set(i, /* @__PURE__ */ new Map()), r = r.get(i));
	}
}
function ne(e, t) {
	let n = e;
	for (let e = 0; e < t.length; e++) {
		let r = t[e];
		if (!(n instanceof Map) || !n.has(r)) return z;
		n = n.get(r);
	}
	return n;
}
var re = class {
	constructor(e = 500) {
		this.resetAtItemCount = e, this.cached = /* @__PURE__ */ new Map(), this.itemCount = 0, this.tries = 0, this.hits = 0;
	}
	set(e, t) {
		this.itemCount > this.resetAtItemCount && this.reset(), te(this.cached, e, t), this.itemCount++;
	}
	get(e) {
		let t = ne(this.cached, e);
		return this.tries++, t === z ? null : (this.hits++, t);
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
function ie(e, t, n) {
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
// src/private/fadeColor.ts
function ae(e, t, r) {
	if (r === 0) return e;
	if (r === 1) return t;
	let i = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, a = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055, o = n(e).map(i), s = n(t).map(i);
	return "#" + o.map((e, t) => Math.round(Math.max(0, Math.min(1, a(e + (s[t] - e) * r))) * 255).toString(16).padStart(2, "0")).join("");
}
// src/Color.ts
var B = new re(), oe = /* @__PURE__ */ new WeakMap(), V = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new Map();
function se(t) {
	let n = H.get(t);
	if (n) return n;
	let r = N.get(t);
	return n = r === void 0 ? void 0 : U.get(r), n || (n = Array.from({ length: 257 }, (n, r) => {
		let i = t(r / 256), a = e.lab(...i).hex();
		return {
			lab: i,
			hex: a,
			lightness: l(a)
		};
	}), r !== void 0 && (U.size >= 64 && U.clear(), U.set(r, n))), H.set(t, n), n;
}
var W = class {
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
}, G = class t extends W {
	constructor({ theme: e, bgColor: t = null, lab: n, ramp: r = null, baseRamp: i = null }) {
		if (super(n), !e) throw Error("`theme` is required");
		if (i && (i.startL === void 0 || i.endL === void 0)) throw Error("`baseRamp` can't be a direct ramp");
		if (!i && (!t || t.baseRamp) && !e.ramps.gray) throw Error("No baseRamp");
		this.theme = e, this.bgColor = t, this.ramp = r, this.baseRamp = i || t && t.baseRamp || e.ramps.gray, this.lightness = n[0];
	}
	static fromTheme(e) {
		if (!(e instanceof I)) throw TypeError("Need to give me a Theme instance, not a \"theme config\"");
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
		return this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1 ? B.at([
			this,
			"fadeContrast",
			n,
			r
		], () => this.fadeEnabled(r, (e, t) => e.contrast(n, t))) : r.config.mode === "direct" ? this.direct(r) : B.at([
			this.hex,
			this.baseRamp,
			n,
			r
		], () => {
			let { theme: i } = this, o = r === i.ramps[i.bgRamp];
			if (o && i.rescaleContrastToGrayRange && n >= 0) {
				let e = Math.max(0, Math.min(1, n / 100 * i.contrastMultiplier));
				if (e === 0) return this;
				let a = se(r), [o, s] = [a[0], a[a.length - 1]].sort((e, t) => e.lightness - t.lightness), c = h(this.hex, o.hex, s.hex) === s.hex, u = l(this.hex), d = Math.abs((c ? s : o).lightness - u);
				if (d <= 1e-10) return this;
				let f = d * e, p = r(0), m = -1, g, _ = Infinity;
				for (let { lab: e, lightness: t } of a) {
					if (c ? t < u : t > u) continue;
					let n = Math.abs(t - u);
					n > m && (p = e, m = n), n >= f && n < _ && (g = e, _ = n);
				}
				return new t({
					theme: i,
					bgColor: this,
					lab: g ?? p,
					ramp: r
				});
			}
			if (r.config.mode === "furthest" && i.rescaleContrastToGrayRange && n >= 0) {
				let o = Math.max(0, Math.min(1, n / 100 * i.contrastMultiplier));
				if (o === 0) return this;
				let s = i.ramps[i.bgRamp], c = [0, 1].map((t) => e.lab(...s(t)).hex()).sort((e, t) => a(e) - a(t)), l = h(this.hex, c[0], c[1]) === c[1], u = [0, 1].map((t) => e.lab(...r(t)).hex()).sort((e, t) => a(e) - a(t))[+!!l], d = (l ? a(u) >= a(this.hex) : a(u) <= a(this.hex)) ? ie(this.hex, u, o) : this.hex;
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
				let s = i.ramps[i.bgRamp], [c, l] = [0, 1].map((t) => e.lab(...s(t)).hex()).sort((e, t) => a(e) - a(t)), u = h(this.hex, c, l) === l, d = u ? i.endSignalLightness : i.startSignalLightness, [f, p, m] = _(e.lab(...r(d)).hex()), g = _(c)[0], v = _(l)[0];
				if (Math.abs(v - g) < 1e-7) return this;
				let [y] = _(this.hex), b = Math.max(0, Math.min(1, u ? (f - g) / (v - g) : (v - f) / (v - g))), x = u ? v : g, C = y + (x - y) * b, w = S([
					C,
					p,
					m
				]), T = (e) => u ? a(e) >= a(this.hex) : a(e) <= a(this.hex);
				for (let e = 0; e < 24 && !T(w); e++) C = (C + x) / 2, w = S([
					C,
					p,
					m
				]);
				T(w) || (w = this.hex);
				let E = ie(this.hex, w, o);
				return T(E) || (E = this.hex), new t({
					theme: i,
					bgColor: this,
					lab: e(E).lab(),
					ramp: r
				});
			}
			let [s, c] = this._getMinMax(r), [u, d] = this._getMinMax(this.ramp), f = (this.lightness - u) / (d - u), p = (() => {
				let e = (s + c) / 2;
				return (this.lightness < e ? 1 : -1) * ((c - s) / 100);
			})(), m = (() => {
				let e = 1, t = 1, n = 1;
				if ((o || i.contrastMultiplier < 1) && (e = i.contrastMultiplier), i.rescaleContrastToGrayRange && o && (t = Math.abs(f - .5) + .5), !o) {
					let e = (s + c) / 2;
					n = this.lightness < e ? i.endSignalLightness : 1 - i.startSignalLightness;
				}
				return e * t * n;
			})(), g = (this.lightness + n * p * m - (r.startL ?? NaN)) / ((r.endL ?? NaN) - (r.startL ?? NaN)), [v, y, b] = this.lab, [x, C, w] = r(g), T = o || i.contrastMultiplier > 1 ? 1 : i.contrastMultiplier, E = [
				v + (x - v) * 1,
				y + (C - y) * T,
				b + (w - b) * T
			];
			return new t({
				theme: i,
				bgColor: this,
				lab: E,
				ramp: r
			});
		});
	}
	direct(e) {
		return this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1 ? B.at([
			this,
			"fadeDirect",
			e
		], () => this.fadeEnabled(e, (e, t) => e.direct(t))) : B.at([this.hex, e], () => {
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
		let i = oe.get(this.theme);
		i || (i = new I({
			...this.theme.config,
			contrastMultiplier: 1
		}), oe.set(this.theme, i));
		let a = (e) => {
			if (!e) return null;
			let t = Object.keys(this.theme.ramps).find((t) => this.theme.ramps[t] === e);
			return t === void 0 ? e : i.ramps[t];
		}, o = V.get(this) ?? {
			color: new t({
				theme: i,
				lab: this.lab,
				ramp: a(this.ramp),
				baseRamp: a(this.baseRamp)
			}),
			origin: this.hex
		}, s = r(o.color, a(n)), c = ae(o.origin, s.hex, this.theme.contrastMultiplier), l = new t({
			theme: this.theme,
			bgColor: this,
			lab: e(c).lab(),
			ramp: n
		});
		return V.set(l, {
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
		}), r = V.get(this);
		if (r) {
			let t = Object.keys(this.theme.ramps).find((t) => this.theme.ramps[t] === e), i = t === void 0 ? e : r.color.theme.ramps[t];
			V.set(n, {
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
function K(t) {
	return Math.max(0, e(t).get("lab.l"));
}
// src/core/relative.ts
function ce(t, n, r, i = 1, a = !0) {
	if (!Number.isFinite(i) || i < 0 || i > 1) throw RangeError("contrast must be between 0 and 1");
	let o = Object.fromEntries(r.colors.slice(1, -1).map((e, t) => [`stop${t}`, e])), s = new I({
		...M,
		pallet: {
			...M.pallet,
			...n,
			...o,
			black: r.colors[0],
			white: r.colors[r.colors.length - 1]
		},
		ramps: a ? {
			...M.ramps,
			gray: {
				colors: [
					"black",
					...Object.keys(o),
					"white"
				],
				colorModel: r.colorModel
			}
		} : M.ramps,
		contrastMultiplier: i
	});
	return new G({
		theme: s,
		lab: e(t).lab(),
		ramp: s.ramps.gray
	});
}
// src/core/theme.ts
var q = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
], J = [
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
], le = {
	red: "#d14457",
	yellow: "#9d6f00",
	green: "#298830",
	blue: "#0082dc",
	purple: "#a359b9"
}, ue = (e) => ({
	color: e,
	y: d(e)
}), de = (e) => ({
	...ue(e),
	luminance: a(e)
}), Y = (e, { y: t }) => Math.abs(p(t, e)), X = {
	foreground: 90,
	muted: 60,
	border: 30
};
function Z(e, t, n) {
	let r = d(e), i = t[0].color, a = -1, o = "", s = Infinity;
	for (let e of t) {
		let t = Y(r, e);
		t > a && (i = e.color, a = t), t >= n && t < s && (o = e.color, s = t);
	}
	return o || i;
}
var fe = 257;
function Q(e, t, n) {
	for (let r = 0; r < fe; r++) if (t(e(r)) >= n - 1e-9) return e(r).color;
}
function pe(e, t) {
	let n = e[0](0), r = t(n);
	for (let i of e) for (let e = 0; e < fe; e++) {
		let a = t(i(e));
		a > r && ([n, r] = [i(e), a]);
	}
	return n.color;
}
var me = /* @__PURE__ */ new Map(), he = /* @__PURE__ */ new Map();
function $(e, t, n = me, r = 64) {
	if (n.has(e)) return n.get(e);
	let i = t();
	return n.size >= r && n.clear(), n.set(e, i), i;
}
function ge(t) {
	let r = t.neutral !== void 0;
	if (r && (t.dark !== void 0 || t.light !== void 0)) throw TypeError("Pass either neutral.colors or dark/light, not both");
	let i = Object.freeze([...t.neutral?.colors ?? [t.dark ?? "#000000", t.light ?? "#ffffff"]]);
	if (i.length < 2) throw RangeError("neutral.colors needs at least two colors");
	for (let e of i) n(e);
	let o = i[0], s = i[i.length - 1];
	if (a(o) > a(s)) throw RangeError("dark must be darker than light");
	let c = t.neutral?.colorModel ?? "oklab";
	if (!J.includes(c)) throw TypeError(`Unknown color model: ${c}`);
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
function _e(e = {}) {
	let t = ge(e), { custom: r, stops: i, dark: o, light: s, colorModel: c } = t, l = `${c}:${r}:${i}`, { ramp: u } = $(`ramp:${l}`, () => t), f = u(e.background ?? 1), p = Object.freeze({
		...le,
		...e.colors
	});
	for (let e of Object.values(p)) n(e);
	let g = Object.fromEntries(q.map((e) => [e, `${l}:${p[e]}`])), v = $(`neutral:${l}`, () => Array.from({ length: 257 }, (e, t) => _(u(t / 256)))), y = (e) => {
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
	}, C = _(o)[0], w = _(s)[0], T = Object.fromEntries(q.map((e) => {
		let [, t, n] = _(p[e]);
		return [e, $(`hue:${g[e]}`, () => Array.from({ length: 257 }, (e, r) => de(S([
			C + (w - C) * r / 256,
			t,
			n
		]))))];
	})), E = (e, t) => {
		let n = a(e), r = h(e, o, s) === s, i = T[t].filter((e) => r ? e.luminance >= n : e.luminance <= n);
		return i.length ? i : [de(e)];
	}, D = Math.min(m(o, s), m(s, o)), O = Math.min(1, D / X.foreground), k = /* @__PURE__ */ new Map(), A = (e, t) => {
		let n = e + t, r = k.get(n);
		if (!r) {
			let i = x(e, t), a = [];
			r = (e) => a[e] ??= ue(i(e / 256)), k.size >= 512 && k.clear(), k.set(n, r);
		}
		return r;
	}, j = /* @__PURE__ */ new Map(), M = (e = f, t = e) => {
		n(e), n(t);
		let r = e + t, i = j.get(r);
		if (i) return i;
		let a = Object.freeze({
			...$(`${l}|${e}|${t}`, () => N(e, t), he, 4096),
			...Object.fromEntries(q.map((t) => [t, $(`${g[t]}|${e}`, () => Z(e, E(e, t), X.muted * O), he, 4096)]))
		});
		return j.size >= 512 && j.clear(), j.set(r, a), a;
	};
	function N(e, t) {
		let n = h(e, o, s), r = A(e, n), i = d(e), a = d(t), c = (e) => Y(i, e), l = Math.min(m(e, n), X.foreground), u = (e) => l * e / X.foreground, f = (e) => Math.min(c(e), Y(a, e)), p = Q(r, f, u(X.border));
		if (p === void 0) {
			let t = A(e, n === s ? o : s);
			p = Q(t, f, u(X.border)) ?? pe([r, t], f);
		}
		return {
			background: e,
			foreground: Q(r, c, l) ?? n,
			muted: Q(r, c, u(X.muted)) ?? n,
			border: p
		};
	}
	let P = /* @__PURE__ */ new Map(), F = D >= X.muted, I = (e) => Math.max(m(e, o), m(e, s)) >= X.muted, ee = (e, t) => {
		let n = e + ":" + t, r = P.get(n);
		if (r) return r;
		let i;
		if (typeof t == "string") {
			if (!q.includes(t)) throw TypeError(`Unknown hue: ${t}`);
			let n = E(e, t), r = F ? n.filter((e) => I(e.color)) : n;
			i = Z(e, r.length ? r : n, X.border * O);
		} else {
			let n = x(e, h(e, o, s));
			if (i = n(t / 100), t !== 0 && F && !I(i)) {
				let e = Infinity;
				for (let r = 0; r <= 256; r++) {
					let a = n(r / 256), o = Math.abs(r / 256 - t / 100);
					o < e && I(a) && (i = a, e = o);
				}
			}
		}
		return P.size >= 512 && P.clear(), P.set(n, i), i;
	}, L = Object.freeze({
		colors: i,
		colorModel: c
	}), R = ce(f, p, L, e.contrast, r);
	return Object.freeze({
		background: f,
		dark: o,
		light: s,
		neutral: L,
		colors: p,
		ramp: u,
		tokens: M,
		surface: ee,
		relative: R
	});
}
function ve(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [`--huet-${e}`, t]));
}
export { g as _, ge as a, G as c, M as d, w as f, a as g, o as h, q as i, K as l, s as m, _e as n, ve as o, c as p, le as r, W as s, J as t, I as u, b as v, _ as y };

//# sourceMappingURL=theme-CZ1vtqrm.js.map