// \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), l = (e, t = 0, n = 1) => g(_(t, e), n), u = (e) => {
	e._clipped = !1, e._unclipped = e.slice(0);
	for (let t = 0; t <= 3; t++) t < 3 ? ((e[t] < 0 || e[t] > 255) && (e._clipped = !0), e[t] = l(e[t], 0, 255)) : t === 3 && (e[t] = l(e[t], 0, 1));
	return e;
}, d = {};
for (let e of [
	"Boolean",
	"Number",
	"String",
	"Function",
	"Array",
	"Date",
	"RegExp",
	"Undefined",
	"Null"
]) d[`[object ${e}]`] = e.toLowerCase();
function f(e) {
	return d[Object.prototype.toString.call(e)] || "object";
}
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/utils/unpack.js
var p = (e, t = null) => e.length >= 3 ? Array.prototype.slice.call(e) : f(e[0]) == "object" && t ? t.split("").filter((t) => e[0][t] !== void 0).map((t) => e[0][t]) : e[0], m = (e) => {
	if (e.length < 2) return null;
	let t = e.length - 1;
	return f(e[t]) == "string" ? e[t].toLowerCase() : null;
}, { PI: h, min: g, max: _ } = Math, v = h * 2, y = h / 3, b = h / 180, x = 180 / h, S = {
	format: {},
	autodetect: []
}, C = class {
	constructor(...e) {
		let t = this;
		if (f(e[0]) === "object" && e[0].constructor && e[0].constructor === this.constructor) return e[0];
		let n = m(e), r = !1;
		if (!n) {
			r = !0, S.sorted ||= (S.autodetect = S.autodetect.sort((e, t) => t.p - e.p), !0);
			for (let t of S.autodetect) if (n = t.test(...e), n) break;
		}
		if (S.format[n]) t._rgb = u(S.format[n].apply(null, r ? e : e.slice(0, -1)));
		else throw Error("unknown format: " + e);
		t._rgb.length === 3 && t._rgb.push(1);
	}
	toString() {
		return f(this.hex) == "function" ? this.hex() : `[${this._rgb.join(",")}]`;
	}
}, w = "2.6.0", T = (...e) => new T.Color(...e);
T.Color = C, T.version = w;
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/cmyk/cmyk2rgb.js
var E = (...e) => {
	e = p(e, "cmyk");
	let [t, n, r, i] = e, a = e.length > 4 ? e[4] : 1;
	return i === 1 ? [
		0,
		0,
		0,
		a
	] : [
		t >= 1 ? 0 : 255 * (1 - t) * (1 - i),
		n >= 1 ? 0 : 255 * (1 - n) * (1 - i),
		r >= 1 ? 0 : 255 * (1 - r) * (1 - i),
		a
	];
}, { max: ee } = Math, D = (...e) => {
	let [t, n, r] = p(e, "rgb");
	t /= 255, n /= 255, r /= 255;
	let i = 1 - ee(t, ee(n, r)), a = i < 1 ? 1 / (1 - i) : 0;
	return [
		(1 - t - i) * a,
		(1 - n - i) * a,
		(1 - r - i) * a,
		i
	];
};
C.prototype.cmyk = function() {
	return D(this._rgb);
}, T.cmyk = (...e) => new C(...e, "cmyk"), S.format.cmyk = E, S.autodetect.push({
	p: 2,
	test: (...e) => {
		if (e = p(e, "cmyk"), f(e) === "array" && e.length === 4) return "cmyk";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/css/hsl2css.js
var te = (e) => Math.round(e * 100) / 100, ne = (...e) => {
	let t = p(e, "hsla"), n = m(e) || "lsa";
	return t[0] = te(t[0] || 0), t[1] = te(t[1] * 100) + "%", t[2] = te(t[2] * 100) + "%", n === "hsla" || t.length > 3 && t[3] < 1 ? (t[3] = t.length > 3 ? t[3] : 1, n = "hsla") : t.length = 3, `${n}(${t.join(",")})`;
}, re = (...e) => {
	e = p(e, "rgba");
	let [t, n, r] = e;
	t /= 255, n /= 255, r /= 255;
	let i = g(t, n, r), a = _(t, n, r), o = (a + i) / 2, s, c;
	return a === i ? (s = 0, c = NaN) : s = o < .5 ? (a - i) / (a + i) : (a - i) / (2 - a - i), t == a ? c = (n - r) / (a - i) : n == a ? c = 2 + (r - t) / (a - i) : r == a && (c = 4 + (t - n) / (a - i)), c *= 60, c < 0 && (c += 360), e.length > 3 && e[3] !== void 0 ? [
		c,
		s,
		o,
		e[3]
	] : [
		c,
		s,
		o
	];
}, { round: O } = Math, ie = (...e) => {
	let t = p(e, "rgba"), n = m(e) || "rgb";
	return n.substr(0, 3) == "hsl" ? ne(re(t), n) : (t[0] = O(t[0]), t[1] = O(t[1]), t[2] = O(t[2]), (n === "rgba" || t.length > 3 && t[3] < 1) && (t[3] = t.length > 3 ? t[3] : 1, n = "rgba"), `${n}(${t.slice(0, n === "rgb" ? 3 : 4).join(",")})`);
}, { round: ae } = Math, oe = (...e) => {
	e = p(e, "hsl");
	let [t, n, r] = e, i, a, o;
	if (n === 0) i = a = o = r * 255;
	else {
		let e = [
			0,
			0,
			0
		], s = [
			0,
			0,
			0
		], c = r < .5 ? r * (1 + n) : r + n - r * n, l = 2 * r - c, u = t / 360;
		e[0] = u + 1 / 3, e[1] = u, e[2] = u - 1 / 3;
		for (let t = 0; t < 3; t++) e[t] < 0 && (e[t] += 1), e[t] > 1 && --e[t], 6 * e[t] < 1 ? s[t] = l + (c - l) * 6 * e[t] : 2 * e[t] < 1 ? s[t] = c : 3 * e[t] < 2 ? s[t] = l + (c - l) * (2 / 3 - e[t]) * 6 : s[t] = l;
		[i, a, o] = [
			ae(s[0] * 255),
			ae(s[1] * 255),
			ae(s[2] * 255)
		];
	}
	return e.length > 3 ? [
		i,
		a,
		o,
		e[3]
	] : [
		i,
		a,
		o,
		1
	];
}, se = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/, ce = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/, le = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/, ue = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/, de = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/, fe = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/, { round: pe } = Math, me = (e) => {
	e = e.toLowerCase().trim();
	let t;
	if (S.format.named) try {
		return S.format.named(e);
	} catch {}
	if (t = e.match(se)) {
		let e = t.slice(1, 4);
		for (let t = 0; t < 3; t++) e[t] = +e[t];
		return e[3] = 1, e;
	}
	if (t = e.match(ce)) {
		let e = t.slice(1, 5);
		for (let t = 0; t < 4; t++) e[t] = +e[t];
		return e;
	}
	if (t = e.match(le)) {
		let e = t.slice(1, 4);
		for (let t = 0; t < 3; t++) e[t] = pe(e[t] * 2.55);
		return e[3] = 1, e;
	}
	if (t = e.match(ue)) {
		let e = t.slice(1, 5);
		for (let t = 0; t < 3; t++) e[t] = pe(e[t] * 2.55);
		return e[3] = +e[3], e;
	}
	if (t = e.match(de)) {
		let e = t.slice(1, 4);
		e[1] *= .01, e[2] *= .01;
		let n = oe(e);
		return n[3] = 1, n;
	}
	if (t = e.match(fe)) {
		let e = t.slice(1, 4);
		e[1] *= .01, e[2] *= .01;
		let n = oe(e);
		return n[3] = +t[4], n;
	}
};
me.test = (e) => se.test(e) || ce.test(e) || le.test(e) || ue.test(e) || de.test(e) || fe.test(e), C.prototype.css = function(e) {
	return ie(this._rgb, e);
}, T.css = (...e) => new C(...e, "css"), S.format.css = me, S.autodetect.push({
	p: 5,
	test: (e, ...t) => {
		if (!t.length && f(e) === "string" && me.test(e)) return "css";
	}
}), S.format.gl = (...e) => {
	let t = p(e, "rgba");
	return t[0] *= 255, t[1] *= 255, t[2] *= 255, t;
}, T.gl = (...e) => new C(...e, "gl"), C.prototype.gl = function() {
	let e = this._rgb;
	return [
		e[0] / 255,
		e[1] / 255,
		e[2] / 255,
		e[3]
	];
};
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/hcg/hcg2rgb.js
var { floor: he } = Math, ge = (...e) => {
	e = p(e, "hcg");
	let [t, n, r] = e, i, a, o;
	r *= 255;
	let s = n * 255;
	if (n === 0) i = a = o = r;
	else {
		t === 360 && (t = 0), t > 360 && (t -= 360), t < 0 && (t += 360), t /= 60;
		let e = he(t), c = t - e, l = r * (1 - n), u = l + s * (1 - c), d = l + s * c, f = l + s;
		switch (e) {
			case 0:
				[i, a, o] = [
					f,
					d,
					l
				];
				break;
			case 1:
				[i, a, o] = [
					u,
					f,
					l
				];
				break;
			case 2:
				[i, a, o] = [
					l,
					f,
					d
				];
				break;
			case 3:
				[i, a, o] = [
					l,
					u,
					f
				];
				break;
			case 4:
				[i, a, o] = [
					d,
					l,
					f
				];
				break;
			case 5: [i, a, o] = [
				f,
				l,
				u
			];
		}
	}
	return [
		i,
		a,
		o,
		e.length > 3 ? e[3] : 1
	];
}, _e = (...e) => {
	let [t, n, r] = p(e, "rgb"), i = g(t, n, r), a = _(t, n, r), o = a - i, s = o * 100 / 255, c = i / (255 - o) * 100, l;
	return o === 0 ? l = NaN : (t === a && (l = (n - r) / o), n === a && (l = 2 + (r - t) / o), r === a && (l = 4 + (t - n) / o), l *= 60, l < 0 && (l += 360)), [
		l,
		s,
		c
	];
};
C.prototype.hcg = function() {
	return _e(this._rgb);
}, T.hcg = (...e) => new C(...e, "hcg"), S.format.hcg = ge, S.autodetect.push({
	p: 1,
	test: (...e) => {
		if (e = p(e, "hcg"), f(e) === "array" && e.length === 3) return "hcg";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/hex/hex2rgb.js
var ve = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, ye = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/, be = (e) => {
	if (e.match(ve)) {
		(e.length === 4 || e.length === 7) && (e = e.substr(1)), e.length === 3 && (e = e.split(""), e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]);
		let t = parseInt(e, 16);
		return [
			t >> 16,
			t >> 8 & 255,
			t & 255,
			1
		];
	}
	if (e.match(ye)) {
		(e.length === 5 || e.length === 9) && (e = e.substr(1)), e.length === 4 && (e = e.split(""), e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2] + e[3] + e[3]);
		let t = parseInt(e, 16);
		return [
			t >> 24 & 255,
			t >> 16 & 255,
			t >> 8 & 255,
			Math.round((t & 255) / 255 * 100) / 100
		];
	}
	throw Error(`unknown hex color: ${e}`);
}, { round: k } = Math, xe = (...e) => {
	let [t, n, r, i] = p(e, "rgba"), a = m(e) || "auto";
	i === void 0 && (i = 1), a === "auto" && (a = i < 1 ? "rgba" : "rgb"), t = k(t), n = k(n), r = k(r);
	let o = "000000" + (t << 16 | n << 8 | r).toString(16);
	o = o.substr(o.length - 6);
	let s = "0" + k(i * 255).toString(16);
	switch (s = s.substr(s.length - 2), a.toLowerCase()) {
		case "rgba": return `#${o}${s}`;
		case "argb": return `#${s}${o}`;
		default: return `#${o}`;
	}
};
C.prototype.hex = function(e) {
	return xe(this._rgb, e);
}, T.hex = (...e) => new C(...e, "hex"), S.format.hex = be, S.autodetect.push({
	p: 4,
	test: (e, ...t) => {
		if (!t.length && f(e) === "string" && [
			3,
			4,
			5,
			6,
			7,
			8,
			9
		].indexOf(e.length) >= 0) return "hex";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/hsi/hsi2rgb.js
var { cos: A } = Math, Se = (...e) => {
	e = p(e, "hsi");
	let [t, n, r] = e, i, a, o;
	return isNaN(t) && (t = 0), isNaN(n) && (n = 0), t > 360 && (t -= 360), t < 0 && (t += 360), t /= 360, t < 1 / 3 ? (o = (1 - n) / 3, i = (1 + n * A(v * t) / A(y - v * t)) / 3, a = 1 - (o + i)) : t < 2 / 3 ? (t -= 1 / 3, i = (1 - n) / 3, a = (1 + n * A(v * t) / A(y - v * t)) / 3, o = 1 - (i + a)) : (t -= 2 / 3, a = (1 - n) / 3, o = (1 + n * A(v * t) / A(y - v * t)) / 3, i = 1 - (a + o)), i = l(r * i * 3), a = l(r * a * 3), o = l(r * o * 3), [
		i * 255,
		a * 255,
		o * 255,
		e.length > 3 ? e[3] : 1
	];
}, { min: Ce, sqrt: we, acos: Te } = Math, Ee = (...e) => {
	let [t, n, r] = p(e, "rgb");
	t /= 255, n /= 255, r /= 255;
	let i, a = Ce(t, n, r), o = (t + n + r) / 3, s = o > 0 ? 1 - a / o : 0;
	return s === 0 ? i = NaN : (i = (t - n + (t - r)) / 2, i /= we((t - n) * (t - n) + (t - r) * (n - r)), i = Te(i), r > n && (i = v - i), i /= v), [
		i * 360,
		s,
		o
	];
};
C.prototype.hsi = function() {
	return Ee(this._rgb);
}, T.hsi = (...e) => new C(...e, "hsi"), S.format.hsi = Se, S.autodetect.push({
	p: 2,
	test: (...e) => {
		if (e = p(e, "hsi"), f(e) === "array" && e.length === 3) return "hsi";
	}
}), C.prototype.hsl = function() {
	return re(this._rgb);
}, T.hsl = (...e) => new C(...e, "hsl"), S.format.hsl = oe, S.autodetect.push({
	p: 2,
	test: (...e) => {
		if (e = p(e, "hsl"), f(e) === "array" && e.length === 3) return "hsl";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/hsv/hsv2rgb.js
var { floor: De } = Math, Oe = (...e) => {
	e = p(e, "hsv");
	let [t, n, r] = e, i, a, o;
	if (r *= 255, n === 0) i = a = o = r;
	else {
		t === 360 && (t = 0), t > 360 && (t -= 360), t < 0 && (t += 360), t /= 60;
		let e = De(t), s = t - e, c = r * (1 - n), l = r * (1 - n * s), u = r * (1 - n * (1 - s));
		switch (e) {
			case 0:
				[i, a, o] = [
					r,
					u,
					c
				];
				break;
			case 1:
				[i, a, o] = [
					l,
					r,
					c
				];
				break;
			case 2:
				[i, a, o] = [
					c,
					r,
					u
				];
				break;
			case 3:
				[i, a, o] = [
					c,
					l,
					r
				];
				break;
			case 4:
				[i, a, o] = [
					u,
					c,
					r
				];
				break;
			case 5: [i, a, o] = [
				r,
				c,
				l
			];
		}
	}
	return [
		i,
		a,
		o,
		e.length > 3 ? e[3] : 1
	];
}, { min: ke, max: Ae } = Math, je = (...e) => {
	e = p(e, "rgb");
	let [t, n, r] = e, i = ke(t, n, r), a = Ae(t, n, r), o = a - i, s, c, l;
	return l = a / 255, a === 0 ? (s = NaN, c = 0) : (c = o / a, t === a && (s = (n - r) / o), n === a && (s = 2 + (r - t) / o), r === a && (s = 4 + (t - n) / o), s *= 60, s < 0 && (s += 360)), [
		s,
		c,
		l
	];
};
C.prototype.hsv = function() {
	return je(this._rgb);
}, T.hsv = (...e) => new C(...e, "hsv"), S.format.hsv = Oe, S.autodetect.push({
	p: 2,
	test: (...e) => {
		if (e = p(e, "hsv"), f(e) === "array" && e.length === 3) return "hsv";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/lab/lab-constants.js
var j = {
	Kn: 18,
	Xn: .95047,
	Yn: 1,
	Zn: 1.08883,
	t0: .137931034,
	t1: .206896552,
	t2: .12841855,
	t3: .008856452
}, { pow: Me } = Math, Ne = (...e) => {
	e = p(e, "lab");
	let [t, n, r] = e, i, a, o, s, c, l;
	return a = (t + 16) / 116, i = isNaN(n) ? a : a + n / 500, o = isNaN(r) ? a : a - r / 200, a = j.Yn * Fe(a), i = j.Xn * Fe(i), o = j.Zn * Fe(o), s = Pe(3.2404542 * i - 1.5371385 * a - .4985314 * o), c = Pe(-.969266 * i + 1.8760108 * a + .041556 * o), l = Pe(.0556434 * i - .2040259 * a + 1.0572252 * o), [
		s,
		c,
		l,
		e.length > 3 ? e[3] : 1
	];
}, Pe = (e) => 255 * (e <= .00304 ? 12.92 * e : 1.055 * Me(e, 1 / 2.4) - .055), Fe = (e) => e > j.t1 ? e * e * e : j.t2 * (e - j.t0), { pow: Ie } = Math, Le = (...e) => {
	let [t, n, r] = p(e, "rgb"), [i, a, o] = Be(t, n, r), s = 116 * a - 16;
	return [
		s < 0 ? 0 : s,
		500 * (i - a),
		200 * (a - o)
	];
}, Re = (e) => (e /= 255) <= .04045 ? e / 12.92 : Ie((e + .055) / 1.055, 2.4), ze = (e) => e > j.t3 ? Ie(e, 1 / 3) : e / j.t2 + j.t0, Be = (e, t, n) => (e = Re(e), t = Re(t), n = Re(n), [
	ze((.4124564 * e + .3575761 * t + .1804375 * n) / j.Xn),
	ze((.2126729 * e + .7151522 * t + .072175 * n) / j.Yn),
	ze((.0193339 * e + .119192 * t + .9503041 * n) / j.Zn)
]);
C.prototype.lab = function() {
	return Le(this._rgb);
}, T.lab = (...e) => new C(...e, "lab"), S.format.lab = Ne, S.autodetect.push({
	p: 2,
	test: (...e) => {
		if (e = p(e, "lab"), f(e) === "array" && e.length === 3) return "lab";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/lch/lch2lab.js
var { sin: Ve, cos: He } = Math, Ue = (...e) => {
	let [t, n, r] = p(e, "lch");
	return isNaN(r) && (r = 0), r *= b, [
		t,
		He(r) * n,
		Ve(r) * n
	];
}, We = (...e) => {
	e = p(e, "lch");
	let [t, n, r] = e, [i, a, o] = Ue(t, n, r), [s, c, l] = Ne(i, a, o);
	return [
		s,
		c,
		l,
		e.length > 3 ? e[3] : 1
	];
}, Ge = (...e) => We(...p(e, "hcl").reverse()), { sqrt: Ke, atan2: qe, round: Je } = Math, Ye = (...e) => {
	let [t, n, r] = p(e, "lab"), i = Ke(n * n + r * r), a = (qe(r, n) * x + 360) % 360;
	return Je(i * 1e4) === 0 && (a = NaN), [
		t,
		i,
		a
	];
}, Xe = (...e) => {
	let [t, n, r] = p(e, "rgb"), [i, a, o] = Le(t, n, r);
	return Ye(i, a, o);
};
C.prototype.lch = function() {
	return Xe(this._rgb);
}, C.prototype.hcl = function() {
	return Xe(this._rgb).reverse();
}, T.lch = (...e) => new C(...e, "lch"), T.hcl = (...e) => new C(...e, "hcl"), S.format.lch = We, S.format.hcl = Ge, ["lch", "hcl"].forEach((e) => S.autodetect.push({
	p: 2,
	test: (...t) => {
		if (t = p(t, e), f(t) === "array" && t.length === 3) return e;
	}
}));
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/colors/w3cx11.js
var M = {
	aliceblue: "#f0f8ff",
	antiquewhite: "#faebd7",
	aqua: "#00ffff",
	aquamarine: "#7fffd4",
	azure: "#f0ffff",
	beige: "#f5f5dc",
	bisque: "#ffe4c4",
	black: "#000000",
	blanchedalmond: "#ffebcd",
	blue: "#0000ff",
	blueviolet: "#8a2be2",
	brown: "#a52a2a",
	burlywood: "#deb887",
	cadetblue: "#5f9ea0",
	chartreuse: "#7fff00",
	chocolate: "#d2691e",
	coral: "#ff7f50",
	cornflowerblue: "#6495ed",
	cornsilk: "#fff8dc",
	crimson: "#dc143c",
	cyan: "#00ffff",
	darkblue: "#00008b",
	darkcyan: "#008b8b",
	darkgoldenrod: "#b8860b",
	darkgray: "#a9a9a9",
	darkgreen: "#006400",
	darkgrey: "#a9a9a9",
	darkkhaki: "#bdb76b",
	darkmagenta: "#8b008b",
	darkolivegreen: "#556b2f",
	darkorange: "#ff8c00",
	darkorchid: "#9932cc",
	darkred: "#8b0000",
	darksalmon: "#e9967a",
	darkseagreen: "#8fbc8f",
	darkslateblue: "#483d8b",
	darkslategray: "#2f4f4f",
	darkslategrey: "#2f4f4f",
	darkturquoise: "#00ced1",
	darkviolet: "#9400d3",
	deeppink: "#ff1493",
	deepskyblue: "#00bfff",
	dimgray: "#696969",
	dimgrey: "#696969",
	dodgerblue: "#1e90ff",
	firebrick: "#b22222",
	floralwhite: "#fffaf0",
	forestgreen: "#228b22",
	fuchsia: "#ff00ff",
	gainsboro: "#dcdcdc",
	ghostwhite: "#f8f8ff",
	gold: "#ffd700",
	goldenrod: "#daa520",
	gray: "#808080",
	green: "#008000",
	greenyellow: "#adff2f",
	grey: "#808080",
	honeydew: "#f0fff0",
	hotpink: "#ff69b4",
	indianred: "#cd5c5c",
	indigo: "#4b0082",
	ivory: "#fffff0",
	khaki: "#f0e68c",
	laserlemon: "#ffff54",
	lavender: "#e6e6fa",
	lavenderblush: "#fff0f5",
	lawngreen: "#7cfc00",
	lemonchiffon: "#fffacd",
	lightblue: "#add8e6",
	lightcoral: "#f08080",
	lightcyan: "#e0ffff",
	lightgoldenrod: "#fafad2",
	lightgoldenrodyellow: "#fafad2",
	lightgray: "#d3d3d3",
	lightgreen: "#90ee90",
	lightgrey: "#d3d3d3",
	lightpink: "#ffb6c1",
	lightsalmon: "#ffa07a",
	lightseagreen: "#20b2aa",
	lightskyblue: "#87cefa",
	lightslategray: "#778899",
	lightslategrey: "#778899",
	lightsteelblue: "#b0c4de",
	lightyellow: "#ffffe0",
	lime: "#00ff00",
	limegreen: "#32cd32",
	linen: "#faf0e6",
	magenta: "#ff00ff",
	maroon: "#800000",
	maroon2: "#7f0000",
	maroon3: "#b03060",
	mediumaquamarine: "#66cdaa",
	mediumblue: "#0000cd",
	mediumorchid: "#ba55d3",
	mediumpurple: "#9370db",
	mediumseagreen: "#3cb371",
	mediumslateblue: "#7b68ee",
	mediumspringgreen: "#00fa9a",
	mediumturquoise: "#48d1cc",
	mediumvioletred: "#c71585",
	midnightblue: "#191970",
	mintcream: "#f5fffa",
	mistyrose: "#ffe4e1",
	moccasin: "#ffe4b5",
	navajowhite: "#ffdead",
	navy: "#000080",
	oldlace: "#fdf5e6",
	olive: "#808000",
	olivedrab: "#6b8e23",
	orange: "#ffa500",
	orangered: "#ff4500",
	orchid: "#da70d6",
	palegoldenrod: "#eee8aa",
	palegreen: "#98fb98",
	paleturquoise: "#afeeee",
	palevioletred: "#db7093",
	papayawhip: "#ffefd5",
	peachpuff: "#ffdab9",
	peru: "#cd853f",
	pink: "#ffc0cb",
	plum: "#dda0dd",
	powderblue: "#b0e0e6",
	purple: "#800080",
	purple2: "#7f007f",
	purple3: "#a020f0",
	rebeccapurple: "#663399",
	red: "#ff0000",
	rosybrown: "#bc8f8f",
	royalblue: "#4169e1",
	saddlebrown: "#8b4513",
	salmon: "#fa8072",
	sandybrown: "#f4a460",
	seagreen: "#2e8b57",
	seashell: "#fff5ee",
	sienna: "#a0522d",
	silver: "#c0c0c0",
	skyblue: "#87ceeb",
	slateblue: "#6a5acd",
	slategray: "#708090",
	slategrey: "#708090",
	snow: "#fffafa",
	springgreen: "#00ff7f",
	steelblue: "#4682b4",
	tan: "#d2b48c",
	teal: "#008080",
	thistle: "#d8bfd8",
	tomato: "#ff6347",
	turquoise: "#40e0d0",
	violet: "#ee82ee",
	wheat: "#f5deb3",
	white: "#ffffff",
	whitesmoke: "#f5f5f5",
	yellow: "#ffff00",
	yellowgreen: "#9acd32"
};
C.prototype.name = function() {
	let e = xe(this._rgb, "rgb");
	for (let t of Object.keys(M)) if (M[t] === e) return t.toLowerCase();
	return e;
}, S.format.named = (e) => {
	if (e = e.toLowerCase(), M[e]) return be(M[e]);
	throw Error("unknown color name: " + e);
}, S.autodetect.push({
	p: 5,
	test: (e, ...t) => {
		if (!t.length && f(e) === "string" && M[e.toLowerCase()]) return "named";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/num/num2rgb.js
var Ze = (e) => {
	if (f(e) == "number" && e >= 0 && e <= 16777215) return [
		e >> 16,
		e >> 8 & 255,
		e & 255,
		1
	];
	throw Error("unknown num color: " + e);
}, Qe = (...e) => {
	let [t, n, r] = p(e, "rgb");
	return (t << 16) + (n << 8) + r;
};
C.prototype.num = function() {
	return Qe(this._rgb);
}, T.num = (...e) => new C(...e, "num"), S.format.num = Ze, S.autodetect.push({
	p: 5,
	test: (...e) => {
		if (e.length === 1 && f(e[0]) === "number" && e[0] >= 0 && e[0] <= 16777215) return "num";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/rgb/index.js
var { round: $e } = Math;
C.prototype.rgb = function(e = !0) {
	return e === !1 ? this._rgb.slice(0, 3) : this._rgb.slice(0, 3).map($e);
}, C.prototype.rgba = function(e = !0) {
	return this._rgb.slice(0, 4).map((t, n) => n < 3 ? e === !1 ? t : $e(t) : t);
}, T.rgb = (...e) => new C(...e, "rgb"), S.format.rgb = (...e) => {
	let t = p(e, "rgba");
	return t[3] === void 0 && (t[3] = 1), t;
}, S.autodetect.push({
	p: 3,
	test: (...e) => {
		if (e = p(e, "rgba"), f(e) === "array" && (e.length === 3 || e.length === 4 && f(e[3]) == "number" && e[3] >= 0 && e[3] <= 1)) return "rgb";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/temp/temperature2rgb.js
var { log: et } = Math, tt = (e) => {
	let t = e / 100, n, r, i;
	return t < 66 ? (n = 255, r = t < 6 ? 0 : -155.25485562709179 - .44596950469579133 * (r = t - 2) + 104.49216199393888 * et(r), i = t < 20 ? 0 : -254.76935184120902 + .8274096064007395 * (i = t - 10) + 115.67994401066147 * et(i)) : (n = 351.97690566805693 + .114206453784165 * (n = t - 55) - 40.25366309332127 * et(n), r = 325.4494125711974 + .07943456536662342 * (r = t - 50) - 28.0852963507957 * et(r), i = 255), [
		n,
		r,
		i,
		1
	];
}, { round: nt } = Math, rt = (...e) => {
	let t = p(e, "rgb"), n = t[0], r = t[2], i = 1e3, a = 4e4, o;
	for (; a - i > .4;) {
		o = (a + i) * .5;
		let e = tt(o);
		e[2] / e[0] >= r / n ? a = o : i = o;
	}
	return nt(o);
};
C.prototype.temp = C.prototype.kelvin = C.prototype.temperature = function() {
	return rt(this._rgb);
}, T.temp = T.kelvin = T.temperature = (...e) => new C(...e, "temp"), S.format.temp = S.format.kelvin = S.format.temperature = tt;
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/oklab/oklab2rgb.js
var { pow: N, sign: it } = Math, at = (...e) => {
	e = p(e, "lab");
	let [t, n, r] = e, i = N(t + .3963377774 * n + .2158037573 * r, 3), a = N(t - .1055613458 * n - .0638541728 * r, 3), o = N(t - .0894841775 * n - 1.291485548 * r, 3);
	return [
		255 * ot(4.0767416621 * i - 3.3077115913 * a + .2309699292 * o),
		255 * ot(-1.2684380046 * i + 2.6097574011 * a - .3413193965 * o),
		255 * ot(-.0041960863 * i - .7034186147 * a + 1.707614701 * o),
		e.length > 3 ? e[3] : 1
	];
};
function ot(e) {
	let t = Math.abs(e);
	return t > .0031308 ? (it(e) || 1) * (1.055 * N(t, 1 / 2.4) - .055) : e * 12.92;
}
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/oklab/rgb2oklab.js
var { cbrt: st, pow: ct, sign: lt } = Math, ut = (...e) => {
	let [t, n, r] = p(e, "rgb"), [i, a, o] = [
		dt(t / 255),
		dt(n / 255),
		dt(r / 255)
	], s = st(.4122214708 * i + .5363325363 * a + .0514459929 * o), c = st(.2119034982 * i + .6806995451 * a + .1073969566 * o), l = st(.0883024619 * i + .2817188376 * a + .6299787005 * o);
	return [
		.2104542553 * s + .793617785 * c - .0040720468 * l,
		1.9779984951 * s - 2.428592205 * c + .4505937099 * l,
		.0259040371 * s + .7827717662 * c - .808675766 * l
	];
};
function dt(e) {
	let t = Math.abs(e);
	return t < .04045 ? e / 12.92 : (lt(e) || 1) * ct((t + .055) / 1.055, 2.4);
}
C.prototype.oklab = function() {
	return ut(this._rgb);
}, T.oklab = (...e) => new C(...e, "oklab"), S.format.oklab = at, S.autodetect.push({
	p: 3,
	test: (...e) => {
		if (e = p(e, "oklab"), f(e) === "array" && e.length === 3) return "oklab";
	}
});
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/io/oklch/oklch2rgb.js
var ft = (...e) => {
	e = p(e, "lch");
	let [t, n, r] = e, [i, a, o] = Ue(t, n, r), [s, c, l] = at(i, a, o);
	return [
		s,
		c,
		l,
		e.length > 3 ? e[3] : 1
	];
}, pt = (...e) => {
	let [t, n, r] = p(e, "rgb"), [i, a, o] = ut(t, n, r);
	return Ye(i, a, o);
};
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/ops/get.js
C.prototype.oklch = function() {
	return pt(this._rgb);
}, T.oklch = (...e) => new C(...e, "oklch"), S.format.oklch = ft, S.autodetect.push({
	p: 3,
	test: (...e) => {
		if (e = p(e, "oklch"), f(e) === "array" && e.length === 3) return "oklch";
	}
}), C.prototype.alpha = function(e, t = !1) {
	return e !== void 0 && f(e) === "number" ? t ? (this._rgb[3] = e, this) : new C([
		this._rgb[0],
		this._rgb[1],
		this._rgb[2],
		e
	], "rgb") : this._rgb[3];
}, C.prototype.clipped = function() {
	return this._rgb._clipped || !1;
}, C.prototype.darken = function(e = 1) {
	let t = this, n = t.lab();
	return n[0] -= j.Kn * e, new C(n, "lab").alpha(t.alpha(), !0);
}, C.prototype.brighten = function(e = 1) {
	return this.darken(-e);
}, C.prototype.darker = C.prototype.darken, C.prototype.brighter = C.prototype.brighten, C.prototype.get = function(e) {
	let [t, n] = e.split("."), r = this[t]();
	if (n) {
		let e = t.indexOf(n) - (t.substr(0, 2) === "ok" ? 2 : 0);
		if (e > -1) return r[e];
		throw Error(`unknown channel ${n} in mode ${t}`);
	}
	return r;
};
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/ops/luminance.js
var { pow: mt } = Math, ht = 1e-7, gt = 20;
C.prototype.luminance = function(e, t = "rgb") {
	if (e !== void 0 && f(e) === "number") {
		if (e === 0) return new C([
			0,
			0,
			0,
			this._rgb[3]
		], "rgb");
		if (e === 1) return new C([
			255,
			255,
			255,
			this._rgb[3]
		], "rgb");
		let n = this.luminance(), r = gt, i = (n, a) => {
			let o = n.interpolate(a, .5, t), s = o.luminance();
			return Math.abs(e - s) < ht || !r-- ? o : s > e ? i(n, o) : i(o, a);
		};
		return new C([...(n > e ? i(new C([
			0,
			0,
			0
		]), this) : i(this, new C([
			255,
			255,
			255
		]))).rgb(), this._rgb[3]]);
	}
	return _t(...this._rgb.slice(0, 3));
};
var _t = (e, t, n) => (e = vt(e), t = vt(t), n = vt(n), .2126 * e + .7152 * t + .0722 * n), vt = (e) => (e /= 255, e <= .03928 ? e / 12.92 : mt((e + .055) / 1.055, 2.4)), P = {}, F = (e, t, n = .5, ...r) => {
	let i = r[0] || "lrgb";
	if (!P[i] && !r.length && (i = Object.keys(P)[0]), !P[i]) throw Error(`interpolation mode ${i} is not defined`);
	return f(e) !== "object" && (e = new C(e)), f(t) !== "object" && (t = new C(t)), P[i](e, t, n).alpha(e.alpha() + n * (t.alpha() - e.alpha()));
};
C.prototype.mix = C.prototype.interpolate = function(e, t = .5, ...n) {
	return F(this, e, t, ...n);
}, C.prototype.premultiply = function(e = !1) {
	let t = this._rgb, n = t[3];
	return e ? (this._rgb = [
		t[0] * n,
		t[1] * n,
		t[2] * n,
		n
	], this) : new C([
		t[0] * n,
		t[1] * n,
		t[2] * n,
		n
	], "rgb");
}, C.prototype.saturate = function(e = 1) {
	let t = this, n = t.lch();
	return n[1] += j.Kn * e, n[1] < 0 && (n[1] = 0), new C(n, "lch").alpha(t.alpha(), !0);
}, C.prototype.desaturate = function(e = 1) {
	return this.saturate(-e);
}, C.prototype.set = function(e, t, n = !1) {
	let [r, i] = e.split("."), a = this[r]();
	if (i) {
		let e = r.indexOf(i) - (r.substr(0, 2) === "ok" ? 2 : 0);
		if (e > -1) {
			if (f(t) == "string") switch (t.charAt(0)) {
				case "+":
					a[e] += +t;
					break;
				case "-":
					a[e] += +t;
					break;
				case "*":
					a[e] *= +t.substr(1);
					break;
				case "/":
					a[e] /= +t.substr(1);
					break;
				default: a[e] = +t;
			}
			else if (f(t) === "number") a[e] = t;
			else throw Error("unsupported value for Color.set");
			let i = new C(a, r);
			return n ? (this._rgb = i._rgb, this) : i;
		}
		throw Error(`unknown channel ${i} in mode ${r}`);
	}
	return a;
}, C.prototype.tint = function(e = .5, ...t) {
	return F(this, "white", e, ...t);
}, C.prototype.shade = function(e = .5, ...t) {
	return F(this, "black", e, ...t);
}, P.rgb = (e, t, n) => {
	let r = e._rgb, i = t._rgb;
	return new C(r[0] + n * (i[0] - r[0]), r[1] + n * (i[1] - r[1]), r[2] + n * (i[2] - r[2]), "rgb");
};
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/interpolator/lrgb.js
var { sqrt: yt, pow: I } = Math;
P.lrgb = (e, t, n) => {
	let [r, i, a] = e._rgb, [o, s, c] = t._rgb;
	return new C(yt(I(r, 2) * (1 - n) + I(o, 2) * n), yt(I(i, 2) * (1 - n) + I(s, 2) * n), yt(I(a, 2) * (1 - n) + I(c, 2) * n), "rgb");
}, P.lab = (e, t, n) => {
	let r = e.lab(), i = t.lab();
	return new C(r[0] + n * (i[0] - r[0]), r[1] + n * (i[1] - r[1]), r[2] + n * (i[2] - r[2]), "lab");
};
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/interpolator/_hsx.js
var L = (e, t, n, r) => {
	let i, a;
	r === "hsl" ? (i = e.hsl(), a = t.hsl()) : r === "hsv" ? (i = e.hsv(), a = t.hsv()) : r === "hcg" ? (i = e.hcg(), a = t.hcg()) : r === "hsi" ? (i = e.hsi(), a = t.hsi()) : r === "lch" || r === "hcl" ? (r = "hcl", i = e.hcl(), a = t.hcl()) : r === "oklch" && (i = e.oklch().reverse(), a = t.oklch().reverse());
	let o, s, c, l, u, d;
	(r.substr(0, 1) === "h" || r === "oklch") && ([o, c, u] = i, [s, l, d] = a);
	let f, p, m, h;
	return !isNaN(o) && !isNaN(s) ? (h = s > o && s - o > 180 ? s - (o + 360) : s < o && o - s > 180 ? s + 360 - o : s - o, p = o + n * h) : isNaN(o) ? isNaN(s) ? p = NaN : (p = s, (u == 1 || u == 0) && r != "hsv" && (f = l)) : (p = o, (d == 1 || d == 0) && r != "hsv" && (f = c)), f === void 0 && (f = c + n * (l - c)), m = u + n * (d - u), r === "oklch" ? new C([
		m,
		f,
		p
	], r) : new C([
		p,
		f,
		m
	], r);
}, bt = (e, t, n) => L(e, t, n, "lch");
P.lch = bt, P.hcl = bt, P.num = (e, t, n) => {
	let r = e.num();
	return new C(r + n * (t.num() - r), "num");
}, P.hcg = (e, t, n) => L(e, t, n, "hcg"), P.hsi = (e, t, n) => L(e, t, n, "hsi"), P.hsl = (e, t, n) => L(e, t, n, "hsl"), P.hsv = (e, t, n) => L(e, t, n, "hsv"), P.oklab = (e, t, n) => {
	let r = e.oklab(), i = t.oklab();
	return new C(r[0] + n * (i[0] - r[0]), r[1] + n * (i[1] - r[1]), r[2] + n * (i[2] - r[2]), "oklab");
}, P.oklch = (e, t, n) => L(e, t, n, "oklch");
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/generator/average.js
var { pow: xt, sqrt: St, PI: Ct, cos: wt, sin: Tt, atan2: Et } = Math, Dt = (e, t = "lrgb", n = null) => {
	let r = e.length;
	n ||= Array.from(Array(r)).map(() => 1);
	let i = r / n.reduce(function(e, t) {
		return e + t;
	});
	if (n.forEach((e, t) => {
		n[t] *= i;
	}), e = e.map((e) => new C(e)), t === "lrgb") return Ot(e, n);
	let a = e.shift(), o = a.get(t), s = [], c = 0, l = 0;
	for (let e = 0; e < o.length; e++) if (o[e] = (o[e] || 0) * n[0], s.push(isNaN(o[e]) ? 0 : n[0]), t.charAt(e) === "h" && !isNaN(o[e])) {
		let t = o[e] / 180 * Ct;
		c += wt(t) * n[0], l += Tt(t) * n[0];
	}
	let u = a.alpha() * n[0];
	e.forEach((e, r) => {
		let i = e.get(t);
		u += e.alpha() * n[r + 1];
		for (let e = 0; e < o.length; e++) if (!isNaN(i[e])) {
			if (s[e] += n[r + 1], t.charAt(e) === "h") {
				let t = i[e] / 180 * Ct;
				c += wt(t) * n[r + 1], l += Tt(t) * n[r + 1];
			} else o[e] += i[e] * n[r + 1];
		}
	});
	for (let e = 0; e < o.length; e++) if (t.charAt(e) === "h") {
		let t = Et(l / s[e], c / s[e]) / Ct * 180;
		for (; t < 0;) t += 360;
		for (; t >= 360;) t -= 360;
		o[e] = t;
	} else o[e] = o[e] / s[e];
	return u /= r, new C(o, t).alpha(u > .99999 ? 1 : u, !0);
}, Ot = (e, t) => {
	let n = e.length, r = [
		0,
		0,
		0,
		0
	];
	for (let i = 0; i < e.length; i++) {
		let a = e[i], o = t[i] / n, s = a._rgb;
		r[0] += xt(s[0], 2) * o, r[1] += xt(s[1], 2) * o, r[2] += xt(s[2], 2) * o, r[3] += s[3] * o;
	}
	return r[0] = St(r[0]), r[1] = St(r[1]), r[2] = St(r[2]), r[3] > .9999999 && (r[3] = 1), new C(u(r));
}, { pow: kt } = Math;
function At(e) {
	let t = "rgb", n = T("#ccc"), r = 0, i = [0, 1], a = [], o = [0, 0], s = !1, c = [], u = !1, d = 0, p = 1, m = !1, h = {}, g = !0, _ = 1, v = function(e) {
		if (e ||= ["#fff", "#000"], e && f(e) === "string" && T.brewer && T.brewer[e.toLowerCase()] && (e = T.brewer[e.toLowerCase()]), f(e) === "array") {
			e.length === 1 && (e = [e[0], e[0]]), e = e.slice(0);
			for (let t = 0; t < e.length; t++) e[t] = T(e[t]);
			a.length = 0;
			for (let t = 0; t < e.length; t++) a.push(t / (e.length - 1));
		}
		return C(), c = e;
	}, y = function(e) {
		if (s != null) {
			let t = s.length - 1, n = 0;
			for (; n < t && e >= s[n];) n++;
			return n - 1;
		}
		return 0;
	}, b = (e) => e, x = (e) => e, S = function(e, r) {
		let i, u;
		if (r ??= !1, isNaN(e) || e === null) return n;
		u = r ? e : s && s.length > 2 ? y(e) / (s.length - 2) : p === d ? 1 : (e - d) / (p - d), u = x(u), r || (u = b(u)), _ !== 1 && (u = kt(u, _)), u = o[0] + u * (1 - o[0] - o[1]), u = l(u, 0, 1);
		let m = Math.floor(u * 1e4);
		if (g && h[m]) i = h[m];
		else {
			if (f(c) === "array") for (let e = 0; e < a.length; e++) {
				let n = a[e];
				if (u <= n || u >= n && e === a.length - 1) {
					i = c[e];
					break;
				}
				if (u > n && u < a[e + 1]) {
					u = (u - n) / (a[e + 1] - n), i = T.interpolate(c[e], c[e + 1], u, t);
					break;
				}
			}
			else f(c) === "function" && (i = c(u));
			g && (h[m] = i);
		}
		return i;
	};
	var C = () => h = {};
	v(e);
	let w = function(e) {
		let t = T(S(e));
		return u && t[u] ? t[u]() : t;
	};
	return w.classes = function(e) {
		if (e != null) {
			if (f(e) === "array") s = e, i = [e[0], e[e.length - 1]];
			else {
				let t = T.analyze(i);
				s = e === 0 ? [t.min, t.max] : T.limits(t, "e", e);
			}
			return w;
		}
		return s;
	}, w.domain = function(e) {
		if (!arguments.length) return i;
		d = e[0], p = e[e.length - 1], a = [];
		let t = c.length;
		if (e.length === t && d !== p) for (let t of Array.from(e)) a.push((t - d) / (p - d));
		else {
			for (let e = 0; e < t; e++) a.push(e / (t - 1));
			if (e.length > 2) {
				let t = e.map((t, n) => n / (e.length - 1)), n = e.map((e) => (e - d) / (p - d));
				n.every((e, n) => t[n] === e) || (x = (e) => {
					if (e <= 0 || e >= 1) return e;
					let r = 0;
					for (; e >= n[r + 1];) r++;
					let i = (e - n[r]) / (n[r + 1] - n[r]);
					return t[r] + i * (t[r + 1] - t[r]);
				});
			}
		}
		return i = [d, p], w;
	}, w.mode = function(e) {
		return arguments.length ? (t = e, C(), w) : t;
	}, w.range = function(e, t) {
		return v(e, t), w;
	}, w.out = function(e) {
		return u = e, w;
	}, w.spread = function(e) {
		return arguments.length ? (r = e, w) : r;
	}, w.correctLightness = function(e) {
		return e ??= !0, m = e, C(), b = m ? function(e) {
			let t = S(0, !0).lab()[0], n = S(1, !0).lab()[0], r = t > n, i = S(e, !0).lab()[0], a = t + (n - t) * e, o = i - a, s = 0, c = 1, l = 20;
			for (; Math.abs(o) > .01 && l-- > 0;) (function() {
				return r && (o *= -1), o < 0 ? (s = e, e += (c - e) * .5) : (c = e, e += (s - e) * .5), i = S(e, !0).lab()[0], o = i - a;
			})();
			return e;
		} : (e) => e, w;
	}, w.padding = function(e) {
		return e == null ? o : (f(e) === "number" && (e = [e, e]), o = e, w);
	}, w.colors = function(t, n) {
		arguments.length < 2 && (n = "hex");
		let r = [];
		if (arguments.length === 0) r = c.slice(0);
		else if (t === 1) r = [w(.5)];
		else if (t > 1) {
			let e = i[0], n = i[1] - e;
			r = jt(0, t, !1).map((r) => w(e + r / (t - 1) * n));
		} else {
			e = [];
			let t = [];
			if (s && s.length > 2) for (let e = 1, n = s.length, r = 1 <= n; r ? e < n : e > n; r ? e++ : e--) t.push((s[e - 1] + s[e]) * .5);
			else t = i;
			r = t.map((e) => w(e));
		}
		return T[n] && (r = r.map((e) => e[n]())), r;
	}, w.cache = function(e) {
		return e == null ? g : (g = e, w);
	}, w.gamma = function(e) {
		return e == null ? _ : (_ = e, w);
	}, w.nodata = function(e) {
		return e == null ? n : (n = T(e), w);
	}, w;
}
function jt(e, t, n) {
	let r = [], i = e < t, a = n ? i ? t + 1 : t - 1 : t;
	for (let t = e; i ? t < a : t > a; i ? t++ : t--) r.push(t);
	return r;
}
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/generator/bezier.js
var Mt = function(e) {
	let t = [1, 1];
	for (let n = 1; n < e; n++) {
		let e = [1];
		for (let n = 1; n <= t.length; n++) e[n] = (t[n] || 0) + t[n - 1];
		t = e;
	}
	return t;
}, Nt = function(e) {
	let t, n, r, i;
	if (e = e.map((e) => new C(e)), e.length === 2) [n, r] = e.map((e) => e.lab()), t = function(e) {
		return new C([
			0,
			1,
			2
		].map((t) => n[t] + e * (r[t] - n[t])), "lab");
	};
	else if (e.length === 3) [n, r, i] = e.map((e) => e.lab()), t = function(e) {
		return new C([
			0,
			1,
			2
		].map((t) => (1 - e) * (1 - e) * n[t] + 2 * (1 - e) * e * r[t] + e * e * i[t]), "lab");
	};
	else if (e.length === 4) {
		let a;
		[n, r, i, a] = e.map((e) => e.lab()), t = function(e) {
			return new C([
				0,
				1,
				2
			].map((t) => (1 - e) * (1 - e) * (1 - e) * n[t] + 3 * (1 - e) * (1 - e) * e * r[t] + 3 * (1 - e) * e * e * i[t] + e * e * e * a[t]), "lab");
		};
	} else if (e.length >= 5) {
		let n, r, i;
		n = e.map((e) => e.lab()), i = e.length - 1, r = Mt(i), t = function(e) {
			let t = 1 - e;
			return new C([
				0,
				1,
				2
			].map((a) => n.reduce((n, o, s) => n + r[s] * t ** (i - s) * e ** s * o[a], 0)), "lab");
		};
	} else throw RangeError("No point in running bezier with only one color.");
	return t;
}, Pt = (e) => {
	let t = Nt(e);
	return t.scale = () => At(t), t;
}, R = (e, t, n) => {
	if (!R[n]) throw Error("unknown blend mode " + n);
	return R[n](e, t);
}, z = (e) => (t, n) => {
	let r = T(n).rgb(), i = T(t).rgb();
	return T.rgb(e(r, i));
}, B = (e) => (t, n) => {
	let r = [];
	return r[0] = e(t[0], n[0]), r[1] = e(t[1], n[1]), r[2] = e(t[2], n[2]), r;
};
R.normal = z(B((e) => e)), R.multiply = z(B((e, t) => e * t / 255)), R.screen = z(B((e, t) => 255 * (1 - (1 - e / 255) * (1 - t / 255)))), R.overlay = z(B((e, t) => t < 128 ? 2 * e * t / 255 : 255 * (1 - 2 * (1 - e / 255) * (1 - t / 255)))), R.darken = z(B((e, t) => e > t ? t : e)), R.lighten = z(B((e, t) => e > t ? e : t)), R.dodge = z(B((e, t) => e === 255 ? 255 : (e = t / 255 * 255 / (1 - e / 255), e > 255 ? 255 : e))), R.burn = z(B((e, t) => 255 * (1 - (1 - t / 255) / (e / 255))));
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/generator/cubehelix.js
var { pow: Ft, sin: It, cos: Lt } = Math;
function Rt(e = 300, t = -1.5, n = 1, r = 1, i = [0, 1]) {
	let a = 0, o;
	f(i) === "array" ? o = i[1] - i[0] : (o = 0, i = [i, i]);
	let s = function(s) {
		let c = v * ((e + 120) / 360 + t * s), l = Ft(i[0] + o * s, r), d = (a === 0 ? n : n[0] + s * a) * l * (1 - l) / 2, f = Lt(c), p = It(c), m = l + d * (-.14861 * f + 1.78277 * p), h = l + d * (-.29227 * f - .90649 * p), g = l + 1.97294 * f * d;
		return T(u([
			m * 255,
			h * 255,
			g * 255,
			1
		]));
	};
	return s.start = function(t) {
		return t == null ? e : (e = t, s);
	}, s.rotations = function(e) {
		return e == null ? t : (t = e, s);
	}, s.gamma = function(e) {
		return e == null ? r : (r = e, s);
	}, s.hue = function(e) {
		return e == null ? n : (n = e, f(n) === "array" ? (a = n[1] - n[0], a === 0 && (n = n[1])) : a = 0, s);
	}, s.lightness = function(e) {
		return e == null ? i : (f(e) === "array" ? (i = e, o = e[1] - e[0]) : (i = [e, e], o = 0), s);
	}, s.scale = () => T.scale(s), s.hue(n), s;
}
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/generator/random.js
var zt = "0123456789abcdef", { floor: Bt, random: Vt } = Math, Ht = () => {
	let e = "#";
	for (let t = 0; t < 6; t++) e += zt.charAt(Bt(Vt() * 16));
	return new C(e, "hex");
}, { log: Ut, pow: Wt, floor: Gt, abs: Kt } = Math;
function qt(e, t = null) {
	let n = {
		min: Number.MAX_VALUE,
		max: Number.MAX_VALUE * -1,
		sum: 0,
		values: [],
		count: 0
	};
	return f(e) === "object" && (e = Object.values(e)), e.forEach((e) => {
		t && f(e) === "object" && (e = e[t]), e != null && !isNaN(e) && (n.values.push(e), n.sum += e, e < n.min && (n.min = e), e > n.max && (n.max = e), n.count += 1);
	}), n.domain = [n.min, n.max], n.limits = (e, t) => Jt(n, e, t), n;
}
function Jt(e, t = "equal", n = 7) {
	f(e) == "array" && (e = qt(e));
	let { min: r, max: i } = e, a = e.values.sort((e, t) => e - t);
	if (n === 1) return [r, i];
	let o = [];
	if (t.substr(0, 1) === "c" && (o.push(r), o.push(i)), t.substr(0, 1) === "e") {
		o.push(r);
		for (let e = 1; e < n; e++) o.push(r + e / n * (i - r));
		o.push(i);
	} else if (t.substr(0, 1) === "l") {
		if (r <= 0) throw Error("Logarithmic scales are only possible for values > 0");
		let e = Math.LOG10E * Ut(r), t = Math.LOG10E * Ut(i);
		o.push(r);
		for (let r = 1; r < n; r++) o.push(Wt(10, e + r / n * (t - e)));
		o.push(i);
	} else if (t.substr(0, 1) === "q") {
		o.push(r);
		for (let e = 1; e < n; e++) {
			let t = (a.length - 1) * e / n, r = Gt(t);
			if (r === t) o.push(a[r]);
			else {
				let e = t - r;
				o.push(a[r] * (1 - e) + a[r + 1] * e);
			}
		}
		o.push(i);
	} else if (t.substr(0, 1) === "k") {
		let e, t = a.length, s = Array(t), c = Array(n), l = !0, u = 0, d = null;
		d = [], d.push(r);
		for (let e = 1; e < n; e++) d.push(r + e / n * (i - r));
		for (d.push(i); l;) {
			for (let e = 0; e < n; e++) c[e] = 0;
			for (let e = 0; e < t; e++) {
				let t = a[e], r = Number.MAX_VALUE, i;
				for (let a = 0; a < n; a++) {
					let n = Kt(d[a] - t);
					n < r && (r = n, i = a), c[i]++, s[e] = i;
				}
			}
			let r = Array(n);
			for (let e = 0; e < n; e++) r[e] = null;
			for (let n = 0; n < t; n++) e = s[n], r[e] === null ? r[e] = a[n] : r[e] += a[n];
			for (let e = 0; e < n; e++) r[e] *= 1 / c[e];
			l = !1;
			for (let e = 0; e < n; e++) if (r[e] !== d[e]) {
				l = !0;
				break;
			}
			d = r, u++, u > 200 && (l = !1);
		}
		let f = {};
		for (let e = 0; e < n; e++) f[e] = [];
		for (let n = 0; n < t; n++) e = s[n], f[e].push(a[n]);
		let p = [];
		for (let e = 0; e < n; e++) p.push(f[e][0]), p.push(f[e][f[e].length - 1]);
		p = p.sort((e, t) => e - t), o.push(p[0]);
		for (let e = 1; e < p.length; e += 2) {
			let t = p[e];
			!isNaN(t) && o.indexOf(t) === -1 && o.push(t);
		}
	}
	return o;
}
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/utils/contrast.js
var Yt = (e, t) => {
	e = new C(e), t = new C(t);
	let n = e.luminance(), r = t.luminance();
	return n > r ? (n + .05) / (r + .05) : (r + .05) / (n + .05);
}, { sqrt: V, pow: H, min: Xt, max: Zt, atan2: Qt, abs: $t, cos: en, sin: tn, exp: nn, PI: rn } = Math;
function an(e, t, n = 1, r = 1, i = 1) {
	var a = function(e) {
		return 360 * e / (2 * rn);
	}, o = function(e) {
		return 2 * rn * e / 360;
	};
	e = new C(e), t = new C(t);
	let [s, c, l] = Array.from(e.lab()), [u, d, f] = Array.from(t.lab()), p = (s + u) / 2, m = (V(H(c, 2) + H(l, 2)) + V(H(d, 2) + H(f, 2))) / 2, h = .5 * (1 - V(H(m, 7) / (H(m, 7) + H(25, 7)))), g = c * (1 + h), _ = d * (1 + h), v = V(H(g, 2) + H(l, 2)), y = V(H(_, 2) + H(f, 2)), b = (v + y) / 2, x = a(Qt(l, g)), S = a(Qt(f, _)), w = x >= 0 ? x : x + 360, T = S >= 0 ? S : S + 360, E = $t(w - T) > 180 ? (w + T + 360) / 2 : (w + T) / 2, ee = 1 - .17 * en(o(E - 30)) + .24 * en(o(2 * E)) + .32 * en(o(3 * E + 6)) - .2 * en(o(4 * E - 63)), D = T - w;
	D = $t(D) <= 180 ? D : T <= w ? D + 360 : D - 360, D = 2 * V(v * y) * tn(o(D) / 2);
	let te = u - s, ne = y - v, re = 1 + .015 * H(p - 50, 2) / V(20 + H(p - 50, 2)), O = 1 + .045 * b, ie = 1 + .015 * b * ee, ae = 30 * nn(-H((E - 275) / 25, 2)), oe = -(2 * V(H(b, 7) / (H(b, 7) + H(25, 7)))) * tn(2 * o(ae));
	return Zt(0, Xt(100, V(H(te / (n * re), 2) + H(ne / (r * O), 2) + H(D / (i * ie), 2) + oe * (ne / (r * O)) * (D / (i * ie)))));
}
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/utils/distance.js
function on(e, t, n = "lab") {
	e = new C(e), t = new C(t);
	let r = e.get(n), i = t.get(n), a = 0;
	for (let e in r) {
		let t = (r[e] || 0) - (i[e] || 0);
		a += t * t;
	}
	return Math.sqrt(a);
}
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/src/utils/valid.js
var sn = (...e) => {
	try {
		return new C(...e), !0;
	} catch {
		return !1;
	}
}, cn = {
	cool() {
		return At([T.hsl(180, 1, .9), T.hsl(250, .7, .4)]);
	},
	hot() {
		return At([
			"#000",
			"#f00",
			"#ff0",
			"#fff"
		], [
			0,
			.25,
			.75,
			1
		]).mode("rgb");
	}
}, ln = {
	OrRd: [
		"#fff7ec",
		"#fee8c8",
		"#fdd49e",
		"#fdbb84",
		"#fc8d59",
		"#ef6548",
		"#d7301f",
		"#b30000",
		"#7f0000"
	],
	PuBu: [
		"#fff7fb",
		"#ece7f2",
		"#d0d1e6",
		"#a6bddb",
		"#74a9cf",
		"#3690c0",
		"#0570b0",
		"#045a8d",
		"#023858"
	],
	BuPu: [
		"#f7fcfd",
		"#e0ecf4",
		"#bfd3e6",
		"#9ebcda",
		"#8c96c6",
		"#8c6bb1",
		"#88419d",
		"#810f7c",
		"#4d004b"
	],
	Oranges: [
		"#fff5eb",
		"#fee6ce",
		"#fdd0a2",
		"#fdae6b",
		"#fd8d3c",
		"#f16913",
		"#d94801",
		"#a63603",
		"#7f2704"
	],
	BuGn: [
		"#f7fcfd",
		"#e5f5f9",
		"#ccece6",
		"#99d8c9",
		"#66c2a4",
		"#41ae76",
		"#238b45",
		"#006d2c",
		"#00441b"
	],
	YlOrBr: [
		"#ffffe5",
		"#fff7bc",
		"#fee391",
		"#fec44f",
		"#fe9929",
		"#ec7014",
		"#cc4c02",
		"#993404",
		"#662506"
	],
	YlGn: [
		"#ffffe5",
		"#f7fcb9",
		"#d9f0a3",
		"#addd8e",
		"#78c679",
		"#41ab5d",
		"#238443",
		"#006837",
		"#004529"
	],
	Reds: [
		"#fff5f0",
		"#fee0d2",
		"#fcbba1",
		"#fc9272",
		"#fb6a4a",
		"#ef3b2c",
		"#cb181d",
		"#a50f15",
		"#67000d"
	],
	RdPu: [
		"#fff7f3",
		"#fde0dd",
		"#fcc5c0",
		"#fa9fb5",
		"#f768a1",
		"#dd3497",
		"#ae017e",
		"#7a0177",
		"#49006a"
	],
	Greens: [
		"#f7fcf5",
		"#e5f5e0",
		"#c7e9c0",
		"#a1d99b",
		"#74c476",
		"#41ab5d",
		"#238b45",
		"#006d2c",
		"#00441b"
	],
	YlGnBu: [
		"#ffffd9",
		"#edf8b1",
		"#c7e9b4",
		"#7fcdbb",
		"#41b6c4",
		"#1d91c0",
		"#225ea8",
		"#253494",
		"#081d58"
	],
	Purples: [
		"#fcfbfd",
		"#efedf5",
		"#dadaeb",
		"#bcbddc",
		"#9e9ac8",
		"#807dba",
		"#6a51a3",
		"#54278f",
		"#3f007d"
	],
	GnBu: [
		"#f7fcf0",
		"#e0f3db",
		"#ccebc5",
		"#a8ddb5",
		"#7bccc4",
		"#4eb3d3",
		"#2b8cbe",
		"#0868ac",
		"#084081"
	],
	Greys: [
		"#ffffff",
		"#f0f0f0",
		"#d9d9d9",
		"#bdbdbd",
		"#969696",
		"#737373",
		"#525252",
		"#252525",
		"#000000"
	],
	YlOrRd: [
		"#ffffcc",
		"#ffeda0",
		"#fed976",
		"#feb24c",
		"#fd8d3c",
		"#fc4e2a",
		"#e31a1c",
		"#bd0026",
		"#800026"
	],
	PuRd: [
		"#f7f4f9",
		"#e7e1ef",
		"#d4b9da",
		"#c994c7",
		"#df65b0",
		"#e7298a",
		"#ce1256",
		"#980043",
		"#67001f"
	],
	Blues: [
		"#f7fbff",
		"#deebf7",
		"#c6dbef",
		"#9ecae1",
		"#6baed6",
		"#4292c6",
		"#2171b5",
		"#08519c",
		"#08306b"
	],
	PuBuGn: [
		"#fff7fb",
		"#ece2f0",
		"#d0d1e6",
		"#a6bddb",
		"#67a9cf",
		"#3690c0",
		"#02818a",
		"#016c59",
		"#014636"
	],
	Viridis: [
		"#440154",
		"#482777",
		"#3f4a8a",
		"#31678e",
		"#26838f",
		"#1f9d8a",
		"#6cce5a",
		"#b6de2b",
		"#fee825"
	],
	Spectral: [
		"#9e0142",
		"#d53e4f",
		"#f46d43",
		"#fdae61",
		"#fee08b",
		"#ffffbf",
		"#e6f598",
		"#abdda4",
		"#66c2a5",
		"#3288bd",
		"#5e4fa2"
	],
	RdYlGn: [
		"#a50026",
		"#d73027",
		"#f46d43",
		"#fdae61",
		"#fee08b",
		"#ffffbf",
		"#d9ef8b",
		"#a6d96a",
		"#66bd63",
		"#1a9850",
		"#006837"
	],
	RdBu: [
		"#67001f",
		"#b2182b",
		"#d6604d",
		"#f4a582",
		"#fddbc7",
		"#f7f7f7",
		"#d1e5f0",
		"#92c5de",
		"#4393c3",
		"#2166ac",
		"#053061"
	],
	PiYG: [
		"#8e0152",
		"#c51b7d",
		"#de77ae",
		"#f1b6da",
		"#fde0ef",
		"#f7f7f7",
		"#e6f5d0",
		"#b8e186",
		"#7fbc41",
		"#4d9221",
		"#276419"
	],
	PRGn: [
		"#40004b",
		"#762a83",
		"#9970ab",
		"#c2a5cf",
		"#e7d4e8",
		"#f7f7f7",
		"#d9f0d3",
		"#a6dba0",
		"#5aae61",
		"#1b7837",
		"#00441b"
	],
	RdYlBu: [
		"#a50026",
		"#d73027",
		"#f46d43",
		"#fdae61",
		"#fee090",
		"#ffffbf",
		"#e0f3f8",
		"#abd9e9",
		"#74add1",
		"#4575b4",
		"#313695"
	],
	BrBG: [
		"#543005",
		"#8c510a",
		"#bf812d",
		"#dfc27d",
		"#f6e8c3",
		"#f5f5f5",
		"#c7eae5",
		"#80cdc1",
		"#35978f",
		"#01665e",
		"#003c30"
	],
	RdGy: [
		"#67001f",
		"#b2182b",
		"#d6604d",
		"#f4a582",
		"#fddbc7",
		"#ffffff",
		"#e0e0e0",
		"#bababa",
		"#878787",
		"#4d4d4d",
		"#1a1a1a"
	],
	PuOr: [
		"#7f3b08",
		"#b35806",
		"#e08214",
		"#fdb863",
		"#fee0b6",
		"#f7f7f7",
		"#d8daeb",
		"#b2abd2",
		"#8073ac",
		"#542788",
		"#2d004b"
	],
	Set2: [
		"#66c2a5",
		"#fc8d62",
		"#8da0cb",
		"#e78ac3",
		"#a6d854",
		"#ffd92f",
		"#e5c494",
		"#b3b3b3"
	],
	Accent: [
		"#7fc97f",
		"#beaed4",
		"#fdc086",
		"#ffff99",
		"#386cb0",
		"#f0027f",
		"#bf5b17",
		"#666666"
	],
	Set1: [
		"#e41a1c",
		"#377eb8",
		"#4daf4a",
		"#984ea3",
		"#ff7f00",
		"#ffff33",
		"#a65628",
		"#f781bf",
		"#999999"
	],
	Set3: [
		"#8dd3c7",
		"#ffffb3",
		"#bebada",
		"#fb8072",
		"#80b1d3",
		"#fdb462",
		"#b3de69",
		"#fccde5",
		"#d9d9d9",
		"#bc80bd",
		"#ccebc5",
		"#ffed6f"
	],
	Dark2: [
		"#1b9e77",
		"#d95f02",
		"#7570b3",
		"#e7298a",
		"#66a61e",
		"#e6ab02",
		"#a6761d",
		"#666666"
	],
	Paired: [
		"#a6cee3",
		"#1f78b4",
		"#b2df8a",
		"#33a02c",
		"#fb9a99",
		"#e31a1c",
		"#fdbf6f",
		"#ff7f00",
		"#cab2d6",
		"#6a3d9a",
		"#ffff99",
		"#b15928"
	],
	Pastel2: [
		"#b3e2cd",
		"#fdcdac",
		"#cbd5e8",
		"#f4cae4",
		"#e6f5c9",
		"#fff2ae",
		"#f1e2cc",
		"#cccccc"
	],
	Pastel1: [
		"#fbb4ae",
		"#b3cde3",
		"#ccebc5",
		"#decbe4",
		"#fed9a6",
		"#ffffcc",
		"#e5d8bd",
		"#fddaec",
		"#f2f2f2"
	]
};
for (let e of Object.keys(ln)) ln[e.toLowerCase()] = ln[e];
// node_modules/.pnpm/chroma-js@2.6.0/node_modules/chroma-js/index.js
Object.assign(T, {
	average: Dt,
	bezier: Pt,
	blend: R,
	cubehelix: Rt,
	mix: F,
	interpolate: F,
	random: Ht,
	scale: At,
	analyze: qt,
	contrast: Yt,
	deltaE: an,
	distance: on,
	limits: Jt,
	valid: sn,
	scales: cn,
	input: S,
	colors: M,
	brewer: ln
});
var U = T, un = /* @__PURE__ */ c((/* @__PURE__ */ o(((e, t) => {
	var n = Object.prototype.hasOwnProperty;
	t.exports = function(e, t) {
		var r = {};
		for (var i in e) n.call(e, i) && (r[i] = t(e[i], i, e));
		return r;
	};
})))(), 1), dn = {
	SIGNAL: "signal",
	DIRECT: "direct",
	FURTHEST: "furthest"
}, fn = (e) => Math.max(0, Math.min(1, e));
function W(e) {
	if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(e)) throw TypeError(`Expected an opaque hex color, got ${e}`);
	let t = e.length === 4 ? e.slice(1).split("").map((e) => e + e).join("") : e.slice(1);
	return [
		0,
		2,
		4
	].map((e) => parseInt(t.slice(e, e + 2), 16) / 255);
}
var G = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, pn = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055;
function K(e) {
	let [t, n, r] = W(e).map(G);
	return .2126 * t + .7152 * n + .0722 * r;
}
function q(e, t) {
	let n = K(e), r = K(t);
	return (Math.max(n, r) + .05) / (Math.min(n, r) + .05);
}
function mn(e, t, n) {
	e = G(e), t = G(t), n = G(n);
	let r = Math.cbrt(.4122214708 * e + .5363325363 * t + .0514459929 * n), i = Math.cbrt(.2119034982 * e + .6806995451 * t + .1073969566 * n), a = Math.cbrt(.0883024619 * e + .2817188376 * t + .6299787005 * n);
	return [
		.2104542553 * r + .793617785 * i - .0040720468 * a,
		1.9779984951 * r - 2.428592205 * i + .4505937099 * a,
		.0259040371 * r + .7827717662 * i - .808675766 * a
	];
}
function J(e) {
	return mn(...W(e));
}
function hn([e, t, n]) {
	let r = (e + .3963377774 * t + .2158037573 * n) ** 3, i = (e - .1055613458 * t - .0638541728 * n) ** 3, a = (e - .0894841775 * t - 1.291485548 * n) ** 3;
	return [
		4.0767416621 * r - 3.3077115913 * i + .2309699292 * a,
		-1.2684380046 * r + 2.6097574011 * i - .3413193965 * a,
		-.0041960863 * r - .7034186147 * i + 1.707614701 * a
	];
}
function gn([e, t, n]) {
	e = fn(e);
	let r = hn([
		e,
		t,
		n
	]), i = (e) => e.every((e) => e >= -1e-7 && e <= 1 + 1e-7);
	if (!i(r)) {
		let a = 0, o = 1;
		for (let r = 0; r < 20; r++) {
			let r = (a + o) / 2;
			i(hn([
				e,
				t * r,
				n * r
			])) ? a = r : o = r;
		}
		r = hn([
			e,
			t * a,
			n * a
		]);
	}
	return r.map((e) => fn(pn(e)));
}
function _n(e) {
	return "#" + gn(e).map((e) => Math.round(e * 255).toString(16).padStart(2, "0")).join("");
}
function Y(e, t, n) {
	if (!Number.isFinite(n) || n < 0 || n > 1) throw RangeError("Mix amount must be between 0 and 1");
	let r = J(e), i = J(t);
	return n === 0 ? e : n === 1 ? t : _n(r.map((e, t) => e + (i[t] - e) * n));
}
// src/private/cache.ts
var vn = "MISS";
function yn(e, t, n) {
	let r = e;
	for (let e = 0; e < t.length; e++) {
		let i = t[e];
		e === t.length - 1 ? r.set(i, n) : (r.has(i) || r.set(i, /* @__PURE__ */ new Map()), r = r.get(i));
	}
}
function bn(e, t) {
	let n = e;
	for (let e = 0; e < t.length; e++) {
		let r = t[e];
		if (!(n instanceof Map) || !n.has(r)) return vn;
		n = n.get(r);
	}
	return n;
}
var xn = class {
	constructor(e = 500) {
		this.resetAtItemCount = e, this.cached = /* @__PURE__ */ new Map(), this.itemCount = 0, this.tries = 0, this.hits = 0;
	}
	set(e, t) {
		this.itemCount > this.resetAtItemCount && this.reset(), yn(this.cached, e, t), this.itemCount++;
	}
	get(e) {
		let t = bn(this.cached, e);
		return this.tries++, t === vn ? null : (this.hits++, t);
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
function Sn(e, t, n) {
	if (n === 0) return e;
	if (n === 1) return t;
	let r = K(e), i = K(t);
	if (Math.abs(i - r) < 1e-10) return Y(e, t, n);
	let a = i > r, o = q(e, t) ** n, s = a ? (r + .05) * o - .05 : (r + .05) / o - .05, c = 0, l = 1, u = e, d = Math.abs(s - r);
	for (let n = 0; n < 18; n++) {
		let n = (c + l) / 2, r = Y(e, t, n), i = K(r), o = Math.abs(i - s);
		o < d && (u = r, d = o), (a ? i < s : i > s) ? c = n : l = n;
	}
	return u;
}
// src/private/fadeColor.ts
function Cn(e, t, n) {
	if (n === 0) return e;
	if (n === 1) return t;
	let r = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, i = (e) => e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055, a = W(e).map(r), o = W(t).map(r);
	return "#" + a.map((e, t) => Math.round(Math.max(0, Math.min(1, i(e + (o[t] - e) * n))) * 255).toString(16).padStart(2, "0")).join("");
}
// src/Color.ts
var X = new xn(), wn = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap();
function Dn(e) {
	let t = En.get(e);
	return t || (t = Array.from({ length: 257 }, (t, n) => {
		let r = e(n / 256);
		return {
			lab: r,
			luminance: U(U.lab(...r).hex()).luminance()
		};
	}), En.set(e, t)), t;
}
typeof window < "u" && (window.cache = X);
var On = class {
	constructor(e) {
		if (!e) throw Error("`lab` is required");
		this.lab = e, this.hex = U.lab(...this.lab).hex();
	}
	alpha(e) {
		return U(this.hex).alpha(e).hex();
	}
	toString() {
		return this.hex;
	}
}, kn = class e extends On {
	constructor({ theme: e, bgColor: t = null, lab: n, ramp: r = null, baseRamp: i = null }) {
		if (super(n), !e) throw Error("`theme` is required");
		if (i && (i.startL === void 0 || i.endL === void 0)) throw Error("`baseRamp` can't be a direct ramp");
		if (!i && (!t || t.baseRamp) && !e.ramps.gray) throw Error("No baseRamp");
		this.theme = e, this.bgColor = t, this.ramp = r, this.baseRamp = i || t && t.baseRamp || e.ramps.gray, this.lightness = n[0];
	}
	static fromTheme(t) {
		if (!(t instanceof zn)) throw TypeError("Need to give me a Theme instance, not a \"theme config\"");
		let n = t.ramps[t.bgRamp], r = n(t.bgRampValue);
		return new e({
			theme: t,
			bgColor: null,
			lab: r,
			ramp: n,
			baseRamp: n
		});
	}
	contrast(t = 100, n = this.baseRamp) {
		return this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1 ? X.at([
			this,
			"fadeContrast",
			t,
			n
		], () => this.fadeEnabled(n, (e, n) => e.contrast(t, n))) : n.config.mode === "direct" ? this.direct(n) : X.at([
			this.hex,
			this.baseRamp,
			t,
			n
		], () => {
			let { theme: r } = this, i = n === r.ramps[r.bgRamp];
			if (i && r.rescaleContrastToGrayRange && t >= 0) {
				let i = Math.max(0, Math.min(1, t / 100 * r.contrastMultiplier));
				if (i === 0) return this;
				let a = n(0), o = 0, s, c = Infinity, l = Dn(n), u = U(this.hex).luminance(), d = (e) => (Math.max(u, e) + .05) / (Math.min(u, e) + .05), f = Math.min(l[0].luminance, l[l.length - 1].luminance), p = Math.max(l[0].luminance, l[l.length - 1].luminance), m = d(p) > d(f), h = Math.max(d(f), d(p));
				if (h <= 1 + 1e-10) return this;
				let g = h ** i;
				for (let { lab: e, luminance: t } of l) {
					if (m ? t < u : t > u) continue;
					let n = (Math.max(u, t) + .05) / (Math.min(u, t) + .05);
					n > o && (a = e, o = n), n >= g && n < c && (s = e, c = n);
				}
				return new e({
					theme: r,
					bgColor: this,
					lab: s ?? a,
					ramp: n
				});
			}
			if (n.config.mode === "furthest" && r.rescaleContrastToGrayRange && t >= 0) {
				let i = Math.max(0, Math.min(1, t / 100 * r.contrastMultiplier));
				if (i === 0) return this;
				let a = r.ramps[r.bgRamp], o = [0, 1].map((e) => U.lab(...a(e)).hex()).sort((e, t) => K(e) - K(t)), s = U.contrast(this.hex, o[1]) > U.contrast(this.hex, o[0]), c = [0, 1].map((e) => U.lab(...n(e)).hex()).sort((e, t) => K(e) - K(t))[+!!s], l = (s ? K(c) >= K(this.hex) : K(c) <= K(this.hex)) ? Sn(this.hex, c, i) : this.hex;
				return new e({
					theme: r,
					bgColor: this,
					lab: U(l).lab(),
					ramp: n
				});
			}
			if (n.config.mode === "signal" && r.rescaleContrastToGrayRange && t >= 0) {
				let i = Math.max(0, Math.min(1, t / 100 * r.contrastMultiplier));
				if (i === 0) return this;
				let a = r.ramps[r.bgRamp], [o, s] = [0, 1].map((e) => U.lab(...a(e)).hex()).sort((e, t) => K(e) - K(t)), c = U.contrast(this.hex, s) > U.contrast(this.hex, o), l = c ? r.endSignalLightness : r.startSignalLightness, [u, d, f] = J(U.lab(...n(l)).hex()), p = J(o)[0], m = J(s)[0];
				if (Math.abs(m - p) < 1e-7) return this;
				let [h] = J(this.hex), g = Math.max(0, Math.min(1, c ? (u - p) / (m - p) : (m - u) / (m - p))), _ = c ? m : p, v = h + (_ - h) * g, y = _n([
					v,
					d,
					f
				]), b = (e) => c ? K(e) >= K(this.hex) : K(e) <= K(this.hex);
				for (let e = 0; e < 24 && !b(y); e++) v = (v + _) / 2, y = _n([
					v,
					d,
					f
				]);
				b(y) || (y = this.hex);
				let x = Sn(this.hex, y, i);
				return b(x) || (x = this.hex), new e({
					theme: r,
					bgColor: this,
					lab: U(x).lab(),
					ramp: n
				});
			}
			let [a, o] = this._getMinMax(n), [s, c] = this._getMinMax(this.ramp), l = (this.lightness - s) / (c - s), u = (() => {
				let e = (a + o) / 2;
				return (this.lightness < e ? 1 : -1) * ((o - a) / 100);
			})(), d = (() => {
				let e = 1, t = 1, n = 1;
				if ((i || r.contrastMultiplier < 1) && (e = r.contrastMultiplier), r.rescaleContrastToGrayRange && i && (t = Math.abs(l - .5) + .5), !i) {
					let e = (a + o) / 2;
					n = this.lightness < e ? r.endSignalLightness : 1 - r.startSignalLightness;
				}
				return e * t * n;
			})(), f = (this.lightness + t * u * d - (n.startL ?? NaN)) / ((n.endL ?? NaN) - (n.startL ?? NaN)), [p, m, h] = this.lab, [g, _, v] = n(f), y = i || r.contrastMultiplier > 1 ? 1 : r.contrastMultiplier, b = [
				p + (g - p) * 1,
				m + (_ - m) * y,
				h + (v - h) * y
			];
			return new e({
				theme: r,
				bgColor: this,
				lab: b,
				ramp: n
			});
		});
	}
	direct(t) {
		return this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1 ? X.at([
			this,
			"fadeDirect",
			t
		], () => this.fadeEnabled(t, (e, t) => e.direct(t))) : X.at([this.hex, t], () => {
			if (t.config.mode !== "direct") throw Error("Not allowed");
			let { theme: n, baseRamp: r } = this, [i, a, o] = t((this.lightness - (r.startL ?? NaN)) / ((r.endL ?? NaN) - (r.startL ?? NaN))), [s, c, l] = this.lab, u = Math.min(n.contrastMultiplier, 1), d = [
				s + (i - s) * u,
				c + (a - c) * u,
				l + (o - l) * u
			];
			return new e({
				theme: n,
				bgColor: this,
				lab: d,
				ramp: t
			});
		});
	}
	fadeEnabled(t, n) {
		let r = wn.get(this.theme);
		r || (r = new zn({
			...this.theme.config,
			contrastMultiplier: 1
		}), wn.set(this.theme, r));
		let i = (e) => {
			if (!e) return null;
			let t = Object.keys(this.theme.ramps).find((t) => this.theme.ramps[t] === e);
			return t === void 0 ? e : r.ramps[t];
		}, a = Tn.get(this) ?? {
			color: new e({
				theme: r,
				lab: this.lab,
				ramp: i(this.ramp),
				baseRamp: i(this.baseRamp)
			}),
			origin: this.hex
		}, o = n(a.color, i(t)), s = Cn(a.origin, o.hex, this.theme.contrastMultiplier), c = new e({
			theme: this.theme,
			bgColor: this,
			lab: U(s).lab(),
			ramp: t
		});
		return Tn.set(c, {
			color: o,
			origin: a.origin
		}), c;
	}
	base(t) {
		let n = new e({
			theme: this.theme,
			bgColor: this.bgColor,
			lab: this.lab,
			ramp: this.ramp,
			baseRamp: t
		}), r = Tn.get(this);
		if (r) {
			let e = Object.keys(this.theme.ramps).find((e) => this.theme.ramps[e] === t), i = e === void 0 ? t : r.color.theme.ramps[e];
			Tn.set(n, {
				color: r.color.base(i),
				origin: r.origin
			});
		}
		return n;
	}
	alpha(e) {
		return U.lab(...this.lab).alpha(e * this.theme.contrastMultiplier).hex();
	}
	shadowColor(e = 1) {
		return U.lab(...this.theme.ramps.gray(0)).alpha(this.theme.contrastMultiplier * e);
	}
	_getMinMax(e) {
		let t = this.theme.ramps[this.theme.bgRamp];
		return !e || e.config.mode === "direct" ? [t.startL ?? NaN, t.endL ?? NaN] : [Math.max(e.startL ?? NaN, t.startL ?? NaN), Math.min(e.endL ?? NaN, t.endL ?? NaN)];
	}
};
function An(e) {
	return Math.max(0, U(e).get("lab.l"));
}
// src/private/baseThemeConfig.ts
var jn = 20, Mn = 50, Nn = 60, Pn = [
	[0, "red"],
	[1, "yellow"],
	[2, "green"],
	[4, "blue"],
	[5, "purple"]
], Fn = 60, In = Object.fromEntries(Pn.map(([e, t]) => [t, U.hcl(Fn * e + jn, Nn, Mn).hex()])), Ln = Object.fromEntries(Pn.map(([, e]) => [e, {
	colors: [
		"black",
		e,
		"white"
	],
	mode: "signal"
}])), Z = {
	id: 0,
	name: "Base",
	pallet: {
		black: "#000000",
		white: "#ffffff",
		...In
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
		...Ln
	},
	bgRamp: "gray",
	bgRampValue: 1,
	startSignalLightness: .49,
	endSignalLightness: .49,
	contrastMultiplier: 1,
	rescaleContrastToGrayRange: !0
}, Rn = [
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
], Q = {
	colors: ["black", "white"],
	colorModel: "lab",
	correctLightness: !0,
	mode: dn.FURTHEST
}, zn = class {
	constructor(e = Z) {
		this.config = e;
		for (let t of Object.keys(e)) if (!Rn.includes(t)) throw Error(`${t} isn't allowed in Theme`);
		this.id = e.id, this.name = e.name, this.pallet = e.pallet, this.bgRamp = e.bgRamp, this.bgRampValue = e.bgRampValue, this.startSignalLightness = e.startSignalLightness, this.endSignalLightness = e.endSignalLightness, this.contrastMultiplier = e.contrastMultiplier, this.rescaleContrastToGrayRange = e.rescaleContrastToGrayRange, this.ramps = (0, un.default)(e.ramps, (t) => Bn(e, t));
	}
};
function Bn(e, t) {
	let n = {
		...Q,
		...t,
		colors: t.colors ?? Q.colors,
		colorModel: t.colorModel ?? Q.colorModel,
		correctLightness: t.correctLightness ?? Q.correctLightness,
		mode: t.mode ?? Q.mode
	}, r = n.colors.map((t) => {
		if (t in e.pallet) return e.pallet[t];
		throw Error(`Couldn't find color "${t}" in themeConfig.pallet`);
	}), i = U.scale(r);
	n.colorModel && i.mode(n.colorModel), n.classes && i.classes(n.classes);
	let a;
	switch (n.mode) {
		case dn.DIRECT:
			a = Un(i);
			break;
		case dn.SIGNAL:
		default: n.correctLightness && i.correctLightness(), a = Hn(i);
	}
	return a.config = n, a;
}
function Vn(e) {
	return (t) => e(t).lab();
}
function Hn(e) {
	let t = Vn(e);
	return t.startL = An(e(0)), t.endL = An(e(1)), t;
}
function Un(e) {
	return Vn(e);
}
// src/core/relative.ts
function Wn(e, t, n, r = 1, i = !0) {
	if (!Number.isFinite(r) || r < 0 || r > 1) throw RangeError("contrast must be between 0 and 1");
	let a = Object.fromEntries(n.colors.slice(1, -1).map((e, t) => [`stop${t}`, e])), o = new zn({
		...Z,
		pallet: {
			...Z.pallet,
			...t,
			...a,
			black: n.colors[0],
			white: n.colors[n.colors.length - 1]
		},
		ramps: i ? {
			...Z.ramps,
			gray: {
				colors: [
					"black",
					...Object.keys(a),
					"white"
				],
				colorModel: n.colorModel
			}
		} : Z.ramps,
		contrastMultiplier: r
	});
	return new kn({
		theme: o,
		lab: U(e).lab(),
		ramp: o.ramps.gray
	});
}
// src/core/theme.ts
var Gn = [
	"red",
	"yellow",
	"green",
	"blue",
	"purple"
], Kn = [
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
], qn = {
	red: "#d14457",
	yellow: "#9d6f00",
	green: "#298830",
	blue: "#0082dc",
	purple: "#a359b9"
}, Jn = (e) => ({
	color: e,
	luminance: K(e)
}), Yn = (e, t) => (Math.max(e, t) + .05) / (Math.min(e, t) + .05);
function $(e, t, n, r = e) {
	let i = t[0].color, a = 0, o = "", s = Infinity, c = K(e), l = K(r);
	for (let { color: e, luminance: r } of t) {
		let t = Math.min(Yn(c, r), Yn(l, r));
		t > a && (i = e, a = t), t >= n && t < s && (o = e, s = t);
	}
	return o || i;
}
function Xn(e) {
	let t = e.neutral !== void 0;
	if (t && (e.dark !== void 0 || e.light !== void 0)) throw TypeError("Pass either neutral.colors or dark/light, not both");
	let n = Object.freeze([...e.neutral?.colors ?? [e.dark ?? "#000000", e.light ?? "#ffffff"]]);
	if (n.length < 2) throw RangeError("neutral.colors needs at least two colors");
	for (let e of n) W(e);
	let r = n[0], i = n[n.length - 1];
	if (K(r) > K(i)) throw RangeError("dark must be darker than light");
	let a = e.neutral?.colorModel ?? "oklab";
	if (!Kn.includes(a)) throw TypeError(`Unknown color model: ${a}`);
	let o = U.scale([...n]).mode(a);
	return {
		custom: t,
		stops: n,
		dark: r,
		light: i,
		colorModel: a,
		ramp: (e) => {
			if (!Number.isFinite(e) || e < 0 || e > 1) throw RangeError("Mix amount must be between 0 and 1");
			return t ? o(e).hex() : Y(r, i, e);
		}
	};
}
function Zn(e = {}) {
	let { custom: t, stops: n, dark: r, light: i, colorModel: a, ramp: o } = Xn(e), s = o(e.background ?? 1), c = Object.freeze({
		...qn,
		...e.colors
	});
	for (let e of Object.values(c)) W(e);
	let l = Array.from({ length: 257 }, (e, t) => Jn(o(t / 256))), u = l.map((e) => J(e.color)), d = (e) => {
		let [t, n, r] = J(e), i = -1, a = Infinity;
		return u.forEach(([e, o, s], c) => {
			let l = Math.hypot(t - e, n - o, r - s);
			l < a && ([i, a] = [c, l]);
		}), a < .01 ? i / 256 : void 0;
	}, f = (e, n) => {
		let i = t ? d(e) : void 0;
		if (i === void 0) return (t) => Y(e, n, t);
		let a = n === r ? 0 : 1;
		return (t) => t === 0 ? e : o(i + (a - i) * t);
	}, p = J(r)[0], m = J(i)[0], h = Object.fromEntries(Gn.map((e) => {
		let [, t, n] = J(c[e]);
		return [e, Array.from({ length: 257 }, (e, r) => Jn(_n([
			p + (m - p) * r / 256,
			t,
			n
		])))];
	})), g = (e, t) => {
		let n = K(e), a = q(e, i) > q(e, r), o = h[t].filter((e) => a ? e.luminance >= n : e.luminance <= n);
		return o.length ? o : [Jn(e)];
	}, _ = /* @__PURE__ */ new Map(), v = (e = s, t = e) => {
		W(e), W(t);
		let n = e + t, a = _.get(n);
		if (a) return a;
		let o = Math.max(q(e, r), q(e, i)), c = Math.min(1, (q(r, i) - 1) / 6), u = Object.freeze({
			background: e,
			foreground: $(e, l, Math.min(7, o)),
			muted: $(e, l, Math.min(4.5, o)),
			border: $(e, l, 3, t),
			...Object.fromEntries(Gn.map((t) => [t, $(e, g(e, t), 1 + 3.5 * c)]))
		});
		return _.size >= 512 && _.clear(), _.set(n, u), u;
	}, y = /* @__PURE__ */ new Map(), b = K(r), x = K(i), S = q(r, i) >= 4.5, C = (e) => Math.max(Yn(e, b), Yn(e, x)) >= 4.5, w = (e, t) => {
		let n = e + ":" + t, a = y.get(n);
		if (a) return a;
		let o;
		if (typeof t == "string") {
			if (!Gn.includes(t)) throw TypeError(`Unknown hue: ${t}`);
			let n = g(e, t), a = S ? n.filter((e) => C(e.luminance)) : n, s = Math.min(1, (q(r, i) - 1) / 6);
			o = $(e, a.length ? a : n, 1 + 2 * s);
		} else {
			let n = q(e, r) >= q(e, i) ? r : i, a = f(e, n);
			if (o = a(t / 100), t !== 0 && S && !C(K(o))) {
				let e = Infinity;
				for (let n = 0; n <= 256; n++) {
					let r = a(n / 256), i = Math.abs(n / 256 - t / 100);
					i < e && C(K(r)) && (o = r, e = i);
				}
			}
		}
		return y.size >= 512 && y.clear(), y.set(n, o), o;
	}, T = Object.freeze({
		colors: n,
		colorModel: a
	}), E = Wn(s, c, T, e.contrast, t);
	return Object.freeze({
		background: s,
		dark: r,
		light: i,
		neutral: T,
		colors: c,
		ramp: o,
		tokens: v,
		surface: w,
		relative: E
	});
}
function Qn(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [`--huet-${e}`, t]));
}
export { dn as _, Xn as a, c as b, Z as c, An as d, q as f, J as g, gn as h, Gn as i, On as l, mn as m, Zn as n, Qn as o, K as p, qn as r, zn as s, Kn as t, kn as u, U as v, o as y };

//# sourceMappingURL=theme-NOxmHyYn.js.map