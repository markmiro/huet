import { _ as e, a as t, b as n, d as r, g as i, i as a, m as o, o as s, p as c, r as l, t as u, x as d } from "./theme-BaMwzpON.js";
// src/core/filters.ts
var f = (e) => Math.min(1, Math.max(0, e)), p = (e) => (t) => {
	let [n, r, i] = t;
	t[0] = f(e[0] * n + e[1] * r + e[2] * i), t[1] = f(e[3] * n + e[4] * r + e[5] * i), t[2] = f(e[6] * n + e[7] * r + e[8] * i);
}, m = (e, t) => (n) => {
	for (let r = 0; r < 3; r++) n[r] = f(e * n[r] + t);
}, h = (e) => [
	.213 + .787 * e,
	.715 - .715 * e,
	.072 - .072 * e,
	.213 - .213 * e,
	.715 + .285 * e,
	.072 - .072 * e,
	.213 - .213 * e,
	.715 - .715 * e,
	.072 + .928 * e
], g = {
	grayscale: (e) => {
		let t = 1 - Math.min(1, e);
		return p([
			.2126 + .7874 * t,
			.7152 - .7152 * t,
			.0722 - .0722 * t,
			.2126 - .2126 * t,
			.7152 + .2848 * t,
			.0722 - .0722 * t,
			.2126 - .2126 * t,
			.7152 - .7152 * t,
			.0722 + .9278 * t
		]);
	},
	sepia: (e) => {
		let t = 1 - Math.min(1, e);
		return p([
			.393 + .607 * t,
			.769 - .769 * t,
			.189 - .189 * t,
			.349 - .349 * t,
			.686 + .314 * t,
			.168 - .168 * t,
			.272 - .272 * t,
			.534 - .534 * t,
			.131 + .869 * t
		]);
	},
	saturate: (e) => p(h(e)),
	"hue-rotate": (e) => {
		let t = Math.cos(e * Math.PI / 180), n = Math.sin(e * Math.PI / 180);
		return p([
			.213 + t * .787 - n * .213,
			.715 - t * .715 - n * .715,
			.072 - t * .072 + n * .928,
			.213 - t * .213 + n * .143,
			.715 + t * .285 + n * .14,
			.072 - t * .072 - n * .283,
			.213 - t * .213 - n * .787,
			.715 - t * .715 + n * .715,
			.072 + t * .928 + n * .072
		]);
	},
	invert: (e) => m(1 - 2 * Math.min(1, e), Math.min(1, e)),
	brightness: (e) => m(e, 0),
	contrast: (e) => m(e, .5 - .5 * e)
};
function _(e) {
	let t = [], n = /([a-z-]+)\(/gi, r;
	for (; r = n.exec(e);) {
		let i = 1, a = n.lastIndex;
		for (; a < e.length && i; a++) e[a] === "(" ? i++ : e[a] === ")" && i--;
		t.push({
			name: r[1].toLowerCase(),
			args: e.slice(n.lastIndex, a - 1).trim(),
			text: e.slice(r.index, a)
		}), n.lastIndex = a;
	}
	return t;
}
function v(e, t) {
	let n = parseFloat(t);
	return e === "hue-rotate" ? t ? t.endsWith("grad") ? n * .9 : t.endsWith("rad") ? n * 180 / Math.PI : t.endsWith("turn") ? n * 360 : n : 0 : t ? t.endsWith("%") ? n / 100 : n : 1;
}
var y = (e) => _(e).some(({ name: e }) => e in g);
function b(e) {
	let t = [], n = [];
	for (let { name: r, args: i, text: a } of _(e)) {
		let e = g[r];
		e ? t.push(e(v(r, i))) : n.push(a);
	}
	return {
		apply: t.length ? (e, n, r) => {
			let i = [
				e,
				n,
				r
			];
			for (let e of t) e(i);
			return i;
		} : null,
		rest: n.join(" ") || "none"
	};
}
function x(e) {
	let t = w.get(e);
	if (!t) return getComputedStyle(e).filter;
	let { style: n } = e;
	n.setProperty("filter", t.value, t.priority);
	let r = getComputedStyle(e).filter;
	return n.setProperty("filter", t.written, "important"), r;
}
function S(e, t) {
	let n = [], r = [];
	for (let i = e; i; i = i.parentElement) {
		let a = x(i);
		a !== "none" && y(a) && (i === e || t(i) || C(i, t) ? n : r).push({
			el: i,
			filter: a
		});
	}
	return {
		folded: n,
		stuck: r,
		key: n.map(({ filter: e }) => e).join(" ")
	};
}
function C(e, t) {
	let n = !1;
	for (let r of e.childNodes) if (r.nodeType === Node.TEXT_NODE) {
		if (r.textContent.trim()) return !1;
	} else if (r instanceof Element) {
		if (t(r)) n = !0;
		else if (getComputedStyle(r).display === "none") continue;
		else if (C(r, t)) n = !0;
		else return !1;
	}
	return n;
}
var w = /* @__PURE__ */ new Map();
function T(e, t, n) {
	let r = b(n).rest, i = w.get(e);
	if (!i) {
		let t = e.style;
		w.set(e, i = {
			value: t.getPropertyValue("filter"),
			priority: t.getPropertyPriority("filter"),
			attribute: e.getAttribute("style"),
			cssText: t.cssText,
			written: r,
			holders: /* @__PURE__ */ new Set()
		});
	}
	i.holders.add(t), i.written = r, e.style.setProperty("filter", r, "important");
}
function E(e, t) {
	let n = w.get(e);
	if (!n || !n.holders.delete(t) || n.holders.size) return;
	w.delete(e);
	let r = e.style;
	r.getPropertyValue("filter") === n.written && (n.value ? r.setProperty("filter", n.value, n.priority) : r.removeProperty("filter"), r.cssText === n.cssText && (n.attribute === null ? e.removeAttribute("style") : e.setAttribute("style", n.attribute)));
}
function D(e) {
	let t = e.id ? `#${e.id}` : "", n = e.getAttribute("class")?.trim(), r = n ? `.${n.split(/\s+/).join(".")}` : "";
	return `<${e.tagName.toLowerCase()}${t}${r}>`;
}
function O(e, t, n) {
	for (let { el: r, filter: i } of n) {
		let n = e.get(t);
		n || e.set(t, n = /* @__PURE__ */ new Set()), !n.has(r) && (n.add(r), reportError(/* @__PURE__ */ Error(`Huet recolored ${D(t)}, but its ancestor ${D(r)} has \`filter: ${i}\`, which recolors it again after Huet. Huet can't lift that filter, since the ancestor also shows other content. Move the filter onto the image or SVG (or a wrapper around only it), or remove it.`)));
	}
}
// src/core/gpu.ts
var k = "#version 300 es\nin vec2 position;\nout vec2 uv;\nvoid main() {\n  uv = position * 0.5 + 0.5;\n  gl_Position = vec4(position, 0.0, 1.0);\n}", A = "#version 300 es\nprecision highp float;\nprecision highp sampler3D;\nuniform sampler2D image;\nuniform sampler3D lut;\nuniform float size;\nin vec2 uv;\nout vec4 color;\nvoid main() {\n  vec4 c = texture(image, vec2(uv.x, 1.0 - uv.y));\n  // Sample lattice centers so 0 and 1 hit the first and last LUT entries.\n  vec3 p = (c.rgb * (size - 1.0) + 0.5) / size;\n  color = vec4(texture(lut, p).rgb, c.a);\n}", j = (e) => e instanceof HTMLImageElement ? [e.naturalWidth, e.naturalHeight] : e instanceof HTMLVideoElement ? [e.videoWidth, e.videoHeight] : "displayWidth" in e ? [e.displayWidth, e.displayHeight] : [e.width, e.height], M = class {
	constructor() {
		this.canvas = document.createElement("canvas"), this.textures = /* @__PURE__ */ new WeakMap(), this.scratch = null, this.currentLut = null;
		let e = this.canvas.getContext("webgl2", {
			antialias: !1,
			premultipliedAlpha: !1,
			preserveDrawingBuffer: !0
		});
		if (!e) throw Error("WebGL2 is not available");
		this.gl = e;
		let t = e.createProgram();
		for (let [n, r] of [[e.VERTEX_SHADER, k], [e.FRAGMENT_SHADER, A]]) {
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
	texture(e, t, n) {
		let r = this.gl;
		r.activeTexture(r.TEXTURE0);
		let i = e instanceof HTMLImageElement || e instanceof ImageBitmap, a = i ? this.textures.get(e) : void 0;
		if (a) {
			r.bindTexture(r.TEXTURE_2D, a);
			return;
		}
		a = i ? r.createTexture() : this.scratch ??= r.createTexture(), r.bindTexture(r.TEXTURE_2D, a), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, e);
		let [o, s] = j(e), c = i || o > t * 2 || s > n * 2;
		c && r.generateMipmap(r.TEXTURE_2D), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, c ? r.LINEAR_MIPMAP_LINEAR : r.LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE), i && this.textures.set(e, a);
	}
	render(e, t, n, r) {
		let i = this.gl;
		this.texture(e, n, r);
		let a = this.canvas;
		a.width < n && (a.width = n), a.height < r && (a.height = r), t.width !== n && (t.width = n), t.height !== r && (t.height = r), i.viewport(0, 0, n, r), i.drawArrays(i.TRIANGLE_STRIP, 0, 4);
		let o = t.getContext("2d");
		o.clearRect(0, 0, n, r), o.drawImage(a, 0, a.height - r, n, r, 0, 0, n, r);
	}
	finish() {
		let e = /* @__PURE__ */ new Uint8Array(4);
		this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, e);
	}
}, N = { neutral: ["#000000", "#ffffff"] }, P = (e) => e < .20689655172413793 ? (e / o) ** 2 : 1, F = /* @__PURE__ */ new Map();
function I(e) {
	u(e);
	let r = JSON.stringify([
		e.neutral,
		e.colorModel,
		e.colors
	]), i = F.get(r);
	if (i) return i;
	let { colors: o } = e, { ramp: d } = t(s(e)), f = /* @__PURE__ */ new Float64Array(257), p = /* @__PURE__ */ new Float64Array(257), m = /* @__PURE__ */ new Float64Array(257);
	for (let e = 0; e < 257; e++) {
		let [t, r, i] = n(d(e / 256));
		f[e] = Math.max(c(t), e ? f[e - 1] : 0), p[e] = r, m[e] = i;
	}
	let h = f[0], g = f[256], _ = [0, 0], v = (e) => {
		let t = h + e * (g - h), n = 0, r = 256;
		if (t <= h) r = 0;
		else if (t >= g) n = 256;
		else for (; r - n > 1;) {
			let e = n + r >> 1;
			f[e] < t ? n = e : r = e;
		}
		let i = f[r] > f[n] ? (t - f[n]) / (f[r] - f[n]) : 0;
		return _[0] = p[n] + i * (p[r] - p[n]), _[1] = m[n] + i * (m[r] - m[n]), _;
	}, y = a.map((e) => n(o?.[e] ?? l[e]));
	return i = {
		low: h,
		high: g,
		neutralAt: v,
		a: Float64Array.from(y, (e) => e[1]),
		b: Float64Array.from(y, (e) => e[2])
	}, F.size >= 64 && F.clear(), F.set(r, i), i;
}
function L(e) {
	let t = a.length, n = (t) => Math.atan2(e.b[t], e.a[t]), r = Array.from({ length: t }, (e, t) => t).sort((e, t) => n(e) - n(t)), i = r.map((n, i) => {
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
	}), { low: o, high: s } = e, l = s - o || 1, u = {
		t: 0,
		i0: 0,
		i1: 0,
		w0: 0,
		w1: 0
	};
	return ([n, r, a]) => {
		let s = (c(n) - o) / l, [d, f] = e.neutralAt(s), p = P(n), m = (r - d) * p, h = (a - f) * p;
		if (u.t = s, u.w0 = u.w1 = 0, m * m + h * h < 1e-10) return u;
		for (let { i0: e, i1: t, det: n, m: r } of i) {
			if (n <= 1e-12) continue;
			let i = r[0] * m + r[1] * h, a = r[2] * m + r[3] * h;
			if (i >= -1e-9 && a >= -1e-9) return Object.assign(u, {
				i0: e,
				i1: t,
				w0: Math.max(0, i),
				w1: Math.max(0, a)
			}), u;
		}
		let g = -Infinity;
		for (let n = 0; n < t; n++) {
			let t = e.a[n] ** 2 + e.b[n] ** 2, r = (m * e.a[n] + h * e.b[n]) / (t || 1), i = r * Math.sqrt(t);
			i > g && (Object.assign(u, {
				i0: n,
				i1: n,
				w0: Math.max(0, r),
				w1: 0
			}), g = i);
		}
		return u;
	};
}
function R([e, t, n], r = N) {
	let { t: o, i0: s, i1: c, w0: l, w1: u } = L(I(r))(i(e, t, n)), d = {};
	return l > 1e-6 && (d[a[s]] = l), u > 1e-6 && (d[a[c]] = (d[a[c]] ?? 0) + u), {
		t: o,
		weights: d
	};
}
function z(t, n = {}, a = "images") {
	u(t);
	let o = t[a]?.strength ?? 1, s = t[a]?.tint ?? 1;
	if (!(o >= 0 && o <= 1)) throw RangeError("strength must be between 0 and 1");
	if (!(s >= 0 && s <= 1)) throw RangeError("tint must be between 0 and 1");
	n.source && u(n.source);
	let c = n.filter ? b(n.filter).apply : null, l, f = () => l ??= p();
	return Object.assign((e, t, n) => f().map(e, t, n), { lut: (e) => f().lut(e) });
	function p() {
		let a = I(t), l = L(I(n.source ?? N)), { low: u, high: f } = a;
		return {
			map: (t, d, p) => {
				c && ([t, d, p] = c(t, d, p));
				let m = i(t, d, p), { t: h, i0: g, i1: _, w0: v, w1: y } = l(m), b = n.invert ? 1 - h : h, x = s + (1 - s) * Math.max(0, 1 - v - y), S = r(u + b * (f - u)), C = 1 / Math.max(P(S), 1e-6), [w, T] = a.neutralAt(b), E = [
					S,
					x * w + C * (v * a.a[g] + y * a.a[_]),
					x * T + C * (v * a.b[g] + y * a.b[_])
				];
				return e(o === 1 ? E : m.map((e, t) => e + (E[t] - e) * o));
			},
			lut: (e) => {
				let t = ee(n, e, l, c), i = new Float32Array(e ** 3 * 3);
				for (let e = 0, c = 0; c < i.length; e++, c += 3) {
					let l = t.t[e], p = t.i0[e], m = t.i1[e], h = t.w0[e], g = t.w1[e], _ = n.invert ? 1 - l : l, v = s + (1 - s) * Math.max(0, 1 - h - g), y = r(u + _ * (f - u)), b = 1 / Math.max(P(y), 1e-6), [x, S] = a.neutralAt(_), C = v * x + b * (h * a.a[p] + g * a.a[m]), w = v * S + b * (h * a.b[p] + g * a.b[m]);
					if (o === 1) d(i, c, y, C, w);
					else {
						let e = t.lab[c], n = t.lab[c + 1], r = t.lab[c + 2];
						d(i, c, e + (y - e) * o, n + (C - n) * o, r + (w - r) * o);
					}
				}
				return i;
			}
		};
	}
}
var B = /* @__PURE__ */ new Map();
function ee(e, t, n, r) {
	let a = JSON.stringify([
		e.source ?? null,
		e.filter ?? "",
		t
	]), o = B.get(a);
	if (o) return o;
	let s = t ** 3;
	o = {
		lab: new Float64Array(s * 3),
		t: new Float64Array(s),
		i0: new Uint8Array(s),
		i1: new Uint8Array(s),
		w0: new Float64Array(s),
		w1: new Float64Array(s)
	};
	let c = 0;
	for (let e = 0; e < t; e++) for (let a = 0; a < t; a++) for (let s = 0; s < t; s++, c++) {
		let [l, u, d] = [
			s / (t - 1),
			a / (t - 1),
			e / (t - 1)
		];
		r && ([l, u, d] = r(l, u, d));
		let f = i(l, u, d), { t: p, i0: m, i1: h, w0: g, w1: _ } = n(f);
		o.lab.set(f, c * 3), o.t[c] = p, o.i0[c] = m, o.i1[c] = h, o.w0[c] = g, o.w1[c] = _;
	}
	return B.size >= 16 && B.clear(), B.set(a, o), o;
}
function te(t, n, i) {
	let { low: o, high: s, neutralAt: c, a: l, b: u } = I(t), d = i ? a.indexOf(i) : -1, [f, p] = c(n);
	return e([
		r(o + n * (s - o)),
		f + (d >= 0 ? l[d] : 0),
		p + (d >= 0 ? u[d] : 0)
	]);
}
function ne(e, t = 33) {
	let n = new Float32Array(t ** 3 * 3), r = 0;
	for (let i = 0; i < t; i++) for (let a = 0; a < t; a++) for (let o = 0; o < t; o++) {
		let s = e(o / (t - 1), a / (t - 1), i / (t - 1));
		n[r++] = s[0], n[r++] = s[1], n[r++] = s[2];
	}
	return n;
}
function re(e, t, n) {
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
function ie(e, t) {
	for (let n = 0; n < e.length; n += 4) {
		let r = t(e[n] / 255, e[n + 1] / 255, e[n + 2] / 255);
		e[n] = r[0] * 255, e[n + 1] = r[1] * 255, e[n + 2] = r[2] * 255;
	}
}
function ae(e, t, n = "Huet theme") {
	let r = [`TITLE "${n.replace(/"/g, "'")}"`, `LUT_3D_SIZE ${t}`];
	for (let t = 0; t < e.length; t += 3) r.push(`${e[t].toFixed(6)} ${e[t + 1].toFixed(6)} ${e[t + 2].toFixed(6)}`);
	return r.join("\n") + "\n";
}
// src/core/raster.ts
var V = /* @__PURE__ */ new Map();
function H(e, { lutSize: t = 17, renderer: n, ...r }) {
	let i = JSON.stringify([
		e.neutral,
		e.colorModel,
		e.colors,
		e.images,
		r,
		t
	]), a = V.get(i);
	return a || (V.size >= 16 && V.clear(), V.set(i, a = z(e, r).lut(t))), a;
}
var U, W = () => {
	if (U === void 0) try {
		U = new M();
	} catch {
		U = null;
	}
	return U;
}, oe = /currentcolor|var\(|context-(?:fill|stroke)/i, G = /^\s*(?:inherit|unset)\s*$/i, se = /* @__PURE__ */ new Set([
	"fill",
	"stroke",
	"stop-color",
	"style",
	"class",
	"href"
]), K = /* @__PURE__ */ new WeakMap();
function ce(e) {
	let t;
	try {
		t = e.cssRules;
	} catch {
		return [];
	}
	let n = K.get(e);
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
	return i(t, []), K.set(e, {
		size: t.length,
		rules: r
	}), r;
}
var q = (e, t) => {
	try {
		return e.matches(t);
	} catch {
		return !1;
	}
}, J;
function le(e) {
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
	if (!J) {
		let e = document.createElement("canvas");
		e.width = e.height = 1, J = e.getContext("2d", { willReadFrequently: !0 });
	}
	J.clearRect(0, 0, 1, 1), J.fillStyle = "transparent", J.fillStyle = e, J.fillRect(0, 0, 1, 1);
	let [n, r, i, a] = J.getImageData(0, 0, 1, 1).data;
	return [
		n,
		r,
		i,
		a / 255
	];
}
function ue(e, t, n = {}) {
	let { selector: r = "svg[data-huet-recolor], [data-huet-recolor] svg", ...i } = n, a = i, o = t, s = /* @__PURE__ */ new Map(), c = t.svgs?.strength === 0, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d, f = !1, p = /* @__PURE__ */ new Map(), m = [], h = {}, g = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new WeakMap(), y = /* @__PURE__ */ new Set();
	z(t, a, "svgs");
	let b = /* @__PURE__ */ new Set(), x = (e, { hadStyle: t, paints: n }) => {
		for (let [t, { via: r, value: i, priority: a, written: o }] of n) if (r === "attribute") {
			if (e.getAttribute(t) !== o) continue;
			i === null ? e.removeAttribute(t) : e.setAttribute(t, i);
		} else e.style.getPropertyValue(t) === o && (i ? e.style.setProperty(t, i, a) : e.style.removeProperty(t));
		!t && e.getAttribute("style") === "" && e.removeAttribute("style");
	}, C = (e) => {
		let t = s.get(e);
		return t || s.set(e, t = z(o, e ? {
			...a,
			filter: e
		} : a, "svgs")), t;
	}, w = ([e, t, n, r], i) => {
		let a = `${i}|${e} ${t} ${n} ${r}`, o = l.get(a);
		if (!o) {
			let s = C(i)(e / 255, t / 255, n / 255).map((e) => Math.round(Math.min(1, Math.max(0, e)) * 255));
			o = r === 1 ? `rgb(${s.join(", ")})` : `rgba(${s.join(", ")}, ${r})`, l.set(a, o);
		}
		return o;
	}, k = () => {
		if (d !== void 0 && cancelAnimationFrame(d), d = void 0, f) return;
		for (let [e, t] of p) x(e, t);
		p.clear();
		for (let e of m) E(e, h);
		if (m = [], b = /* @__PURE__ */ new Set(), c) {
			N.takeRecords();
			return;
		}
		e instanceof SVGElement && e.matches(r) && b.add(e);
		for (let t of e.querySelectorAll(r)) t instanceof SVGElement && b.add(t);
		let t = e.getRootNode(), n = [...t.styleSheets, ...t.adoptedStyleSheets].flatMap(ce).filter((e) => e.media.every((e) => e.matches)), i = (e, t, n) => {
			let r = e.style, i = r?.getPropertyValue(t) ?? "";
			if (i && r.getPropertyPriority(t) === "important") return [
				i,
				"style",
				!0
			];
			let a = "", o = "";
			for (let r of n) r.paint === t && q(e, r.selector) && (r.important ? o = r.value : a = r.value);
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
		}, a = /* @__PURE__ */ new Map(), s = (e, t, r, o) => {
			let c = a.get(t);
			c || a.set(t, c = /* @__PURE__ */ new Map());
			let l = c.get(e);
			if (l !== void 0) return l;
			let [u] = i(e, t, r.contains(e) ? o : n);
			return l = u && !G.test(u) ? oe.test(u) : t === "stop-color" && !u ? !1 : e.parentElement ? s(e.parentElement, t, r, o) : !1, c.set(e, l), l;
		}, l = [], y = [], C = [], D = o.contrast ?? 1, k = /* @__PURE__ */ new Set(), j = /* @__PURE__ */ new Map();
		for (let e of b) {
			let t = S(e, (e) => b.has(e));
			O(g, e, t.stuck);
			for (let { el: e, filter: n } of t.folded) j.set(e, n);
			let r = e.parentElement;
			for (; r && !(r instanceof SVGElement && b.has(r));) r = r.parentElement;
			D < 1 && !r && C.push([e, Number(getComputedStyle(e).opacity) * D]);
			let a = n.filter(({ selector: t }) => q(e, t) || e.querySelector(t) !== null);
			for (let n of [e, ...e.querySelectorAll("*")]) {
				if (!(n instanceof SVGElement) || k.has(n)) continue;
				if (k.add(n), n instanceof SVGImageElement) {
					y.push([n, t.key]);
					continue;
				}
				let r = n instanceof SVGStopElement ? ["stop-color"] : ["fill", "stroke"];
				for (let o of r) {
					let [r, c, u] = i(n, o, a);
					if ((!r || G.test(r)) && o !== "stop-color" && !b.has(n) || s(n, o, e, a)) continue;
					let d = le(getComputedStyle(n).getPropertyValue(o));
					d && d[3] > 0 && l.push([
						n,
						o,
						d,
						c,
						u,
						t.key
					]);
				}
			}
		}
		let M = (e) => {
			let t = p.get(e);
			return t || p.set(e, t = {
				hadStyle: e.hasAttribute("style"),
				paints: /* @__PURE__ */ new Map()
			}), t;
		}, P = (e, t, n) => {
			M(e).paints.set(t, {
				via: "attribute",
				value: e.getAttribute(t),
				priority: "",
				written: n
			}), e.setAttribute(t, n);
		};
		for (let [e, t, n, r, i, a] of l) {
			let o = M(e), s = w(n, a);
			if (r === "attribute" || r === "") o.paints.set(t, {
				via: "attribute",
				value: e.getAttribute(t),
				priority: "",
				written: s
			}), e.setAttribute(t, s);
			else {
				let n = e.style.getPropertyValue(t), r = e.style.getPropertyPriority(t);
				e.style.setProperty(t, s, i ? "important" : ""), o.paints.set(t, {
					via: "style",
					value: n || null,
					priority: r,
					written: e.style.getPropertyValue(t)
				});
			}
		}
		for (let [e, t] of y) {
			let n = e.getAttribute("href") ?? e.getAttributeNS("http://www.w3.org/1999/xlink", "href");
			if (!n || _.has(n)) continue;
			let r = `${t}|${n}`, i = u.get(r);
			i === void 0 && u.set(r, i = A(e, n, t, r));
			let a = v.get(e), o = typeof i == "string" ? i : a?.href === n ? a.url : void 0;
			o ? (v.set(e, {
				href: n,
				url: o
			}), P(e, "href", o)) : P(e, "visibility", "hidden");
		}
		for (let [e, t] of C) {
			let n = e.style.getPropertyValue("opacity"), r = e.style.getPropertyPriority("opacity");
			e.style.setProperty("opacity", String(t), "important"), M(e).paints.set("opacity", {
				via: "style",
				value: n || null,
				priority: r,
				written: e.style.getPropertyValue("opacity")
			});
		}
		for (let [e, t] of j) T(e, h, t), m.push(e);
		N.takeRecords();
	}, A = (e, t, n, r) => {
		let i = u, s = (async () => {
			let s = new Image(), c = new URL(t, e.baseURI);
			c.protocol !== "data:" && c.origin !== location.origin && (s.crossOrigin = "anonymous"), s.src = c.href;
			try {
				if (await s.decode(), u !== i) return;
				let e = Q(s, {
					...o,
					images: o.svgs
				}, n ? {
					...a,
					filter: n
				} : a);
				i.set(r, e.toDataURL());
			} catch (n) {
				_.add(t), reportError(Error(`Huet couldn't read the raster <image> inside ${D(e.ownerSVGElement ?? e)}, so it keeps its own colors. Cross-origin images need CORS headers.`, { cause: n }));
			}
			j();
		})();
		return y.add(s), s.finally(() => y.delete(s)), s;
	}, j = () => {
		!f && d === void 0 && (d = requestAnimationFrame(k));
	}, M = ({ type: e, target: t, attributeName: n, addedNodes: i, removedNodes: a }) => {
		if (!(t instanceof Element)) return !1;
		let o = t.closest(r) !== null;
		if (e === "attributes") return b.has(t) || t.matches(r) ? !0 : o ? se.has(n) : n === "class" && t.querySelector(r) !== null;
		if (o) return !0;
		for (let e of [...i, ...a]) if (e instanceof Element && (e.matches(r) || e.querySelector(r) !== null)) return !0;
		return !1;
	}, N = new MutationObserver((e) => {
		d === void 0 && e.some(M) && j();
	});
	return N.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0
	}), k(), {
		update(e, t) {
			if (f) throw Error("Cannot update a destroyed Huet SVG mount");
			t && (a = t), z(e, a, "svgs"), o = e, s = /* @__PURE__ */ new Map(), c = e.svgs?.strength === 0, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), j();
		},
		async ready() {
			if (!f) for ((d !== void 0 || N.takeRecords().some(M)) && k(); y.size && !f;) await Promise.all(y), k();
		},
		destroy() {
			if (!f) {
				f = !0, d !== void 0 && cancelAnimationFrame(d), N.disconnect();
				for (let [e, t] of p) x(e, t);
				p.clear();
				for (let e of m) E(e, h);
				m = [], b.clear();
			}
		}
	};
}
// src/core/overlay.ts
var Y = (e) => parseFloat(e) || 0;
function de(e, t) {
	for (let e of t) e.setAttribute("aria-hidden", "true"), Object.assign(e.style, {
		position: "absolute",
		pointerEvents: "none",
		margin: "0",
		padding: "0",
		border: "0",
		maxWidth: "none",
		maxHeight: "none",
		boxSizing: "content-box"
	});
	let n = {
		width: 0,
		height: 0,
		place: o,
		detach: s,
		attach: c,
		remove: l
	}, r = !0, i = null, a = new ResizeObserver(() => o());
	a.observe(e);
	function o() {
		if (!r || !e.isConnected) return;
		e.nextSibling !== t[0] && e.after(...t);
		let o = e.getBoundingClientRect();
		if (!e.getClientRects().length) {
			for (let e of t) e.style.display = "none";
			return;
		}
		let s = getComputedStyle(e);
		for (let e of t) e.style.display = "", e.style.left = e.style.top = "0px";
		let c = t[0].getBoundingClientRect(), [l, u, d, f] = [
			"top",
			"right",
			"bottom",
			"left"
		].map((e) => Y(s.getPropertyValue(`border-${e}-width`)) + Y(s.getPropertyValue(`padding-${e}`)));
		n.width = Math.max(0, o.width - f - u), n.height = Math.max(0, o.height - l - d);
		let p = (e, t, n) => {
			let r = s.getPropertyValue(`border-${e}-radius`).split(" ")[0], i = Math.max(Y(s.getPropertyValue(`border-${t}-width`)), Y(s.getPropertyValue(`border-${n}-width`)));
			return r.endsWith("px") ? `${Math.max(0, Y(r) - i)}px` : r;
		}, m = s.position !== "static" && s.zIndex !== "auto" ? s.zIndex : "";
		for (let e of t) Object.assign(e.style, {
			left: `${o.left - c.left + f}px`,
			top: `${o.top - c.top + l}px`,
			width: `${n.width}px`,
			height: `${n.height}px`,
			borderRadius: [
				p("top-left", "top", "left"),
				p("top-right", "top", "right"),
				p("bottom-right", "bottom", "right"),
				p("bottom-left", "bottom", "left")
			].join(" "),
			zIndex: m
		});
		let h = t[0].offsetParent ?? document.body;
		h !== i && (i && a.unobserve(i), a.observe(i = h));
	}
	function s() {
		r = !1;
		for (let e of t) e.remove();
	}
	function c() {
		r = !0, o();
	}
	function l() {
		a.disconnect(), s();
	}
	return e.after(...t), o(), n;
}
// src/core/videos.ts
var fe = (e) => {
	let t = e.currentSrc || e.getAttribute("src") || e.querySelector("source[src]")?.getAttribute("src");
	return t ? new URL(t, document.baseURI).href : "";
};
function pe(e, t, n = {}) {
	let { selector: r = "video[data-huet-recolor], [data-huet-recolor] video", hoverOriginal: i = !1, readableUrl: a, ...o } = n, s = t, c = o, l = 0, u, d = !1, f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Set(), m, h = () => (m?.version !== l && (m = {
		version: l,
		table: H(s, c)
	}), m.table), g = (e, t, n) => {
		t.reported.has(n) || (t.reported.add(n), reportError(Error(n, { cause: e })));
	}, _ = (e, t) => {
		let n = t.ready && !t.failed && !t.hovering;
		if (t.canvas.style.visibility = n ? "" : "hidden", t.failed ? t.layer.detach() : t.canvas.isConnected || t.layer.attach(), t.waiting && !t.failed) t.saved ??= [e.style.getPropertyValue("visibility"), e.style.getPropertyPriority("visibility")], e.style.setProperty("visibility", "hidden", "important");
		else if (t.saved) {
			let [n, r] = t.saved;
			n ? e.style.setProperty("visibility", n, r) : e.style.removeProperty("visibility"), t.saved = void 0;
		}
		t.failed ? e.setAttribute("data-huet-recolored", "original") : t.ready ? e.setAttribute("data-huet-recolored", "") : e.removeAttribute("data-huet-recolored");
	}, v = (e) => {
		e.frame?.(), e.frame = void 0;
	}, y = (e, t, n) => {
		v(t), t.failed = !0, t.waiting = !1, _(e, t), n && g(e, t, n);
	}, b = (e, t) => !!t.poster && (!t.played || e.readyState < HTMLMediaElement.HAVE_CURRENT_DATA), x = (e, t) => {
		if (t.failed || t.hovering || d) return;
		let n = b(e, t);
		if (!n && e.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
		let r = n ? t.poster : e, [i, a] = n ? [t.poster.naturalWidth, t.poster.naturalHeight] : [e.videoWidth, e.videoHeight];
		if (!i || !a) return;
		let { layer: o } = t, s = Math.max(o.width * devicePixelRatio / i, o.height * devicePixelRatio / a), u = s > 0 ? Math.min(1, s) : 1, f = W();
		try {
			f.setLut(h(), c.lutSize ?? 17), f.render(r, t.canvas, Math.max(1, Math.round(i * u)), Math.max(1, Math.round(a * u)));
		} catch (r) {
			if (!(r instanceof DOMException && r.name === "SecurityError")) throw r;
			let i = n ? t.poster.src : fe(e);
			return y(e, t, `Huet can't read the pixels of the video${n ? " poster" : ""} at ${i}, since it's from another origin. Serve it with CORS headers and add crossorigin="anonymous" to the <video>, or pass readableUrl to mountVideos to load it through your own origin.`);
		}
		t.drawn = l;
		let p = !t.ready || t.waiting;
		t.ready = !0, t.waiting = !1, p && _(e, t);
	}, S = (e, t) => {
		if (!(t.frame || !t.near || t.hovering || t.failed)) {
			if ("requestVideoFrameCallback" in e) {
				let n = 0, r = () => {
					n = e.requestVideoFrameCallback(r), x(e, t);
				};
				n = e.requestVideoFrameCallback(r), t.frame = () => e.cancelVideoFrameCallback(n);
			} else {
				let n = e, r = 0, i = -1, a = () => {
					r = requestAnimationFrame(a), n.currentTime !== i && (i = n.currentTime, x(n, t));
				};
				r = requestAnimationFrame(a), t.frame = () => cancelAnimationFrame(r);
			}
		}
	}, C = (e) => !e.failed && e.drawn !== l, w = (e = !1) => {
		u = void 0;
		for (let [t, n] of f) C(n) && (e || n.near) && x(t, n);
	}, T = () => {
		d || u !== void 0 || (u = requestAnimationFrame(() => w()));
	}, E = new IntersectionObserver((e) => {
		for (let { target: t, isIntersecting: n } of e) {
			let e = t, r = f.get(e);
			r && (r.near = n, n ? (r.layer.place(), x(e, r), S(e, r)) : v(r));
		}
	}, { rootMargin: "50% 0px" }), D = (e) => {
		p.add(e), e.finally(() => p.delete(e));
	}, O = (e, t, n, r) => {
		let { currentTime: i, paused: a } = e;
		t.rewritten = {
			from: n,
			to: r
		}, e.crossOrigin = "anonymous", e.src = r, (i || !a) && e.addEventListener("loadedmetadata", () => {
			i && (e.currentTime = i), a || e.play().catch(() => {});
		}, { once: !0 });
	}, k = (e, t, n) => {
		let r = e.getAttribute("poster");
		if (!r) return;
		let i = new URL(r, document.baseURI).href, o = a ? a(i) : i;
		if (!o) return;
		let s = new Image();
		s.crossOrigin = o === i ? e.crossOrigin : "anonymous", s.src = o, t.waiting = !t.played, _(e, t), D(s.decode().then(() => {
			f.get(e) === t && n === t.generation && (t.poster = s, t.drawn = -1, x(e, t), t.waiting && (t.waiting = !1, _(e, t)));
		}, () => {
			f.get(e) === t && n === t.generation && (t.waiting = !1, _(e, t), g(e, t, `Huet couldn't load the poster ${o} to recolor it, so the video's original poster shows until it plays.`));
		}));
	}, A = (e, t) => {
		let n = ++t.generation;
		if (v(t), t.poster = void 0, t.ready = t.failed = t.waiting = !1, t.drawn = -1, t.played = !e.paused || e.currentTime > 0, !W()) return y(e, t);
		let r = fe(e);
		if (r && r === t.reverted) return y(e, t);
		if (r && t.rewritten?.to !== r) {
			let n = a ? a(r) : r;
			if (!n) return y(e, t);
			n !== r && O(e, t, r, n);
		}
		if (e.error) return y(e, t);
		_(e, t), k(e, t, n), t.layer.place(), x(e, t), S(e, t);
	}, j = (e) => {
		let t = document.createElement("canvas");
		t.setAttribute("data-huet-video", "");
		let n = getComputedStyle(e);
		t.style.objectFit = n.objectFit, t.style.objectPosition = n.objectPosition;
		let r = {
			canvas: t,
			layer: de(e, [t]),
			near: !1,
			hovering: !1,
			ready: !1,
			failed: !1,
			drawn: -1,
			played: !1,
			waiting: !1,
			generation: 0,
			reported: /* @__PURE__ */ new Set(),
			listeners: []
		};
		f.set(e, r);
		let a = (e, t, n, i) => {
			e.addEventListener(t, n, i), r.listeners.push([
				e,
				t,
				n,
				i
			]);
		};
		a(e, "loadeddata", () => r.near && x(e, r)), a(e, "seeked", () => r.near && x(e, r)), a(e, "play", () => r.played = !0), a(e, "seeking", () => r.played = !0), a(e, "error", () => {
			if (!e.error) return;
			let { rewritten: t } = r;
			if (t && e.getAttribute("src") === t.to) return r.rewritten = void 0, r.reverted = t.from, e.removeAttribute("crossorigin"), e.src = t.from, y(e, r, `Huet switched a video to ${t.to}, the URL readableUrl gave for ${t.from}, but it didn't load, so the video plays from its original source, unrecolored.`);
			y(e, r);
		}), i && (a(e, "pointerenter", () => {
			r.hovering = !0, v(r), _(e, r);
		}), a(e, "pointerleave", () => {
			r.hovering = !1, x(e, r), _(e, r), S(e, r);
		})), E.observe(e), A(e, r);
	}, M = (e, t) => {
		v(t), t.generation++;
		for (let [e, n, r, i] of t.listeners) e.removeEventListener(n, r, i);
		t.waiting = !1, t.failed = t.ready = !1, _(e, t), t.layer.remove(), E.unobserve(e), f.delete(e);
	}, N = () => {
		if (d) return;
		let t = /* @__PURE__ */ new Set();
		e instanceof HTMLVideoElement && e.matches(r) && t.add(e);
		for (let n of e.querySelectorAll(r)) n instanceof HTMLVideoElement && t.add(n);
		for (let [e, n] of f) t.has(e) ? !n.failed && e.nextSibling !== n.canvas && n.layer.place() : M(e, n);
		for (let e of t) f.has(e) || j(e);
	}, P = new MutationObserver((e) => {
		let t = /* @__PURE__ */ new Set();
		for (let { type: n, target: r, attributeName: i, addedNodes: a, removedNodes: o } of e) {
			if (n === "childList") {
				r instanceof HTMLVideoElement && f.has(r) && [...a, ...o].some((e) => e instanceof HTMLSourceElement) && t.add(r);
				continue;
			}
			let e = r instanceof HTMLVideoElement ? r : r instanceof HTMLSourceElement && r.parentElement instanceof HTMLVideoElement ? r.parentElement : null, s = e && f.get(e);
			if (!s || i === "data-huet-recolor") continue;
			let c = e.getAttribute("src");
			(r !== e || i !== "src" || !c || c !== s.rewritten?.to && c !== s.reverted) && t.add(e);
		}
		for (let e of t) {
			let t = f.get(e), n = e.getAttribute("src");
			n !== t.rewritten?.to && (t.rewritten = void 0), n !== t.reverted && (t.reverted = void 0), A(e, t);
		}
		N();
	});
	return N(), P.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: [
			"src",
			"poster",
			"data-huet-recolor"
		]
	}), {
		update(e, t) {
			if (d) throw Error("Cannot update a destroyed Huet video mount");
			s = e, t && (c = t), l++, T();
		},
		async ready() {
			do
				await Promise.all(p), d || w(!0);
			while (p.size);
		},
		destroy() {
			if (!d) {
				d = !0, u !== void 0 && cancelAnimationFrame(u), P.disconnect(), E.disconnect();
				for (let [e, t] of f) M(e, t);
				p = /* @__PURE__ */ new Set();
			}
		}
	};
}
// src/core/iframes.ts
var X = (e) => Math.min(1, Math.max(0, e)), me = (e) => `rgb(${e.map((e) => Math.round(X(e) * 255)).join(" ")})`;
function Z(e, t = {}) {
	let n = z(e, t), r = n(0, 0, 0).map(X);
	return {
		multiply: me(n(1, 1, 1).map(X).map((e, t) => r[t] < 1 ? X((e - r[t]) / (1 - r[t])) : 1)),
		screen: me(r)
	};
}
function he(e, t, n = {}) {
	let { selector: r = "iframe[data-huet-recolor], [data-huet-recolor] iframe", hoverOriginal: i = !1, ...a } = n, o = a, s = Z(t, o), c = !1, l = /* @__PURE__ */ new Map(), u = (e) => {
		e.layers[0].style.background = s.multiply, e.layers[1].style.background = s.screen;
	}, d = (e) => {
		let t = ["multiply", "screen"].map((e) => {
			let t = document.createElement("div");
			return t.setAttribute("data-huet-iframe", e), t.style.mixBlendMode = e, t;
		}), n = {
			layer: de(e, t),
			layers: t,
			listeners: []
		};
		if (u(n), i) {
			let r = (e) => () => {
				for (let n of t) n.style.visibility = e ? "" : "hidden";
			};
			n.listeners.push(["pointerenter", r(!1)], ["pointerleave", r(!0)]);
			for (let [t, r] of n.listeners) e.addEventListener(t, r);
		}
		e.setAttribute("data-huet-recolored", ""), l.set(e, n);
	}, f = (e, t) => {
		for (let [n, r] of t.listeners) e.removeEventListener(n, r);
		t.layer.remove(), e.removeAttribute("data-huet-recolored"), l.delete(e);
	}, p = () => {
		if (c) return;
		let t = /* @__PURE__ */ new Set();
		e instanceof HTMLIFrameElement && e.matches(r) && t.add(e);
		for (let n of e.querySelectorAll(r)) n instanceof HTMLIFrameElement && t.add(n);
		for (let [e, n] of l) t.has(e) ? e.nextSibling !== n.layers[0] && n.layer.place() : f(e, n);
		for (let e of t) l.has(e) || d(e);
	}, m = new MutationObserver(p);
	return p(), m.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ["data-huet-recolor"]
	}), {
		update(e, t) {
			if (c) throw Error("Cannot update a destroyed Huet iframe mount");
			t && (o = t), s = Z(e, o);
			for (let e of l.values()) u(e);
		},
		destroy() {
			if (!c) {
				c = !0, m.disconnect();
				for (let [e, t] of l) f(e, t);
			}
		}
	};
}
// src/core/images.ts
var ge = () => W() !== null, _e = (e) => e instanceof HTMLImageElement ? [e.naturalWidth, e.naturalHeight] : e instanceof HTMLVideoElement ? [e.videoWidth, e.videoHeight] : [e.width, e.height];
function Q(e, t, n = {}, r = document.createElement("canvas")) {
	let [i, a] = _e(e), { renderer: o = "gpu", ...s } = n, c = s.lutSize ?? 17, l = H(t, s), u = o === "gpu" ? W() : null;
	if (u) return u.setLut(l, c), u.render(e, r, i, a), r;
	r.width !== i && (r.width = i), r.height !== a && (r.height = a);
	let d = r.getContext("2d", { willReadFrequently: !0 });
	d.clearRect(0, 0, i, a), d.drawImage(e, 0, 0);
	let f = d.getImageData(0, 0, i, a);
	return re(f.data, l, c), d.putImageData(f, 0, 0), r;
}
function ve(e, t) {
	if (t >= 1) return;
	let n = e.getContext("2d");
	n.save(), n.globalCompositeOperation = "destination-in", n.fillStyle = `rgba(0, 0, 0, ${t})`, n.fillRect(0, 0, e.width, e.height), n.restore();
}
var $ = [
	"class",
	"title",
	"alt"
];
function ye(e, t, n = {}) {
	let { selector: r = "img[data-huet-recolor], [data-huet-recolor] img", hoverOriginal: i = !1, readableUrl: a, ...o } = n, s = t, c = o, l = 0, u, d = !1, f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new WeakMap(), g = (e) => f.has(e) || p.has(e), _ = /* @__PURE__ */ new Set(), v = (e, t) => {
		let n = `${t} ${e}`, r = m.get(n);
		if (!r) {
			let i = new Image();
			i.crossOrigin = t, i.src = e, m.set(n, r = i.decode().then(() => i)), r.catch(() => m.delete(n));
		}
		return r;
	}, y = (e, t, n, r) => {
		let i = t.saved.get(n);
		if (r === void 0) {
			if (!i) return;
			t.saved.delete(n), i[0] ? e.style.setProperty(n, i[0], i[1]) : e.style.removeProperty(n);
		} else i || t.saved.set(n, [e.style.getPropertyValue(n), e.style.getPropertyPriority(n)]), e.style.setProperty(n, r, "important");
	}, b = (e, t, n) => {
		let r = e.getAttribute(n);
		n === "alt" ? (r ? t.setAttribute("aria-label", r) : t.removeAttribute("aria-label"), r === "" ? t.setAttribute("aria-hidden", "true") : t.removeAttribute("aria-hidden")) : r === null ? t.removeAttribute(n) : t.setAttribute(n, r);
	}, x = (e, t) => {
		let n = document.createElement("canvas");
		n.setAttribute("role", "img");
		for (let t of $) b(e, n, t);
		n.style.cssText = e.style.cssText;
		for (let [e, [r, i]] of t.saved) r ? n.style.setProperty(e, r, i) : n.style.removeProperty(e);
		if (i) {
			let r = () => {
				t.hovering = !0, D(e, t);
			}, i = () => {
				t.hovering = !1, D(e, t);
			};
			n.addEventListener("pointerenter", r), e.addEventListener("pointerleave", i), t.leave = () => e.removeEventListener("pointerleave", i);
		}
		return p.set(n, e), F.observe(n), n;
	}, C = (e) => e.ready && !e.failed && !e.hovering, w = (e, t, n) => {
		for (let { el: r, filter: i } of t.filters) {
			let a = r === e ? t.canvas : r;
			a && (n ? T(a, t, i) : E(a, t));
		}
	}, D = (e, t) => {
		let { canvas: n } = t, r = !!n && C(t);
		w(e, t, r), r ? (e.nextSibling !== n && e.after(n), y(e, t, "display", "none")) : (n?.remove(), y(e, t, "display")), t.ready || t.failed ? y(e, t, "visibility") : y(e, t, "visibility", "hidden"), t.failed ? e.setAttribute("data-huet-recolored", "original") : t.ready ? e.setAttribute("data-huet-recolored", "") : e.removeAttribute("data-huet-recolored");
	}, k = (e, t) => {
		t.failed = !0, t.ready = !1, D(e, t);
	}, A = (e, t) => {
		t.leave?.(), w(e, t, !1), t.canvas && (t.canvas.remove(), p.delete(t.canvas), F.unobserve(t.canvas)), F.unobserve(e);
		for (let n of [...t.saved.keys()]) y(e, t, n);
		e.removeAttribute("data-huet-recolored"), f.delete(e);
	}, j = (e, t) => {
		try {
			let n = t.canvas ??= x(e, t), { folded: r, stuck: i, key: a } = S(e, g);
			O(h, e, i), w(e, t, !1), t.filters = r, Q(t.image, s, a ? {
				...c,
				filter: a
			} : c, n), ve(n, s.contrast ?? 1), t.drawn = l, t.ready = !0, D(e, t);
		} catch {
			k(e, t);
		}
	}, M = (e) => e.image && !e.failed && e.drawn !== l, N = (e = !1) => {
		u = void 0;
		for (let [t, n] of f) M(n) && (e || n.near.img || n.near.canvas) && j(t, n);
	}, P = () => {
		d || u !== void 0 || (u = requestAnimationFrame(() => N()));
	}, F = new IntersectionObserver((e) => {
		for (let { target: t, isIntersecting: n } of e) {
			let e = t instanceof HTMLCanvasElement, r = e ? p.get(t) : t, i = r && f.get(r);
			i && (i.near[e ? "canvas" : "img"] = n, n && M(i) && P());
		}
	}, { rootMargin: "100% 0px" }), I = (e) => {
		_.add(e), e.finally(() => _.delete(e));
	}, L = (e) => {
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
			saved: /* @__PURE__ */ new Map(),
			filters: []
		};
		f.set(e, t), F.observe(e), R(e, t);
	}, R = (e, t) => {
		let n = ++t.generation;
		t.image = void 0, t.ready = t.failed = t.hovering = !1, D(e, t);
		let r = async () => {
			if (f.get(e) !== t || n !== t.generation) return;
			let r = (e.srcset ? e.currentSrc : "") || e.src, i = r && (a ? a(r) : r);
			if (!i) return k(e, t);
			try {
				let a = await v(i, i === r ? e.crossOrigin : "anonymous");
				if (f.get(e) !== t || n !== t.generation) return;
				t.image = a, t.drawn = -1, P();
			} catch {
				f.get(e) === t && n === t.generation && k(e, t);
			}
		};
		I(e.complete ? r() : new Promise((i) => {
			e.addEventListener("load", () => i(r()), { once: !0 }), e.addEventListener("error", () => i(f.get(e) === t && n === t.generation ? k(e, t) : void 0), { once: !0 });
		}));
	}, z = () => {
		if (d) return;
		let t = /* @__PURE__ */ new Set();
		e instanceof HTMLImageElement && e.matches(r) && t.add(e);
		for (let n of e.querySelectorAll(r)) n instanceof HTMLImageElement && t.add(n);
		for (let [e, n] of f) t.has(e) ? C(n) && e.nextSibling !== n.canvas && D(e, n) : A(e, n);
		for (let e of t) f.has(e) || L(e);
	}, B = new MutationObserver((e) => {
		for (let { type: t, target: n, attributeName: r } of e) {
			if (t !== "attributes" || !(n instanceof HTMLImageElement)) continue;
			let e = f.get(n);
			e && ($.includes(r) ? e.canvas && b(n, e.canvas, r) : r !== "data-huet-recolor" && R(n, e));
		}
		z();
	});
	return z(), B.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: [
			"src",
			"srcset",
			"sizes",
			"data-huet-recolor",
			...$
		]
	}), {
		update(e, t) {
			if (d) throw Error("Cannot update a destroyed Huet image mount");
			s = e, t && (c = t), l++, P();
		},
		async ready() {
			do
				await Promise.all(_), d || N(!0);
			while (_.size);
		},
		destroy() {
			if (!d) {
				d = !0, u !== void 0 && cancelAnimationFrame(u), B.disconnect(), F.disconnect();
				for (let [e, t] of f) A(e, t);
				_ = /* @__PURE__ */ new Set();
			}
		}
	};
}
export { M as GpuRecolor, re as applyLut, ie as applyTransform, Z as blendLayers, ne as buildLut, R as coordinatesOf, ge as hasGpu, he as mountIframes, ye as mountImages, ue as mountSvgs, pe as mountVideos, te as rampColor, Q as recolorImage, z as recolorer, ae as toCube };

//# sourceMappingURL=images.js.map