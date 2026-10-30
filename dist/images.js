import { _ as e, a as t, g as n, h as r, i, r as a } from "./theme-C2LgQ8y2.js";
// src/core/gpu.ts
var o = "#version 300 es\nin vec2 position;\nout vec2 uv;\nvoid main() {\n  uv = position * 0.5 + 0.5;\n  gl_Position = vec4(position, 0.0, 1.0);\n}", s = "#version 300 es\nprecision highp float;\nprecision highp sampler3D;\nuniform sampler2D image;\nuniform sampler3D lut;\nuniform float size;\nin vec2 uv;\nout vec4 color;\nvoid main() {\n  vec4 c = texture(image, vec2(uv.x, 1.0 - uv.y));\n  // Sample lattice centers so 0 and 1 hit the first and last LUT entries.\n  vec3 p = (c.rgb * (size - 1.0) + 0.5) / size;\n  color = vec4(texture(lut, p).rgb, c.a);\n}", c = class {
	constructor() {
		this.canvas = document.createElement("canvas"), this.textures = /* @__PURE__ */ new WeakMap(), this.scratch = null, this.currentLut = null;
		let e = this.canvas.getContext("webgl2", {
			premultipliedAlpha: !1,
			preserveDrawingBuffer: !0
		});
		if (!e) throw Error("WebGL2 is not available");
		this.gl = e;
		let t = e.createProgram();
		for (let [n, r] of [[e.VERTEX_SHADER, o], [e.FRAGMENT_SHADER, s]]) {
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
		this.texture(e), this.canvas.width = n, this.canvas.height = r, i.viewport(0, 0, n, r), i.drawArrays(i.TRIANGLE_STRIP, 0, 4), t.width = n, t.height = r;
		let a = t.getContext("2d");
		a.clearRect(0, 0, n, r), a.drawImage(this.canvas, 0, 0);
	}
	finish() {
		let e = /* @__PURE__ */ new Uint8Array(4);
		this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, e);
	}
}, l = 6 / 29, u = (e) => e > l ? 1.16 * e - .16 : 24389 / 2700 * e ** 3, d = (e) => e > .08 ? (e + .16) / 1.16 : Math.cbrt(e * 2700 / 24389), f = (e) => e < l ? (e / l) ** 2 : 1, p = /* @__PURE__ */ new Map();
function m(n) {
	let r = JSON.stringify(n), o = p.get(r);
	if (o) return o;
	let { dark: s, light: c, neutral: l, colors: d } = n, { ramp: f } = t({
		dark: s,
		light: c,
		neutral: l
	}), m = /* @__PURE__ */ new Float64Array(257), h = /* @__PURE__ */ new Float64Array(257), g = /* @__PURE__ */ new Float64Array(257);
	for (let t = 0; t < 257; t++) {
		let [n, r, i] = e(f(t / 256));
		m[t] = Math.max(u(n), t ? m[t - 1] : 0), h[t] = r, g[t] = i;
	}
	let _ = m[0], v = m[256], y = [0, 0], b = (e) => {
		let t = _ + e * (v - _), n = 0, r = 256;
		if (t <= _) r = 0;
		else if (t >= v) n = 256;
		else for (; r - n > 1;) {
			let e = n + r >> 1;
			m[e] < t ? n = e : r = e;
		}
		let i = m[r] > m[n] ? (t - m[n]) / (m[r] - m[n]) : 0;
		return y[0] = h[n] + i * (h[r] - h[n]), y[1] = g[n] + i * (g[r] - g[n]), y;
	}, x = i.map((t) => e(d?.[t] ?? a[t]));
	return o = {
		low: _,
		high: v,
		neutralAt: b,
		a: Float64Array.from(x, (e) => e[1]),
		b: Float64Array.from(x, (e) => e[2])
	}, p.size >= 64 && p.clear(), p.set(r, o), o;
}
function h(e) {
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
		let s = (u(n) - o) / c, [d, p] = e.neutralAt(s), m = f(n), h = (r - d) * m, g = (i - p) * m;
		if (l.t = s, l.w0 = l.w1 = 0, h * h + g * g < 1e-10) return l;
		for (let { i0: e, i1: t, det: n, m: r } of a) {
			if (n <= 1e-12) continue;
			let i = r[0] * h + r[1] * g, a = r[2] * h + r[3] * g;
			if (i >= -1e-9 && a >= -1e-9) return Object.assign(l, {
				i0: e,
				i1: t,
				w0: Math.max(0, i),
				w1: Math.max(0, a)
			}), l;
		}
		let _ = -Infinity;
		for (let n = 0; n < t; n++) {
			let t = e.a[n] ** 2 + e.b[n] ** 2, r = (h * e.a[n] + g * e.b[n]) / (t || 1), i = r * Math.sqrt(t);
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
function g([e, t, n], a = {}) {
	let { t: o, i0: s, i1: c, w0: l, w1: u } = h(m(a))(r(e, t, n)), d = {};
	return l > 1e-6 && (d[i[s]] = l), u > 1e-6 && (d[i[c]] = (d[i[c]] ?? 0) + u), {
		t: o,
		weights: d
	};
}
function _(e, t = {}) {
	let i = t.strength ?? 1, a = t.tint ?? 1;
	if (!(i >= 0 && i <= 1)) throw RangeError("strength must be between 0 and 1");
	if (!(a >= 0 && a <= 1)) throw RangeError("tint must be between 0 and 1");
	let o = h(m(t.source ?? {})), s = m(e), { low: c, high: l } = s;
	return (e, u, p) => {
		let m = r(e, u, p), { t: h, i0: g, i1: _, w0: v, w1: y } = o(m), b = t.invert ? 1 - h : h, x = a + (1 - a) * Math.max(0, 1 - v - y), S = d(c + b * (l - c)), C = 1 / Math.max(f(S), 1e-6), [w, T] = s.neutralAt(b), E = [
			S,
			x * w + C * (v * s.a[g] + y * s.a[_]),
			x * T + C * (v * s.b[g] + y * s.b[_])
		];
		return n(i === 1 ? E : m.map((e, t) => e + (E[t] - e) * i));
	};
}
function v(e, t, r) {
	let { low: a, high: o, neutralAt: s, a: c, b: l } = m(e), u = r ? i.indexOf(r) : -1, [f, p] = s(t);
	return n([
		d(a + t * (o - a)),
		f + (u >= 0 ? c[u] : 0),
		p + (u >= 0 ? l[u] : 0)
	]);
}
function y(e, t = 33) {
	let n = new Float32Array(t ** 3 * 3), r = 0;
	for (let i = 0; i < t; i++) for (let a = 0; a < t; a++) for (let o = 0; o < t; o++) {
		let s = e(o / (t - 1), a / (t - 1), i / (t - 1));
		n[r++] = s[0], n[r++] = s[1], n[r++] = s[2];
	}
	return n;
}
function b(e, t, n) {
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
function x(e, t) {
	for (let n = 0; n < e.length; n += 4) {
		let r = t(e[n] / 255, e[n + 1] / 255, e[n + 2] / 255);
		e[n] = r[0] * 255, e[n + 1] = r[1] * 255, e[n + 2] = r[2] * 255;
	}
}
function S(e, t, n = "Huet theme") {
	let r = [`TITLE "${n.replace(/"/g, "'")}"`, `LUT_3D_SIZE ${t}`];
	for (let t = 0; t < e.length; t += 3) r.push(`${e[t].toFixed(6)} ${e[t + 1].toFixed(6)} ${e[t + 2].toFixed(6)}`);
	return r.join("\n") + "\n";
}
// src/core/images.ts
function C(e) {
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
var w = /* @__PURE__ */ new Map();
function T(e, { lutSize: t = 17, ...n }) {
	let r = JSON.stringify([
		e,
		n,
		t
	]), i = w.get(r);
	return i || (w.size >= 16 && w.clear(), w.set(r, i = y(_(e, n), t))), i;
}
var E, D = () => {
	if (E === void 0) try {
		E = new c();
	} catch {
		E = null;
	}
	return E;
}, O = () => D() !== null, k = (e) => e instanceof HTMLImageElement ? [e.naturalWidth, e.naturalHeight] : [e.width, e.height];
function A(e, t, n = {}, r = document.createElement("canvas")) {
	let [i, a] = k(e), { renderer: o = "gpu", ...s } = n, c = s.lutSize ?? 17, l = T(C(t), s), u = o === "gpu" ? D() : null;
	if (u) return u.setLut(l, c), u.render(e, r, i, a), r;
	r.width = i, r.height = a;
	let d = r.getContext("2d", { willReadFrequently: !0 });
	d.clearRect(0, 0, i, a), d.drawImage(e, 0, 0);
	let f = d.getImageData(0, 0, i, a);
	return b(f.data, l, c), d.putImageData(f, 0, 0), r;
}
function j(e, t, n = {}) {
	let { selector: r = "img[data-huet-recolor]", hoverOriginal: i = !1, ...a } = n, o = C(t), s = a, c = !1, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set(), f = (e, t) => {
		let n = `${t} ${e}`, r = u.get(n);
		if (!r) {
			let i = new Image();
			i.crossOrigin = t, i.src = e, u.set(n, r = i.decode().then(() => i)), r.catch(() => u.delete(n));
		}
		return r;
	}, p = (e, t, n) => {
		t.written = n, e.getAttribute("src") !== n && e.setAttribute("src", n);
	}, m = (e, t) => {
		if (t.hidden) return;
		let { style: n } = e;
		t.hidden = [n.getPropertyValue("visibility"), n.getPropertyPriority("visibility")], n.setProperty("visibility", "hidden", "important");
	}, h = (e, t) => {
		if (!t.hidden) return;
		let [n, r] = t.hidden;
		n ? e.style.setProperty("visibility", n, r) : e.style.removeProperty("visibility"), t.hidden = void 0;
	}, g = (e, t) => {
		e.setAttribute("data-huet-recolored", "original"), h(e, t);
	}, _ = (e) => {
		e.recolored && URL.revokeObjectURL(e.recolored), e.recolored = void 0;
	}, v = (e, t) => {
		t.leave?.(), h(e, t);
		for (let [n, r] of Object.entries(t.original)) r === null ? e.removeAttribute(n) : e.setAttribute(n, r);
		_(t), e.removeAttribute("data-huet-recolored"), l.delete(e);
	}, y = async (e, t) => {
		let n = ++t.generation, r = t.source;
		if (!r) return g(e, t);
		try {
			let a = await f(r, e.crossOrigin);
			if (c || n !== t.generation || !l.has(e)) return;
			let u = A(a, o, s), d = await new Promise((e) => u.toBlob(e));
			if (c || n !== t.generation || !l.has(e)) return;
			if (!d) throw Error("Could not encode the recolored image");
			if (_(t), t.recolored = URL.createObjectURL(d), e.removeAttribute("srcset"), e.removeAttribute("sizes"), i && e.matches(":hover") || p(e, t, t.recolored), e.setAttribute("data-huet-recolored", ""), !t.hidden) return;
			await e.decode().catch(() => {}), n === t.generation && l.has(e) && h(e, t);
		} catch {
			n === t.generation && l.has(e) && g(e, t);
		}
	}, b = (e) => {
		d.add(e), e.finally(() => d.delete(e));
	}, x = (e) => {
		let t = {
			original: {
				src: e.getAttribute("src"),
				srcset: e.getAttribute("srcset"),
				sizes: e.getAttribute("sizes")
			},
			generation: 0
		};
		if (l.set(e, t), i) {
			let n = () => t.source && p(e, t, t.source), r = () => t.recolored && p(e, t, t.recolored);
			e.addEventListener("pointerenter", n), e.addEventListener("pointerleave", r), t.leave = () => {
				e.removeEventListener("pointerenter", n), e.removeEventListener("pointerleave", r);
			};
		}
		S(e, t);
	}, S = (e, t) => {
		m(e, t);
		let n = async () => {
			l.has(e) && (t.source = (e.srcset ? e.currentSrc : "") || e.src || void 0, await y(e, t));
		};
		b(e.complete ? n() : new Promise((r) => {
			e.addEventListener("load", () => r(n()), { once: !0 }), e.addEventListener("error", () => r(l.get(e) === t ? g(e, t) : void 0), { once: !0 });
		}));
	}, w = () => {
		if (c) return;
		let t = /* @__PURE__ */ new Set();
		e instanceof HTMLImageElement && e.matches(r) && t.add(e);
		for (let n of e.querySelectorAll(r)) t.add(n);
		for (let [e, n] of l) t.has(e) || v(e, n);
		for (let e of t) l.has(e) || x(e);
	}, T = new MutationObserver((e) => {
		for (let { type: t, target: n, attributeName: r } of e) {
			if (t !== "attributes" || !(n instanceof HTMLImageElement)) continue;
			let e = l.get(n);
			if (!e || r === "data-huet-recolor") continue;
			let i = n.getAttribute(r);
			(r === "src" ? i === e.written : i === null) || (r === "src" ? e.original.src = i : e.original.srcset = i, e.source = e.written = void 0, e.generation++, S(n, e));
		}
		w();
	});
	return w(), T.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: [
			"src",
			"srcset",
			"data-huet-recolor"
		]
	}), {
		update(e, t) {
			if (c) throw Error("Cannot update a destroyed Huet image mount");
			o = C(e), t && (s = t);
			for (let [e, t] of l) b(y(e, t));
		},
		async ready() {
			for (; d.size;) await Promise.all(d);
		},
		destroy() {
			if (!c) {
				c = !0, T.disconnect();
				for (let [e, t] of l) v(e, t);
				d = /* @__PURE__ */ new Set();
			}
		}
	};
}
export { c as GpuRecolor, b as applyLut, x as applyTransform, y as buildLut, g as coordinatesOf, O as hasGpu, j as mountImages, C as paletteOf, v as rampColor, A as recolorImage, _ as recolorer, S as toCube };

//# sourceMappingURL=images.js.map