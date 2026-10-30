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
var o = 6 / 29, s = (e) => e > .20689655172413793 ? 1.16 * e - .16 : 24389 / 2700 * e ** 3, c = (e) => e > .08 ? (e + .16) / 1.16 : Math.cbrt(e * 2700 / 24389);
function l(e) {
	return s(h(e)[0]);
}
function u(e) {
	let [t, r, i] = n(e), a = .2126729 * t ** 2.4 + .7151522 * r ** 2.4 + .072175 * i ** 2.4;
	return a < .022 ? a + (.022 - a) ** 1.414 : a;
}
function d(e, t) {
	let n = u(e), r = u(t);
	if (Math.abs(r - n) < 5e-4) return 0;
	let i = r > n ? (r ** .56 - n ** .57) * 1.14 : (r ** .65 - n ** .62) * 1.14;
	return Math.sign(i) * Math.max(0, Math.abs(i) - .027) * 100;
}
var f = (e, t) => Math.abs(d(t, e));
function p(e, t, n) {
	return f(e, n) > f(e, t) ? n : t;
}
function m(e, t, n) {
	e = r(e), t = r(t), n = r(n);
	let i = Math.cbrt(.4122214708 * e + .5363325363 * t + .0514459929 * n), a = Math.cbrt(.2119034982 * e + .6806995451 * t + .1073969566 * n), o = Math.cbrt(.0883024619 * e + .2817188376 * t + .6299787005 * n);
	return [
		.2104542553 * i + .793617785 * a - .0040720468 * o,
		1.9779984951 * i - 2.428592205 * a + .4505937099 * o,
		.0259040371 * i + .7827717662 * a - .808675766 * o
	];
}
function h(e) {
	return m(...n(e));
}
function g([e, t, n]) {
	let r = (e + .3963377774 * t + .2158037573 * n) ** 3, i = (e - .1055613458 * t - .0638541728 * n) ** 3, a = (e - .0894841775 * t - 1.291485548 * n) ** 3;
	return [
		4.0767416621 * r - 3.3077115913 * i + .2309699292 * a,
		-1.2684380046 * r + 2.6097574011 * i - .3413193965 * a,
		-.0041960863 * r - .7034186147 * i + 1.707614701 * a
	];
}
function _([e, n, r]) {
	e = t(e);
	let a = g([
		e,
		n,
		r
	]), o = (e) => e.every((e) => e >= -1e-7 && e <= 1 + 1e-7);
	if (!o(a)) {
		let t = 0, i = 1;
		for (let a = 0; a < 20; a++) {
			let a = (t + i) / 2;
			o(g([
				e,
				n * a,
				r * a
			])) ? t = a : i = a;
		}
		a = g([
			e,
			n * t,
			r * t
		]);
	}
	return a.map((e) => t(i(e)));
}
function v(e) {
	return "#" + _(e).map((e) => Math.round(e * 255).toString(16).padStart(2, "0")).join("");
}
function y(e, t, n) {
	if (!Number.isFinite(n) || n < 0 || n > 1) throw RangeError("Mix amount must be between 0 and 1");
	let r = h(e), i = h(t);
	return n === 0 ? e : n === 1 ? t : v(r.map((e, t) => e + (i[t] - e) * n));
}
// src/colorModel.ts
var b = {
	SIGNAL: "signal",
	DIRECT: "direct",
	FURTHEST: "furthest"
}, x = 20, S = 50, C = 60, w = [
	[0, "red"],
	[1, "yellow"],
	[2, "green"],
	[4, "blue"],
	[5, "purple"]
], T = 60, E = Object.fromEntries(w.map(([t, n]) => [n, e.hcl(T * t + x, C, S).hex()])), D = Object.fromEntries(w.map(([, e]) => [e, {
	colors: [
		"black",
		e,
		"white"
	],
	mode: "signal"
}])), O = {
	id: 0,
	name: "Base",
	pallet: {
		black: "#000000",
		white: "#ffffff",
		...E
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
		...D
	},
	bgRamp: "gray",
	bgRampValue: 1,
	startSignalLightness: .49,
	endSignalLightness: .49,
	contrastMultiplier: 1,
	rescaleContrastToGrayRange: !0
}, k = [
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
], A = {
	colors: ["black", "white"],
	colorModel: "lab",
	correctLightness: !0,
	mode: b.FURTHEST
}, j = class {
	constructor(e = O) {
		this.config = e;
		for (let t of Object.keys(e)) if (!k.includes(t)) throw Error(`${t} isn't allowed in Theme`);
		this.id = e.id, this.name = e.name, this.pallet = e.pallet, this.bgRamp = e.bgRamp, this.bgRampValue = e.bgRampValue, this.startSignalLightness = e.startSignalLightness, this.endSignalLightness = e.endSignalLightness, this.contrastMultiplier = e.contrastMultiplier, this.rescaleContrastToGrayRange = e.rescaleContrastToGrayRange, this.ramps = Object.fromEntries(Object.entries(e.ramps).map(([t, n]) => [t, M(e, n)]));
	}
};
function M(t, n) {
	let r = {
		...A,
		...n,
		colors: n.colors ?? A.colors,
		colorModel: n.colorModel ?? A.colorModel,
		correctLightness: n.correctLightness ?? A.correctLightness,
		mode: n.mode ?? A.mode
	}, i = r.colors.map((e) => {
		if (e in t.pallet) return t.pallet[e];
		throw Error(`Couldn't find color "${e}" in themeConfig.pallet`);
	}), a = e.scale(i);
	r.colorModel && a.mode(r.colorModel), r.classes && a.classes(r.classes);
	let o;
	switch (r.mode) {
		case b.DIRECT:
			o = F(a);
			break;
		case b.SIGNAL:
		default: r.correctLightness && a.correctLightness(), o = P(a);
	}
	return o.config = r, o;
}
function N(e) {
	return (t) => e(t).lab();
}
function P(e) {
	let t = N(e);
	return t.startL = G(e(0)), t.endL = G(e(1)), t;
}
function F(e) {
	return N(e);
}
// src/private/cache.ts
var I = "MISS";
function L(e, t, n) {
	let r = e;
	for (let e = 0; e < t.length; e++) {
		let i = t[e];
		e === t.length - 1 ? r.set(i, n) : (r.has(i) || r.set(i, /* @__PURE__ */ new Map()), r = r.get(i));
	}
}
function ee(e, t) {
	let n = e;
	for (let e = 0; e < t.length; e++) {
		let r = t[e];
		if (!(n instanceof Map) || !n.has(r)) return I;
		n = n.get(r);
	}
	return n;
}
var te = class {
	constructor(e = 500) {
		this.resetAtItemCount = e, this.cached = /* @__PURE__ */ new Map(), this.itemCount = 0, this.tries = 0, this.hits = 0;
	}
	set(e, t) {
		this.itemCount > this.resetAtItemCount && this.reset(), L(this.cached, e, t), this.itemCount++;
	}
	get(e) {
		let t = ee(this.cached, e);
		return this.tries++, t === I ? null : (this.hits++, t);
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
function R(e, t, n) {
	if (n === 0) return e;
	if (n === 1) return t;
	let r = l(e), i = l(t);
	if (Math.abs(i - r) < 1e-10) return y(e, t, n);
	let a = i > r, o = r + (i - r) * n, s = 0, c = 1, u = e, d = Math.abs(o - r);
	for (let n = 0; n < 18; n++) {
		let n = (s + c) / 2, r = y(e, t, n), i = l(r), f = Math.abs(i - o);
		f < d && (u = r, d = f), (a ? i < o : i > o) ? s = n : c = n;
	}
	return u;
}
// src/private/fadeColor.ts
function ne(e, t, r) {
	if (r === 0) return e;
	if (r === 1) return t;
	let i = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, a = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055, o = n(e).map(i), s = n(t).map(i);
	return "#" + o.map((e, t) => Math.round(Math.max(0, Math.min(1, a(e + (s[t] - e) * r))) * 255).toString(16).padStart(2, "0")).join("");
}
// src/Color.ts
var z = new te(), B = /* @__PURE__ */ new WeakMap(), V = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakMap();
function re(t) {
	let n = H.get(t);
	return n || (n = Array.from({ length: 257 }, (n, r) => {
		let i = t(r / 256), a = e.lab(...i).hex();
		return {
			lab: i,
			hex: a,
			lightness: l(a)
		};
	}), H.set(t, n)), n;
}
var U = class {
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
}, W = class t extends U {
	constructor({ theme: e, bgColor: t = null, lab: n, ramp: r = null, baseRamp: i = null }) {
		if (super(n), !e) throw Error("`theme` is required");
		if (i && (i.startL === void 0 || i.endL === void 0)) throw Error("`baseRamp` can't be a direct ramp");
		if (!i && (!t || t.baseRamp) && !e.ramps.gray) throw Error("No baseRamp");
		this.theme = e, this.bgColor = t, this.ramp = r, this.baseRamp = i || t && t.baseRamp || e.ramps.gray, this.lightness = n[0];
	}
	static fromTheme(e) {
		if (!(e instanceof j)) throw TypeError("Need to give me a Theme instance, not a \"theme config\"");
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
		return this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1 ? z.at([
			this,
			"fadeContrast",
			n,
			r
		], () => this.fadeEnabled(r, (e, t) => e.contrast(n, t))) : r.config.mode === "direct" ? this.direct(r) : z.at([
			this.hex,
			this.baseRamp,
			n,
			r
		], () => {
			let { theme: i } = this, o = r === i.ramps[i.bgRamp];
			if (o && i.rescaleContrastToGrayRange && n >= 0) {
				let e = Math.max(0, Math.min(1, n / 100 * i.contrastMultiplier));
				if (e === 0) return this;
				let a = re(r), [o, s] = [a[0], a[a.length - 1]].sort((e, t) => e.lightness - t.lightness), c = p(this.hex, o.hex, s.hex) === s.hex, u = l(this.hex), d = Math.abs((c ? s : o).lightness - u);
				if (d <= 1e-10) return this;
				let f = d * e, m = r(0), h = -1, g, _ = Infinity;
				for (let { lab: e, lightness: t } of a) {
					if (c ? t < u : t > u) continue;
					let n = Math.abs(t - u);
					n > h && (m = e, h = n), n >= f && n < _ && (g = e, _ = n);
				}
				return new t({
					theme: i,
					bgColor: this,
					lab: g ?? m,
					ramp: r
				});
			}
			if (r.config.mode === "furthest" && i.rescaleContrastToGrayRange && n >= 0) {
				let o = Math.max(0, Math.min(1, n / 100 * i.contrastMultiplier));
				if (o === 0) return this;
				let s = i.ramps[i.bgRamp], c = [0, 1].map((t) => e.lab(...s(t)).hex()).sort((e, t) => a(e) - a(t)), l = p(this.hex, c[0], c[1]) === c[1], u = [0, 1].map((t) => e.lab(...r(t)).hex()).sort((e, t) => a(e) - a(t))[+!!l], d = (l ? a(u) >= a(this.hex) : a(u) <= a(this.hex)) ? R(this.hex, u, o) : this.hex;
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
				let s = i.ramps[i.bgRamp], [c, l] = [0, 1].map((t) => e.lab(...s(t)).hex()).sort((e, t) => a(e) - a(t)), u = p(this.hex, c, l) === l, d = u ? i.endSignalLightness : i.startSignalLightness, [f, m, g] = h(e.lab(...r(d)).hex()), _ = h(c)[0], y = h(l)[0];
				if (Math.abs(y - _) < 1e-7) return this;
				let [b] = h(this.hex), x = Math.max(0, Math.min(1, u ? (f - _) / (y - _) : (y - f) / (y - _))), S = u ? y : _, C = b + (S - b) * x, w = v([
					C,
					m,
					g
				]), T = (e) => u ? a(e) >= a(this.hex) : a(e) <= a(this.hex);
				for (let e = 0; e < 24 && !T(w); e++) C = (C + S) / 2, w = v([
					C,
					m,
					g
				]);
				T(w) || (w = this.hex);
				let E = R(this.hex, w, o);
				return T(E) || (E = this.hex), new t({
					theme: i,
					bgColor: this,
					lab: e(E).lab(),
					ramp: r
				});
			}
			let [s, c] = this._getMinMax(r), [u, d] = this._getMinMax(this.ramp), f = (this.lightness - u) / (d - u), m = (() => {
				let e = (s + c) / 2;
				return (this.lightness < e ? 1 : -1) * ((c - s) / 100);
			})(), g = (() => {
				let e = 1, t = 1, n = 1;
				if ((o || i.contrastMultiplier < 1) && (e = i.contrastMultiplier), i.rescaleContrastToGrayRange && o && (t = Math.abs(f - .5) + .5), !o) {
					let e = (s + c) / 2;
					n = this.lightness < e ? i.endSignalLightness : 1 - i.startSignalLightness;
				}
				return e * t * n;
			})(), _ = (this.lightness + n * m * g - (r.startL ?? NaN)) / ((r.endL ?? NaN) - (r.startL ?? NaN)), [y, b, x] = this.lab, [S, C, w] = r(_), T = o || i.contrastMultiplier > 1 ? 1 : i.contrastMultiplier, E = [
				y + (S - y) * 1,
				b + (C - b) * T,
				x + (w - x) * T
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
		return this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1 ? z.at([
			this,
			"fadeDirect",
			e
		], () => this.fadeEnabled(e, (e, t) => e.direct(t))) : z.at([this.hex, e], () => {
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
		let i = B.get(this.theme);
		i || (i = new j({
			...this.theme.config,
			contrastMultiplier: 1
		}), B.set(this.theme, i));
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
		}, s = r(o.color, a(n)), c = ne(o.origin, s.hex, this.theme.contrastMultiplier), l = new t({
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
function G(t) {
	return Math.max(0, e(t).get("lab.l"));
}
// src/core/relative.ts
function ie(t, n, r, i = 1, a = !0) {
	if (!Number.isFinite(i) || i < 0 || i > 1) throw RangeError("contrast must be between 0 and 1");
	let o = Object.fromEntries(r.colors.slice(1, -1).map((e, t) => [`stop${t}`, e])), s = new j({
		...O,
		pallet: {
			...O.pallet,
			...n,
			...o,
			black: r.colors[0],
			white: r.colors[r.colors.length - 1]
		},
		ramps: a ? {
			...O.ramps,
			gray: {
				colors: [
					"black",
					...Object.keys(o),
					"white"
				],
				colorModel: r.colorModel
			}
		} : O.ramps,
		contrastMultiplier: i
	});
	return new W({
		theme: s,
		lab: e(t).lab(),
		ramp: s.ramps.gray
	});
}
// src/core/theme.ts
var K = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
], q = [
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
], J = {
	red: "#d14457",
	yellow: "#9d6f00",
	green: "#298830",
	blue: "#0082dc",
	purple: "#a359b9"
}, Y = (e) => ({
	color: e,
	luminance: a(e)
}), X = {
	foreground: 90,
	muted: 60,
	border: 30
};
function Z(e, t, n) {
	let r = t[0].color, i = -1, a = "", o = Infinity;
	for (let { color: s } of t) {
		let t = f(e, s);
		t > i && (r = s, i = t), t >= n && t < o && (a = s, o = t);
	}
	return a || r;
}
var Q = (e, t, n) => e.find((e) => t(e) >= n - 1e-9), ae = (e, t) => e.reduce((e, n) => t(n) > t(e) ? n : e);
function $(t) {
	let r = t.neutral !== void 0;
	if (r && (t.dark !== void 0 || t.light !== void 0)) throw TypeError("Pass either neutral.colors or dark/light, not both");
	let i = Object.freeze([...t.neutral?.colors ?? [t.dark ?? "#000000", t.light ?? "#ffffff"]]);
	if (i.length < 2) throw RangeError("neutral.colors needs at least two colors");
	for (let e of i) n(e);
	let o = i[0], s = i[i.length - 1];
	if (a(o) > a(s)) throw RangeError("dark must be darker than light");
	let c = t.neutral?.colorModel ?? "oklab";
	if (!q.includes(c)) throw TypeError(`Unknown color model: ${c}`);
	let l = e.scale([...i]).mode(c);
	return {
		custom: r,
		stops: i,
		dark: o,
		light: s,
		colorModel: c,
		ramp: (e) => {
			if (!Number.isFinite(e) || e < 0 || e > 1) throw RangeError("Mix amount must be between 0 and 1");
			return r ? l(e).hex() : y(o, s, e);
		}
	};
}
function oe(e = {}) {
	let { custom: t, stops: r, dark: i, light: o, colorModel: s, ramp: c } = $(e), l = c(e.background ?? 1), u = Object.freeze({
		...J,
		...e.colors
	});
	for (let e of Object.values(u)) n(e);
	let d = Array.from({ length: 257 }, (e, t) => Y(c(t / 256))).map((e) => h(e.color)), m = (e) => {
		let [t, n, r] = h(e), i = -1, a = Infinity;
		return d.forEach(([e, o, s], c) => {
			let l = Math.hypot(t - e, n - o, r - s);
			l < a && ([i, a] = [c, l]);
		}), a < .01 ? i / 256 : void 0;
	}, g = (e) => {
		let t = e * 256, n = Math.min(255, Math.floor(t)), r = t - n;
		return d[n].map((e, t) => e + (d[n + 1][t] - e) * r);
	}, _ = (e, n) => {
		let r = n === i ? 0 : 1, a = t ? m(e) : void 0;
		if (a !== void 0) return (t) => t === 0 ? e : c(a + (r - a) * t);
		let o = h(e), s = 0;
		d.forEach(([e], t) => {
			Math.abs(e - o[0]) < Math.abs(d[s][0] - o[0]) && (s = t);
		});
		let l = d[s];
		return (t) => {
			if (t === 0) return e;
			if (t === 1) return n;
			let i = g(s / 256 + (r - s / 256) * t), a = [
				1 - t,
				1 - t ** 3,
				1 - t ** 3
			];
			return v(i.map((e, t) => e + (o[t] - l[t]) * a[t]));
		};
	}, y = h(i)[0], b = h(o)[0], x = Object.fromEntries(K.map((e) => {
		let [, t, n] = h(u[e]);
		return [e, Array.from({ length: 257 }, (e, r) => Y(v([
			y + (b - y) * r / 256,
			t,
			n
		])))];
	})), S = (e, t) => {
		let n = a(e), r = p(e, i, o) === o, s = x[t].filter((e) => r ? e.luminance >= n : e.luminance <= n);
		return s.length ? s : [Y(e)];
	}, C = Math.min(f(i, o), f(o, i)), w = Math.min(1, C / X.foreground), T = /* @__PURE__ */ new Map(), E = (e = l, t = e) => {
		n(e), n(t);
		let r = e + t, a = T.get(r);
		if (a) return a;
		let s = p(e, i, o), c = (t) => {
			let n = _(e, t);
			return Array.from({ length: 257 }, (e, t) => n(t / 256));
		}, u = c(s), d = (t) => f(e, t), m = Math.min(d(s), X.foreground), h = (e) => m * e / X.foreground, g = (e) => Math.min(d(e), f(t, e)), v = Q(u, g, h(X.border));
		if (v === void 0) {
			let e = c(s === o ? i : o);
			v = Q(e, g, h(X.border)) ?? ae([...u, ...e], g);
		}
		let y = Object.freeze({
			background: e,
			foreground: Q(u, d, m) ?? s,
			muted: Q(u, d, h(X.muted)) ?? s,
			border: v,
			...Object.fromEntries(K.map((t) => [t, Z(e, S(e, t), X.muted * w)]))
		});
		return T.size >= 512 && T.clear(), T.set(r, y), y;
	}, D = /* @__PURE__ */ new Map(), O = C >= X.muted, k = (e) => Math.max(f(e, i), f(e, o)) >= X.muted, A = (e, t) => {
		let n = e + ":" + t, r = D.get(n);
		if (r) return r;
		let a;
		if (typeof t == "string") {
			if (!K.includes(t)) throw TypeError(`Unknown hue: ${t}`);
			let n = S(e, t), r = O ? n.filter((e) => k(e.color)) : n;
			a = Z(e, r.length ? r : n, X.border * w);
		} else {
			let n = _(e, p(e, i, o));
			if (a = n(t / 100), t !== 0 && O && !k(a)) {
				let e = Infinity;
				for (let r = 0; r <= 256; r++) {
					let i = n(r / 256), o = Math.abs(r / 256 - t / 100);
					o < e && k(i) && (a = i, e = o);
				}
			}
		}
		return D.size >= 512 && D.clear(), D.set(n, a), a;
	}, j = Object.freeze({
		colors: r,
		colorModel: s
	}), M = ie(l, u, j, e.contrast, t);
	return Object.freeze({
		background: l,
		dark: i,
		light: o,
		neutral: j,
		colors: u,
		ramp: c,
		tokens: E,
		surface: A,
		relative: M
	});
}
function se(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [`--huet-${e}`, t]));
}
export { m as _, $ as a, W as c, O as d, b as f, a as g, o as h, K as i, G as l, s as m, oe as n, se as o, c as p, J as r, U as s, q as t, j as u, _ as v, h as y };

//# sourceMappingURL=theme-MTtaYU1H.js.map