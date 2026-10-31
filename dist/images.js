import { _ as e, a as t, h as n, i as r, m as i, p as a, r as o, v as s, y as c } from "./theme-Dm2Wxxd-.js";
// src/core/gpu.ts
var l = "#version 300 es\nin vec2 position;\nout vec2 uv;\nvoid main() {\n  uv = position * 0.5 + 0.5;\n  gl_Position = vec4(position, 0.0, 1.0);\n}", u = "#version 300 es\nprecision highp float;\nprecision highp sampler3D;\nuniform sampler2D image;\nuniform sampler3D lut;\nuniform float size;\nin vec2 uv;\nout vec4 color;\nvoid main() {\n  vec4 c = texture(image, vec2(uv.x, 1.0 - uv.y));\n  // Sample lattice centers so 0 and 1 hit the first and last LUT entries.\n  vec3 p = (c.rgb * (size - 1.0) + 0.5) / size;\n  color = vec4(texture(lut, p).rgb, c.a);\n}", d = class {
	constructor() {
		this.canvas = document.createElement("canvas"), this.textures = /* @__PURE__ */ new WeakMap(), this.scratch = null, this.currentLut = null;
		let e = this.canvas.getContext("webgl2", {
			premultipliedAlpha: !1,
			preserveDrawingBuffer: !0
		});
		if (!e) throw Error("WebGL2 is not available");
		this.gl = e;
		let t = e.createProgram();
		for (let [n, r] of [[e.VERTEX_SHADER, l], [e.FRAGMENT_SHADER, u]]) {
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
};
// src/core/recolor.ts
function f(e) {
	if (!("tokens" in e)) return e;
	let { neutral: t, colors: n } = e;
	return t.colors.length === 2 && t.colorModel === "oklab" ? {
		dark: e.dark,
		light: e.light,
		colors: n
	} : {
		neutral: t,
		colors: n
	};
}
var p = (e) => e < .20689655172413793 ? (e / n) ** 2 : 1, m = /* @__PURE__ */ new Map();
function h(e) {
	let n = JSON.stringify(e), a = m.get(n);
	if (a) return a;
	let { dark: s, light: l, neutral: u, colors: d } = e, { ramp: f } = t({
		dark: s,
		light: l,
		neutral: u
	}), p = /* @__PURE__ */ new Float64Array(257), h = /* @__PURE__ */ new Float64Array(257), g = /* @__PURE__ */ new Float64Array(257);
	for (let e = 0; e < 257; e++) {
		let [t, n, r] = c(f(e / 256));
		p[e] = Math.max(i(t), e ? p[e - 1] : 0), h[e] = n, g[e] = r;
	}
	let _ = p[0], v = p[256], y = [0, 0], b = (e) => {
		let t = _ + e * (v - _), n = 0, r = 256;
		if (t <= _) r = 0;
		else if (t >= v) n = 256;
		else for (; r - n > 1;) {
			let e = n + r >> 1;
			p[e] < t ? n = e : r = e;
		}
		let i = p[r] > p[n] ? (t - p[n]) / (p[r] - p[n]) : 0;
		return y[0] = h[n] + i * (h[r] - h[n]), y[1] = g[n] + i * (g[r] - g[n]), y;
	}, x = r.map((e) => c(d?.[e] ?? o[e]));
	return a = {
		low: _,
		high: v,
		neutralAt: b,
		a: Float64Array.from(x, (e) => e[1]),
		b: Float64Array.from(x, (e) => e[2])
	}, m.size >= 64 && m.clear(), m.set(n, a), a;
}
function g(e) {
	let t = r.length, n = (t) => Math.atan2(e.b[t], e.a[t]), a = Array.from({ length: t }, (e, t) => t).sort((e, t) => n(e) - n(t)), o = a.map((n, r) => {
		let i = a[(r + 1) % t], [o, s, c, l] = [
			e.a[n],
			e.b[n],
			e.a[i],
			e.b[i]
		], u = o * l - c * s;
		return {
			i0: n,
			i1: i,
			det: u,
			m: [
				l / u,
				-c / u,
				-s / u,
				o / u
			]
		};
	}), { low: s, high: c } = e, l = c - s || 1, u = {
		t: 0,
		i0: 0,
		i1: 0,
		w0: 0,
		w1: 0
	};
	return ([n, r, a]) => {
		let c = (i(n) - s) / l, [d, f] = e.neutralAt(c), m = p(n), h = (r - d) * m, g = (a - f) * m;
		if (u.t = c, u.w0 = u.w1 = 0, h * h + g * g < 1e-10) return u;
		for (let { i0: e, i1: t, det: n, m: r } of o) {
			if (n <= 1e-12) continue;
			let i = r[0] * h + r[1] * g, a = r[2] * h + r[3] * g;
			if (i >= -1e-9 && a >= -1e-9) return Object.assign(u, {
				i0: e,
				i1: t,
				w0: Math.max(0, i),
				w1: Math.max(0, a)
			}), u;
		}
		let _ = -Infinity;
		for (let n = 0; n < t; n++) {
			let t = e.a[n] ** 2 + e.b[n] ** 2, r = (h * e.a[n] + g * e.b[n]) / (t || 1), i = r * Math.sqrt(t);
			i > _ && (Object.assign(u, {
				i0: n,
				i1: n,
				w0: Math.max(0, r),
				w1: 0
			}), _ = i);
		}
		return u;
	};
}
function _([t, n, i], a = {}) {
	let { t: o, i0: s, i1: c, w0: l, w1: u } = g(h(a))(e(t, n, i)), d = {};
	return l > 1e-6 && (d[r[s]] = l), u > 1e-6 && (d[r[c]] = (d[r[c]] ?? 0) + u), {
		t: o,
		weights: d
	};
}
function v(t, n = {}) {
	let r = n.strength ?? 1, i = n.tint ?? 1;
	if (!(r >= 0 && r <= 1)) throw RangeError("strength must be between 0 and 1");
	if (!(i >= 0 && i <= 1)) throw RangeError("tint must be between 0 and 1");
	let o = g(h(n.source ?? {})), c = h(t), { low: l, high: u } = c;
	return (t, d, f) => {
		let m = e(t, d, f), { t: h, i0: g, i1: _, w0: v, w1: y } = o(m), b = n.invert ? 1 - h : h, x = i + (1 - i) * Math.max(0, 1 - v - y), S = a(l + b * (u - l)), C = 1 / Math.max(p(S), 1e-6), [w, T] = c.neutralAt(b), E = [
			S,
			x * w + C * (v * c.a[g] + y * c.a[_]),
			x * T + C * (v * c.b[g] + y * c.b[_])
		];
		return s(r === 1 ? E : m.map((e, t) => e + (E[t] - e) * r));
	};
}
function y(e, t, n) {
	let { low: i, high: o, neutralAt: c, a: l, b: u } = h(e), d = n ? r.indexOf(n) : -1, [f, p] = c(t);
	return s([
		a(i + t * (o - i)),
		f + (d >= 0 ? l[d] : 0),
		p + (d >= 0 ? u[d] : 0)
	]);
}
function b(e, t = 33) {
	let n = new Float32Array(t ** 3 * 3), r = 0;
	for (let i = 0; i < t; i++) for (let a = 0; a < t; a++) for (let o = 0; o < t; o++) {
		let s = e(o / (t - 1), a / (t - 1), i / (t - 1));
		n[r++] = s[0], n[r++] = s[1], n[r++] = s[2];
	}
	return n;
}
function x(e, t, n) {
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
function S(e, t) {
	for (let n = 0; n < e.length; n += 4) {
		let r = t(e[n] / 255, e[n + 1] / 255, e[n + 2] / 255);
		e[n] = r[0] * 255, e[n + 1] = r[1] * 255, e[n + 2] = r[2] * 255;
	}
}
function C(e, t, n = "Huet theme") {
	let r = [`TITLE "${n.replace(/"/g, "'")}"`, `LUT_3D_SIZE ${t}`];
	for (let t = 0; t < e.length; t += 3) r.push(`${e[t].toFixed(6)} ${e[t + 1].toFixed(6)} ${e[t + 2].toFixed(6)}`);
	return r.join("\n") + "\n";
}
// src/core/svgs.ts
var w = /currentcolor|var\(|context-(?:fill|stroke)/i, T = /^\s*(?:inherit|unset)\s*$/i, E = /* @__PURE__ */ new Set([
	"fill",
	"stroke",
	"stop-color",
	"style",
	"class"
]), D = /* @__PURE__ */ new WeakMap();
function O(e) {
	let t;
	try {
		t = e.cssRules;
	} catch {
		return [];
	}
	let n = D.get(e);
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
	return i(t, []), D.set(e, {
		size: t.length,
		rules: r
	}), r;
}
var k = (e, t) => {
	try {
		return e.matches(t);
	} catch {
		return !1;
	}
}, A;
function j(e) {
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
	if (!A) {
		let e = document.createElement("canvas");
		e.width = e.height = 1, A = e.getContext("2d", { willReadFrequently: !0 });
	}
	A.clearRect(0, 0, 1, 1), A.fillStyle = "transparent", A.fillStyle = e, A.fillRect(0, 0, 1, 1);
	let [n, r, i, a] = A.getImageData(0, 0, 1, 1).data;
	return [
		n,
		r,
		i,
		a / 255
	];
}
function M(e, t, n = {}) {
	let { selector: r = "svg[data-huet-recolor]", ...i } = n, a = i, o = v(f(t), a), s = /* @__PURE__ */ new Map(), c, l = !1, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set(), p = (e, { hadStyle: t, paints: n }) => {
		for (let [t, { via: r, value: i, priority: a, written: o }] of n) if (r === "attribute") {
			if (e.getAttribute(t) !== o) continue;
			i === null ? e.removeAttribute(t) : e.setAttribute(t, i);
		} else e.style.getPropertyValue(t) === o && (i ? e.style.setProperty(t, i, a) : e.style.removeProperty(t));
		!t && e.getAttribute("style") === "" && e.removeAttribute("style");
	}, m = ([e, t, n, r]) => {
		let i = `${e} ${t} ${n} ${r}`, a = s.get(i);
		if (!a) {
			let c = o(e / 255, t / 255, n / 255).map((e) => Math.round(Math.min(1, Math.max(0, e)) * 255));
			a = r === 1 ? `rgb(${c.join(", ")})` : `rgba(${c.join(", ")}, ${r})`, s.set(i, a);
		}
		return a;
	}, h = () => {
		if (c !== void 0 && cancelAnimationFrame(c), c = void 0, l) return;
		for (let [e, t] of u) p(e, t);
		u.clear(), d = /* @__PURE__ */ new Set(), e instanceof SVGElement && e.matches(r) && d.add(e);
		for (let t of e.querySelectorAll(r)) t instanceof SVGElement && d.add(t);
		let t = e.getRootNode(), n = [...t.styleSheets, ...t.adoptedStyleSheets].flatMap(O).filter((e) => e.media.every((e) => e.matches)), i = (e, t, n) => {
			let r = e.style, i = r?.getPropertyValue(t) ?? "";
			if (i && r.getPropertyPriority(t) === "important") return [
				i,
				"style",
				!0
			];
			let a = "", o = "";
			for (let r of n) r.paint === t && k(e, r.selector) && (r.important ? o = r.value : a = r.value);
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
			return l = u && !T.test(u) ? w.test(u) : t === "stop-color" && !u ? !1 : e.parentElement ? o(e.parentElement, t, r, s) : !1, c.set(e, l), l;
		}, s = [], f = /* @__PURE__ */ new Set();
		for (let e of d) {
			let t = n.filter(({ selector: t }) => k(e, t) || e.querySelector(t) !== null);
			for (let n of [e, ...e.querySelectorAll("*")]) {
				if (!(n instanceof SVGElement) || f.has(n)) continue;
				f.add(n);
				let r = n instanceof SVGStopElement ? ["stop-color"] : ["fill", "stroke"];
				for (let a of r) {
					let [r, c, l] = i(n, a, t);
					if ((!r || T.test(r)) && a !== "stop-color" && !d.has(n) || o(n, a, e, t)) continue;
					let u = j(getComputedStyle(n).getPropertyValue(a));
					u && u[3] > 0 && s.push([
						n,
						a,
						u,
						c,
						l
					]);
				}
			}
		}
		for (let [e, t, n, r, i] of s) {
			let a = u.get(e);
			a || u.set(e, a = {
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
		y.takeRecords();
	}, g = () => {
		!l && c === void 0 && (c = requestAnimationFrame(h));
	}, _ = ({ type: e, target: t, attributeName: n, addedNodes: i, removedNodes: a }) => {
		if (!(t instanceof Element)) return !1;
		let o = t.closest(r) !== null;
		if (e === "attributes") return d.has(t) || t.matches(r) ? !0 : o ? E.has(n) : n === "class" && t.querySelector(r) !== null;
		if (o) return !0;
		for (let e of [...i, ...a]) if (e instanceof Element && (e.matches(r) || e.querySelector(r) !== null)) return !0;
		return !1;
	}, y = new MutationObserver((e) => {
		e.some(_) && g();
	});
	return y.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0
	}), h(), {
		update(e, t) {
			if (l) throw Error("Cannot update a destroyed Huet SVG mount");
			t && (a = t), o = v(f(e), a), s = /* @__PURE__ */ new Map(), g();
		},
		async ready() {
			l || (c !== void 0 || y.takeRecords().some(_)) && h();
		},
		destroy() {
			if (!l) {
				l = !0, c !== void 0 && cancelAnimationFrame(c), y.disconnect();
				for (let [e, t] of u) p(e, t);
				u.clear(), d.clear();
			}
		}
	};
}
// src/core/images.ts
var N = /* @__PURE__ */ new Map();
function P(e, { lutSize: t = 17, ...n }) {
	let r = JSON.stringify([
		e,
		n,
		t
	]), i = N.get(r);
	return i || (N.size >= 16 && N.clear(), N.set(r, i = b(v(e, n), t))), i;
}
var F, I = () => {
	if (F === void 0) try {
		F = new d();
	} catch {
		F = null;
	}
	return F;
}, L = () => I() !== null, R = (e) => e instanceof HTMLImageElement ? [e.naturalWidth, e.naturalHeight] : [e.width, e.height];
function z(e, t, n = {}, r = document.createElement("canvas")) {
	let [i, a] = R(e), { renderer: o = "gpu", ...s } = n, c = s.lutSize ?? 17, l = P(f(t), s), u = o === "gpu" ? I() : null;
	if (u) return u.setLut(l, c), u.render(e, r, i, a), r;
	r.width !== i && (r.width = i), r.height !== a && (r.height = a);
	let d = r.getContext("2d", { willReadFrequently: !0 });
	d.clearRect(0, 0, i, a), d.drawImage(e, 0, 0);
	let p = d.getImageData(0, 0, i, a);
	return x(p.data, l, c), d.putImageData(p, 0, 0), r;
}
var B = [
	"class",
	"title",
	"alt"
];
function V(e, t, n = {}) {
	let { selector: r = "img[data-huet-recolor]", hoverOriginal: i = !1, ...a } = n, o = f(t), s = a, c = 0, l, u = !1, d = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Set(), g = (e, t) => {
		let n = `${t} ${e}`, r = m.get(n);
		if (!r) {
			let i = new Image();
			i.crossOrigin = t, i.src = e, m.set(n, r = i.decode().then(() => i)), r.catch(() => m.delete(n));
		}
		return r;
	}, _ = (e, t, n, r) => {
		let i = t.saved.get(n);
		if (r === void 0) {
			if (!i) return;
			t.saved.delete(n), i[0] ? e.style.setProperty(n, i[0], i[1]) : e.style.removeProperty(n);
		} else i || t.saved.set(n, [e.style.getPropertyValue(n), e.style.getPropertyPriority(n)]), e.style.setProperty(n, r, "important");
	}, v = (e, t, n) => {
		let r = e.getAttribute(n);
		n === "alt" ? (r ? t.setAttribute("aria-label", r) : t.removeAttribute("aria-label"), r === "" ? t.setAttribute("aria-hidden", "true") : t.removeAttribute("aria-hidden")) : r === null ? t.removeAttribute(n) : t.setAttribute(n, r);
	}, y = (e, t) => {
		let n = document.createElement("canvas");
		n.setAttribute("role", "img");
		for (let t of B) v(e, n, t);
		n.style.cssText = e.style.cssText;
		for (let [e, [r, i]] of t.saved) r ? n.style.setProperty(e, r, i) : n.style.removeProperty(e);
		if (i) {
			let r = () => {
				t.hovering = !0, x(e, t);
			}, i = () => {
				t.hovering = !1, x(e, t);
			};
			n.addEventListener("pointerenter", r), e.addEventListener("pointerleave", i), t.leave = () => e.removeEventListener("pointerleave", i);
		}
		return p.set(n, e), O.observe(n), n;
	}, b = (e) => e.ready && !e.failed && !e.hovering, x = (e, t) => {
		let { canvas: n } = t;
		n && b(t) ? (e.nextSibling !== n && e.after(n), _(e, t, "display", "none")) : (n?.remove(), _(e, t, "display")), t.ready || t.failed ? _(e, t, "visibility") : _(e, t, "visibility", "hidden"), t.failed ? e.setAttribute("data-huet-recolored", "original") : t.ready ? e.setAttribute("data-huet-recolored", "") : e.removeAttribute("data-huet-recolored");
	}, S = (e, t) => {
		t.failed = !0, t.ready = !1, x(e, t);
	}, C = (e, t) => {
		t.leave?.(), t.canvas && (t.canvas.remove(), p.delete(t.canvas), O.unobserve(t.canvas)), O.unobserve(e);
		for (let n of [...t.saved.keys()]) _(e, t, n);
		e.removeAttribute("data-huet-recolored"), d.delete(e);
	}, w = (e, t) => {
		try {
			let n = t.canvas ??= y(e, t);
			z(t.image, o, s, n), t.drawn = c, t.ready = !0, x(e, t);
		} catch {
			S(e, t);
		}
	}, T = (e) => e.image && !e.failed && e.drawn !== c, E = (e = !1) => {
		l = void 0;
		for (let [t, n] of d) T(n) && (e || n.near.img || n.near.canvas) && w(t, n);
	}, D = () => {
		u || l !== void 0 || (l = requestAnimationFrame(() => E()));
	}, O = new IntersectionObserver((e) => {
		for (let { target: t, isIntersecting: n } of e) {
			let e = t instanceof HTMLCanvasElement, r = e ? p.get(t) : t, i = r && d.get(r);
			i && (i.near[e ? "canvas" : "img"] = n, n && T(i) && D());
		}
	}, { rootMargin: "100% 0px" }), k = (e) => {
		h.add(e), e.finally(() => h.delete(e));
	}, A = (e) => {
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
		d.set(e, t), O.observe(e), j(e, t);
	}, j = (e, t) => {
		let n = ++t.generation;
		t.image = void 0, t.ready = t.failed = t.hovering = !1, x(e, t);
		let r = async () => {
			if (d.get(e) !== t || n !== t.generation) return;
			let r = (e.srcset ? e.currentSrc : "") || e.src;
			if (!r) return S(e, t);
			try {
				let i = await g(r, e.crossOrigin);
				if (d.get(e) !== t || n !== t.generation) return;
				t.image = i, t.drawn = -1, D();
			} catch {
				d.get(e) === t && n === t.generation && S(e, t);
			}
		};
		k(e.complete ? r() : new Promise((i) => {
			e.addEventListener("load", () => i(r()), { once: !0 }), e.addEventListener("error", () => i(d.get(e) === t && n === t.generation ? S(e, t) : void 0), { once: !0 });
		}));
	}, M = () => {
		if (u) return;
		let t = /* @__PURE__ */ new Set();
		e instanceof HTMLImageElement && e.matches(r) && t.add(e);
		for (let n of e.querySelectorAll(r)) n instanceof HTMLImageElement && t.add(n);
		for (let [e, n] of d) t.has(e) ? b(n) && e.nextSibling !== n.canvas && x(e, n) : C(e, n);
		for (let e of t) d.has(e) || A(e);
	}, N = new MutationObserver((e) => {
		for (let { type: t, target: n, attributeName: r } of e) {
			if (t !== "attributes" || !(n instanceof HTMLImageElement)) continue;
			let e = d.get(n);
			e && (B.includes(r) ? e.canvas && v(n, e.canvas, r) : r !== "data-huet-recolor" && j(n, e));
		}
		M();
	});
	return M(), N.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: [
			"src",
			"srcset",
			"sizes",
			"data-huet-recolor",
			...B
		]
	}), {
		update(e, t) {
			if (u) throw Error("Cannot update a destroyed Huet image mount");
			o = f(e), t && (s = t), c++, D();
		},
		async ready() {
			do
				await Promise.all(h), u || E(!0);
			while (h.size);
		},
		destroy() {
			if (!u) {
				u = !0, l !== void 0 && cancelAnimationFrame(l), N.disconnect(), O.disconnect();
				for (let [e, t] of d) C(e, t);
				h = /* @__PURE__ */ new Set();
			}
		}
	};
}
export { d as GpuRecolor, x as applyLut, S as applyTransform, b as buildLut, _ as coordinatesOf, L as hasGpu, V as mountImages, M as mountSvgs, f as paletteOf, y as rampColor, z as recolorImage, v as recolorer, C as toCube };

//# sourceMappingURL=images.js.map