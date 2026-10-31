import { a as e, d as t, f as n, h as r, i, l as a, o, p as s, r as c, t as l, u } from "./theme-DneS7YmB.js";
// src/core/gpu.ts
var d = "#version 300 es\nin vec2 position;\nout vec2 uv;\nvoid main() {\n  uv = position * 0.5 + 0.5;\n  gl_Position = vec4(position, 0.0, 1.0);\n}", f = "#version 300 es\nprecision highp float;\nprecision highp sampler3D;\nuniform sampler2D image;\nuniform sampler3D lut;\nuniform float size;\nin vec2 uv;\nout vec4 color;\nvoid main() {\n  vec4 c = texture(image, vec2(uv.x, 1.0 - uv.y));\n  // Sample lattice centers so 0 and 1 hit the first and last LUT entries.\n  vec3 p = (c.rgb * (size - 1.0) + 0.5) / size;\n  color = vec4(texture(lut, p).rgb, c.a);\n}", p = class {
	constructor() {
		this.canvas = document.createElement("canvas"), this.textures = /* @__PURE__ */ new WeakMap(), this.scratch = null, this.currentLut = null;
		let e = this.canvas.getContext("webgl2", {
			premultipliedAlpha: !1,
			preserveDrawingBuffer: !0
		});
		if (!e) throw Error("WebGL2 is not available");
		this.gl = e;
		let t = e.createProgram();
		for (let [n, r] of [[e.VERTEX_SHADER, d], [e.FRAGMENT_SHADER, f]]) {
			let i = e.createShader(n);
			if (e.shaderSource(i, r), e.compileShader(i), !e.getShaderParameter(i, e.COMPILE_STATUS)) throw Error(e.getShaderInfoLog(i) ?? "Shader error");
			e.attachShader(t, i);
		}
		e.linkProgram(t), e.useProgram(t);
		let n = e.createBuffer();
		e.bindBuffer(e.ARRAY_BUFFER, n), e.bufferData(e.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			1,
			-1,
			-1,
			1,
			1,
			1
		]), e.STATIC_DRAW);
		let r = e.getAttribLocation(t, "position");
		e.enableVertexAttribArray(r), e.vertexAttribPointer(r, 2, e.FLOAT, !1, 0, 0), e.uniform1i(e.getUniformLocation(t, "image"), 0), e.uniform1i(e.getUniformLocation(t, "lut"), 1), this.sizeLocation = e.getUniformLocation(t, "size"), this.lut = e.createTexture(), e.pixelStorei(e.UNPACK_ALIGNMENT, 1);
	}
	setLut(e, t) {
		if (e === this.currentLut) return;
		let n = this.gl;
		n.activeTexture(n.TEXTURE1), n.bindTexture(n.TEXTURE_3D, this.lut);
		let r = Uint8Array.from(e, (e) => e * 255 + .5);
		n.texImage3D(n.TEXTURE_3D, 0, n.RGB8, t, t, t, 0, n.RGB, n.UNSIGNED_BYTE, r);
		for (let e of [
			n.TEXTURE_WRAP_S,
			n.TEXTURE_WRAP_T,
			n.TEXTURE_WRAP_R
		]) n.texParameteri(n.TEXTURE_3D, e, n.CLAMP_TO_EDGE);
		n.texParameteri(n.TEXTURE_3D, n.TEXTURE_MIN_FILTER, n.LINEAR), n.texParameteri(n.TEXTURE_3D, n.TEXTURE_MAG_FILTER, n.LINEAR), n.uniform1f(this.sizeLocation, t), this.currentLut = e;
	}
	texture(e) {
		let t = this.gl;
		t.activeTexture(t.TEXTURE0);
		let n = e instanceof HTMLImageElement || e instanceof ImageBitmap, r = n ? this.textures.get(e) : void 0;
		r ? t.bindTexture(t.TEXTURE_2D, r) : (r = n ? t.createTexture() : this.scratch ??= t.createTexture(), t.bindTexture(t.TEXTURE_2D, r), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, e), t.generateMipmap(t.TEXTURE_2D), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR_MIPMAP_LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), n && this.textures.set(e, r));
	}
	render(e, t, n, r) {
		let i = this.gl;
		this.texture(e);
		for (let e of [this.canvas, t]) e.width !== n && (e.width = n), e.height !== r && (e.height = r);
		i.viewport(0, 0, n, r), i.drawArrays(i.TRIANGLE_STRIP, 0, 4);
		let a = t.getContext("2d");
		a.clearRect(0, 0, n, r), a.drawImage(this.canvas, 0, 0);
	}
	finish() {
		let e = /* @__PURE__ */ new Uint8Array(4);
		this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, e);
	}
}, m = { neutral: ["#000000", "#ffffff"] }, h = (e) => e < .20689655172413793 ? (e / t) ** 2 : 1, g = /* @__PURE__ */ new Map();
function _(t) {
	let n = JSON.stringify(t), a = g.get(n);
	if (a) return a;
	l(t);
	let { colors: s } = t, { ramp: d } = e(o(t)), f = /* @__PURE__ */ new Float64Array(257), p = /* @__PURE__ */ new Float64Array(257), m = /* @__PURE__ */ new Float64Array(257);
	for (let e = 0; e < 257; e++) {
		let [t, n, i] = r(d(e / 256));
		f[e] = Math.max(u(t), e ? f[e - 1] : 0), p[e] = n, m[e] = i;
	}
	let h = f[0], _ = f[256], v = [0, 0], y = (e) => {
		let t = h + e * (_ - h), n = 0, r = 256;
		if (t <= h) r = 0;
		else if (t >= _) n = 256;
		else for (; r - n > 1;) {
			let e = n + r >> 1;
			f[e] < t ? n = e : r = e;
		}
		let i = f[r] > f[n] ? (t - f[n]) / (f[r] - f[n]) : 0;
		return v[0] = p[n] + i * (p[r] - p[n]), v[1] = m[n] + i * (m[r] - m[n]), v;
	}, b = i.map((e) => r(s?.[e] ?? c[e]));
	return a = {
		low: h,
		high: _,
		neutralAt: y,
		a: Float64Array.from(b, (e) => e[1]),
		b: Float64Array.from(b, (e) => e[2])
	}, g.size >= 64 && g.clear(), g.set(n, a), a;
}
function v(e) {
	let t = i.length, n = (t) => Math.atan2(e.b[t], e.a[t]), r = Array.from({ length: t }, (e, t) => t).sort((e, t) => n(e) - n(t)), a = r.map((n, i) => {
		let a = r[(i + 1) % t], [o, s, c, l] = [
			e.a[n],
			e.b[n],
			e.a[a],
			e.b[a]
		], u = o * l - c * s;
		return {
			i0: n,
			i1: a,
			det: u,
			m: [
				l / u,
				-c / u,
				-s / u,
				o / u
			]
		};
	}), { low: o, high: s } = e, c = s - o || 1, l = {
		t: 0,
		i0: 0,
		i1: 0,
		w0: 0,
		w1: 0
	};
	return ([n, r, i]) => {
		let s = (u(n) - o) / c, [d, f] = e.neutralAt(s), p = h(n), m = (r - d) * p, g = (i - f) * p;
		if (l.t = s, l.w0 = l.w1 = 0, m * m + g * g < 1e-10) return l;
		for (let { i0: e, i1: t, det: n, m: r } of a) {
			if (n <= 1e-12) continue;
			let i = r[0] * m + r[1] * g, a = r[2] * m + r[3] * g;
			if (i >= -1e-9 && a >= -1e-9) return Object.assign(l, {
				i0: e,
				i1: t,
				w0: Math.max(0, i),
				w1: Math.max(0, a)
			}), l;
		}
		let _ = -Infinity;
		for (let n = 0; n < t; n++) {
			let t = e.a[n] ** 2 + e.b[n] ** 2, r = (m * e.a[n] + g * e.b[n]) / (t || 1), i = r * Math.sqrt(t);
			i > _ && (Object.assign(l, {
				i0: n,
				i1: n,
				w0: Math.max(0, r),
				w1: 0
			}), _ = i);
		}
		return l;
	};
}
function y([e, t, r], a = m) {
	let { t: o, i0: s, i1: c, w0: l, w1: u } = v(_(a))(n(e, t, r)), d = {};
	return l > 1e-6 && (d[i[s]] = l), u > 1e-6 && (d[i[c]] = (d[i[c]] ?? 0) + u), {
		t: o,
		weights: d
	};
}
function b(e, t = {}, r = "images") {
	let i = _(e), o = e[r]?.strength ?? 1, c = e[r]?.tint ?? 1;
	if (!(o >= 0 && o <= 1)) throw RangeError("strength must be between 0 and 1");
	if (!(c >= 0 && c <= 1)) throw RangeError("tint must be between 0 and 1");
	let l = v(_(t.source ?? m)), { low: u, high: d } = i;
	return (e, r, f) => {
		let p = n(e, r, f), { t: m, i0: g, i1: _, w0: v, w1: y } = l(p), b = t.invert ? 1 - m : m, x = c + (1 - c) * Math.max(0, 1 - v - y), S = a(u + b * (d - u)), C = 1 / Math.max(h(S), 1e-6), [w, T] = i.neutralAt(b), E = [
			S,
			x * w + C * (v * i.a[g] + y * i.a[_]),
			x * T + C * (v * i.b[g] + y * i.b[_])
		];
		return s(o === 1 ? E : p.map((e, t) => e + (E[t] - e) * o));
	};
}
function x(e, t, n) {
	let { low: r, high: o, neutralAt: c, a: l, b: u } = _(e), d = n ? i.indexOf(n) : -1, [f, p] = c(t);
	return s([
		a(r + t * (o - r)),
		f + (d >= 0 ? l[d] : 0),
		p + (d >= 0 ? u[d] : 0)
	]);
}
function S(e, t = 33) {
	let n = new Float32Array(t ** 3 * 3), r = 0;
	for (let i = 0; i < t; i++) for (let a = 0; a < t; a++) for (let o = 0; o < t; o++) {
		let s = e(o / (t - 1), a / (t - 1), i / (t - 1));
		n[r++] = s[0], n[r++] = s[1], n[r++] = s[2];
	}
	return n;
}
function C(e, t, n) {
	let r = /* @__PURE__ */ new Int32Array(256), i = /* @__PURE__ */ new Float32Array(256);
	for (let e = 0; e < 256; e++) {
		let t = e / 255 * (n - 1);
		r[e] = Math.min(n - 2, Math.floor(t)), i[e] = t - r[e];
	}
	let a = n * 3, o = n * n * 3;
	for (let n = 0; n < e.length; n += 4) {
		let s = e[n], c = e[n + 1], l = e[n + 2], u = i[s], d = i[c], f = i[l], p = r[s] * 3 + r[c] * a + r[l] * o;
		for (let r = 0; r < 3; r++) {
			let i = p + r, s = t[i] + (t[i + 3] - t[i]) * u, c = t[i + a] + (t[i + a + 3] - t[i + a]) * u, l = t[i + o] + (t[i + o + 3] - t[i + o]) * u, m = t[i + a + o] + (t[i + a + o + 3] - t[i + a + o]) * u, h = s + (c - s) * d, g = l + (m - l) * d;
			e[n + r] = (h + (g - h) * f) * 255;
		}
	}
}
function w(e, t) {
	for (let n = 0; n < e.length; n += 4) {
		let r = t(e[n] / 255, e[n + 1] / 255, e[n + 2] / 255);
		e[n] = r[0] * 255, e[n + 1] = r[1] * 255, e[n + 2] = r[2] * 255;
	}
}
function T(e, t, n = "Huet theme") {
	let r = [`TITLE "${n.replace(/"/g, "'")}"`, `LUT_3D_SIZE ${t}`];
	for (let t = 0; t < e.length; t += 3) r.push(`${e[t].toFixed(6)} ${e[t + 1].toFixed(6)} ${e[t + 2].toFixed(6)}`);
	return r.join("\n") + "\n";
}
// src/core/svgs.ts
var E = /currentcolor|var\(|context-(?:fill|stroke)/i, D = /^\s*(?:inherit|unset)\s*$/i, O = /* @__PURE__ */ new Set([
	"fill",
	"stroke",
	"stop-color",
	"style",
	"class"
]), k = /* @__PURE__ */ new WeakMap();
function A(e) {
	let t;
	try {
		t = e.cssRules;
	} catch {
		return [];
	}
	let n = k.get(e);
	if (n?.size === t.length) return n.rules;
	let r = [], i = (e, t) => {
		for (let n of e) if (n instanceof CSSStyleRule) for (let e of [
			"fill",
			"stroke",
			"stop-color"
		]) {
			let i = n.style.getPropertyValue(e);
			i && r.push({
				selector: n.selectorText,
				paint: e,
				value: i,
				important: n.style.getPropertyPriority(e) === "important",
				media: t
			});
		}
		else n instanceof CSSMediaRule ? i(n.cssRules, [...t, matchMedia(n.media.mediaText)]) : n instanceof CSSSupportsRule ? CSS.supports(n.conditionText) && i(n.cssRules, t) : n instanceof CSSGroupingRule && n.constructor.name !== "CSSStartingStyleRule" && i(n.cssRules, t);
	};
	return i(t, []), k.set(e, {
		size: t.length,
		rules: r
	}), r;
}
var j = (e, t) => {
	try {
		return e.matches(t);
	} catch {
		return !1;
	}
}, M;
function N(e) {
	let t = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)(%?))?\s*\)$/i.exec(e);
	if (t) {
		let e = t[4] === void 0 ? 1 : Number(t[4]) / (t[5] ? 100 : 1);
		return [
			Number(t[1]),
			Number(t[2]),
			Number(t[3]),
			e
		];
	}
	if (!/^(?:oklch|oklab|lch|lab|hwb|hsla?|color)\(/i.test(e)) return null;
	if (!M) {
		let e = document.createElement("canvas");
		e.width = e.height = 1, M = e.getContext("2d", { willReadFrequently: !0 });
	}
	M.clearRect(0, 0, 1, 1), M.fillStyle = "transparent", M.fillStyle = e, M.fillRect(0, 0, 1, 1);
	let [n, r, i, a] = M.getImageData(0, 0, 1, 1).data;
	return [
		n,
		r,
		i,
		a / 255
	];
}
function P(e, t, n = {}) {
	let { selector: r = "svg[data-huet-recolor]", ...i } = n, a = i, o = b(t, a, "svgs"), s = t.svgs?.strength === 0, c = /* @__PURE__ */ new Map(), l, u = !1, d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set(), p = (e, { hadStyle: t, paints: n }) => {
		for (let [t, { via: r, value: i, priority: a, written: o }] of n) if (r === "attribute") {
			if (e.getAttribute(t) !== o) continue;
			i === null ? e.removeAttribute(t) : e.setAttribute(t, i);
		} else e.style.getPropertyValue(t) === o && (i ? e.style.setProperty(t, i, a) : e.style.removeProperty(t));
		!t && e.getAttribute("style") === "" && e.removeAttribute("style");
	}, m = ([e, t, n, r]) => {
		let i = `${e} ${t} ${n} ${r}`, a = c.get(i);
		if (!a) {
			let s = o(e / 255, t / 255, n / 255).map((e) => Math.round(Math.min(1, Math.max(0, e)) * 255));
			a = r === 1 ? `rgb(${s.join(", ")})` : `rgba(${s.join(", ")}, ${r})`, c.set(i, a);
		}
		return a;
	}, h = () => {
		if (l !== void 0 && cancelAnimationFrame(l), l = void 0, u) return;
		for (let [e, t] of d) p(e, t);
		if (d.clear(), f = /* @__PURE__ */ new Set(), s) {
			v.takeRecords();
			return;
		}
		e instanceof SVGElement && e.matches(r) && f.add(e);
		for (let t of e.querySelectorAll(r)) t instanceof SVGElement && f.add(t);
		let t = e.getRootNode(), n = [...t.styleSheets, ...t.adoptedStyleSheets].flatMap(A).filter((e) => e.media.every((e) => e.matches)), i = (e, t, n) => {
			let r = e.style, i = r?.getPropertyValue(t) ?? "";
			if (i && r.getPropertyPriority(t) === "important") return [
				i,
				"style",
				!0
			];
			let a = "", o = "";
			for (let r of n) r.paint === t && j(e, r.selector) && (r.important ? o = r.value : a = r.value);
			if (o) return [
				o,
				"rule",
				!0
			];
			if (i) return [
				i,
				"style",
				!1
			];
			if (a) return [
				a,
				"rule",
				!1
			];
			let s = e instanceof SVGElement ? e.getAttribute(t) : null;
			return s ? [
				s,
				"attribute",
				!1
			] : [
				"",
				"",
				!1
			];
		}, a = /* @__PURE__ */ new Map(), o = (e, t, r, s) => {
			let c = a.get(t);
			c || a.set(t, c = /* @__PURE__ */ new Map());
			let l = c.get(e);
			if (l !== void 0) return l;
			let [u] = i(e, t, r.contains(e) ? s : n);
			return l = u && !D.test(u) ? E.test(u) : t === "stop-color" && !u ? !1 : e.parentElement ? o(e.parentElement, t, r, s) : !1, c.set(e, l), l;
		}, c = [], h = /* @__PURE__ */ new Set();
		for (let e of f) {
			let t = n.filter(({ selector: t }) => j(e, t) || e.querySelector(t) !== null);
			for (let n of [e, ...e.querySelectorAll("*")]) {
				if (!(n instanceof SVGElement) || h.has(n)) continue;
				h.add(n);
				let r = n instanceof SVGStopElement ? ["stop-color"] : ["fill", "stroke"];
				for (let a of r) {
					let [r, s, l] = i(n, a, t);
					if ((!r || D.test(r)) && a !== "stop-color" && !f.has(n) || o(n, a, e, t)) continue;
					let u = N(getComputedStyle(n).getPropertyValue(a));
					u && u[3] > 0 && c.push([
						n,
						a,
						u,
						s,
						l
					]);
				}
			}
		}
		for (let [e, t, n, r, i] of c) {
			let a = d.get(e);
			a || d.set(e, a = {
				hadStyle: e.hasAttribute("style"),
				paints: /* @__PURE__ */ new Map()
			});
			let o = m(n);
			if (r === "attribute" || r === "") a.paints.set(t, {
				via: "attribute",
				value: e.getAttribute(t),
				priority: "",
				written: o
			}), e.setAttribute(t, o);
			else {
				let n = e.style.getPropertyValue(t), r = e.style.getPropertyPriority(t);
				e.style.setProperty(t, o, i ? "important" : ""), a.paints.set(t, {
					via: "style",
					value: n || null,
					priority: r,
					written: e.style.getPropertyValue(t)
				});
			}
		}
		v.takeRecords();
	}, g = () => {
		!u && l === void 0 && (l = requestAnimationFrame(h));
	}, _ = ({ type: e, target: t, attributeName: n, addedNodes: i, removedNodes: a }) => {
		if (!(t instanceof Element)) return !1;
		let o = t.closest(r) !== null;
		if (e === "attributes") return f.has(t) || t.matches(r) ? !0 : o ? O.has(n) : n === "class" && t.querySelector(r) !== null;
		if (o) return !0;
		for (let e of [...i, ...a]) if (e instanceof Element && (e.matches(r) || e.querySelector(r) !== null)) return !0;
		return !1;
	}, v = new MutationObserver((e) => {
		e.some(_) && g();
	});
	return v.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0
	}), h(), {
		update(e, t) {
			if (u) throw Error("Cannot update a destroyed Huet SVG mount");
			t && (a = t), o = b(e, a, "svgs"), s = e.svgs?.strength === 0, c = /* @__PURE__ */ new Map(), g();
		},
		async ready() {
			u || (l !== void 0 || v.takeRecords().some(_)) && h();
		},
		destroy() {
			if (!u) {
				u = !0, l !== void 0 && cancelAnimationFrame(l), v.disconnect();
				for (let [e, t] of d) p(e, t);
				d.clear(), f.clear();
			}
		}
	};
}
// src/core/images.ts
var F = /* @__PURE__ */ new Map();
function I(e, { lutSize: t = 17, ...n }) {
	let r = JSON.stringify([
		e.neutral,
		e.colorModel,
		e.colors,
		e.images,
		n,
		t
	]), i = F.get(r);
	return i || (F.size >= 16 && F.clear(), F.set(r, i = S(b(e, n), t))), i;
}
var L, R = () => {
	if (L === void 0) try {
		L = new p();
	} catch {
		L = null;
	}
	return L;
}, z = () => R() !== null, B = (e) => e instanceof HTMLImageElement ? [e.naturalWidth, e.naturalHeight] : [e.width, e.height];
function V(e, t, n = {}, r = document.createElement("canvas")) {
	let [i, a] = B(e), { renderer: o = "gpu", ...s } = n, c = s.lutSize ?? 17, l = I(t, s), u = o === "gpu" ? R() : null;
	if (u) return u.setLut(l, c), u.render(e, r, i, a), r;
	r.width !== i && (r.width = i), r.height !== a && (r.height = a);
	let d = r.getContext("2d", { willReadFrequently: !0 });
	d.clearRect(0, 0, i, a), d.drawImage(e, 0, 0);
	let f = d.getImageData(0, 0, i, a);
	return C(f.data, l, c), d.putImageData(f, 0, 0), r;
}
var H = [
	"class",
	"title",
	"alt"
];
function U(e, t, n = {}) {
	let { selector: r = "img[data-huet-recolor]", hoverOriginal: i = !1, ...a } = n, o = t, s = a, c = 0, l, u = !1, d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Set(), h = (e, t) => {
		let n = `${t} ${e}`, r = p.get(n);
		if (!r) {
			let i = new Image();
			i.crossOrigin = t, i.src = e, p.set(n, r = i.decode().then(() => i)), r.catch(() => p.delete(n));
		}
		return r;
	}, g = (e, t, n, r) => {
		let i = t.saved.get(n);
		if (r === void 0) {
			if (!i) return;
			t.saved.delete(n), i[0] ? e.style.setProperty(n, i[0], i[1]) : e.style.removeProperty(n);
		} else i || t.saved.set(n, [e.style.getPropertyValue(n), e.style.getPropertyPriority(n)]), e.style.setProperty(n, r, "important");
	}, _ = (e, t, n) => {
		let r = e.getAttribute(n);
		n === "alt" ? (r ? t.setAttribute("aria-label", r) : t.removeAttribute("aria-label"), r === "" ? t.setAttribute("aria-hidden", "true") : t.removeAttribute("aria-hidden")) : r === null ? t.removeAttribute(n) : t.setAttribute(n, r);
	}, v = (e, t) => {
		let n = document.createElement("canvas");
		n.setAttribute("role", "img");
		for (let t of H) _(e, n, t);
		n.style.cssText = e.style.cssText;
		for (let [e, [r, i]] of t.saved) r ? n.style.setProperty(e, r, i) : n.style.removeProperty(e);
		if (i) {
			let r = () => {
				t.hovering = !0, b(e, t);
			}, i = () => {
				t.hovering = !1, b(e, t);
			};
			n.addEventListener("pointerenter", r), e.addEventListener("pointerleave", i), t.leave = () => e.removeEventListener("pointerleave", i);
		}
		return f.set(n, e), D.observe(n), n;
	}, y = (e) => e.ready && !e.failed && !e.hovering, b = (e, t) => {
		let { canvas: n } = t;
		n && y(t) ? (e.nextSibling !== n && e.after(n), g(e, t, "display", "none")) : (n?.remove(), g(e, t, "display")), t.ready || t.failed ? g(e, t, "visibility") : g(e, t, "visibility", "hidden"), t.failed ? e.setAttribute("data-huet-recolored", "original") : t.ready ? e.setAttribute("data-huet-recolored", "") : e.removeAttribute("data-huet-recolored");
	}, x = (e, t) => {
		t.failed = !0, t.ready = !1, b(e, t);
	}, S = (e, t) => {
		t.leave?.(), t.canvas && (t.canvas.remove(), f.delete(t.canvas), D.unobserve(t.canvas)), D.unobserve(e);
		for (let n of [...t.saved.keys()]) g(e, t, n);
		e.removeAttribute("data-huet-recolored"), d.delete(e);
	}, C = (e, t) => {
		try {
			let n = t.canvas ??= v(e, t);
			V(t.image, o, s, n), t.drawn = c, t.ready = !0, b(e, t);
		} catch {
			x(e, t);
		}
	}, w = (e) => e.image && !e.failed && e.drawn !== c, T = (e = !1) => {
		l = void 0;
		for (let [t, n] of d) w(n) && (e || n.near.img || n.near.canvas) && C(t, n);
	}, E = () => {
		u || l !== void 0 || (l = requestAnimationFrame(() => T()));
	}, D = new IntersectionObserver((e) => {
		for (let { target: t, isIntersecting: n } of e) {
			let e = t instanceof HTMLCanvasElement, r = e ? f.get(t) : t, i = r && d.get(r);
			i && (i.near[e ? "canvas" : "img"] = n, n && w(i) && E());
		}
	}, { rootMargin: "100% 0px" }), O = (e) => {
		m.add(e), e.finally(() => m.delete(e));
	}, k = (e) => {
		let t = {
			ready: !1,
			drawn: -1,
			failed: !1,
			hovering: !1,
			near: {
				img: !1,
				canvas: !1
			},
			generation: 0,
			saved: /* @__PURE__ */ new Map()
		};
		d.set(e, t), D.observe(e), A(e, t);
	}, A = (e, t) => {
		let n = ++t.generation;
		t.image = void 0, t.ready = t.failed = t.hovering = !1, b(e, t);
		let r = async () => {
			if (d.get(e) !== t || n !== t.generation) return;
			let r = (e.srcset ? e.currentSrc : "") || e.src;
			if (!r) return x(e, t);
			try {
				let i = await h(r, e.crossOrigin);
				if (d.get(e) !== t || n !== t.generation) return;
				t.image = i, t.drawn = -1, E();
			} catch {
				d.get(e) === t && n === t.generation && x(e, t);
			}
		};
		O(e.complete ? r() : new Promise((i) => {
			e.addEventListener("load", () => i(r()), { once: !0 }), e.addEventListener("error", () => i(d.get(e) === t && n === t.generation ? x(e, t) : void 0), { once: !0 });
		}));
	}, j = () => {
		if (u) return;
		let t = /* @__PURE__ */ new Set();
		e instanceof HTMLImageElement && e.matches(r) && t.add(e);
		for (let n of e.querySelectorAll(r)) n instanceof HTMLImageElement && t.add(n);
		for (let [e, n] of d) t.has(e) ? y(n) && e.nextSibling !== n.canvas && b(e, n) : S(e, n);
		for (let e of t) d.has(e) || k(e);
	}, M = new MutationObserver((e) => {
		for (let { type: t, target: n, attributeName: r } of e) {
			if (t !== "attributes" || !(n instanceof HTMLImageElement)) continue;
			let e = d.get(n);
			e && (H.includes(r) ? e.canvas && _(n, e.canvas, r) : r !== "data-huet-recolor" && A(n, e));
		}
		j();
	});
	return j(), M.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: [
			"src",
			"srcset",
			"sizes",
			"data-huet-recolor",
			...H
		]
	}), {
		update(e, t) {
			if (u) throw Error("Cannot update a destroyed Huet image mount");
			o = e, t && (s = t), c++, E();
		},
		async ready() {
			do
				await Promise.all(m), u || T(!0);
			while (m.size);
		},
		destroy() {
			if (!u) {
				u = !0, l !== void 0 && cancelAnimationFrame(l), M.disconnect(), D.disconnect();
				for (let [e, t] of d) S(e, t);
				m = /* @__PURE__ */ new Set();
			}
		}
	};
}
export { p as GpuRecolor, C as applyLut, w as applyTransform, S as buildLut, y as coordinatesOf, z as hasGpu, U as mountImages, P as mountSvgs, x as rampColor, V as recolorImage, b as recolorer, T as toCube };

//# sourceMappingURL=images.js.map