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
var r = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, i = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055, a = Float64Array.from({ length: 256 }, (e, t) => r(t / 255)), o = Float64Array.from({ length: 256 }, (e, t) => (t / 255) ** 2.4);
function s(e) {
	if (e.length !== 7 || e.charCodeAt(0) !== 35) return -1;
	let t = 0;
	for (let n = 1; n < 7; n++) {
		let r = e.charCodeAt(n), i = r >= 48 && r <= 57 ? r - 48 : r >= 97 && r <= 102 ? r - 87 : r >= 65 && r <= 70 ? r - 55 : -1;
		if (i < 0) return -1;
		t = t << 4 | i;
	}
	return t;
}
function c(e) {
	let t = s(e);
	if (t >= 0) return ee(t);
	let [i, a, o] = n(e).map(r);
	return .2126 * i + .7152 * a + .0722 * o;
}
var l = 6 / 29, u = (e) => e > .20689655172413793 ? 1.16 * e - .16 : 24389 / 2700 * e ** 3, d = (e) => e > .08 ? (e + .16) / 1.16 : Math.cbrt(e * 2700 / 24389);
function f(e) {
	return u(S(e)[0]);
}
function p(e) {
	let t = s(e);
	if (t >= 0) return L(t);
	let [r, i, a] = n(e), o = .2126729 * r ** 2.4 + .7151522 * i ** 2.4 + .072175 * a ** 2.4;
	return o < .022 && (o += (.022 - o) ** 1.414), o;
}
function m(e, t) {
	return h(p(e), p(t));
}
function h(e, t) {
	if (Math.abs(t - e) < 5e-4) return 0;
	let n = t > e ? (t ** .56 - e ** .57) * 1.14 : (t ** .65 - e ** .62) * 1.14;
	return Math.sign(n) * Math.max(0, Math.abs(n) - .027) * 100;
}
var g = (e) => ({
	y: e,
	p56: e ** .56,
	p65: e ** .65
});
function _(e, t, n, r) {
	if (Math.abs(e.y - t) < 5e-4) return 0;
	let i = e.y > t ? (e.p56 - (n ?? t ** .57)) * 1.14 : (e.p65 - (r ?? t ** .62)) * 1.14;
	return Math.max(0, Math.abs(i) - .027) * 100;
}
var v = (e, t) => Math.abs(m(t, e));
function y(e, t, n) {
	return v(e, n) > v(e, t) ? n : t;
}
function b(e, t, n) {
	return x(r(e), r(t), r(n));
}
function x(e, t, n) {
	let r = Math.cbrt(.4122214708 * e + .5363325363 * t + .0514459929 * n), i = Math.cbrt(.2119034982 * e + .6806995451 * t + .1073969566 * n), a = Math.cbrt(.0883024619 * e + .2817188376 * t + .6299787005 * n);
	return [
		.2104542553 * r + .793617785 * i - .0040720468 * a,
		1.9779984951 * r - 2.428592205 * i + .4505937099 * a,
		.0259040371 * r + .7827717662 * i - .808675766 * a
	];
}
function S(e) {
	let t = s(e);
	return t >= 0 ? x(a[t >> 16], a[t >> 8 & 255], a[t & 255]) : b(...n(e));
}
function C(e) {
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
function w(e, t, n) {
	let r = (e + 16) / 116, i = r + t * Math.cos(n * Math.PI / 180) / 500, a = r - t * Math.sin(n * Math.PI / 180) / 200, o = (e) => e ** 3 > 216 / 24389 ? e ** 3 : (116 * e - 16) / (24389 / 27), s = o(i) * .96422, c = e > 8 ? r ** 3 : e / (24389 / 27), l = o(a) * .82521;
	return [
		3.1338561 * s - 1.6168667 * c - .4906146 * l,
		-.9787684 * s + 1.9161415 * c + .033454 * l,
		.0719453 * s - .2289914 * c + 1.4052427 * l
	];
}
function T(e, t) {
	let n = 0, r = 200;
	for (let i = 0; i < 30; i++) {
		let i = (n + r) / 2;
		w(e, i, t).every((e) => e >= 0 && e <= 1) ? n = i : r = i;
	}
	return n;
}
var E = 0, D = 0, O = 0;
function k(e, t, n) {
	let r = e + .3963377774 * t + .2158037573 * n, i = e - .1055613458 * t - .0638541728 * n, a = e - .0894841775 * t - 1.291485548 * n, o = r * r * r, s = i * i * i, c = a * a * a;
	E = 4.0767416621 * o - 3.3077115913 * s + .2309699292 * c, D = -1.2684380046 * o + 2.6097574011 * s - .3413193965 * c, O = -.0041960863 * o - .7034186147 * s + 1.707614701 * c;
}
var A = () => E >= -1e-7 && E <= 1 + 1e-7 && D >= -1e-7 && D <= 1 + 1e-7 && O >= -1e-7 && O <= 1 + 1e-7;
function j(e, t, n) {
	if (k(e, t, n), A()) return;
	let r = 0, i = 1;
	for (let a = 0; a < 20; a++) {
		let a = (r + i) / 2;
		k(e, t * a, n * a), A() ? r = a : i = a;
	}
	k(e, t * r, n * r);
}
function M([e, n, r]) {
	return j(t(e), n, r), [
		t(i(E)),
		t(i(D)),
		t(i(O))
	];
}
function N(e, n, r, a, o) {
	j(t(r), a, o), e[n] = t(i(E)), e[n + 1] = t(i(D)), e[n + 2] = t(i(O));
}
var P = Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function F(e, n, r) {
	return j(t(e), n, r), Math.round(t(i(E)) * 255) << 16 | Math.round(t(i(D)) * 255) << 8 | Math.round(t(i(O)) * 255);
}
var I = (e) => "#" + P[e >> 16] + P[e >> 8 & 255] + P[e & 255];
function L(e) {
	let t = .2126729 * o[e >> 16] + .7151522 * o[e >> 8 & 255] + .072175 * o[e & 255];
	return t < .022 ? t + (.022 - t) ** 1.414 : t;
}
function ee(e) {
	return .2126 * a[e >> 16] + .7152 * a[e >> 8 & 255] + .0722 * a[e & 255];
}
function R(e) {
	return I(F(e[0], e[1], e[2]));
}
function z(e, t, n) {
	if (!Number.isFinite(n) || n < 0 || n > 1) throw RangeError("Mix amount must be between 0 and 1");
	let r = S(e), i = S(t);
	return n === 0 ? e : n === 1 ? t : R(r.map((e, t) => e + (i[t] - e) * n));
}
// src/core/steps.ts
var B = {
	onLight: .49,
	onDark: .49
}, V = .004, te = [
	0,
	.7,
	1
], H = (t) => {
	let n = Array.isArray(t) ? t : t.lab();
	return {
		hex: e.lab(...n).hex(),
		L: n[0]
	};
}, U = (t) => H(e(t).lab());
function ne(e, t, n) {
	if (n === 0) return e;
	if (n === 1) return t;
	let r = f(e), i = f(t);
	if (Math.abs(i - r) < 1e-10) return z(e, t, n);
	let a = i > r, o = r + (i - r) * n, s = 0, c = 1, l = e, u = Math.abs(o - r);
	for (let n = 0; n < 18; n++) {
		let n = (s + c) / 2, r = z(e, t, n), i = f(r), d = Math.abs(i - o);
		d < u && (l = r, u = d), (a ? i < o : i > o) ? s = n : c = n;
	}
	return l;
}
function W(e, t, r) {
	if (r === 0) return e;
	if (r === 1) return t;
	let i = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, a = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055, o = n(e).map(i), s = n(t).map(i);
	return "#" + o.map((e, t) => Math.round(Math.max(0, Math.min(1, a(e + (s[t] - e) * r))) * 255).toString(16).padStart(2, "0")).join("");
}
function re({ neutral: t, colorModel: n, colors: r, contrast: i = 1, signalLightness: a = B }) {
	if (!Number.isFinite(i) || i < 0 || i > 2) throw RangeError("contrast must be between 0 and 2");
	let o = t[0], s = t[t.length - 1], l = e.scale([...t]).mode(n).correctLightness(), u = Array.from({ length: 257 }, (e, t) => {
		let n = H(l(t / 256));
		return {
			...n,
			lightness: f(n.hex),
			oklab: S(n.hex)
		};
	}), [d, p] = [u[0], u[256]].sort((e, t) => e.lightness - t.lightness), m = [u[0].hex, u[256].hex].sort((e, t) => c(e) - c(t)), h = Math.max(0, l(0).get("lab.l")), g = Math.max(0, l(1).get("lab.l")), _ = e.scale([s, o]).mode("lab").classes(te), v = /* @__PURE__ */ new Map(), b = (t, n) => {
		let i = `${t}:${n}`, c = v.get(i);
		if (!c) {
			if (!(t in r)) throw TypeError(`Unknown ramp: ${t}`);
			let l = e.scale([
				o,
				r[t],
				s
			]).mode("lab").correctLightness(), u = n ? a.onDark : a.onLight;
			v.set(i, c = H(l(u)).hex);
		}
		return c;
	}, x = (e) => {
		let t = f(e.hex), n = u[0];
		for (let e of u) Math.abs(e.lightness - t) < Math.abs(n.lightness - t) && (n = e);
		let [, r, i] = S(e.hex);
		return Math.hypot(r - n.oklab[1], i - n.oklab[2]) >= V;
	}, C = /* @__PURE__ */ new Map(), w = (e) => {
		let t = C.get(e.hex);
		return t || (t = {
			lighter: y(e.hex, d.hex, p.hex) === p.hex,
			bgL: f(e.hex),
			tinted: x(e)
		}, C.size >= 512 && C.clear(), C.set(e.hex, t)), t;
	}, T = (e, t) => {
		let { lighter: n, bgL: r, tinted: i } = w(e), a = Math.abs((n ? p : d).lightness - r);
		if (a <= 1e-10) return e;
		let o = a * t, s = u[0], c = -1, l, f = Infinity;
		for (let e of u) {
			if (n ? e.lightness < r : e.lightness > r) continue;
			let t = Math.abs(e.lightness - r);
			t > c && ([s, c] = [e, t]), t >= o && t < f && ([l, f] = [e, t]);
		}
		let m = l ?? s;
		if (!i) return {
			hex: m.hex,
			L: m.L
		};
		let h = 1 - t ** 3, [, g, _] = S(e.hex), [v, y, b] = m.oklab;
		return U(R([
			v,
			y + (g - y) * h,
			b + (_ - b) * h
		]));
	}, E = (e, t, n) => {
		let [r, i] = m, a = y(e.hex, r, i) === i, [o, s, l] = S(b(t, a)), u = S(r)[0], d = S(i)[0];
		if (Math.abs(d - u) < 1e-7) return e;
		let [f] = S(e.hex), p = Math.max(0, Math.min(1, a ? (o - u) / (d - u) : (d - o) / (d - u))), h = a ? d : u, g = f + (h - f) * p, _ = R([
			g,
			s,
			l
		]), v = (t) => a ? c(t) >= c(e.hex) : c(t) <= c(e.hex);
		for (let e = 0; e < 24 && !v(_); e++) g = (g + h) / 2, _ = R([
			g,
			s,
			l
		]);
		v(_) || (_ = e.hex);
		let x = ne(e.hex, _, n);
		return v(x) || (x = e.hex), U(x);
	}, D = (e) => H(_((e.L - h) / (g - h))), O = (e, t, n, r) => {
		if (n === "white") return D(e);
		let i = Math.max(0, Math.min(1, t / 100 * r));
		return i === 0 ? e : n === "gray" ? T(e, i) : E(e, n, i);
	}, k = (e) => {
		let t = U(e);
		return {
			...t,
			full: t,
			origin: t.hex
		};
	}, A = (e, t) => i >= 1 ? t : W(e.origin, t, i);
	return {
		surfaceOf: k,
		shown: A,
		derive(e, t) {
			let n = U(t);
			return i >= 1 ? {
				...n,
				full: n,
				origin: e.origin
			} : {
				...U(A(e, t)),
				full: n,
				origin: e.origin
			};
		},
		step(e, t, n = "gray") {
			if (i >= 1) {
				let r = O(e, t, n, i);
				return {
					...r,
					full: r,
					origin: e.origin
				};
			}
			let r = O(e.full, t, n, 1);
			return {
				...U(W(e.origin, r.hex, i)),
				full: r,
				origin: e.origin
			};
		}
	};
}
// src/core/theme.ts
var G = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
], K = [
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
], ie = [
	"neutral",
	"colorModel",
	"colors",
	"contrast",
	"signalLightness",
	"images",
	"svgs"
], ae = [
	"pallet",
	"ramps",
	"bgRamp",
	"bgRampValue",
	"contrastMultiplier"
], q = (t) => typeof t == "string" && e.valid(t);
function oe(t) {
	let n = (e) => {
		throw TypeError(`Invalid Huet theme: ${e}`);
	};
	(typeof t != "object" || !t || Array.isArray(t)) && n(`expected an object like { neutral: ["#000000", "#ffffff"] }, got ${JSON.stringify(t)}`);
	let r = t, i = Object.keys(r);
	i.some((e) => ae.includes(e)) && n("this is the old ThemeConfig format (pallet, ramps, bgRampValue, ...). Themes are now { neutral, colorModel, colors, contrast }, and the background is passed when rendering.");
	let a = i.filter((e) => !ie.includes(e));
	a.length && n(`unknown field${a.length > 1 ? "s" : ""} ${a.join(", ")}. Themes have ${ie.join(", ")}.`);
	let { neutral: o, colorModel: s, colors: l, contrast: u } = r;
	(!Array.isArray(o) || o.length < 2) && n(`neutral must be an array of two or more colors, darkest first, got ${JSON.stringify(o)}`);
	for (let e of o) q(e) || n(`neutral has ${JSON.stringify(e)}, which isn't a color`);
	let d = o, [f, p] = [d[0], d[d.length - 1]];
	if (c(e(f).hex("rgb")) > c(e(p).hex("rgb")) && n(`neutral runs darkest first, but its first color ${f} is lighter than its last color ${p}`), s !== void 0 && !K.includes(s) && n(`colorModel must be one of ${K.join(", ")}, got ${JSON.stringify(s)}`), l !== void 0) {
		(typeof l != "object" || !l || Array.isArray(l)) && n(`colors must be an object like { red: "#d14457" }, got ${JSON.stringify(l)}`);
		for (let [e, t] of Object.entries(l)) G.includes(e) || n(`colors.${e} isn't a hue. Hues are ${G.join(", ")}.`), q(t) || n(`colors.${e} is ${JSON.stringify(t)}, which isn't a color`);
	}
	u !== void 0 && !(typeof u == "number" && u >= 0 && u <= 2) && n(`contrast must be a number from 0 to 2, got ${JSON.stringify(u)}`);
	let m = (e) => typeof e == "number" && e >= 0 && e <= 1, { signalLightness: h } = r;
	if (h !== void 0) {
		let e = Object.keys(h ?? {});
		typeof h == "object" && h && e.sort().join() === "onDark,onLight" && m(h.onLight) && m(h.onDark) || n(`signalLightness must be { onLight, onDark }, each from 0 to 1, got ${JSON.stringify(h)}`);
	}
	for (let e of ["images", "svgs"]) {
		let t = r[e];
		t !== void 0 && (typeof t != "object" || !t || Object.keys(t).some((e) => e !== "strength" && e !== "tint") || t.strength !== void 0 && !m(t.strength) || t.tint !== void 0 && !m(t.tint)) && n(`${e} must be { strength, tint }, each from 0 to 1, got ${JSON.stringify(t)}`);
	}
}
function se({ neutral: e, colorModel: t = "oklab" }) {
	return e.length === 2 && t === "oklab" ? {
		dark: e[0],
		light: e[1]
	} : { neutral: {
		colors: e,
		colorModel: t
	} };
}
function ce(e, { background: t = 1 } = {}) {
	if (oe(e), typeof t != "number" || !(t >= 0 && t <= 1)) throw RangeError(`Huet: background must be a number from 0 (dark) to 1 (light), got ${JSON.stringify(t)}`);
	return _e({
		...se(e),
		colors: e.colors,
		contrast: e.contrast,
		signalLightness: e.signalLightness,
		background: t
	});
}
var le = {
	red: "#d14457",
	yellow: "#9d6f00",
	green: "#298830",
	blue: "#0082dc",
	purple: "#a359b9"
}, ue = (e, t, n) => ({
	color: e,
	y: t,
	luminance: n,
	y57: t ** .57,
	y62: t ** .62
}), de = (e) => ue(e, p(e), c(e)), J = {
	foreground: 90,
	muted: 60,
	disabled: 40,
	border: 30,
	disabledBorder: 15
};
function fe(e, t, n, r) {
	let i = g(p(e)), a, o = -1, s = "", c = Infinity;
	for (let e of t) {
		if (r && (r.lighter ? e.luminance < r.luminance : e.luminance > r.luminance)) continue;
		let t = _(i, e.y, e.y57, e.y62);
		t > o && (a = e.color, o = t), t >= n && t < c && (s = e.color, c = t);
	}
	return s || (a ?? e);
}
var Y = 257;
function X(e, t, n) {
	for (let r = 0; r < Y; r++) if (t(e, r) >= n - 1e-9) return e.color(r);
}
function pe(e, t, n) {
	if (t(e, 0) >= n - 1e-9) return e.color(0);
	let r = 1, i = Y;
	for (; r < i;) {
		let a = r + i >> 1;
		t(e, a) >= n - 1e-9 ? i = a : r = a + 1;
	}
	return r < Y ? e.color(r) : void 0;
}
function me(e, t) {
	let n = e[0].color(0), r = t(e[0], 0);
	for (let i of e) for (let e = 0; e < Y; e++) {
		let a = t(i, e);
		a > r && ([n, r] = [i.color(e), a]);
	}
	return n;
}
var he = /* @__PURE__ */ new Map(), ge = /* @__PURE__ */ new Map();
function Z(e, t, n = he, r = 64) {
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
	let a = i[0], o = i[i.length - 1];
	if (c(a) > c(o)) throw RangeError("dark must be darker than light");
	let s = t.neutral?.colorModel ?? "oklab";
	if (!K.includes(s)) throw TypeError(`Unknown color model: ${s}`);
	let l = e.scale([...i]).mode(s), u = [];
	return {
		custom: r,
		stops: i,
		dark: a,
		light: o,
		colorModel: s,
		ramp: (e) => {
			if (!Number.isFinite(e) || e < 0 || e > 1) throw RangeError("Mix amount must be between 0 and 1");
			return r ? u[Math.floor(e * 1e4)] ??= l(e).hex() : z(a, o, e);
		}
	};
}
var $ = /* @__PURE__ */ new Map();
function _e(e = {}) {
	let t = Q(e), { custom: r, stops: i, colorModel: a } = t, o = Object.freeze({
		...le,
		...e.colors
	});
	for (let e of Object.values(o)) n(e);
	let s = JSON.stringify([
		a,
		r,
		i,
		o,
		e.contrast,
		e.signalLightness
	]), c = $.get(s);
	c ? $.delete(s) : (c = ve(e, t, o), $.size >= 32 && $.delete($.keys().next().value)), $.set(s, c);
	let { tokens: l, steps: u, ...d } = c, f = c.ramp(e.background ?? 1);
	return Object.freeze({
		background: f,
		...d,
		tokens: (e = f, t = e) => l(e, t),
		root: u.surfaceOf(f),
		step: u.step,
		surfaceOf: u.surfaceOf,
		derive: u.derive
	});
}
function ve(e, t, r) {
	let { custom: i, stops: a, dark: o, light: s, colorModel: l } = t, u = `${l}:${i}:${a}`, { ramp: d } = Z(`ramp:${u}`, () => t), f = Object.fromEntries(G.map((e) => [e, `${u}:${r[e]}`])), m = Z(`neutral:${u}`, () => Array.from({ length: 257 }, (e, t) => S(d(t / 256)))), h = i && Z(`rising:${u}`, () => {
		let e = 0;
		for (let t = 0; t <= 256; t++) {
			let n = parseInt(d(t / 256).slice(1, 7), 16);
			if (n >> 16 < e >> 16 || (n >> 8 & 255) < (e >> 8 & 255) || (n & 255) < (e & 255)) return !1;
			e = n;
		}
		return !0;
	}), b = (e) => {
		let [t, n, r] = S(e), i = -1, a = Infinity;
		for (let e = 0; e < m.length; e++) {
			let [o, s, c] = m[e], l = (t - o) ** 2 + (n - s) ** 2 + (r - c) ** 2;
			l < a && ([i, a] = [e, l]);
		}
		return a < .01 ** 2 ? i / 256 : void 0;
	}, x = (e, t) => {
		let n = t === o ? 0 : 1, r = i ? b(e) : void 0;
		if (r !== void 0) return Object.assign((t) => t === 0 ? e : d(r + (n - r) * t), { onRamp: !0 });
		let a = S(e), s = 0;
		m.forEach(([e], t) => {
			Math.abs(e - a[0]) < Math.abs(m[s][0] - a[0]) && (s = t);
		});
		let c = m[s], l = (e) => {
			let t = (s / 256 + (n - s / 256) * e) * 256, r = Math.min(255, Math.floor(t)), i = t - r, [o, l, u] = m[r], [d, f, p] = m[r + 1], h = 1 - e ** 3;
			return F(o + (d - o) * i + (a[0] - c[0]) * (1 - e), l + (f - l) * i + (a[1] - c[1]) * h, u + (p - u) * i + (a[2] - c[2]) * h);
		};
		return Object.assign((n) => n === 0 ? e : n === 1 ? t : I(l(n)), { bits: l });
	}, C = S(o)[0], w = S(s)[0], T = Object.fromEntries(G.map((e) => {
		let [, t, n] = S(r[e]);
		return [e, Z(`hue:${f[e]}`, () => Array.from({ length: 257 }, (e, r) => {
			let i = F(C + (w - C) * r / 256, t, n);
			return ue(I(i), L(i), ee(i));
		}))];
	})), E = (e) => ({
		lighter: y(e, o, s) === s,
		luminance: c(e)
	}), D = (e, t) => {
		let { lighter: n, luminance: r } = E(e), i = T[t].filter((e) => n ? e.luminance >= r : e.luminance <= r);
		return i.length ? i : [de(e)];
	}, O = Math.min(v(o, s), v(s, o)), k = Math.min(1, O / J.foreground), A = /* @__PURE__ */ new Map(), j = (e, t) => {
		let n = e + t, r = A.get(n);
		if (!r) {
			let i = x(e, t), a = [], s = new Float64Array(Y).fill(-1), c = new Int32Array("bits" in i ? Y : 0), l = (e) => {
				let t = e / 256;
				return "bits" in i && e > 0 && e < 256 ? s[e] = L(c[e] = i.bits(t)) : s[e] = p(a[e] = i(t));
			}, u = (e) => s[e] >= 0 ? s[e] : l(e), d = (e) => (s[e] < 0 && l(e), a[e] ??= I(c[e])), f = g(p(e)), m = new Float64Array(Y).fill(-1);
			r = {
				color: d,
				y: u,
				lc: (e) => m[e] >= 0 ? m[e] : m[e] = _(f, u(e)),
				rising: h && "onRamp" in i && (t === o ? u(1) <= f.y : u(1) >= f.y)
			}, A.size >= 512 && A.clear(), A.set(n, r);
		}
		return r;
	}, M = /* @__PURE__ */ new Map(), N = (e, t) => {
		n(e), n(t);
		let r = e + t, i = M.get(r);
		if (i) return i;
		let a, o = Object.freeze({
			...Z(`${u}|${e}|${t}`, () => P(e, t), ge, 4096),
			...Object.fromEntries(G.map((t) => [t, Z(`${f[t]}|${e}`, () => fe(e, T[t], J.muted * k, a ??= E(e)), ge, 4096)]))
		});
		return M.size >= 512 && M.clear(), M.set(r, o), o;
	};
	function P(e, t) {
		let n = y(e, o, s), r = j(e, n), i = (e, t) => e.lc(t), a = Math.min(v(e, n), J.foreground), c = (e) => a * e / J.foreground, l = g(p(t)), u = t === e ? i : (e, t) => Math.min(e.lc(t), _(l, e.y(t))), d = r.rising ? pe : X, f = t === e || (n === o ? l.y >= r.y(1) : l.y <= r.y(1)), m = (r.rising && f ? pe : X)(r, u, c(J.border));
		if (m === void 0) {
			let t = j(e, n === s ? o : s);
			m = X(t, u, c(J.border)) ?? me([r, t], u);
		}
		return {
			background: e,
			foreground: d(r, i, a) ?? n,
			muted: d(r, i, c(J.muted)) ?? n,
			border: m,
			disabled: d(r, i, c(J.disabled)) ?? n,
			disabledBorder: d(r, i, c(J.disabledBorder)) ?? n
		};
	}
	let R = /* @__PURE__ */ new Map(), z = O >= J.muted, B = (e) => Math.max(v(e, o), v(e, s)) >= J.muted, V = (e, t) => {
		let n = e + ":" + t, r = R.get(n);
		if (r) return r;
		let i;
		if (typeof t == "string") {
			if (!G.includes(t)) throw TypeError(`Unknown hue: ${t}`);
			let n = D(e, t), r = z ? n.filter((e) => B(e.color)) : n;
			i = fe(e, r.length ? r : n, J.border * k);
		} else {
			let n = x(e, y(e, o, s));
			if (i = n(t / 100), t !== 0 && z && !B(i)) {
				let e = Infinity;
				for (let r = 0; r <= 256; r++) {
					let a = n(r / 256), o = Math.abs(r / 256 - t / 100);
					o < e && B(a) && (i = a, e = o);
				}
			}
		}
		return R.size >= 512 && R.clear(), R.set(n, i), i;
	}, te = Object.freeze({
		colors: a,
		colorModel: l
	}), H = re({
		neutral: a,
		colorModel: i ? l : "lab",
		colors: r,
		contrast: e.contrast,
		signalLightness: e.signalLightness
	});
	return {
		dark: o,
		light: s,
		neutral: te,
		colors: r,
		ramp: d,
		tokens: N,
		tokensOn: (t, n = t) => {
			let r = N(t.full.hex, n.full.hex);
			return (e.contrast ?? 1) >= 1 ? r : Object.freeze(Object.fromEntries(Object.entries(r).map(([e, n]) => [e, e === "background" ? t.hex : H.shown(t, n)])));
		},
		surface: V,
		steps: H
	};
}
function ye(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [`--huet-${e.replace(/[A-Z]/g, (e) => "-" + e.toLowerCase())}`, t]));
}
export { M as _, Q as a, S as b, ye as c, d, R as f, b as g, T as h, G as i, W as l, l as m, K as n, se as o, u as p, le as r, ce as s, oe as t, v as u, y as v, N as x, C as y };

//# sourceMappingURL=theme-BaMwzpON.js.map