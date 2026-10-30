import { _ as e, b as t, c as n, d as r, l as i, s as a, u as o, v as s, y as c } from "./theme-NOxmHyYn.js";
import { n as l, t as u } from "./fromConfig-Cju5hhJC.js";
import d, { useCallback as f, useContext as p, useEffect as m, useLayoutEffect as h, useMemo as g, useRef as _, useState as v, useSyncExternalStore as y } from "react";
import { Fragment as b, jsx as x, jsxs as S } from "react/jsx-runtime";
import { createPortal as C } from "react-dom";
// src/reactContexts.ts
var ee = d.createContext(null), te = d.createContext(null);
function ne() {
	let e = p(ee);
	if (!e) throw Error("Need to set a theme before using Huet");
	return e;
}
function re() {
	let e = p(te);
	if (!e) throw Error("Need a background color before using Huet");
	return e;
}
// src/Contrast.tsx
var ie = (e) => {
	let { as: t, bg: n, bgRamp: r, text: i, textRamp: a, border: s, borderRamp: c, outline: l, outlineRamp: u, children: f, style: m, debug: h, ...g } = {
		as: "div",
		bg: null,
		border: null,
		outline: null,
		...e
	}, _ = p(ee);
	if (!_) throw Error("Need to set a theme before using a Contrast component");
	let v = _, y = p(te) || o.fromTheme(v);
	function b(e, t, n) {
		let r = n ? v.ramps[n] : void 0;
		return e.contrast(t ?? void 0, r);
	}
	let S = f, C = null, ne = null;
	n == null ? ne = b(y, i, a) : (C = b(y, n, r), ne = b(C, i, a), S = f ? /* @__PURE__ */ x(te.Provider, {
		value: C,
		children: f
	}) : null);
	let re = {
		style: {
			backgroundColor: C,
			color: ne,
			borderColor: s == null ? null : b(y, s, c),
			outlineColor: l == null ? null : b(y, l, u),
			...m
		},
		...g
	};
	return d.createElement(t, re, S);
};
// src/Block.tsx
function ae({ as: e = "div", theme: t, debug: n, style: r, contrast: i = "fg=100", base: a, children: s, ...c }) {
	let l = p(ee), u = p(te), f, m;
	if (t ? (f = t, m = o.fromTheme(t)) : (f = l, m = u), !f) throw Error("Need to set a theme before using a Block");
	if (!m) throw Error("Need a background color before using a Block");
	a && (m = m.base(f.ramps[a]));
	let h;
	if (typeof r == "function") h = r(m);
	else if (r && typeof r == "object") h = r;
	else if (!r) h = null;
	else throw Error("Unsupported style prop value");
	i && (h = {
		...h,
		...se(m, i)
	});
	let g = {
		style: h,
		...c
	}, _ = s;
	if (t && s && (_ = /* @__PURE__ */ x(ee.Provider, {
		value: f,
		children: s
	})), h && h.backgroundColor && h.backgroundColor !== "transparent" && s) {
		let e = h.backgroundColor;
		if (typeof e != "object" || !(e instanceof o)) throw TypeError("Use a Huet Color instance here.");
		_ = /* @__PURE__ */ x(te.Provider, {
			value: e,
			children: _
		});
	} else if (t) {
		if (!s) throw Error("Add children to the <Block> in order to see something on screen.");
		_ = /* @__PURE__ */ x(te.Provider, {
			value: m,
			children: _
		});
	}
	return d.createElement(e, g, _);
}
var oe = {
	bg: "backgroundColor",
	fg: "color",
	b: "borderColor",
	o: "outlineColor"
};
function se(e, t) {
	let n = e.theme, r = t.split(" "), i = {}, a = { parent: e };
	for (let e of r) {
		let [t, r = ""] = e.split("="), [o, s] = (() => {
			let [e, t] = r.split("-");
			if (e && t) return [Number.parseInt(e, 10), t];
			let n = Number.parseInt(e ?? "", 10);
			return Number.isInteger(n) ? [n, void 0] : [void 0, e];
		})(), c = (t ?? "").split("/"), [l, u] = c.length > 1 ? c : ["parent", c[0]];
		if (l === "fg") throw Error("Can't use \"fg\" as the parent as in \"fg/bg=100\". This limitation exists to prevent accidental mistakes assuming you meant \"bg/fg=100\". However, if you think you have a legitimate use case, please create an issue on Github.");
		let d = a[l].contrast(o, s ? n.ramps[s] : void 0);
		a[u] = d;
		let f = oe[u];
		f === "backgroundColor" ? i.backgroundColor = d : f === "color" ? i.color = d : f === "borderColor" ? i.borderColor = d : f === "outlineColor" && (i.outlineColor = d), u === "bg" && (i.color = d.contrast(100));
	}
	return i;
}
// src/private/isThemeConfig.ts
function w(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var ce = ["rescaleSaturationToGrayRange"], le = (e) => typeof e == "number" && Number.isFinite(e);
function ue(e) {
	if (!w(e)) return !1;
	let { id: t, name: n, pallet: r, ramps: i, bgRamp: o } = e;
	if (!((t === void 0 || le(t)) && (n === void 0 || typeof n == "string") && w(r) && Object.values(r).every((e) => typeof e == "string") && w(i) && Object.values(i).every(w) && typeof o == "string" && o in i && le(e.bgRampValue) && le(e.startSignalLightness) && le(e.endSignalLightness) && le(e.contrastMultiplier) && typeof e.rescaleContrastToGrayRange == "boolean")) return !1;
	try {
		return new a(e), !0;
	} catch {
		return !1;
	}
}
function de(e) {
	if (!w(e)) return;
	let t = Object.fromEntries(Object.entries(e).filter(([e]) => !ce.includes(e)));
	return ue(t) ? t : void 0;
}
// src/private/persistentState.ts
var fe = "huet:", pe = "useBrowserState_huet_", me = ["themer:showHelp"], he = 500, ge = (e) => typeof e == "boolean" ? e : void 0;
function _e(e) {
	return (t) => e.includes(t) ? t : void 0;
}
function ve() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function ye(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e.key(n);
		r !== null && t.push(r);
	}
	return t;
}
function be(e, t, n) {
	let r = ve();
	if (!r) return t;
	try {
		let i = r.getItem(fe + e);
		if (i === null) return t;
		let a = n(JSON.parse(i));
		if (a !== void 0) return a;
	} catch {}
	console.warn(`Huet: discarding invalid saved value for "${e}"`);
	try {
		r.removeItem(fe + e);
	} catch {}
	return t;
}
var xe = /* @__PURE__ */ new Map(), Se = /* @__PURE__ */ new Set(), Ce;
function we() {
	for (let e of Se) e();
}
function Te(e, t) {
	xe.set(e, t), clearTimeout(Ce), Ce = setTimeout(Ee, he), we();
}
function Ee() {
	if (clearTimeout(Ce), Ce = void 0, xe.size === 0) return;
	let e = ve();
	for (let [t, n] of xe) try {
		e?.setItem(fe + t, JSON.stringify(n));
	} catch (e) {
		console.warn(`Huet: couldn't save "${t}"`, e);
	}
	xe.clear(), we();
}
function De() {
	clearTimeout(Ce), Ce = void 0, xe.clear(), we();
	let e = ve();
	if (e) for (let t of ye(e)) (t.startsWith(fe) || t.startsWith(pe)) && e.removeItem(t);
}
function Oe() {
	De(), window.location.reload();
}
function ke() {
	let e = ve();
	if (e) try {
		for (let t of ye(e)) t.startsWith(pe) && e.removeItem(t);
		for (let t of me) e.removeItem(fe + t);
	} catch {}
}
typeof window < "u" && (ke(), window.addEventListener("pagehide", Ee), document.addEventListener("visibilitychange", () => {
	document.visibilityState === "hidden" && Ee();
}));
function Ae(e) {
	return Se.add(e), () => {
		Se.delete(e);
	};
}
function je() {
	return y(Ae, () => xe.size > 0, () => !1);
}
function Me(e, t, n) {
	let [r, i] = v(() => be(e, t, n)), a = _(!1);
	return m(() => {
		a.current && Te(e, r);
	}, [e, r]), [r, f((e) => {
		a.current = !0, i(e);
	}, [])];
}
// src/Body.tsx
var Ne = d.createContext(null);
function Pe() {
	let e = p(Ne);
	if (!e) throw Error("Theme configurator is only available inside Body");
	return e;
}
function Fe({ initialThemeConfig: e = n, setDocumentBodyColors: t, ...r }) {
	let [i, s] = Me("theme", e, de), c = new a(i), l = o.fromTheme(c);
	return m(() => {
		t && (document.body.style.backgroundColor = l.toString(), document.body.style.color = l.contrast(100).toString());
	}, [l, t]), /* @__PURE__ */ x(Ne.Provider, {
		value: [c, s],
		children: /* @__PURE__ */ x(ae, {
			theme: c,
			...r
		})
	});
}
// src/private/cx.ts
var Ie = /* @__PURE__ */ t((/* @__PURE__ */ c(((e, t, n) => {
	(function(t, n) {
		typeof define == "function" && define.amd ? define([], n) : e === void 0 ? (n(), t.FileSaver = { exports: {} }.exports) : n();
	})(n, function() {
		function e(e, t) {
			return t === void 0 ? t = { autoBom: !1 } : typeof t != "object" && (console.warn("Deprecated: Expected third argument to be a object"), t = { autoBom: !t }), t.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["﻿", e], { type: e.type }) : e;
		}
		function n(e, t, n) {
			var r = new XMLHttpRequest();
			r.open("GET", e), r.responseType = "blob", r.onload = function() {
				s(r.response, t, n);
			}, r.onerror = function() {
				console.error("could not download file");
			}, r.send();
		}
		function r(e) {
			var t = new XMLHttpRequest();
			t.open("HEAD", e, !1);
			try {
				t.send();
			} catch {}
			return 200 <= t.status && 299 >= t.status;
		}
		function i(e) {
			try {
				e.dispatchEvent(new MouseEvent("click"));
			} catch {
				var t = document.createEvent("MouseEvents");
				t.initMouseEvent("click", !0, !0, window, 0, 0, 0, 80, 20, !1, !1, !1, !1, 0, null), e.dispatchEvent(t);
			}
		}
		var a = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof global == "object" && global.global === global ? global : void 0, o = a.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent), s = a.saveAs || (typeof window != "object" || window !== a ? function() {} : "download" in HTMLAnchorElement.prototype && !o ? function(e, t, o) {
			var s = a.URL || a.webkitURL, c = document.createElement("a");
			t = t || e.name || "download", c.download = t, c.rel = "noopener", typeof e == "string" ? (c.href = e, c.origin === location.origin ? i(c) : r(c.href) ? n(e, t, o) : i(c, c.target = "_blank")) : (c.href = s.createObjectURL(e), setTimeout(function() {
				s.revokeObjectURL(c.href);
			}, 4e4), setTimeout(function() {
				i(c);
			}, 0));
		} : "msSaveOrOpenBlob" in navigator ? function(t, a, o) {
			if (a = a || t.name || "download", typeof t != "string") navigator.msSaveOrOpenBlob(e(t, o), a);
			else if (r(t)) n(t, a, o);
			else {
				var s = document.createElement("a");
				s.href = t, s.target = "_blank", setTimeout(function() {
					i(s);
				});
			}
		} : function(e, t, r, i) {
			if (i ||= open("", "_blank"), i && (i.document.title = i.document.body.innerText = "downloading..."), typeof e == "string") return n(e, t, r);
			var s = e.type === "application/octet-stream", c = /constructor/i.test(a.HTMLElement) || a.safari, l = /CriOS\/[\d]+/.test(navigator.userAgent);
			if ((l || s && c || o) && typeof FileReader < "u") {
				var u = new FileReader();
				u.onloadend = function() {
					var e = u.result;
					e = l ? e : e.replace(/^data:[^;]*;/, "data:attachment/file;"), i ? i.location.href = e : location = e, i = null;
				}, u.readAsDataURL(e);
			} else {
				var d = a.URL || a.webkitURL, f = d.createObjectURL(e);
				i ? i.location = f : location.href = f, i = null, setTimeout(function() {
					d.revokeObjectURL(f);
				}, 4e4);
			}
		});
		a.saveAs = s.saveAs = s, t !== void 0 && (t.exports = s);
	});
})))(), 1);
function T(...e) {
	return e.filter(Boolean).join(" ");
}
// src/private/AllExceptFirst.tsx
var Le = {
	1: "hc:ml-1",
	2: "hc:ml-2",
	3: "hc:ml-4"
}, Re = {
	1: "hc:mt-1",
	2: "hc:mt-2",
	3: "hc:mt-4"
};
function ze({ exceptFirst: e, each: t, children: n }) {
	return d.Children.map(n, (n, r) => /* @__PURE__ */ x("div", {
		className: T(r > 0 && e, t) || void 0,
		children: n
	}));
}
function Be({ size: e = 1, growEach: t, children: n, className: r }) {
	return /* @__PURE__ */ x("div", {
		className: T("hc:flex hc:flex-row", r),
		children: /* @__PURE__ */ x(ze, {
			each: t ? "hc:grow" : void 0,
			exceptFirst: Le[e],
			children: n
		})
	});
}
function Ve({ size: e = 1, children: t, className: n }) {
	return /* @__PURE__ */ x("div", {
		className: T("hc:flex hc:flex-col", n),
		children: /* @__PURE__ */ x(ze, {
			exceptFirst: Re[e],
			children: t
		})
	});
}
// src/private/Arrow.tsx
var He = {
	".5em": "hc:border-x-[.5em] hc:border-b-[.5em]",
	".75em": "hc:border-x-[.75em] hc:border-b-[.75em]"
};
function Ue({ size: e, className: t, style: n }) {
	return /* @__PURE__ */ x("span", {
		className: T("hc:inline-block hc:w-0 hc:h-0 hc:border-x-transparent hc:border-b-current", He[e], t),
		style: n
	});
}
// src/private/displayError.ts
function We(e) {
	console.error(e), alert(e);
}
// src/private/inputClass.ts
var Ge = "hc:py-[.3em] hc:px-[.5em] hc:border hc:max-w-[30em] hc:rounded-xs";
// src/private/Button.tsx
function E({ children: e, className: t, onUpload: n }) {
	return /* @__PURE__ */ S(qe, {
		as: "div",
		"data-focus-within": "",
		className: T("hc:relative", t),
		children: [e, /* @__PURE__ */ x("input", {
			type: "file",
			className: "hc:absolute hc:w-full hc:h-full hc:left-0 hc:top-0 hc:opacity-0",
			onChange: (e) => {
				let t = new FileReader(), r = () => {
					if (typeof t.result == "string") {
						let e;
						try {
							e = JSON.parse(t.result);
						} catch {}
						let r = de(e);
						r ? n(r) : We("That file isn't a valid Huet theme.");
					}
					t.removeEventListener("load", r);
				};
				t.addEventListener("load", r);
				let i = e.target.files?.[0];
				e.target.value = "", i && (i.type === "application/json" || i.name.toLowerCase().endsWith(".json") ? t.readAsText(i) : We("Only JSON files are accepted."));
			}
		})]
	});
}
function Ke(e, t) {
	if (e && !t) throw Error("Need a callback, otherwise `doubleCheck(boolOrMessage, cb)` doesn't do anything.");
	return (n) => {
		(!e || window.confirm(e === !0 ? "Are you sure?" : e)) && t?.(n);
	};
}
function qe({ as: e = "button", colors: t = "huet-bg-12", className: n, children: r, verify: i, onClick: a, ...o }) {
	return /* @__PURE__ */ x(e, {
		onClick: Ke(i, a),
		...o,
		className: T(Ge, "hc:w-full hc:border-transparent hc:cursor-default hc:flex hc:justify-center hc:items-center", t, n),
		children: r
	});
}
function Je({ onClick: e, className: t, verify: n, ...r }) {
	return /* @__PURE__ */ x("button", {
		...r,
		className: T("hc:underline hc:cursor-pointer", t),
		onClick: Ke(n, e)
	});
}
// src/private/BgColors.tsx
function Ye({ theme: e, scaleValue: t, isSelected: n, onClick: r }) {
	let i = e.ramps[e.bgRamp], a = i(t), s = new o({
		theme: e,
		bgColor: null,
		lab: a,
		ramp: i,
		baseRamp: i
	});
	return /* @__PURE__ */ S(qe, {
		colors: "",
		className: "hc:relative hc:h-8",
		style: {
			backgroundColor: s.toString(),
			borderColor: s.contrast(n ? 100 : 12).toString(),
			color: s.contrast(75).toString(),
			boxShadow: `0 2px 10px ${s.shadowColor(.2)}`
		},
		onClick: r,
		children: [
			t * 100,
			"%",
			n && /* @__PURE__ */ x(Ue, {
				size: ".5em",
				className: "hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2 hc:translate-y-px",
				style: { color: s.contrast(100).toString() }
			})
		]
	});
}
function Xe({ theme: e, bgRampValue: t, onRampValueChange: n }) {
	return /* @__PURE__ */ x(Be, {
		growEach: !0,
		size: 2,
		children: [
			0,
			.25,
			.75,
			1
		].map((r) => /* @__PURE__ */ x(Ye, {
			theme: e,
			scaleValue: r,
			isSelected: t === r,
			onClick: () => n(r)
		}, r))
	});
}
// src/private/Checkbox.tsx
function Ze({ label: e, value: t, onChange: n, className: r }) {
	return /* @__PURE__ */ S("label", {
		className: T("huet-text-100 hc:inline-flex hc:relative hc:cursor-default", r),
		children: [
			/* @__PURE__ */ x("input", {
				"aria-label": e,
				type: "checkbox",
				checked: t,
				onChange: (e) => n?.(e.target.checked),
				className: "hc:absolute hc:top-0 hc:left-0 hc:w-full hc:h-full"
			}),
			/* @__PURE__ */ x("span", {
				className: "hc:mr-1 hc:text-[1.25em] hc:leading-none",
				children: t ? "☒" : "☐"
			}),
			/* @__PURE__ */ x("span", { children: e })
		]
	});
}
// src/private/ColorRamps.tsx
var Qe = /* @__PURE__ */ t((/* @__PURE__ */ c(((e, t, n) => {
	(function() {
		var n, r = "Expected a function", i = "__lodash_hash_undefined__", a = "__lodash_placeholder__", o = 1, s = 2, c = 8, l = 16, u = 32, d = 64, f = 128, p = 256, m = 512, h = 1 / 0, g = 9007199254740991, _ = 17976931348623157e292, v = NaN, y = 4294967295, b = y - 1, x = y >>> 1, S = [
			["ary", f],
			["bind", o],
			["bindKey", s],
			["curry", c],
			["curryRight", l],
			["flip", m],
			["partial", u],
			["partialRight", d],
			["rearg", p]
		], C = "[object Arguments]", ee = "[object Array]", te = "[object AsyncFunction]", ne = "[object Boolean]", re = "[object Date]", ie = "[object DOMException]", ae = "[object Error]", oe = "[object Function]", se = "[object GeneratorFunction]", w = "[object Map]", ce = "[object Number]", le = "[object Null]", ue = "[object Object]", de = "[object Promise]", fe = "[object Proxy]", pe = "[object RegExp]", me = "[object Set]", he = "[object String]", ge = "[object Symbol]", _e = "[object Undefined]", ve = "[object WeakMap]", ye = "[object WeakSet]", be = "[object ArrayBuffer]", xe = "[object DataView]", Se = "[object Float32Array]", Ce = "[object Float64Array]", we = "[object Int8Array]", Te = "[object Int16Array]", Ee = "[object Int32Array]", De = "[object Uint8Array]", Oe = "[object Uint8ClampedArray]", ke = "[object Uint16Array]", Ae = "[object Uint32Array]", je = /\b__p \+= '';/g, Me = /\b(__p \+=) '' \+/g, Ne = /(__e\(.*?\)|\b__t\)) \+\n'';/g, Pe = /&(?:amp|lt|gt|quot|#39);/g, Fe = /[&<>"']/g, Ie = RegExp(Pe.source), T = RegExp(Fe.source), Le = /<%-([\s\S]+?)%>/g, Re = /<%([\s\S]+?)%>/g, ze = /<%=([\s\S]+?)%>/g, Be = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Ve = /^\w*$/, He = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Ue = /[\\^$.*+?()[\]{}|]/g, We = RegExp(Ue.source), Ge = /^\s+/, E = /\s/, Ke = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, qe = /\{\n\/\* \[wrapped with (.+)\] \*/, Je = /,? & /, Ye = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, Xe = /[()=,{}\[\]\/\s]/, Ze = /\\(\\)?/g, Qe = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, $e = /\w*$/, et = /^[-+]0x[0-9a-f]+$/i, tt = /^0b[01]+$/i, nt = /^\[object .+?Constructor\]$/, rt = /^0o[0-7]+$/i, it = /^(?:0|[1-9]\d*)$/, at = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, ot = /($^)/, st = /['\n\r\u2028\u2029\\]/g, ct = "\\ud800-\\udfff", lt = "\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff", ut = "\\u2700-\\u27bf", D = "a-z\\xdf-\\xf6\\xf8-\\xff", dt = "\\xac\\xb1\\xd7\\xf7", ft = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", O = "\\u2000-\\u206f", pt = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", mt = "A-Z\\xc0-\\xd6\\xd8-\\xde", ht = "\\ufe0e\\ufe0f", gt = dt + ft + O + pt, _t = "['’]", k = "[" + ct + "]", vt = "[" + gt + "]", yt = "[" + lt + "]", bt = "\\d+", xt = "[" + ut + "]", St = "[" + D + "]", Ct = "[^" + ct + gt + bt + ut + D + mt + "]", wt = "\\ud83c[\\udffb-\\udfff]", Tt = "(?:" + yt + "|" + wt + ")", Et = "[^" + ct + "]", Dt = "(?:\\ud83c[\\udde6-\\uddff]){2}", Ot = "[\\ud800-\\udbff][\\udc00-\\udfff]", kt = "[" + mt + "]", At = "\\u200d", jt = "(?:" + St + "|" + Ct + ")", Mt = "(?:" + kt + "|" + Ct + ")", Nt = "(?:" + _t + "(?:d|ll|m|re|s|t|ve))?", Pt = "(?:" + _t + "(?:D|LL|M|RE|S|T|VE))?", Ft = Tt + "?", It = "[" + ht + "]?", Lt = "(?:" + At + "(?:" + [
			Et,
			Dt,
			Ot
		].join("|") + ")" + It + Ft + ")*", Rt = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", zt = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", Bt = It + Ft + Lt, Vt = "(?:" + [
			xt,
			Dt,
			Ot
		].join("|") + ")" + Bt, Ht = "(?:" + [
			Et + yt + "?",
			yt,
			Dt,
			Ot,
			k
		].join("|") + ")", Ut = RegExp(_t, "g"), Wt = RegExp(yt, "g"), Gt = RegExp(wt + "(?=" + wt + ")|" + Ht + Bt, "g"), Kt = RegExp([
			kt + "?" + St + "+" + Nt + "(?=" + [
				vt,
				kt,
				"$"
			].join("|") + ")",
			Mt + "+" + Pt + "(?=" + [
				vt,
				kt + jt,
				"$"
			].join("|") + ")",
			kt + "?" + jt + "+" + Nt,
			kt + "+" + Pt,
			zt,
			Rt,
			bt,
			Vt
		].join("|"), "g"), qt = RegExp("[" + At + ct + lt + ht + "]"), A = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Jt = /* @__PURE__ */ "Array.Buffer.DataView.Date.Error.Float32Array.Float64Array.Function.Int8Array.Int16Array.Int32Array.Map.Math.Object.Promise.RegExp.Set.String.Symbol.TypeError.Uint8Array.Uint8ClampedArray.Uint16Array.Uint32Array.WeakMap._.clearTimeout.isFinite.parseInt.setTimeout".split("."), Yt = -1, j = {};
		j[Se] = j[Ce] = j[we] = j[Te] = j[Ee] = j[De] = j[Oe] = j[ke] = j[Ae] = !0, j[C] = j[ee] = j[be] = j[ne] = j[xe] = j[re] = j[ae] = j[oe] = j[w] = j[ce] = j[ue] = j[pe] = j[me] = j[he] = j[ve] = !1;
		var M = {};
		M[C] = M[ee] = M[be] = M[xe] = M[ne] = M[re] = M[Se] = M[Ce] = M[we] = M[Te] = M[Ee] = M[w] = M[ce] = M[ue] = M[pe] = M[me] = M[he] = M[ge] = M[De] = M[Oe] = M[ke] = M[Ae] = !0, M[ae] = M[oe] = M[ve] = !1;
		var N = {
			À: "A",
			Á: "A",
			Â: "A",
			Ã: "A",
			Ä: "A",
			Å: "A",
			à: "a",
			á: "a",
			â: "a",
			ã: "a",
			ä: "a",
			å: "a",
			Ç: "C",
			ç: "c",
			Ð: "D",
			ð: "d",
			È: "E",
			É: "E",
			Ê: "E",
			Ë: "E",
			è: "e",
			é: "e",
			ê: "e",
			ë: "e",
			Ì: "I",
			Í: "I",
			Î: "I",
			Ï: "I",
			ì: "i",
			í: "i",
			î: "i",
			ï: "i",
			Ñ: "N",
			ñ: "n",
			Ò: "O",
			Ó: "O",
			Ô: "O",
			Õ: "O",
			Ö: "O",
			Ø: "O",
			ò: "o",
			ó: "o",
			ô: "o",
			õ: "o",
			ö: "o",
			ø: "o",
			Ù: "U",
			Ú: "U",
			Û: "U",
			Ü: "U",
			ù: "u",
			ú: "u",
			û: "u",
			ü: "u",
			Ý: "Y",
			ý: "y",
			ÿ: "y",
			Æ: "Ae",
			æ: "ae",
			Þ: "Th",
			þ: "th",
			ß: "ss",
			Ā: "A",
			Ă: "A",
			Ą: "A",
			ā: "a",
			ă: "a",
			ą: "a",
			Ć: "C",
			Ĉ: "C",
			Ċ: "C",
			Č: "C",
			ć: "c",
			ĉ: "c",
			ċ: "c",
			č: "c",
			Ď: "D",
			Đ: "D",
			ď: "d",
			đ: "d",
			Ē: "E",
			Ĕ: "E",
			Ė: "E",
			Ę: "E",
			Ě: "E",
			ē: "e",
			ĕ: "e",
			ė: "e",
			ę: "e",
			ě: "e",
			Ĝ: "G",
			Ğ: "G",
			Ġ: "G",
			Ģ: "G",
			ĝ: "g",
			ğ: "g",
			ġ: "g",
			ģ: "g",
			Ĥ: "H",
			Ħ: "H",
			ĥ: "h",
			ħ: "h",
			Ĩ: "I",
			Ī: "I",
			Ĭ: "I",
			Į: "I",
			İ: "I",
			ĩ: "i",
			ī: "i",
			ĭ: "i",
			į: "i",
			ı: "i",
			Ĵ: "J",
			ĵ: "j",
			Ķ: "K",
			ķ: "k",
			ĸ: "k",
			Ĺ: "L",
			Ļ: "L",
			Ľ: "L",
			Ŀ: "L",
			Ł: "L",
			ĺ: "l",
			ļ: "l",
			ľ: "l",
			ŀ: "l",
			ł: "l",
			Ń: "N",
			Ņ: "N",
			Ň: "N",
			Ŋ: "N",
			ń: "n",
			ņ: "n",
			ň: "n",
			ŋ: "n",
			Ō: "O",
			Ŏ: "O",
			Ő: "O",
			ō: "o",
			ŏ: "o",
			ő: "o",
			Ŕ: "R",
			Ŗ: "R",
			Ř: "R",
			ŕ: "r",
			ŗ: "r",
			ř: "r",
			Ś: "S",
			Ŝ: "S",
			Ş: "S",
			Š: "S",
			ś: "s",
			ŝ: "s",
			ş: "s",
			š: "s",
			Ţ: "T",
			Ť: "T",
			Ŧ: "T",
			ţ: "t",
			ť: "t",
			ŧ: "t",
			Ũ: "U",
			Ū: "U",
			Ŭ: "U",
			Ů: "U",
			Ű: "U",
			Ų: "U",
			ũ: "u",
			ū: "u",
			ŭ: "u",
			ů: "u",
			ű: "u",
			ų: "u",
			Ŵ: "W",
			ŵ: "w",
			Ŷ: "Y",
			ŷ: "y",
			Ÿ: "Y",
			Ź: "Z",
			Ż: "Z",
			Ž: "Z",
			ź: "z",
			ż: "z",
			ž: "z",
			Ĳ: "IJ",
			ĳ: "ij",
			Œ: "Oe",
			œ: "oe",
			ŉ: "'n",
			ſ: "s"
		}, Xt = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;",
			"'": "&#39;"
		}, Zt = {
			"&amp;": "&",
			"&lt;": "<",
			"&gt;": ">",
			"&quot;": "\"",
			"&#39;": "'"
		}, Qt = {
			"\\": "\\",
			"'": "'",
			"\n": "n",
			"\r": "r",
			"\u2028": "u2028",
			"\u2029": "u2029"
		}, $t = parseFloat, en = parseInt, tn = typeof global == "object" && global && global.Object === Object && global, nn = typeof self == "object" && self && self.Object === Object && self, P = tn || nn || Function("return this")(), rn = typeof e == "object" && e && !e.nodeType && e, an = rn && typeof t == "object" && t && !t.nodeType && t, on = an && an.exports === rn, sn = on && tn.process, F = function() {
			try {
				return an && an.require && an.require("util").types || sn && sn.binding && sn.binding("util");
			} catch {}
		}(), cn = F && F.isArrayBuffer, ln = F && F.isDate, un = F && F.isMap, dn = F && F.isRegExp, fn = F && F.isSet, pn = F && F.isTypedArray;
		function mn(e, t, n) {
			switch (n.length) {
				case 0: return e.call(t);
				case 1: return e.call(t, n[0]);
				case 2: return e.call(t, n[0], n[1]);
				case 3: return e.call(t, n[0], n[1], n[2]);
			}
			return e.apply(t, n);
		}
		function hn(e, t, n, r) {
			for (var i = -1, a = e == null ? 0 : e.length; ++i < a;) {
				var o = e[i];
				t(r, o, n(o), e);
			}
			return r;
		}
		function gn(e, t) {
			for (var n = -1, r = e == null ? 0 : e.length; ++n < r && t(e[n], n, e) !== !1;);
			return e;
		}
		function _n(e, t) {
			for (var n = e == null ? 0 : e.length; n-- && t(e[n], n, e) !== !1;);
			return e;
		}
		function vn(e, t) {
			for (var n = -1, r = e == null ? 0 : e.length; ++n < r;) if (!t(e[n], n, e)) return !1;
			return !0;
		}
		function yn(e, t) {
			for (var n = -1, r = e == null ? 0 : e.length, i = 0, a = []; ++n < r;) {
				var o = e[n];
				t(o, n, e) && (a[i++] = o);
			}
			return a;
		}
		function bn(e, t) {
			return !!(e != null && e.length) && jn(e, t, 0) > -1;
		}
		function xn(e, t, n) {
			for (var r = -1, i = e == null ? 0 : e.length; ++r < i;) if (n(t, e[r])) return !0;
			return !1;
		}
		function I(e, t) {
			for (var n = -1, r = e == null ? 0 : e.length, i = Array(r); ++n < r;) i[n] = t(e[n], n, e);
			return i;
		}
		function Sn(e, t) {
			for (var n = -1, r = t.length, i = e.length; ++n < r;) e[i + n] = t[n];
			return e;
		}
		function Cn(e, t, n, r) {
			var i = -1, a = e == null ? 0 : e.length;
			for (r && a && (n = e[++i]); ++i < a;) n = t(n, e[i], i, e);
			return n;
		}
		function wn(e, t, n, r) {
			var i = e == null ? 0 : e.length;
			for (r && i && (n = e[--i]); i--;) n = t(n, e[i], i, e);
			return n;
		}
		function Tn(e, t) {
			for (var n = -1, r = e == null ? 0 : e.length; ++n < r;) if (t(e[n], n, e)) return !0;
			return !1;
		}
		var En = Fn("length");
		function Dn(e) {
			return e.split("");
		}
		function On(e) {
			return e.match(Ye) || [];
		}
		function kn(e, t, n) {
			var r;
			return n(e, function(e, n, i) {
				if (t(e, n, i)) return r = n, !1;
			}), r;
		}
		function An(e, t, n, r) {
			for (var i = e.length, a = n + (r ? 1 : -1); r ? a-- : ++a < i;) if (t(e[a], a, e)) return a;
			return -1;
		}
		function jn(e, t, n) {
			return t === t ? sr(e, t, n) : An(e, Nn, n);
		}
		function Mn(e, t, n, r) {
			for (var i = n - 1, a = e.length; ++i < a;) if (r(e[i], t)) return i;
			return -1;
		}
		function Nn(e) {
			return e !== e;
		}
		function Pn(e, t) {
			var n = e == null ? 0 : e.length;
			return n ? zn(e, t) / n : v;
		}
		function Fn(e) {
			return function(t) {
				return t == null ? n : t[e];
			};
		}
		function In(e) {
			return function(t) {
				return e == null ? n : e[t];
			};
		}
		function Ln(e, t, n, r, i) {
			return i(e, function(e, i, a) {
				n = r ? (r = !1, e) : t(n, e, i, a);
			}), n;
		}
		function Rn(e, t) {
			var n = e.length;
			for (e.sort(t); n--;) e[n] = e[n].value;
			return e;
		}
		function zn(e, t) {
			for (var r, i = -1, a = e.length; ++i < a;) {
				var o = t(e[i]);
				o !== n && (r = r === n ? o : r + o);
			}
			return r;
		}
		function Bn(e, t) {
			for (var n = -1, r = Array(e); ++n < e;) r[n] = t(n);
			return r;
		}
		function Vn(e, t) {
			return I(t, function(t) {
				return [t, e[t]];
			});
		}
		function Hn(e) {
			return e && e.slice(0, dr(e) + 1).replace(Ge, "");
		}
		function Un(e) {
			return function(t) {
				return e(t);
			};
		}
		function Wn(e, t) {
			return I(t, function(t) {
				return e[t];
			});
		}
		function Gn(e, t) {
			return e.has(t);
		}
		function Kn(e, t) {
			for (var n = -1, r = e.length; ++n < r && jn(t, e[n], 0) > -1;);
			return n;
		}
		function qn(e, t) {
			for (var n = e.length; n-- && jn(t, e[n], 0) > -1;);
			return n;
		}
		function Jn(e, t) {
			for (var n = e.length, r = 0; n--;) e[n] === t && ++r;
			return r;
		}
		var Yn = In(N), Xn = In(Xt);
		function Zn(e) {
			return "\\" + Qt[e];
		}
		function Qn(e, t) {
			return e == null ? n : e[t];
		}
		function $n(e) {
			return qt.test(e);
		}
		function er(e) {
			return A.test(e);
		}
		function tr(e) {
			for (var t, n = []; !(t = e.next()).done;) n.push(t.value);
			return n;
		}
		function nr(e) {
			var t = -1, n = Array(e.size);
			return e.forEach(function(e, r) {
				n[++t] = [r, e];
			}), n;
		}
		function rr(e, t) {
			return function(n) {
				return e(t(n));
			};
		}
		function ir(e, t) {
			for (var n = -1, r = e.length, i = 0, o = []; ++n < r;) {
				var s = e[n];
				(s === t || s === a) && (e[n] = a, o[i++] = n);
			}
			return o;
		}
		function ar(e) {
			var t = -1, n = Array(e.size);
			return e.forEach(function(e) {
				n[++t] = e;
			}), n;
		}
		function or(e) {
			var t = -1, n = Array(e.size);
			return e.forEach(function(e) {
				n[++t] = [e, e];
			}), n;
		}
		function sr(e, t, n) {
			for (var r = n - 1, i = e.length; ++r < i;) if (e[r] === t) return r;
			return -1;
		}
		function cr(e, t, n) {
			for (var r = n + 1; r--;) if (e[r] === t) return r;
			return r;
		}
		function lr(e) {
			return $n(e) ? pr(e) : En(e);
		}
		function ur(e) {
			return $n(e) ? mr(e) : Dn(e);
		}
		function dr(e) {
			for (var t = e.length; t-- && E.test(e.charAt(t)););
			return t;
		}
		var fr = In(Zt);
		function pr(e) {
			for (var t = Gt.lastIndex = 0; Gt.test(e);) ++t;
			return t;
		}
		function mr(e) {
			return e.match(Gt) || [];
		}
		function hr(e) {
			return e.match(Kt) || [];
		}
		var gr = (function e(t) {
			t = t == null ? P : gr.defaults(P.Object(), t, gr.pick(P, Jt));
			var E = t.Array, Ye = t.Date, ct = t.Error, lt = t.Function, ut = t.Math, D = t.Object, dt = t.RegExp, ft = t.String, O = t.TypeError, pt = E.prototype, mt = lt.prototype, ht = D.prototype, gt = t["__core-js_shared__"], _t = mt.toString, k = ht.hasOwnProperty, vt = 0, yt = function() {
				var e = /[^.]+$/.exec(gt && gt.keys && gt.keys.IE_PROTO || "");
				return e ? "Symbol(src)_1." + e : "";
			}(), bt = ht.toString, xt = _t.call(D), St = P._, Ct = dt("^" + _t.call(k).replace(Ue, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), wt = on ? t.Buffer : n, Tt = t.Symbol, Et = t.Uint8Array, Dt = wt ? wt.allocUnsafe : n, Ot = rr(D.getPrototypeOf, D), kt = D.create, At = ht.propertyIsEnumerable, jt = pt.splice, Mt = Tt ? Tt.isConcatSpreadable : n, Nt = Tt ? Tt.iterator : n, Pt = Tt ? Tt.toStringTag : n, Ft = function() {
				try {
					var e = zo(D, "defineProperty");
					return e({}, "", {}), e;
				} catch {}
			}(), It = t.clearTimeout !== P.clearTimeout && t.clearTimeout, Lt = Ye && Ye.now !== P.Date.now && Ye.now, Rt = t.setTimeout !== P.setTimeout && t.setTimeout, zt = ut.ceil, Bt = ut.floor, Vt = D.getOwnPropertySymbols, Ht = wt ? wt.isBuffer : n, Gt = t.isFinite, Kt = pt.join, qt = rr(D.keys, D), A = ut.max, N = ut.min, Xt = Ye.now, Zt = t.parseInt, Qt = ut.random, tn = pt.reverse, nn = zo(t, "DataView"), rn = zo(t, "Map"), an = zo(t, "Promise"), sn = zo(t, "Set"), F = zo(t, "WeakMap"), En = zo(D, "create"), Dn = F && new F(), In = {}, sr = Ss(nn), pr = Ss(rn), mr = Ss(an), _r = Ss(sn), vr = Ss(F), yr = Tt ? Tt.prototype : n, br = yr ? yr.valueOf : n, xr = yr ? yr.toString : n;
			function L(e) {
				if (X(e) && !K(e) && !(e instanceof R)) {
					if (e instanceof wr) return e;
					if (k.call(e, "__wrapped__")) return ws(e);
				}
				return new wr(e);
			}
			var Sr = function() {
				function e() {}
				return function(t) {
					if (!Y(t)) return {};
					if (kt) return kt(t);
					e.prototype = t;
					var r = new e();
					return e.prototype = n, r;
				};
			}();
			function Cr() {}
			function wr(e, t) {
				this.__wrapped__ = e, this.__actions__ = [], this.__chain__ = !!t, this.__index__ = 0, this.__values__ = n;
			}
			L.templateSettings = {
				escape: Le,
				evaluate: Re,
				interpolate: ze,
				variable: "",
				imports: { _: L }
			}, L.prototype = Cr.prototype, L.prototype.constructor = L, wr.prototype = Sr(Cr.prototype), wr.prototype.constructor = wr;
			function R(e) {
				this.__wrapped__ = e, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = y, this.__views__ = [];
			}
			function Tr() {
				var e = new R(this.__wrapped__);
				return e.__actions__ = H(this.__actions__), e.__dir__ = this.__dir__, e.__filtered__ = this.__filtered__, e.__iteratees__ = H(this.__iteratees__), e.__takeCount__ = this.__takeCount__, e.__views__ = H(this.__views__), e;
			}
			function Er() {
				if (this.__filtered__) {
					var e = new R(this);
					e.__dir__ = -1, e.__filtered__ = !0;
				} else e = this.clone(), e.__dir__ *= -1;
				return e;
			}
			function Dr() {
				var e = this.__wrapped__.value(), t = this.__dir__, n = K(e), r = t < 0, i = n ? e.length : 0, a = Uo(0, i, this.__views__), o = a.start, s = a.end, c = s - o, l = r ? s : o - 1, u = this.__iteratees__, d = u.length, f = 0, p = N(c, this.__takeCount__);
				if (!n || !r && i == c && p == c) return Ma(e, this.__actions__);
				var m = [];
				outer: for (; c-- && f < p;) {
					l += t;
					for (var h = -1, g = e[l]; ++h < d;) {
						var _ = u[h], v = _.iteratee, y = _.type, b = v(g);
						if (y == 2) g = b;
						else if (!b) {
							if (y == 1) continue outer;
							break outer;
						}
					}
					m[f++] = g;
				}
				return m;
			}
			R.prototype = Sr(Cr.prototype), R.prototype.constructor = R;
			function Or(e) {
				var t = -1, n = e == null ? 0 : e.length;
				for (this.clear(); ++t < n;) {
					var r = e[t];
					this.set(r[0], r[1]);
				}
			}
			function kr() {
				this.__data__ = En ? En(null) : {}, this.size = 0;
			}
			function Ar(e) {
				var t = this.has(e) && delete this.__data__[e];
				return this.size -= +!!t, t;
			}
			function jr(e) {
				var t = this.__data__;
				if (En) {
					var r = t[e];
					return r === i ? n : r;
				}
				return k.call(t, e) ? t[e] : n;
			}
			function Mr(e) {
				var t = this.__data__;
				return En ? t[e] !== n : k.call(t, e);
			}
			function Nr(e, t) {
				var r = this.__data__;
				return this.size += +!this.has(e), r[e] = En && t === n ? i : t, this;
			}
			Or.prototype.clear = kr, Or.prototype.delete = Ar, Or.prototype.get = jr, Or.prototype.has = Mr, Or.prototype.set = Nr;
			function Pr(e) {
				var t = -1, n = e == null ? 0 : e.length;
				for (this.clear(); ++t < n;) {
					var r = e[t];
					this.set(r[0], r[1]);
				}
			}
			function Fr() {
				this.__data__ = [], this.size = 0;
			}
			function Ir(e) {
				var t = this.__data__, n = si(t, e);
				return n < 0 ? !1 : (n == t.length - 1 ? t.pop() : jt.call(t, n, 1), --this.size, !0);
			}
			function Lr(e) {
				var t = this.__data__, r = si(t, e);
				return r < 0 ? n : t[r][1];
			}
			function Rr(e) {
				return si(this.__data__, e) > -1;
			}
			function zr(e, t) {
				var n = this.__data__, r = si(n, e);
				return r < 0 ? (++this.size, n.push([e, t])) : n[r][1] = t, this;
			}
			Pr.prototype.clear = Fr, Pr.prototype.delete = Ir, Pr.prototype.get = Lr, Pr.prototype.has = Rr, Pr.prototype.set = zr;
			function Br(e) {
				var t = -1, n = e == null ? 0 : e.length;
				for (this.clear(); ++t < n;) {
					var r = e[t];
					this.set(r[0], r[1]);
				}
			}
			function Vr() {
				this.size = 0, this.__data__ = {
					hash: new Or(),
					map: new (rn || Pr)(),
					string: new Or()
				};
			}
			function Hr(e) {
				var t = Lo(this, e).delete(e);
				return this.size -= +!!t, t;
			}
			function Ur(e) {
				return Lo(this, e).get(e);
			}
			function Wr(e) {
				return Lo(this, e).has(e);
			}
			function Gr(e, t) {
				var n = Lo(this, e), r = n.size;
				return n.set(e, t), this.size += n.size == r ? 0 : 1, this;
			}
			Br.prototype.clear = Vr, Br.prototype.delete = Hr, Br.prototype.get = Ur, Br.prototype.has = Wr, Br.prototype.set = Gr;
			function Kr(e) {
				var t = -1, n = e == null ? 0 : e.length;
				for (this.__data__ = new Br(); ++t < n;) this.add(e[t]);
			}
			function qr(e) {
				return this.__data__.set(e, i), this;
			}
			function Jr(e) {
				return this.__data__.has(e);
			}
			Kr.prototype.add = Kr.prototype.push = qr, Kr.prototype.has = Jr;
			function Yr(e) {
				var t = this.__data__ = new Pr(e);
				this.size = t.size;
			}
			function Xr() {
				this.__data__ = new Pr(), this.size = 0;
			}
			function Zr(e) {
				var t = this.__data__, n = t.delete(e);
				return this.size = t.size, n;
			}
			function Qr(e) {
				return this.__data__.get(e);
			}
			function $r(e) {
				return this.__data__.has(e);
			}
			function ei(e, t) {
				var n = this.__data__;
				if (n instanceof Pr) {
					var r = n.__data__;
					if (!rn || r.length < 199) return r.push([e, t]), this.size = ++n.size, this;
					n = this.__data__ = new Br(r);
				}
				return n.set(e, t), this.size = n.size, this;
			}
			Yr.prototype.clear = Xr, Yr.prototype.delete = Zr, Yr.prototype.get = Qr, Yr.prototype.has = $r, Yr.prototype.set = ei;
			function ti(e, t) {
				var n = K(e), r = !n && Zl(e), i = !n && !r && eu(e), a = !n && !r && !i && Tu(e), o = n || r || i || a, s = o ? Bn(e.length, ft) : [], c = s.length;
				for (var l in e) (t || k.call(e, l)) && !(o && (l == "length" || i && (l == "offset" || l == "parent") || a && (l == "buffer" || l == "byteLength" || l == "byteOffset") || Zo(l, c))) && s.push(l);
				return s;
			}
			function ni(e) {
				var t = e.length;
				return t ? e[fa(0, t - 1)] : n;
			}
			function ri(e, t) {
				return ys(H(e), pi(t, 0, e.length));
			}
			function ii(e) {
				return ys(H(e));
			}
			function ai(e, t, r) {
				(r !== n && !Jl(e[t], r) || r === n && !(t in e)) && di(e, t, r);
			}
			function oi(e, t, r) {
				var i = e[t];
				(!(k.call(e, t) && Jl(i, r)) || r === n && !(t in e)) && di(e, t, r);
			}
			function si(e, t) {
				for (var n = e.length; n--;) if (Jl(e[n][0], t)) return n;
				return -1;
			}
			function ci(e, t, n, r) {
				return yi(e, function(e, i, a) {
					t(r, e, n(e), a);
				}), r;
			}
			function li(e, t) {
				return e && Za(t, $(t), e);
			}
			function ui(e, t) {
				return e && Za(t, ad(t), e);
			}
			function di(e, t, n) {
				t == "__proto__" && Ft ? Ft(e, t, {
					configurable: !0,
					enumerable: !0,
					value: n,
					writable: !0
				}) : e[t] = n;
			}
			function fi(e, t) {
				for (var r = -1, i = t.length, a = E(i), o = e == null; ++r < i;) a[r] = o ? n : $u(e, t[r]);
				return a;
			}
			function pi(e, t, r) {
				return e === e && (r !== n && (e = e <= r ? e : r), t !== n && (e = e >= t ? e : t)), e;
			}
			function mi(e, t, r, i, a, o) {
				var s, c = t & 1, l = t & 2, u = t & 4;
				if (r && (s = a ? r(e, i, a, o) : r(e)), s !== n) return s;
				if (!Y(e)) return e;
				var d = K(e);
				if (d) {
					if (s = Ko(e), !c) return H(e, s);
				} else {
					var f = W(e), p = f == oe || f == se;
					if (eu(e)) return Va(e, c);
					if (f == ue || f == C || p && !a) {
						if (s = l || p ? {} : qo(e), !c) return l ? $a(e, ui(s, e)) : Qa(e, li(s, e));
					} else {
						if (!M[f]) return a ? e : {};
						s = Jo(e, f, c);
					}
				}
				o ||= new Yr();
				var m = o.get(e);
				if (m) return m;
				o.set(e, s), Su(e) ? e.forEach(function(n) {
					s.add(mi(n, t, r, n, e, o));
				}) : du(e) && e.forEach(function(n, i) {
					s.set(i, mi(n, t, r, i, e, o));
				});
				var h = d ? n : (u ? l ? No : Mo : l ? ad : $)(e);
				return gn(h || e, function(n, i) {
					h && (i = n, n = e[i]), oi(s, i, mi(n, t, r, i, e, o));
				}), s;
			}
			function hi(e) {
				var t = $(e);
				return function(n) {
					return gi(n, e, t);
				};
			}
			function gi(e, t, r) {
				var i = r.length;
				if (e == null) return !i;
				for (e = D(e); i--;) {
					var a = r[i], o = t[a], s = e[a];
					if (s === n && !(a in e) || !o(s)) return !1;
				}
				return !0;
			}
			function _i(e, t, i) {
				if (typeof e != "function") throw new O(r);
				return hs(function() {
					e.apply(n, i);
				}, t);
			}
			function vi(e, t, n, r) {
				var i = -1, a = bn, o = !0, s = e.length, c = [], l = t.length;
				if (!s) return c;
				n && (t = I(t, Un(n))), r ? (a = xn, o = !1) : t.length >= 200 && (a = Gn, o = !1, t = new Kr(t));
				outer: for (; ++i < s;) {
					var u = e[i], d = n == null ? u : n(u);
					if (u = r || u !== 0 ? u : 0, o && d === d) {
						for (var f = l; f--;) if (t[f] === d) continue outer;
						c.push(u);
					} else a(t, d, r) || c.push(u);
				}
				return c;
			}
			var yi = no(Di), bi = no(Oi, !0);
			function xi(e, t) {
				var n = !0;
				return yi(e, function(e, r, i) {
					return n = !!t(e, r, i), n;
				}), n;
			}
			function Si(e, t, r) {
				for (var i = -1, a = e.length; ++i < a;) {
					var o = e[i], s = t(o);
					if (s != null && (c === n ? s === s && !wu(s) : r(s, c))) var c = s, l = o;
				}
				return l;
			}
			function Ci(e, t, r, i) {
				var a = e.length;
				for (r = Z(r), r < 0 && (r = -r > a ? 0 : a + r), i = i === n || i > a ? a : Z(i), i < 0 && (i += a), i = r > i ? 0 : Nu(i); r < i;) e[r++] = t;
				return e;
			}
			function wi(e, t) {
				var n = [];
				return yi(e, function(e, r, i) {
					t(e, r, i) && n.push(e);
				}), n;
			}
			function z(e, t, n, r, i) {
				var a = -1, o = e.length;
				for (n ||= Xo, i ||= []; ++a < o;) {
					var s = e[a];
					t > 0 && n(s) ? t > 1 ? z(s, t - 1, n, r, i) : Sn(i, s) : r || (i[i.length] = s);
				}
				return i;
			}
			var Ti = ro(), Ei = ro(!0);
			function Di(e, t) {
				return e && Ti(e, t, $);
			}
			function Oi(e, t) {
				return e && Ei(e, t, $);
			}
			function ki(e, t) {
				return yn(t, function(t) {
					return cu(e[t]);
				});
			}
			function Ai(e, t) {
				t = La(t, e);
				for (var r = 0, i = t.length; e != null && r < i;) e = e[xs(t[r++])];
				return r && r == i ? e : n;
			}
			function ji(e, t, n) {
				var r = t(e);
				return K(e) ? r : Sn(r, n(e));
			}
			function B(e) {
				return e == null ? e === n ? _e : le : Pt && Pt in D(e) ? Bo(e) : ls(e);
			}
			function Mi(e, t) {
				return e > t;
			}
			function Ni(e, t) {
				return e != null && k.call(e, t);
			}
			function Pi(e, t) {
				return e != null && t in D(e);
			}
			function Fi(e, t, n) {
				return e >= N(t, n) && e < A(t, n);
			}
			function Ii(e, t, r) {
				for (var i = r ? xn : bn, a = e[0].length, o = e.length, s = o, c = E(o), l = Infinity, u = []; s--;) {
					var d = e[s];
					s && t && (d = I(d, Un(t))), l = N(d.length, l), c[s] = !r && (t || a >= 120 && d.length >= 120) ? new Kr(s && d) : n;
				}
				d = e[0];
				var f = -1, p = c[0];
				outer: for (; ++f < a && u.length < l;) {
					var m = d[f], h = t ? t(m) : m;
					if (m = r || m !== 0 ? m : 0, !(p ? Gn(p, h) : i(u, h, r))) {
						for (s = o; --s;) {
							var g = c[s];
							if (!(g ? Gn(g, h) : i(e[s], h, r))) continue outer;
						}
						p && p.push(h), u.push(m);
					}
				}
				return u;
			}
			function Li(e, t, n, r) {
				return Di(e, function(e, i, a) {
					t(r, n(e), i, a);
				}), r;
			}
			function Ri(e, t, r) {
				t = La(t, e), e = ds(e, t);
				var i = e == null ? e : e[xs(Ys(t))];
				return i == null ? n : mn(i, e, r);
			}
			function zi(e) {
				return X(e) && B(e) == C;
			}
			function Bi(e) {
				return X(e) && B(e) == be;
			}
			function Vi(e) {
				return X(e) && B(e) == re;
			}
			function Hi(e, t, n, r, i) {
				return e === t ? !0 : e == null || t == null || !X(e) && !X(t) ? e !== e && t !== t : Ui(e, t, n, r, Hi, i);
			}
			function Ui(e, t, n, r, i, a) {
				var o = K(e), s = K(t), c = o ? ee : W(e), l = s ? ee : W(t);
				c = c == C ? ue : c, l = l == C ? ue : l;
				var u = c == ue, d = l == ue, f = c == l;
				if (f && eu(e)) {
					if (!eu(t)) return !1;
					o = !0, u = !1;
				}
				if (f && !u) return a ||= new Yr(), o || Tu(e) ? Oo(e, t, n, r, i, a) : ko(e, t, c, n, r, i, a);
				if (!(n & 1)) {
					var p = u && k.call(e, "__wrapped__"), m = d && k.call(t, "__wrapped__");
					if (p || m) {
						var h = p ? e.value() : e, g = m ? t.value() : t;
						return a ||= new Yr(), i(h, g, n, r, a);
					}
				}
				return f ? (a ||= new Yr(), Ao(e, t, n, r, i, a)) : !1;
			}
			function Wi(e) {
				return X(e) && W(e) == w;
			}
			function Gi(e, t, r, i) {
				var a = r.length, o = a, s = !i;
				if (e == null) return !o;
				for (e = D(e); a--;) {
					var c = r[a];
					if (s && c[2] ? c[1] !== e[c[0]] : !(c[0] in e)) return !1;
				}
				for (; ++a < o;) {
					c = r[a];
					var l = c[0], u = e[l], d = c[1];
					if (s && c[2]) {
						if (u === n && !(l in e)) return !1;
					} else {
						var f = new Yr();
						if (i) var p = i(u, d, l, e, t, f);
						if (!(p === n ? Hi(d, u, 3, i, f) : p)) return !1;
					}
				}
				return !0;
			}
			function Ki(e) {
				return !Y(e) || ts(e) ? !1 : (cu(e) ? Ct : nt).test(Ss(e));
			}
			function qi(e) {
				return X(e) && B(e) == pe;
			}
			function Ji(e) {
				return X(e) && W(e) == me;
			}
			function Yi(e) {
				return X(e) && uu(e.length) && !!j[B(e)];
			}
			function Xi(e) {
				return typeof e == "function" ? e : e == null ? pf : typeof e == "object" ? K(e) ? na(e[0], e[1]) : ta(e) : Ef(e);
			}
			function Zi(e) {
				if (!rs(e)) return qt(e);
				var t = [];
				for (var n in D(e)) k.call(e, n) && n != "constructor" && t.push(n);
				return t;
			}
			function Qi(e) {
				if (!Y(e)) return cs(e);
				var t = rs(e), n = [];
				for (var r in e) (r != "constructor" || !t && k.call(e, r)) && n.push(r);
				return n;
			}
			function $i(e, t) {
				return e < t;
			}
			function ea(e, t) {
				var n = -1, r = q(e) ? E(e.length) : [];
				return yi(e, function(e, i, a) {
					r[++n] = t(e, i, a);
				}), r;
			}
			function ta(e) {
				var t = Ro(e);
				return t.length == 1 && t[0][2] ? as(t[0][0], t[0][1]) : function(n) {
					return n === e || Gi(n, e, t);
				};
			}
			function na(e, t) {
				return Qo(e) && is(t) ? as(xs(e), t) : function(r) {
					var i = $u(r, e);
					return i === n && i === t ? td(r, e) : Hi(t, i, 3);
				};
			}
			function ra(e, t, r, i, a) {
				e !== t && Ti(t, function(o, s) {
					if (a ||= new Yr(), Y(o)) ia(e, t, s, r, ra, i, a);
					else {
						var c = i ? i(ps(e, s), o, s + "", e, t, a) : n;
						c === n && (c = o), ai(e, s, c);
					}
				}, ad);
			}
			function ia(e, t, r, i, a, o, s) {
				var c = ps(e, r), l = ps(t, r), u = s.get(l);
				if (u) ai(e, r, u);
				else {
					var d = o ? o(c, l, r + "", e, t, s) : n, f = d === n;
					if (f) {
						var p = K(l), m = !p && eu(l), h = !p && !m && Tu(l);
						d = l, p || m || h ? K(c) ? d = c : J(c) ? d = H(c) : m ? (f = !1, d = Va(l, !0)) : h ? (f = !1, d = Ka(l, !0)) : d = [] : yu(l) || Zl(l) ? (d = c, Zl(c) ? d = Fu(c) : (!Y(c) || cu(c)) && (d = qo(l))) : f = !1;
					}
					f && (s.set(l, d), a(d, l, i, o, s), s.delete(l)), ai(e, r, d);
				}
			}
			function aa(e, t) {
				var r = e.length;
				if (r) return t += t < 0 ? r : 0, Zo(t, r) ? e[t] : n;
			}
			function oa(e, t, n) {
				t = t.length ? I(t, function(e) {
					return K(e) ? function(t) {
						return Ai(t, e.length === 1 ? e[0] : e);
					} : e;
				}) : [pf];
				var r = -1;
				return t = I(t, Un(U())), Rn(ea(e, function(e, n, i) {
					return {
						criteria: I(t, function(t) {
							return t(e);
						}),
						index: ++r,
						value: e
					};
				}), function(e, t) {
					return Ja(e, t, n);
				});
			}
			function sa(e, t) {
				return ca(e, t, function(t, n) {
					return td(e, n);
				});
			}
			function ca(e, t, n) {
				for (var r = -1, i = t.length, a = {}; ++r < i;) {
					var o = t[r], s = Ai(e, o);
					n(s, o) && _a(a, La(o, e), s);
				}
				return a;
			}
			function la(e) {
				return function(t) {
					return Ai(t, e);
				};
			}
			function ua(e, t, n, r) {
				var i = r ? Mn : jn, a = -1, o = t.length, s = e;
				for (e === t && (t = H(t)), n && (s = I(e, Un(n))); ++a < o;) for (var c = 0, l = t[a], u = n ? n(l) : l; (c = i(s, u, c, r)) > -1;) s !== e && jt.call(s, c, 1), jt.call(e, c, 1);
				return e;
			}
			function da(e, t) {
				for (var n = e ? t.length : 0, r = n - 1; n--;) {
					var i = t[n];
					if (n == r || i !== a) {
						var a = i;
						Zo(i) ? jt.call(e, i, 1) : ka(e, i);
					}
				}
				return e;
			}
			function fa(e, t) {
				return e + Bt(Qt() * (t - e + 1));
			}
			function pa(e, t, n, r) {
				for (var i = -1, a = A(zt((t - e) / (n || 1)), 0), o = E(a); a--;) o[r ? a : ++i] = e, e += n;
				return o;
			}
			function ma(e, t) {
				var n = "";
				if (!e || t < 1 || t > g) return n;
				do
					t % 2 && (n += e), t = Bt(t / 2), t && (e += e);
				while (t);
				return n;
			}
			function V(e, t) {
				return gs(us(e, t, pf), e + "");
			}
			function ha(e) {
				return ni(Cd(e));
			}
			function ga(e, t) {
				var n = Cd(e);
				return ys(n, pi(t, 0, n.length));
			}
			function _a(e, t, r, i) {
				if (!Y(e)) return e;
				t = La(t, e);
				for (var a = -1, o = t.length, s = o - 1, c = e; c != null && ++a < o;) {
					var l = xs(t[a]), u = r;
					if (l === "__proto__" || l === "constructor" || l === "prototype") return e;
					if (a != s) {
						var d = c[l];
						u = i ? i(d, l, c) : n, u === n && (u = Y(d) ? d : Zo(t[a + 1]) ? [] : {});
					}
					oi(c, l, u), c = c[l];
				}
				return e;
			}
			var va = Dn ? function(e, t) {
				return Dn.set(e, t), e;
			} : pf, ya = Ft ? function(e, t) {
				return Ft(e, "toString", {
					configurable: !0,
					enumerable: !1,
					value: lf(t),
					writable: !0
				});
			} : pf;
			function ba(e) {
				return ys(Cd(e));
			}
			function xa(e, t, n) {
				var r = -1, i = e.length;
				t < 0 && (t = -t > i ? 0 : i + t), n = n > i ? i : n, n < 0 && (n += i), i = t > n ? 0 : n - t >>> 0, t >>>= 0;
				for (var a = E(i); ++r < i;) a[r] = e[r + t];
				return a;
			}
			function Sa(e, t) {
				var n;
				return yi(e, function(e, r, i) {
					return n = t(e, r, i), !n;
				}), !!n;
			}
			function Ca(e, t, n) {
				var r = 0, i = e == null ? r : e.length;
				if (typeof t == "number" && t === t && i <= x) {
					for (; r < i;) {
						var a = r + i >>> 1, o = e[a];
						o !== null && !wu(o) && (n ? o <= t : o < t) ? r = a + 1 : i = a;
					}
					return i;
				}
				return wa(e, t, pf, n);
			}
			function wa(e, t, r, i) {
				var a = 0, o = e == null ? 0 : e.length;
				if (o === 0) return 0;
				t = r(t);
				for (var s = t !== t, c = t === null, l = wu(t), u = t === n; a < o;) {
					var d = Bt((a + o) / 2), f = r(e[d]), p = f !== n, m = f === null, h = f === f, g = wu(f);
					if (s) var _ = i || h;
					else _ = u ? h && (i || p) : c ? h && p && (i || !m) : l ? h && p && !m && (i || !g) : m || g ? !1 : i ? f <= t : f < t;
					_ ? a = d + 1 : o = d;
				}
				return N(o, b);
			}
			function Ta(e, t) {
				for (var n = -1, r = e.length, i = 0, a = []; ++n < r;) {
					var o = e[n], s = t ? t(o) : o;
					if (!n || !Jl(s, c)) {
						var c = s;
						a[i++] = o === 0 ? 0 : o;
					}
				}
				return a;
			}
			function Ea(e) {
				return typeof e == "number" ? e : wu(e) ? v : +e;
			}
			function Da(e) {
				if (typeof e == "string") return e;
				if (K(e)) return I(e, Da) + "";
				if (wu(e)) return xr ? xr.call(e) : "";
				var t = e + "";
				return t == "0" && 1 / e == -Infinity ? "-0" : t;
			}
			function Oa(e, t, n) {
				var r = -1, i = bn, a = e.length, o = !0, s = [], c = s;
				if (n) o = !1, i = xn;
				else if (a >= 200) {
					var l = t ? null : So(e);
					if (l) return ar(l);
					o = !1, i = Gn, c = new Kr();
				} else c = t ? [] : s;
				outer: for (; ++r < a;) {
					var u = e[r], d = t ? t(u) : u;
					if (u = n || u !== 0 ? u : 0, o && d === d) {
						for (var f = c.length; f--;) if (c[f] === d) continue outer;
						t && c.push(d), s.push(u);
					} else i(c, d, n) || (c !== s && c.push(d), s.push(u));
				}
				return s;
			}
			function ka(e, t) {
				t = La(t, e);
				var n = -1, r = t.length;
				if (!r) return !0;
				for (; ++n < r;) {
					var i = xs(t[n]);
					if (i === "__proto__" && !k.call(e, "__proto__") || (i === "constructor" || i === "prototype") && n < r - 1) return !1;
				}
				var a = ds(e, t);
				return a == null || delete a[xs(Ys(t))];
			}
			function Aa(e, t, n, r) {
				return _a(e, t, n(Ai(e, t)), r);
			}
			function ja(e, t, n, r) {
				for (var i = e.length, a = r ? i : -1; (r ? a-- : ++a < i) && t(e[a], a, e););
				return n ? xa(e, r ? 0 : a, r ? a + 1 : i) : xa(e, r ? a + 1 : 0, r ? i : a);
			}
			function Ma(e, t) {
				var n = e;
				return n instanceof R && (n = n.value()), Cn(t, function(e, t) {
					return t.func.apply(t.thisArg, Sn([e], t.args));
				}, n);
			}
			function Na(e, t, n) {
				var r = e.length;
				if (r < 2) return r ? Oa(e[0]) : [];
				for (var i = -1, a = E(r); ++i < r;) for (var o = e[i], s = -1; ++s < r;) s != i && (a[i] = vi(a[i] || o, e[s], t, n));
				return Oa(z(a, 1), t, n);
			}
			function Pa(e, t, r) {
				for (var i = -1, a = e.length, o = t.length, s = {}; ++i < a;) {
					var c = i < o ? t[i] : n;
					r(s, e[i], c);
				}
				return s;
			}
			function Fa(e) {
				return J(e) ? e : [];
			}
			function Ia(e) {
				return typeof e == "function" ? e : pf;
			}
			function La(e, t) {
				return K(e) ? e : Qo(e, t) ? [e] : bs(Q(e));
			}
			var Ra = V;
			function za(e, t, r) {
				var i = e.length;
				return r = r === n ? i : r, !t && r >= i ? e : xa(e, t, r);
			}
			var Ba = It || function(e) {
				return P.clearTimeout(e);
			};
			function Va(e, t) {
				if (t) return e.slice();
				var n = e.length, r = Dt ? Dt(n) : new e.constructor(n);
				return e.copy(r), r;
			}
			function Ha(e) {
				var t = new e.constructor(e.byteLength);
				return new Et(t).set(new Et(e)), t;
			}
			function Ua(e, t) {
				var n = t ? Ha(e.buffer) : e.buffer;
				return new e.constructor(n, e.byteOffset, e.byteLength);
			}
			function Wa(e) {
				var t = new e.constructor(e.source, $e.exec(e));
				return t.lastIndex = e.lastIndex, t;
			}
			function Ga(e) {
				return br ? D(br.call(e)) : {};
			}
			function Ka(e, t) {
				var n = t ? Ha(e.buffer) : e.buffer;
				return new e.constructor(n, e.byteOffset, e.length);
			}
			function qa(e, t) {
				if (e !== t) {
					var r = e !== n, i = e === null, a = e === e, o = wu(e), s = t !== n, c = t === null, l = t === t, u = wu(t);
					if (!c && !u && !o && e > t || o && s && l && !c && !u || i && s && l || !r && l || !a) return 1;
					if (!i && !o && !u && e < t || u && r && a && !i && !o || c && r && a || !s && a || !l) return -1;
				}
				return 0;
			}
			function Ja(e, t, n) {
				for (var r = -1, i = e.criteria, a = t.criteria, o = i.length, s = n.length; ++r < o;) {
					var c = qa(i[r], a[r]);
					if (c) return r >= s ? c : c * (n[r] == "desc" ? -1 : 1);
				}
				return e.index - t.index;
			}
			function Ya(e, t, n, r) {
				for (var i = -1, a = e.length, o = n.length, s = -1, c = t.length, l = A(a - o, 0), u = E(c + l), d = !r; ++s < c;) u[s] = t[s];
				for (; ++i < o;) (d || i < a) && (u[n[i]] = e[i]);
				for (; l--;) u[s++] = e[i++];
				return u;
			}
			function Xa(e, t, n, r) {
				for (var i = -1, a = e.length, o = -1, s = n.length, c = -1, l = t.length, u = A(a - s, 0), d = E(u + l), f = !r; ++i < u;) d[i] = e[i];
				for (var p = i; ++c < l;) d[p + c] = t[c];
				for (; ++o < s;) (f || i < a) && (d[p + n[o]] = e[i++]);
				return d;
			}
			function H(e, t) {
				var n = -1, r = e.length;
				for (t ||= E(r); ++n < r;) t[n] = e[n];
				return t;
			}
			function Za(e, t, r, i) {
				var a = !r;
				r ||= {};
				for (var o = -1, s = t.length; ++o < s;) {
					var c = t[o], l = i ? i(r[c], e[c], c, r, e) : n;
					l === n && (l = e[c]), a ? di(r, c, l) : oi(r, c, l);
				}
				return r;
			}
			function Qa(e, t) {
				return Za(e, Vo(e), t);
			}
			function $a(e, t) {
				return Za(e, Ho(e), t);
			}
			function eo(e, t) {
				return function(n, r) {
					var i = K(n) ? hn : ci, a = t ? t() : {};
					return i(n, e, U(r, 2), a);
				};
			}
			function to(e) {
				return V(function(t, r) {
					var i = -1, a = r.length, o = a > 1 ? r[a - 1] : n, s = a > 2 ? r[2] : n;
					for (o = e.length > 3 && typeof o == "function" ? (a--, o) : n, s && G(r[0], r[1], s) && (o = a < 3 ? n : o, a = 1), t = D(t); ++i < a;) {
						var c = r[i];
						c && e(t, c, i, o);
					}
					return t;
				});
			}
			function no(e, t) {
				return function(n, r) {
					if (n == null) return n;
					if (!q(n)) return e(n, r);
					for (var i = n.length, a = t ? i : -1, o = D(n); (t ? a-- : ++a < i) && r(o[a], a, o) !== !1;);
					return n;
				};
			}
			function ro(e) {
				return function(t, n, r) {
					for (var i = -1, a = D(t), o = r(t), s = o.length; s--;) {
						var c = o[e ? s : ++i];
						if (n(a[c], c, a) === !1) break;
					}
					return t;
				};
			}
			function io(e, t, n) {
				var r = t & o, i = so(e);
				function a() {
					return (this && this !== P && this instanceof a ? i : e).apply(r ? n : this, arguments);
				}
				return a;
			}
			function ao(e) {
				return function(t) {
					t = Q(t);
					var r = $n(t) ? ur(t) : n, i = r ? r[0] : t.charAt(0), a = r ? za(r, 1).join("") : t.slice(1);
					return i[e]() + a;
				};
			}
			function oo(e) {
				return function(t) {
					return Cn(rf(Ad(t).replace(Ut, "")), e, "");
				};
			}
			function so(e) {
				return function() {
					var t = arguments;
					switch (t.length) {
						case 0: return new e();
						case 1: return new e(t[0]);
						case 2: return new e(t[0], t[1]);
						case 3: return new e(t[0], t[1], t[2]);
						case 4: return new e(t[0], t[1], t[2], t[3]);
						case 5: return new e(t[0], t[1], t[2], t[3], t[4]);
						case 6: return new e(t[0], t[1], t[2], t[3], t[4], t[5]);
						case 7: return new e(t[0], t[1], t[2], t[3], t[4], t[5], t[6]);
					}
					var n = Sr(e.prototype), r = e.apply(n, t);
					return Y(r) ? r : n;
				};
			}
			function co(e, t, r) {
				var i = so(e);
				function a() {
					for (var o = arguments.length, s = E(o), c = o, l = Io(a); c--;) s[c] = arguments[c];
					var u = o < 3 && s[0] !== l && s[o - 1] !== l ? [] : ir(s, l);
					return o -= u.length, o < r ? bo(e, t, fo, a.placeholder, n, s, u, n, n, r - o) : mn(this && this !== P && this instanceof a ? i : e, this, s);
				}
				return a;
			}
			function lo(e) {
				return function(t, r, i) {
					var a = D(t);
					if (!q(t)) {
						var o = U(r, 3);
						t = $(t), r = function(e) {
							return o(a[e], e, a);
						};
					}
					var s = e(t, r, i);
					return s > -1 ? a[o ? t[s] : s] : n;
				};
			}
			function uo(e) {
				return jo(function(t) {
					var i = t.length, a = i, o = wr.prototype.thru;
					for (e && t.reverse(); a--;) {
						var s = t[a];
						if (typeof s != "function") throw new O(r);
						if (o && !l && Fo(s) == "wrapper") var l = new wr([], !0);
					}
					for (a = l ? a : i; ++a < i;) {
						s = t[a];
						var d = Fo(s), m = d == "wrapper" ? Po(s) : n;
						l = m && es(m[0]) && m[1] == (f | c | u | p) && !m[4].length && m[9] == 1 ? l[Fo(m[0])].apply(l, m[3]) : s.length == 1 && es(s) ? l[d]() : l.thru(s);
					}
					return function() {
						var e = arguments, n = e[0];
						if (l && e.length == 1 && K(n)) return l.plant(n).value();
						for (var r = 0, a = i ? t[r].apply(this, e) : n; ++r < i;) a = t[r].call(this, a);
						return a;
					};
				});
			}
			function fo(e, t, r, i, a, u, d, p, h, g) {
				var _ = t & f, v = t & o, y = t & s, b = t & (c | l), x = t & m, S = y ? n : so(e);
				function C() {
					for (var n = arguments.length, o = E(n), s = n; s--;) o[s] = arguments[s];
					if (b) var c = Io(C), l = Jn(o, c);
					if (i && (o = Ya(o, i, a, b)), u && (o = Xa(o, u, d, b)), n -= l, b && n < g) {
						var f = ir(o, c);
						return bo(e, t, fo, C.placeholder, r, o, f, p, h, g - n);
					}
					var m = v ? r : this, ee = y ? m[e] : e;
					return n = o.length, p ? o = fs(o, p) : x && n > 1 && o.reverse(), _ && h < n && (o.length = h), this && this !== P && this instanceof C && (ee = S || so(ee)), ee.apply(m, o);
				}
				return C;
			}
			function po(e, t) {
				return function(n, r) {
					return Li(n, e, t(r), {});
				};
			}
			function mo(e, t) {
				return function(r, i) {
					var a;
					if (r === n && i === n) return t;
					if (r !== n && (a = r), i !== n) {
						if (a === n) return i;
						typeof r == "string" || typeof i == "string" ? (r = Da(r), i = Da(i)) : (r = Ea(r), i = Ea(i)), a = e(r, i);
					}
					return a;
				};
			}
			function ho(e) {
				return jo(function(t) {
					return t = I(t, Un(U())), V(function(n) {
						var r = this;
						return e(t, function(e) {
							return mn(e, r, n);
						});
					});
				});
			}
			function go(e, t) {
				t = t === n ? " " : Da(t);
				var r = t.length;
				if (r < 2) return r ? ma(t, e) : t;
				var i = ma(t, zt(e / lr(t)));
				return $n(t) ? za(ur(i), 0, e).join("") : i.slice(0, e);
			}
			function _o(e, t, n, r) {
				var i = t & o, a = so(e);
				function s() {
					for (var t = -1, o = arguments.length, c = -1, l = r.length, u = E(l + o), d = this && this !== P && this instanceof s ? a : e; ++c < l;) u[c] = r[c];
					for (; o--;) u[c++] = arguments[++t];
					return mn(d, i ? n : this, u);
				}
				return s;
			}
			function vo(e) {
				return function(t, r, i) {
					return i && typeof i != "number" && G(t, r, i) && (r = i = n), t = Mu(t), r === n ? (r = t, t = 0) : r = Mu(r), i = i === n ? t < r ? 1 : -1 : Mu(i), pa(t, r, i, e);
				};
			}
			function yo(e) {
				return function(t, n) {
					return (typeof t != "string" || typeof n != "string") && (t = Pu(t), n = Pu(n)), e(t, n);
				};
			}
			function bo(e, t, r, i, a, l, f, p, m, h) {
				var g = t & c, _ = g ? f : n, v = g ? n : f, y = g ? l : n, b = g ? n : l;
				t |= g ? u : d, t &= ~(g ? d : u), t & 4 || (t &= ~(o | s));
				var x = [
					e,
					t,
					a,
					y,
					_,
					b,
					v,
					p,
					m,
					h
				], S = r.apply(n, x);
				return es(e) && ms(S, x), S.placeholder = i, _s(S, e, t);
			}
			function xo(e) {
				var t = ut[e];
				return function(e, n) {
					if (e = Pu(e), n = n == null ? 0 : N(Z(n), 292), n && Gt(e)) {
						var r = (Q(e) + "e").split("e");
						return r = (Q(t(r[0] + "e" + (+r[1] + n))) + "e").split("e"), +(r[0] + "e" + (+r[1] - n));
					}
					return t(e);
				};
			}
			var So = sn && 1 / ar(new sn([, -0]))[1] == h ? function(e) {
				return new sn(e);
			} : xf;
			function Co(e) {
				return function(t) {
					var n = W(t);
					return n == w ? nr(t) : n == me ? or(t) : Vn(t, e(t));
				};
			}
			function wo(e, t, i, a, f, p, m, h) {
				var g = t & s;
				if (!g && typeof e != "function") throw new O(r);
				var _ = a ? a.length : 0;
				if (_ || (t &= ~(u | d), a = f = n), m = m === n ? m : A(Z(m), 0), h = h === n ? h : Z(h), _ -= f ? f.length : 0, t & d) {
					var v = a, y = f;
					a = f = n;
				}
				var b = g ? n : Po(e), x = [
					e,
					t,
					i,
					a,
					f,
					v,
					y,
					p,
					m,
					h
				];
				if (b && ss(x, b), e = x[0], t = x[1], i = x[2], a = x[3], f = x[4], h = x[9] = x[9] === n ? g ? 0 : e.length : A(x[9] - _, 0), !h && t & (c | l) && (t &= ~(c | l)), !t || t == o) var S = io(e, t, i);
				else S = t == c || t == l ? co(e, t, h) : (t == u || t == (o | u)) && !f.length ? _o(e, t, i, a) : fo.apply(n, x);
				return _s((b ? va : ms)(S, x), e, t);
			}
			function To(e, t, r, i) {
				return e === n || Jl(e, ht[r]) && !k.call(i, r) ? t : e;
			}
			function Eo(e, t, r, i, a, o) {
				return Y(e) && Y(t) && (o.set(t, e), ra(e, t, n, Eo, o), o.delete(t)), e;
			}
			function Do(e) {
				return yu(e) ? n : e;
			}
			function Oo(e, t, r, i, a, o) {
				var s = r & 1, c = e.length, l = t.length;
				if (c != l && !(s && l > c)) return !1;
				var u = o.get(e), d = o.get(t);
				if (u && d) return u == t && d == e;
				var f = -1, p = !0, m = r & 2 ? new Kr() : n;
				for (o.set(e, t), o.set(t, e); ++f < c;) {
					var h = e[f], g = t[f];
					if (i) var _ = s ? i(g, h, f, t, e, o) : i(h, g, f, e, t, o);
					if (_ !== n) {
						if (_) continue;
						p = !1;
						break;
					}
					if (m) {
						if (!Tn(t, function(e, t) {
							if (!Gn(m, t) && (h === e || a(h, e, r, i, o))) return m.push(t);
						})) {
							p = !1;
							break;
						}
					} else if (!(h === g || a(h, g, r, i, o))) {
						p = !1;
						break;
					}
				}
				return o.delete(e), o.delete(t), p;
			}
			function ko(e, t, n, r, i, a, o) {
				switch (n) {
					case xe:
						if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset) return !1;
						e = e.buffer, t = t.buffer;
					case be: return !(e.byteLength != t.byteLength || !a(new Et(e), new Et(t)));
					case ne:
					case re:
					case ce: return Jl(+e, +t);
					case ae: return e.name == t.name && e.message == t.message;
					case pe:
					case he: return e == t + "";
					case w: var s = nr;
					case me:
						var c = r & 1;
						if (s ||= ar, e.size != t.size && !c) return !1;
						var l = o.get(e);
						if (l) return l == t;
						r |= 2, o.set(e, t);
						var u = Oo(s(e), s(t), r, i, a, o);
						return o.delete(e), u;
					case ge: if (br) return br.call(e) == br.call(t);
				}
				return !1;
			}
			function Ao(e, t, r, i, a, o) {
				var s = r & 1, c = Mo(e), l = c.length;
				if (l != Mo(t).length && !s) return !1;
				for (var u = l; u--;) {
					var d = c[u];
					if (!(s ? d in t : k.call(t, d))) return !1;
				}
				var f = o.get(e), p = o.get(t);
				if (f && p) return f == t && p == e;
				var m = !0;
				o.set(e, t), o.set(t, e);
				for (var h = s; ++u < l;) {
					d = c[u];
					var g = e[d], _ = t[d];
					if (i) var v = s ? i(_, g, d, t, e, o) : i(g, _, d, e, t, o);
					if (!(v === n ? g === _ || a(g, _, r, i, o) : v)) {
						m = !1;
						break;
					}
					h ||= d == "constructor";
				}
				if (m && !h) {
					var y = e.constructor, b = t.constructor;
					y != b && "constructor" in e && "constructor" in t && !(typeof y == "function" && y instanceof y && typeof b == "function" && b instanceof b) && (m = !1);
				}
				return o.delete(e), o.delete(t), m;
			}
			function jo(e) {
				return gs(us(e, n, Rs), e + "");
			}
			function Mo(e) {
				return ji(e, $, Vo);
			}
			function No(e) {
				return ji(e, ad, Ho);
			}
			var Po = Dn ? function(e) {
				return Dn.get(e);
			} : xf;
			function Fo(e) {
				for (var t = e.name + "", n = In[t], r = k.call(In, t) ? n.length : 0; r--;) {
					var i = n[r], a = i.func;
					if (a == null || a == e) return i.name;
				}
				return t;
			}
			function Io(e) {
				return (k.call(L, "placeholder") ? L : e).placeholder;
			}
			function U() {
				var e = L.iteratee || mf;
				return e = e === mf ? Xi : e, arguments.length ? e(arguments[0], arguments[1]) : e;
			}
			function Lo(e, t) {
				var n = e.__data__;
				return $o(t) ? n[typeof t == "string" ? "string" : "hash"] : n.map;
			}
			function Ro(e) {
				for (var t = $(e), n = t.length; n--;) {
					var r = t[n], i = e[r];
					t[n] = [
						r,
						i,
						is(i)
					];
				}
				return t;
			}
			function zo(e, t) {
				var r = Qn(e, t);
				return Ki(r) ? r : n;
			}
			function Bo(e) {
				var t = k.call(e, Pt), r = e[Pt];
				try {
					e[Pt] = n;
					var i = !0;
				} catch {}
				var a = bt.call(e);
				return i && (t ? e[Pt] = r : delete e[Pt]), a;
			}
			var Vo = Vt ? function(e) {
				return e == null ? [] : (e = D(e), yn(Vt(e), function(t) {
					return At.call(e, t);
				}));
			} : Af, Ho = Vt ? function(e) {
				for (var t = []; e;) Sn(t, Vo(e)), e = Ot(e);
				return t;
			} : Af, W = B;
			(nn && W(new nn(/* @__PURE__ */ new ArrayBuffer(1))) != xe || rn && W(new rn()) != w || an && W(an.resolve()) != de || sn && W(new sn()) != me || F && W(new F()) != ve) && (W = function(e) {
				var t = B(e), r = t == ue ? e.constructor : n, i = r ? Ss(r) : "";
				if (i) switch (i) {
					case sr: return xe;
					case pr: return w;
					case mr: return de;
					case _r: return me;
					case vr: return ve;
				}
				return t;
			});
			function Uo(e, t, n) {
				for (var r = -1, i = n.length; ++r < i;) {
					var a = n[r], o = a.size;
					switch (a.type) {
						case "drop":
							e += o;
							break;
						case "dropRight":
							t -= o;
							break;
						case "take":
							t = N(t, e + o);
							break;
						case "takeRight": e = A(e, t - o);
					}
				}
				return {
					start: e,
					end: t
				};
			}
			function Wo(e) {
				var t = e.match(qe);
				return t ? t[1].split(Je) : [];
			}
			function Go(e, t, n) {
				t = La(t, e);
				for (var r = -1, i = t.length, a = !1; ++r < i;) {
					var o = xs(t[r]);
					if (!(a = e != null && n(e, o))) break;
					e = e[o];
				}
				return a || ++r != i ? a : (i = e == null ? 0 : e.length, !!i && uu(i) && Zo(o, i) && (K(e) || Zl(e)));
			}
			function Ko(e) {
				var t = e.length, n = new e.constructor(t);
				return t && typeof e[0] == "string" && k.call(e, "index") && (n.index = e.index, n.input = e.input), n;
			}
			function qo(e) {
				return typeof e.constructor == "function" && !rs(e) ? Sr(Ot(e)) : {};
			}
			function Jo(e, t, n) {
				var r = e.constructor;
				switch (t) {
					case be: return Ha(e);
					case ne:
					case re: return new r(+e);
					case xe: return Ua(e, n);
					case Se:
					case Ce:
					case we:
					case Te:
					case Ee:
					case De:
					case Oe:
					case ke:
					case Ae: return Ka(e, n);
					case w: return new r();
					case ce:
					case he: return new r(e);
					case pe: return Wa(e);
					case me: return new r();
					case ge: return Ga(e);
				}
			}
			function Yo(e, t) {
				var n = t.length;
				if (!n) return e;
				var r = n - 1;
				return t[r] = (n > 1 ? "& " : "") + t[r], t = t.join(n > 2 ? ", " : " "), e.replace(Ke, "{\n/* [wrapped with " + t + "] */\n");
			}
			function Xo(e) {
				return K(e) || Zl(e) || !!(Mt && e && e[Mt]);
			}
			function Zo(e, t) {
				var n = typeof e;
				return t ??= g, !!t && (n == "number" || n != "symbol" && it.test(e)) && e > -1 && e % 1 == 0 && e < t;
			}
			function G(e, t, n) {
				if (!Y(n)) return !1;
				var r = typeof t;
				return (r == "number" ? q(n) && Zo(t, n.length) : r == "string" && t in n) ? Jl(n[t], e) : !1;
			}
			function Qo(e, t) {
				if (K(e)) return !1;
				var n = typeof e;
				return n == "number" || n == "symbol" || n == "boolean" || e == null || wu(e) ? !0 : Ve.test(e) || !Be.test(e) || t != null && e in D(t);
			}
			function $o(e) {
				var t = typeof e;
				return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
			}
			function es(e) {
				var t = Fo(e), n = L[t];
				if (typeof n != "function" || !(t in R.prototype)) return !1;
				if (e === n) return !0;
				var r = Po(n);
				return !!r && e === r[0];
			}
			function ts(e) {
				return !!yt && yt in e;
			}
			var ns = gt ? cu : jf;
			function rs(e) {
				var t = e && e.constructor;
				return e === (typeof t == "function" && t.prototype || ht);
			}
			function is(e) {
				return e === e && !Y(e);
			}
			function as(e, t) {
				return function(r) {
					return r != null && r[e] === t && (t !== n || e in D(r));
				};
			}
			function os(e) {
				var t = Al(e, function(e) {
					return n.size === 500 && n.clear(), e;
				}), n = t.cache;
				return t;
			}
			function ss(e, t) {
				var n = e[1], r = t[1], i = n | r, l = i < (o | s | f), u = r == f && n == c || r == f && n == p && e[7].length <= t[8] || r == (f | p) && t[7].length <= t[8] && n == c;
				if (!(l || u)) return e;
				r & o && (e[2] = t[2], i |= n & o ? 0 : 4);
				var d = t[3];
				if (d) {
					var m = e[3];
					e[3] = m ? Ya(m, d, t[4]) : d, e[4] = m ? ir(e[3], a) : t[4];
				}
				return d = t[5], d && (m = e[5], e[5] = m ? Xa(m, d, t[6]) : d, e[6] = m ? ir(e[5], a) : t[6]), d = t[7], d && (e[7] = d), r & f && (e[8] = e[8] == null ? t[8] : N(e[8], t[8])), e[9] ??= t[9], e[0] = t[0], e[1] = i, e;
			}
			function cs(e) {
				var t = [];
				if (e != null) for (var n in D(e)) t.push(n);
				return t;
			}
			function ls(e) {
				return bt.call(e);
			}
			function us(e, t, r) {
				return t = A(t === n ? e.length - 1 : t, 0), function() {
					for (var n = arguments, i = -1, a = A(n.length - t, 0), o = E(a); ++i < a;) o[i] = n[t + i];
					i = -1;
					for (var s = E(t + 1); ++i < t;) s[i] = n[i];
					return s[t] = r(o), mn(e, this, s);
				};
			}
			function ds(e, t) {
				return t.length < 2 ? e : Ai(e, xa(t, 0, -1));
			}
			function fs(e, t) {
				for (var r = e.length, i = N(t.length, r), a = H(e); i--;) {
					var o = t[i];
					e[i] = Zo(o, r) ? a[o] : n;
				}
				return e;
			}
			function ps(e, t) {
				if ((t !== "constructor" || typeof e[t] != "function") && t != "__proto__") return e[t];
			}
			var ms = vs(va), hs = Rt || function(e, t) {
				return P.setTimeout(e, t);
			}, gs = vs(ya);
			function _s(e, t, n) {
				var r = t + "";
				return gs(e, Yo(r, Cs(Wo(r), n)));
			}
			function vs(e) {
				var t = 0, r = 0;
				return function() {
					var i = Xt(), a = 16 - (i - r);
					if (r = i, a > 0) {
						if (++t >= 800) return arguments[0];
					} else t = 0;
					return e.apply(n, arguments);
				};
			}
			function ys(e, t) {
				var r = -1, i = e.length, a = i - 1;
				for (t = t === n ? i : t; ++r < t;) {
					var o = fa(r, a), s = e[o];
					e[o] = e[r], e[r] = s;
				}
				return e.length = t, e;
			}
			var bs = os(function(e) {
				var t = [];
				return e.charCodeAt(0) === 46 && t.push(""), e.replace(He, function(e, n, r, i) {
					t.push(r ? i.replace(Ze, "$1") : n || e);
				}), t;
			});
			function xs(e) {
				if (typeof e == "string" || wu(e)) return e;
				var t = e + "";
				return t == "0" && 1 / e == -Infinity ? "-0" : t;
			}
			function Ss(e) {
				if (e != null) {
					try {
						return _t.call(e);
					} catch {}
					try {
						return e + "";
					} catch {}
				}
				return "";
			}
			function Cs(e, t) {
				return gn(S, function(n) {
					var r = "_." + n[0];
					t & n[1] && !bn(e, r) && e.push(r);
				}), e.sort();
			}
			function ws(e) {
				if (e instanceof R) return e.clone();
				var t = new wr(e.__wrapped__, e.__chain__);
				return t.__actions__ = H(e.__actions__), t.__index__ = e.__index__, t.__values__ = e.__values__, t;
			}
			function Ts(e, t, r) {
				t = (r ? G(e, t, r) : t === n) ? 1 : A(Z(t), 0);
				var i = e == null ? 0 : e.length;
				if (!i || t < 1) return [];
				for (var a = 0, o = 0, s = E(zt(i / t)); a < i;) s[o++] = xa(e, a, a += t);
				return s;
			}
			function Es(e) {
				for (var t = -1, n = e == null ? 0 : e.length, r = 0, i = []; ++t < n;) {
					var a = e[t];
					a && (i[r++] = a);
				}
				return i;
			}
			function Ds() {
				var e = arguments.length;
				if (!e) return [];
				for (var t = E(e - 1), n = arguments[0], r = e; r--;) t[r - 1] = arguments[r];
				return Sn(K(n) ? H(n) : [n], z(t, 1));
			}
			var Os = V(function(e, t) {
				return J(e) ? vi(e, z(t, 1, J, !0)) : [];
			}), ks = V(function(e, t) {
				var r = Ys(t);
				return J(r) && (r = n), J(e) ? vi(e, z(t, 1, J, !0), U(r, 2)) : [];
			}), As = V(function(e, t) {
				var r = Ys(t);
				return J(r) && (r = n), J(e) ? vi(e, z(t, 1, J, !0), n, r) : [];
			});
			function js(e, t, r) {
				var i = e == null ? 0 : e.length;
				return i ? (t = r || t === n ? 1 : Z(t), xa(e, t < 0 ? 0 : t, i)) : [];
			}
			function Ms(e, t, r) {
				var i = e == null ? 0 : e.length;
				return i ? (t = r || t === n ? 1 : Z(t), t = i - t, xa(e, 0, t < 0 ? 0 : t)) : [];
			}
			function Ns(e, t) {
				return e && e.length ? ja(e, U(t, 3), !0, !0) : [];
			}
			function Ps(e, t) {
				return e && e.length ? ja(e, U(t, 3), !0) : [];
			}
			function Fs(e, t, n, r) {
				var i = e == null ? 0 : e.length;
				return i ? (n && typeof n != "number" && G(e, t, n) && (n = 0, r = i), Ci(e, t, n, r)) : [];
			}
			function Is(e, t, n) {
				var r = e == null ? 0 : e.length;
				if (!r) return -1;
				var i = n == null ? 0 : Z(n);
				return i < 0 && (i = A(r + i, 0)), An(e, U(t, 3), i);
			}
			function Ls(e, t, r) {
				var i = e == null ? 0 : e.length;
				if (!i) return -1;
				var a = i - 1;
				return r !== n && (a = Z(r), a = r < 0 ? A(i + a, 0) : N(a, i - 1)), An(e, U(t, 3), a, !0);
			}
			function Rs(e) {
				return e != null && e.length ? z(e, 1) : [];
			}
			function zs(e) {
				return e != null && e.length ? z(e, h) : [];
			}
			function Bs(e, t) {
				return e != null && e.length ? (t = t === n ? 1 : Z(t), z(e, t)) : [];
			}
			function Vs(e) {
				for (var t = -1, n = e == null ? 0 : e.length, r = {}; ++t < n;) {
					var i = e[t];
					di(r, i[0], i[1]);
				}
				return r;
			}
			function Hs(e) {
				return e && e.length ? e[0] : n;
			}
			function Us(e, t, n) {
				var r = e == null ? 0 : e.length;
				if (!r) return -1;
				var i = n == null ? 0 : Z(n);
				return i < 0 && (i = A(r + i, 0)), jn(e, t, i);
			}
			function Ws(e) {
				return e != null && e.length ? xa(e, 0, -1) : [];
			}
			var Gs = V(function(e) {
				var t = I(e, Fa);
				return t.length && t[0] === e[0] ? Ii(t) : [];
			}), Ks = V(function(e) {
				var t = Ys(e), r = I(e, Fa);
				return t === Ys(r) ? t = n : r.pop(), r.length && r[0] === e[0] ? Ii(r, U(t, 2)) : [];
			}), qs = V(function(e) {
				var t = Ys(e), r = I(e, Fa);
				return t = typeof t == "function" ? t : n, t && r.pop(), r.length && r[0] === e[0] ? Ii(r, n, t) : [];
			});
			function Js(e, t) {
				return e == null ? "" : Kt.call(e, t);
			}
			function Ys(e) {
				var t = e == null ? 0 : e.length;
				return t ? e[t - 1] : n;
			}
			function Xs(e, t, r) {
				var i = e == null ? 0 : e.length;
				if (!i) return -1;
				var a = i;
				return r !== n && (a = Z(r), a = a < 0 ? A(i + a, 0) : N(a, i - 1)), t === t ? cr(e, t, a) : An(e, Nn, a, !0);
			}
			function Zs(e, t) {
				return e && e.length ? aa(e, Z(t)) : n;
			}
			var Qs = V($s);
			function $s(e, t) {
				return e && e.length && t && t.length ? ua(e, t) : e;
			}
			function ec(e, t, n) {
				return e && e.length && t && t.length ? ua(e, t, U(n, 2)) : e;
			}
			function tc(e, t, r) {
				return e && e.length && t && t.length ? ua(e, t, n, r) : e;
			}
			var nc = jo(function(e, t) {
				var n = e == null ? 0 : e.length, r = fi(e, t);
				return da(e, I(t, function(e) {
					return Zo(e, n) ? +e : e;
				}).sort(qa)), r;
			});
			function rc(e, t) {
				var n = [];
				if (!(e && e.length)) return n;
				var r = -1, i = [], a = e.length;
				for (t = U(t, 3); ++r < a;) {
					var o = e[r];
					t(o, r, e) && (n.push(o), i.push(r));
				}
				return da(e, i), n;
			}
			function ic(e) {
				return e == null ? e : tn.call(e);
			}
			function ac(e, t, r) {
				var i = e == null ? 0 : e.length;
				return i ? (r && typeof r != "number" && G(e, t, r) ? (t = 0, r = i) : (t = t == null ? 0 : Z(t), r = r === n ? i : Z(r)), xa(e, t, r)) : [];
			}
			function oc(e, t) {
				return Ca(e, t);
			}
			function sc(e, t, n) {
				return wa(e, t, U(n, 2));
			}
			function cc(e, t) {
				var n = e == null ? 0 : e.length;
				if (n) {
					var r = Ca(e, t);
					if (r < n && Jl(e[r], t)) return r;
				}
				return -1;
			}
			function lc(e, t) {
				return Ca(e, t, !0);
			}
			function uc(e, t, n) {
				return wa(e, t, U(n, 2), !0);
			}
			function dc(e, t) {
				if (e != null && e.length) {
					var n = Ca(e, t, !0) - 1;
					if (Jl(e[n], t)) return n;
				}
				return -1;
			}
			function fc(e) {
				return e && e.length ? Ta(e) : [];
			}
			function pc(e, t) {
				return e && e.length ? Ta(e, U(t, 2)) : [];
			}
			function mc(e) {
				var t = e == null ? 0 : e.length;
				return t ? xa(e, 1, t) : [];
			}
			function hc(e, t, r) {
				return e && e.length ? (t = r || t === n ? 1 : Z(t), xa(e, 0, t < 0 ? 0 : t)) : [];
			}
			function gc(e, t, r) {
				var i = e == null ? 0 : e.length;
				return i ? (t = r || t === n ? 1 : Z(t), t = i - t, xa(e, t < 0 ? 0 : t, i)) : [];
			}
			function _c(e, t) {
				return e && e.length ? ja(e, U(t, 3), !1, !0) : [];
			}
			function vc(e, t) {
				return e && e.length ? ja(e, U(t, 3)) : [];
			}
			var yc = V(function(e) {
				return Oa(z(e, 1, J, !0));
			}), bc = V(function(e) {
				var t = Ys(e);
				return J(t) && (t = n), Oa(z(e, 1, J, !0), U(t, 2));
			}), xc = V(function(e) {
				var t = Ys(e);
				return t = typeof t == "function" ? t : n, Oa(z(e, 1, J, !0), n, t);
			});
			function Sc(e) {
				return e && e.length ? Oa(e) : [];
			}
			function Cc(e, t) {
				return e && e.length ? Oa(e, U(t, 2)) : [];
			}
			function wc(e, t) {
				return t = typeof t == "function" ? t : n, e && e.length ? Oa(e, n, t) : [];
			}
			function Tc(e) {
				if (!(e && e.length)) return [];
				var t = 0;
				return e = yn(e, function(e) {
					if (J(e)) return t = A(e.length, t), !0;
				}), Bn(t, function(t) {
					return I(e, Fn(t));
				});
			}
			function Ec(e, t) {
				if (!(e && e.length)) return [];
				var r = Tc(e);
				return t == null ? r : I(r, function(e) {
					return mn(t, n, e);
				});
			}
			var Dc = V(function(e, t) {
				return J(e) ? vi(e, t) : [];
			}), Oc = V(function(e) {
				return Na(yn(e, J));
			}), kc = V(function(e) {
				var t = Ys(e);
				return J(t) && (t = n), Na(yn(e, J), U(t, 2));
			}), Ac = V(function(e) {
				var t = Ys(e);
				return t = typeof t == "function" ? t : n, Na(yn(e, J), n, t);
			}), jc = V(Tc);
			function Mc(e, t) {
				return Pa(e || [], t || [], oi);
			}
			function Nc(e, t) {
				return Pa(e || [], t || [], _a);
			}
			var Pc = V(function(e) {
				var t = e.length, r = t > 1 ? e[t - 1] : n;
				return r = typeof r == "function" ? (e.pop(), r) : n, Ec(e, r);
			});
			function Fc(e) {
				var t = L(e);
				return t.__chain__ = !0, t;
			}
			function Ic(e, t) {
				return t(e), e;
			}
			function Lc(e, t) {
				return t(e);
			}
			var Rc = jo(function(e) {
				var t = e.length, r = t ? e[0] : 0, i = this.__wrapped__, a = function(t) {
					return fi(t, e);
				};
				return t > 1 || this.__actions__.length || !(i instanceof R) || !Zo(r) ? this.thru(a) : (i = i.slice(r, +r + +!!t), i.__actions__.push({
					func: Lc,
					args: [a],
					thisArg: n
				}), new wr(i, this.__chain__).thru(function(e) {
					return t && !e.length && e.push(n), e;
				}));
			});
			function zc() {
				return Fc(this);
			}
			function Bc() {
				return new wr(this.value(), this.__chain__);
			}
			function Vc() {
				this.__values__ === n && (this.__values__ = ju(this.value()));
				var e = this.__index__ >= this.__values__.length;
				return {
					done: e,
					value: e ? n : this.__values__[this.__index__++]
				};
			}
			function Hc() {
				return this;
			}
			function Uc(e) {
				for (var t, r = this; r instanceof Cr;) {
					var i = ws(r);
					i.__index__ = 0, i.__values__ = n, t ? a.__wrapped__ = i : t = i;
					var a = i;
					r = r.__wrapped__;
				}
				return a.__wrapped__ = e, t;
			}
			function Wc() {
				var e = this.__wrapped__;
				if (e instanceof R) {
					var t = e;
					return this.__actions__.length && (t = new R(this)), t = t.reverse(), t.__actions__.push({
						func: Lc,
						args: [ic],
						thisArg: n
					}), new wr(t, this.__chain__);
				}
				return this.thru(ic);
			}
			function Gc() {
				return Ma(this.__wrapped__, this.__actions__);
			}
			var Kc = eo(function(e, t, n) {
				k.call(e, n) ? ++e[n] : di(e, n, 1);
			});
			function qc(e, t, r) {
				var i = K(e) ? vn : xi;
				return r && G(e, t, r) && (t = n), i(e, U(t, 3));
			}
			function Jc(e, t) {
				return (K(e) ? yn : wi)(e, U(t, 3));
			}
			var Yc = lo(Is), Xc = lo(Ls);
			function Zc(e, t) {
				return z(ol(e, t), 1);
			}
			function Qc(e, t) {
				return z(ol(e, t), h);
			}
			function $c(e, t, r) {
				return r = r === n ? 1 : Z(r), z(ol(e, t), r);
			}
			function el(e, t) {
				return (K(e) ? gn : yi)(e, U(t, 3));
			}
			function tl(e, t) {
				return (K(e) ? _n : bi)(e, U(t, 3));
			}
			var nl = eo(function(e, t, n) {
				k.call(e, n) ? e[n].push(t) : di(e, n, [t]);
			});
			function rl(e, t, n, r) {
				e = q(e) ? e : Cd(e), n = n && !r ? Z(n) : 0;
				var i = e.length;
				return n < 0 && (n = A(i + n, 0)), Cu(e) ? n <= i && e.indexOf(t, n) > -1 : !!i && jn(e, t, n) > -1;
			}
			var il = V(function(e, t, n) {
				var r = -1, i = typeof t == "function", a = q(e) ? E(e.length) : [];
				return yi(e, function(e) {
					a[++r] = i ? mn(t, e, n) : Ri(e, t, n);
				}), a;
			}), al = eo(function(e, t, n) {
				di(e, n, t);
			});
			function ol(e, t) {
				return (K(e) ? I : ea)(e, U(t, 3));
			}
			function sl(e, t, r, i) {
				return e == null ? [] : (K(t) || (t = t == null ? [] : [t]), r = i ? n : r, K(r) || (r = r == null ? [] : [r]), oa(e, t, r));
			}
			var cl = eo(function(e, t, n) {
				e[+!n].push(t);
			}, function() {
				return [[], []];
			});
			function ll(e, t, n) {
				var r = K(e) ? Cn : Ln, i = arguments.length < 3;
				return r(e, U(t, 4), n, i, yi);
			}
			function ul(e, t, n) {
				var r = K(e) ? wn : Ln, i = arguments.length < 3;
				return r(e, U(t, 4), n, i, bi);
			}
			function dl(e, t) {
				return (K(e) ? yn : wi)(e, jl(U(t, 3)));
			}
			function fl(e) {
				return (K(e) ? ni : ha)(e);
			}
			function pl(e, t, r) {
				return t = (r ? G(e, t, r) : t === n) ? 1 : Z(t), (K(e) ? ri : ga)(e, t);
			}
			function ml(e) {
				return (K(e) ? ii : ba)(e);
			}
			function hl(e) {
				if (e == null) return 0;
				if (q(e)) return Cu(e) ? lr(e) : e.length;
				var t = W(e);
				return t == w || t == me ? e.size : Zi(e).length;
			}
			function gl(e, t, r) {
				var i = K(e) ? Tn : Sa;
				return r && G(e, t, r) && (t = n), i(e, U(t, 3));
			}
			var _l = V(function(e, t) {
				if (e == null) return [];
				var n = t.length;
				return n > 1 && G(e, t[0], t[1]) ? t = [] : n > 2 && G(t[0], t[1], t[2]) && (t = [t[0]]), oa(e, z(t, 1), []);
			}), vl = Lt || function() {
				return P.Date.now();
			};
			function yl(e, t) {
				if (typeof t != "function") throw new O(r);
				return e = Z(e), function() {
					if (--e < 1) return t.apply(this, arguments);
				};
			}
			function bl(e, t, r) {
				return t = r ? n : t, t = e && t == null ? e.length : t, wo(e, f, n, n, n, n, t);
			}
			function xl(e, t) {
				var i;
				if (typeof t != "function") throw new O(r);
				return e = Z(e), function() {
					return --e > 0 && (i = t.apply(this, arguments)), e <= 1 && (t = n), i;
				};
			}
			var Sl = V(function(e, t, n) {
				var r = o;
				if (n.length) {
					var i = ir(n, Io(Sl));
					r |= u;
				}
				return wo(e, r, t, n, i);
			}), Cl = V(function(e, t, n) {
				var r = o | s;
				if (n.length) {
					var i = ir(n, Io(Cl));
					r |= u;
				}
				return wo(t, r, e, n, i);
			});
			function wl(e, t, r) {
				t = r ? n : t;
				var i = wo(e, c, n, n, n, n, n, t);
				return i.placeholder = wl.placeholder, i;
			}
			function Tl(e, t, r) {
				t = r ? n : t;
				var i = wo(e, l, n, n, n, n, n, t);
				return i.placeholder = Tl.placeholder, i;
			}
			function El(e, t, i) {
				var a, o, s, c, l, u, d = 0, f = !1, p = !1, m = !0;
				if (typeof e != "function") throw new O(r);
				t = Pu(t) || 0, Y(i) && (f = !!i.leading, p = "maxWait" in i, s = p ? A(Pu(i.maxWait) || 0, t) : s, m = "trailing" in i ? !!i.trailing : m);
				function h(t) {
					var r = a, i = o;
					return a = o = n, d = t, c = e.apply(i, r), c;
				}
				function g(e) {
					return d = e, l = hs(y, t), f ? h(e) : c;
				}
				function _(e) {
					var n = e - u, r = e - d, i = t - n;
					return p ? N(i, s - r) : i;
				}
				function v(e) {
					var r = e - u, i = e - d;
					return u === n || r >= t || r < 0 || p && i >= s;
				}
				function y() {
					var e = vl();
					if (v(e)) return b(e);
					l = hs(y, _(e));
				}
				function b(e) {
					return l = n, m && a ? h(e) : (a = o = n, c);
				}
				function x() {
					l !== n && Ba(l), d = 0, a = u = o = l = n;
				}
				function S() {
					return l === n ? c : b(vl());
				}
				function C() {
					var e = vl(), r = v(e);
					if (a = arguments, o = this, u = e, r) {
						if (l === n) return g(u);
						if (p) return Ba(l), l = hs(y, t), h(u);
					}
					return l === n && (l = hs(y, t)), c;
				}
				return C.cancel = x, C.flush = S, C;
			}
			var Dl = V(function(e, t) {
				return _i(e, 1, t);
			}), Ol = V(function(e, t, n) {
				return _i(e, Pu(t) || 0, n);
			});
			function kl(e) {
				return wo(e, m);
			}
			function Al(e, t) {
				if (typeof e != "function" || t != null && typeof t != "function") throw new O(r);
				var n = function() {
					var r = arguments, i = t ? t.apply(this, r) : r[0], a = n.cache;
					if (a.has(i)) return a.get(i);
					var o = e.apply(this, r);
					return n.cache = a.set(i, o) || a, o;
				};
				return n.cache = new (Al.Cache || Br)(), n;
			}
			Al.Cache = Br;
			function jl(e) {
				if (typeof e != "function") throw new O(r);
				return function() {
					var t = arguments;
					switch (t.length) {
						case 0: return !e.call(this);
						case 1: return !e.call(this, t[0]);
						case 2: return !e.call(this, t[0], t[1]);
						case 3: return !e.call(this, t[0], t[1], t[2]);
					}
					return !e.apply(this, t);
				};
			}
			function Ml(e) {
				return xl(2, e);
			}
			var Nl = Ra(function(e, t) {
				t = t.length == 1 && K(t[0]) ? I(t[0], Un(U())) : I(z(t, 1), Un(U()));
				var n = t.length;
				return V(function(r) {
					for (var i = -1, a = N(r.length, n); ++i < a;) r[i] = t[i].call(this, r[i]);
					return mn(e, this, r);
				});
			}), Pl = V(function(e, t) {
				return wo(e, u, n, t, ir(t, Io(Pl)));
			}), Fl = V(function(e, t) {
				return wo(e, d, n, t, ir(t, Io(Fl)));
			}), Il = jo(function(e, t) {
				return wo(e, p, n, n, n, t);
			});
			function Ll(e, t) {
				if (typeof e != "function") throw new O(r);
				return t = t === n ? t : Z(t), V(e, t);
			}
			function Rl(e, t) {
				if (typeof e != "function") throw new O(r);
				return t = t == null ? 0 : A(Z(t), 0), V(function(n) {
					var r = n[t], i = za(n, 0, t);
					return r && Sn(i, r), mn(e, this, i);
				});
			}
			function zl(e, t, n) {
				var i = !0, a = !0;
				if (typeof e != "function") throw new O(r);
				return Y(n) && (i = "leading" in n ? !!n.leading : i, a = "trailing" in n ? !!n.trailing : a), El(e, t, {
					leading: i,
					maxWait: t,
					trailing: a
				});
			}
			function Bl(e) {
				return bl(e, 1);
			}
			function Vl(e, t) {
				return Pl(Ia(t), e);
			}
			function Hl() {
				if (!arguments.length) return [];
				var e = arguments[0];
				return K(e) ? e : [e];
			}
			function Ul(e) {
				return mi(e, 4);
			}
			function Wl(e, t) {
				return t = typeof t == "function" ? t : n, mi(e, 4, t);
			}
			function Gl(e) {
				return mi(e, 5);
			}
			function Kl(e, t) {
				return t = typeof t == "function" ? t : n, mi(e, 5, t);
			}
			function ql(e, t) {
				return t == null || gi(e, t, $(t));
			}
			function Jl(e, t) {
				return e === t || e !== e && t !== t;
			}
			var Yl = yo(Mi), Xl = yo(function(e, t) {
				return e >= t;
			}), Zl = zi(function() {
				return arguments;
			}()) ? zi : function(e) {
				return X(e) && k.call(e, "callee") && !At.call(e, "callee");
			}, K = E.isArray, Ql = cn ? Un(cn) : Bi;
			function q(e) {
				return e != null && uu(e.length) && !cu(e);
			}
			function J(e) {
				return X(e) && q(e);
			}
			function $l(e) {
				return e === !0 || e === !1 || X(e) && B(e) == ne;
			}
			var eu = Ht || jf, tu = ln ? Un(ln) : Vi;
			function nu(e) {
				return X(e) && e.nodeType === 1 && !yu(e);
			}
			function ru(e) {
				if (e == null) return !0;
				if (q(e) && (K(e) || typeof e == "string" || typeof e.splice == "function" || eu(e) || Tu(e) || Zl(e))) return !e.length;
				var t = W(e);
				if (t == w || t == me) return !e.size;
				if (rs(e)) return !Zi(e).length;
				for (var n in e) if (k.call(e, n)) return !1;
				return !0;
			}
			function iu(e, t) {
				return Hi(e, t);
			}
			function au(e, t, r) {
				r = typeof r == "function" ? r : n;
				var i = r ? r(e, t) : n;
				return i === n ? Hi(e, t, n, r) : !!i;
			}
			function ou(e) {
				if (!X(e)) return !1;
				var t = B(e);
				return t == ae || t == ie || typeof e.message == "string" && typeof e.name == "string" && !yu(e);
			}
			function su(e) {
				return typeof e == "number" && Gt(e);
			}
			function cu(e) {
				if (!Y(e)) return !1;
				var t = B(e);
				return t == oe || t == se || t == te || t == fe;
			}
			function lu(e) {
				return typeof e == "number" && e == Z(e);
			}
			function uu(e) {
				return typeof e == "number" && e > -1 && e % 1 == 0 && e <= g;
			}
			function Y(e) {
				var t = typeof e;
				return e != null && (t == "object" || t == "function");
			}
			function X(e) {
				return typeof e == "object" && !!e;
			}
			var du = un ? Un(un) : Wi;
			function fu(e, t) {
				return e === t || Gi(e, t, Ro(t));
			}
			function pu(e, t, r) {
				return r = typeof r == "function" ? r : n, Gi(e, t, Ro(t), r);
			}
			function mu(e) {
				return vu(e) && e != +e;
			}
			function hu(e) {
				if (ns(e)) throw new ct("Unsupported core-js use. Try https://npms.io/search?q=ponyfill.");
				return Ki(e);
			}
			function gu(e) {
				return e === null;
			}
			function _u(e) {
				return e == null;
			}
			function vu(e) {
				return typeof e == "number" || X(e) && B(e) == ce;
			}
			function yu(e) {
				if (!X(e) || B(e) != ue) return !1;
				var t = Ot(e);
				if (t === null) return !0;
				var n = k.call(t, "constructor") && t.constructor;
				return typeof n == "function" && n instanceof n && _t.call(n) == xt;
			}
			var bu = dn ? Un(dn) : qi;
			function xu(e) {
				return lu(e) && e >= -g && e <= g;
			}
			var Su = fn ? Un(fn) : Ji;
			function Cu(e) {
				return typeof e == "string" || !K(e) && X(e) && B(e) == he;
			}
			function wu(e) {
				return typeof e == "symbol" || X(e) && B(e) == ge;
			}
			var Tu = pn ? Un(pn) : Yi;
			function Eu(e) {
				return e === n;
			}
			function Du(e) {
				return X(e) && W(e) == ve;
			}
			function Ou(e) {
				return X(e) && B(e) == ye;
			}
			var ku = yo($i), Au = yo(function(e, t) {
				return e <= t;
			});
			function ju(e) {
				if (!e) return [];
				if (q(e)) return Cu(e) ? ur(e) : H(e);
				if (Nt && e[Nt]) return tr(e[Nt]());
				var t = W(e);
				return (t == w ? nr : t == me ? ar : Cd)(e);
			}
			function Mu(e) {
				return e ? (e = Pu(e), e === h || e === -Infinity ? (e < 0 ? -1 : 1) * _ : e === e ? e : 0) : e === 0 ? e : 0;
			}
			function Z(e) {
				var t = Mu(e), n = t % 1;
				return t === t ? n ? t - n : t : 0;
			}
			function Nu(e) {
				return e ? pi(Z(e), 0, y) : 0;
			}
			function Pu(e) {
				if (typeof e == "number") return e;
				if (wu(e)) return v;
				if (Y(e)) {
					var t = typeof e.valueOf == "function" ? e.valueOf() : e;
					e = Y(t) ? t + "" : t;
				}
				if (typeof e != "string") return e === 0 ? e : +e;
				e = Hn(e);
				var n = tt.test(e);
				return n || rt.test(e) ? en(e.slice(2), n ? 2 : 8) : et.test(e) ? v : +e;
			}
			function Fu(e) {
				return Za(e, ad(e));
			}
			function Iu(e) {
				return e ? pi(Z(e), -g, g) : e === 0 ? e : 0;
			}
			function Q(e) {
				return e == null ? "" : Da(e);
			}
			var Lu = to(function(e, t) {
				if (rs(t) || q(t)) Za(t, $(t), e);
				else for (var n in t) k.call(t, n) && oi(e, n, t[n]);
			}), Ru = to(function(e, t) {
				Za(t, ad(t), e);
			}), zu = to(function(e, t, n, r) {
				Za(t, ad(t), e, r);
			}), Bu = to(function(e, t, n, r) {
				Za(t, $(t), e, r);
			}), Vu = jo(fi);
			function Hu(e, t) {
				var n = Sr(e);
				return t == null ? n : li(n, t);
			}
			var Uu = V(function(e, t) {
				e = D(e);
				var r = -1, i = t.length, a = i > 2 ? t[2] : n;
				for (a && G(t[0], t[1], a) && (i = 1); ++r < i;) for (var o = t[r], s = ad(o), c = -1, l = s.length; ++c < l;) {
					var u = s[c], d = e[u];
					(d === n || Jl(d, ht[u]) && !k.call(e, u)) && (e[u] = o[u]);
				}
				return e;
			}), Wu = V(function(e) {
				return e.push(n, Eo), mn(ld, n, e);
			});
			function Gu(e, t) {
				return kn(e, U(t, 3), Di);
			}
			function Ku(e, t) {
				return kn(e, U(t, 3), Oi);
			}
			function qu(e, t) {
				return e == null ? e : Ti(e, U(t, 3), ad);
			}
			function Ju(e, t) {
				return e == null ? e : Ei(e, U(t, 3), ad);
			}
			function Yu(e, t) {
				return e && Di(e, U(t, 3));
			}
			function Xu(e, t) {
				return e && Oi(e, U(t, 3));
			}
			function Zu(e) {
				return e == null ? [] : ki(e, $(e));
			}
			function Qu(e) {
				return e == null ? [] : ki(e, ad(e));
			}
			function $u(e, t, r) {
				var i = e == null ? n : Ai(e, t);
				return i === n ? r : i;
			}
			function ed(e, t) {
				return e != null && Go(e, t, Ni);
			}
			function td(e, t) {
				return e != null && Go(e, t, Pi);
			}
			var nd = po(function(e, t, n) {
				t != null && typeof t.toString != "function" && (t = bt.call(t)), e[t] = n;
			}, lf(pf)), rd = po(function(e, t, n) {
				t != null && typeof t.toString != "function" && (t = bt.call(t)), k.call(e, t) ? e[t].push(n) : e[t] = [n];
			}, U), id = V(Ri);
			function $(e) {
				return q(e) ? ti(e) : Zi(e);
			}
			function ad(e) {
				return q(e) ? ti(e, !0) : Qi(e);
			}
			function od(e, t) {
				var n = {};
				return t = U(t, 3), Di(e, function(e, r, i) {
					di(n, t(e, r, i), e);
				}), n;
			}
			function sd(e, t) {
				var n = {};
				return t = U(t, 3), Di(e, function(e, r, i) {
					di(n, r, t(e, r, i));
				}), n;
			}
			var cd = to(function(e, t, n) {
				ra(e, t, n);
			}), ld = to(function(e, t, n, r) {
				ra(e, t, n, r);
			}), ud = jo(function(e, t) {
				var n = {};
				if (e == null) return n;
				var r = !1;
				t = I(t, function(t) {
					return t = La(t, e), r ||= t.length > 1, t;
				}), Za(e, No(e), n), r && (n = mi(n, 7, Do));
				for (var i = t.length; i--;) ka(n, t[i]);
				return n;
			});
			function dd(e, t) {
				return pd(e, jl(U(t)));
			}
			var fd = jo(function(e, t) {
				return e == null ? {} : sa(e, t);
			});
			function pd(e, t) {
				if (e == null) return {};
				var n = I(No(e), function(e) {
					return [e];
				});
				return t = U(t), ca(e, n, function(e, n) {
					return t(e, n[0]);
				});
			}
			function md(e, t, r) {
				t = La(t, e);
				var i = -1, a = t.length;
				for (a || (a = 1, e = n); ++i < a;) {
					var o = e == null ? n : e[xs(t[i])];
					o === n && (i = a, o = r), e = cu(o) ? o.call(e) : o;
				}
				return e;
			}
			function hd(e, t, n) {
				return e == null ? e : _a(e, t, n);
			}
			function gd(e, t, r, i) {
				return i = typeof i == "function" ? i : n, e == null ? e : _a(e, t, r, i);
			}
			var _d = Co($), vd = Co(ad);
			function yd(e, t, n) {
				var r = K(e), i = r || eu(e) || Tu(e);
				if (t = U(t, 4), n == null) {
					var a = e && e.constructor;
					n = i ? r ? new a() : [] : Y(e) && cu(a) ? Sr(Ot(e)) : {};
				}
				return (i ? gn : Di)(e, function(e, r, i) {
					return t(n, e, r, i);
				}), n;
			}
			function bd(e, t) {
				return e == null || ka(e, t);
			}
			function xd(e, t, n) {
				return e == null ? e : Aa(e, t, Ia(n));
			}
			function Sd(e, t, r, i) {
				return i = typeof i == "function" ? i : n, e == null ? e : Aa(e, t, Ia(r), i);
			}
			function Cd(e) {
				return e == null ? [] : Wn(e, $(e));
			}
			function wd(e) {
				return e == null ? [] : Wn(e, ad(e));
			}
			function Td(e, t, r) {
				return r === n && (r = t, t = n), r !== n && (r = Pu(r), r = r === r ? r : 0), t !== n && (t = Pu(t), t = t === t ? t : 0), pi(Pu(e), t, r);
			}
			function Ed(e, t, r) {
				return t = Mu(t), r === n ? (r = t, t = 0) : r = Mu(r), e = Pu(e), Fi(e, t, r);
			}
			function Dd(e, t, r) {
				if (r && typeof r != "boolean" && G(e, t, r) && (t = r = n), r === n && (typeof t == "boolean" ? (r = t, t = n) : typeof e == "boolean" && (r = e, e = n)), e === n && t === n ? (e = 0, t = 1) : (e = Mu(e), t === n ? (t = e, e = 0) : t = Mu(t)), e > t) {
					var i = e;
					e = t, t = i;
				}
				if (r || e % 1 || t % 1) {
					var a = Qt();
					return N(e + a * (t - e + $t("1e-" + ((a + "").length - 1))), t);
				}
				return fa(e, t);
			}
			var Od = oo(function(e, t, n) {
				return t = t.toLowerCase(), e + (n ? kd(t) : t);
			});
			function kd(e) {
				return nf(Q(e).toLowerCase());
			}
			function Ad(e) {
				return e = Q(e), e && e.replace(at, Yn).replace(Wt, "");
			}
			function jd(e, t, r) {
				e = Q(e), t = Da(t);
				var i = e.length;
				r = r === n ? i : pi(Z(r), 0, i);
				var a = r;
				return r -= t.length, r >= 0 && e.slice(r, a) == t;
			}
			function Md(e) {
				return e = Q(e), e && T.test(e) ? e.replace(Fe, Xn) : e;
			}
			function Nd(e) {
				return e = Q(e), e && We.test(e) ? e.replace(Ue, "\\$&") : e;
			}
			var Pd = oo(function(e, t, n) {
				return e + (n ? "-" : "") + t.toLowerCase();
			}), Fd = oo(function(e, t, n) {
				return e + (n ? " " : "") + t.toLowerCase();
			}), Id = ao("toLowerCase");
			function Ld(e, t, n) {
				e = Q(e), t = Z(t);
				var r = t ? lr(e) : 0;
				if (!t || r >= t) return e;
				var i = (t - r) / 2;
				return go(Bt(i), n) + e + go(zt(i), n);
			}
			function Rd(e, t, n) {
				e = Q(e), t = Z(t);
				var r = t ? lr(e) : 0;
				return t && r < t ? e + go(t - r, n) : e;
			}
			function zd(e, t, n) {
				e = Q(e), t = Z(t);
				var r = t ? lr(e) : 0;
				return t && r < t ? go(t - r, n) + e : e;
			}
			function Bd(e, t, n) {
				return n || t == null ? t = 0 : t &&= +t, Zt(Q(e).replace(Ge, ""), t || 0);
			}
			function Vd(e, t, r) {
				return t = (r ? G(e, t, r) : t === n) ? 1 : Z(t), ma(Q(e), t);
			}
			function Hd() {
				var e = arguments, t = Q(e[0]);
				return e.length < 3 ? t : t.replace(e[1], e[2]);
			}
			var Ud = oo(function(e, t, n) {
				return e + (n ? "_" : "") + t.toLowerCase();
			});
			function Wd(e, t, r) {
				return r && typeof r != "number" && G(e, t, r) && (t = r = n), r = r === n ? y : r >>> 0, r ? (e = Q(e), e && (typeof t == "string" || t != null && !bu(t)) && (t = Da(t), !t && $n(e)) ? za(ur(e), 0, r) : e.split(t, r)) : [];
			}
			var Gd = oo(function(e, t, n) {
				return e + (n ? " " : "") + nf(t);
			});
			function Kd(e, t, n) {
				return e = Q(e), n = n == null ? 0 : pi(Z(n), 0, e.length), t = Da(t), e.slice(n, n + t.length) == t;
			}
			function qd(e, t, r) {
				var i = L.templateSettings;
				r && G(e, t, r) && (t = n), e = Q(e), t = Bu({}, t, i, To);
				var a = Bu({}, t.imports, i.imports, To), o = $(a), s = Wn(a, o);
				gn(o, function(e) {
					if (Xe.test(e)) throw new ct("Invalid `imports` option passed into `_.template`");
				});
				var c, l, u = 0, d = t.interpolate || ot, f = "__p += '", p = dt((t.escape || ot).source + "|" + d.source + "|" + (d === ze ? Qe : ot).source + "|" + (t.evaluate || ot).source + "|$", "g"), m = "//# sourceURL=" + (k.call(t, "sourceURL") ? (t.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++Yt + "]") + "\n";
				e.replace(p, function(t, n, r, i, a, o) {
					return r ||= i, f += e.slice(u, o).replace(st, Zn), n && (c = !0, f += "' +\n__e(" + n + ") +\n'"), a && (l = !0, f += "';\n" + a + ";\n__p += '"), r && (f += "' +\n((__t = (" + r + ")) == null ? '' : __t) +\n'"), u = o + t.length, t;
				}), f += "';\n";
				var h = k.call(t, "variable") && t.variable;
				if (!h) f = "with (obj) {\n" + f + "\n}\n";
				else if (Xe.test(h)) throw new ct("Invalid `variable` option passed into `_.template`");
				f = (l ? f.replace(je, "") : f).replace(Me, "$1").replace(Ne, "$1;"), f = "function(" + (h || "obj") + ") {\n" + (h ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (c ? ", __e = _.escape" : "") + (l ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + f + "return __p\n}";
				var g = af(function() {
					return lt(o, m + "return " + f).apply(n, s);
				});
				if (g.source = f, ou(g)) throw g;
				return g;
			}
			function Jd(e) {
				return Q(e).toLowerCase();
			}
			function Yd(e) {
				return Q(e).toUpperCase();
			}
			function Xd(e, t, r) {
				if (e = Q(e), e && (r || t === n)) return Hn(e);
				if (!e || !(t = Da(t))) return e;
				var i = ur(e), a = ur(t);
				return za(i, Kn(i, a), qn(i, a) + 1).join("");
			}
			function Zd(e, t, r) {
				if (e = Q(e), e && (r || t === n)) return e.slice(0, dr(e) + 1);
				if (!e || !(t = Da(t))) return e;
				var i = ur(e);
				return za(i, 0, qn(i, ur(t)) + 1).join("");
			}
			function Qd(e, t, r) {
				if (e = Q(e), e && (r || t === n)) return e.replace(Ge, "");
				if (!e || !(t = Da(t))) return e;
				var i = ur(e);
				return za(i, Kn(i, ur(t))).join("");
			}
			function $d(e, t) {
				var r = 30, i = "...";
				if (Y(t)) {
					var a = "separator" in t ? t.separator : a;
					r = "length" in t ? Z(t.length) : r, i = "omission" in t ? Da(t.omission) : i;
				}
				e = Q(e);
				var o = e.length;
				if ($n(e)) {
					var s = ur(e);
					o = s.length;
				}
				if (r >= o) return e;
				var c = r - lr(i);
				if (c < 1) return i;
				var l = s ? za(s, 0, c).join("") : e.slice(0, c);
				if (a === n) return l + i;
				if (s && (c += l.length - c), bu(a)) {
					if (e.slice(c).search(a)) {
						var u, d = l;
						for (a.global || (a = dt(a.source, Q($e.exec(a)) + "g")), a.lastIndex = 0; u = a.exec(d);) var f = u.index;
						l = l.slice(0, f === n ? c : f);
					}
				} else if (e.indexOf(Da(a), c) != c) {
					var p = l.lastIndexOf(a);
					p > -1 && (l = l.slice(0, p));
				}
				return l + i;
			}
			function ef(e) {
				return e = Q(e), e && Ie.test(e) ? e.replace(Pe, fr) : e;
			}
			var tf = oo(function(e, t, n) {
				return e + (n ? " " : "") + t.toUpperCase();
			}), nf = ao("toUpperCase");
			function rf(e, t, r) {
				return e = Q(e), t = r ? n : t, t === n ? er(e) ? hr(e) : On(e) : e.match(t) || [];
			}
			var af = V(function(e, t) {
				try {
					return mn(e, n, t);
				} catch (e) {
					return ou(e) ? e : new ct(e);
				}
			}), of = jo(function(e, t) {
				return gn(t, function(t) {
					t = xs(t), di(e, t, Sl(e[t], e));
				}), e;
			});
			function sf(e) {
				var t = e == null ? 0 : e.length, n = U();
				return e = t ? I(e, function(e) {
					if (typeof e[1] != "function") throw new O(r);
					return [n(e[0]), e[1]];
				}) : [], V(function(n) {
					for (var r = -1; ++r < t;) {
						var i = e[r];
						if (mn(i[0], this, n)) return mn(i[1], this, n);
					}
				});
			}
			function cf(e) {
				return hi(mi(e, 1));
			}
			function lf(e) {
				return function() {
					return e;
				};
			}
			function uf(e, t) {
				return e == null || e !== e ? t : e;
			}
			var df = uo(), ff = uo(!0);
			function pf(e) {
				return e;
			}
			function mf(e) {
				return Xi(typeof e == "function" ? e : mi(e, 1));
			}
			function hf(e) {
				return ta(mi(e, 1));
			}
			function gf(e, t) {
				return na(e, mi(t, 1));
			}
			var _f = V(function(e, t) {
				return function(n) {
					return Ri(n, e, t);
				};
			}), vf = V(function(e, t) {
				return function(n) {
					return Ri(e, n, t);
				};
			});
			function yf(e, t, n) {
				var r = $(t), i = ki(t, r);
				n == null && (!Y(t) || !i.length && r.length) && (n = t, t = e, e = this, i = ki(t, $(t)));
				var a = !(Y(n) && "chain" in n) || !!n.chain, o = cu(e);
				return gn(i, function(n) {
					var r = t[n];
					e[n] = r, o && (e.prototype[n] = function() {
						var t = this.__chain__;
						if (a || t) {
							var n = e(this.__wrapped__);
							return (n.__actions__ = H(this.__actions__)).push({
								func: r,
								args: arguments,
								thisArg: e
							}), n.__chain__ = t, n;
						}
						return r.apply(e, Sn([this.value()], arguments));
					});
				}), e;
			}
			function bf() {
				return P._ === this && (P._ = St), this;
			}
			function xf() {}
			function Sf(e) {
				return e = Z(e), V(function(t) {
					return aa(t, e);
				});
			}
			var Cf = ho(I), wf = ho(vn), Tf = ho(Tn);
			function Ef(e) {
				return Qo(e) ? Fn(xs(e)) : la(e);
			}
			function Df(e) {
				return function(t) {
					return e == null ? n : Ai(e, t);
				};
			}
			var Of = vo(), kf = vo(!0);
			function Af() {
				return [];
			}
			function jf() {
				return !1;
			}
			function Mf() {
				return {};
			}
			function Nf() {
				return "";
			}
			function Pf() {
				return !0;
			}
			function Ff(e, t) {
				if (e = Z(e), e < 1 || e > g) return [];
				var n = y, r = N(e, y);
				t = U(t), e -= y;
				for (var i = Bn(r, t); ++n < e;) t(n);
				return i;
			}
			function If(e) {
				return K(e) ? I(e, xs) : wu(e) ? [e] : H(bs(Q(e)));
			}
			function Lf(e) {
				var t = ++vt;
				return Q(e) + t;
			}
			var Rf = mo(function(e, t) {
				return e + t;
			}, 0), zf = xo("ceil"), Bf = mo(function(e, t) {
				return e / t;
			}, 1), Vf = xo("floor");
			function Hf(e) {
				return e && e.length ? Si(e, pf, Mi) : n;
			}
			function Uf(e, t) {
				return e && e.length ? Si(e, U(t, 2), Mi) : n;
			}
			function Wf(e) {
				return Pn(e, pf);
			}
			function Gf(e, t) {
				return Pn(e, U(t, 2));
			}
			function Kf(e) {
				return e && e.length ? Si(e, pf, $i) : n;
			}
			function qf(e, t) {
				return e && e.length ? Si(e, U(t, 2), $i) : n;
			}
			var Jf = mo(function(e, t) {
				return e * t;
			}, 1), Yf = xo("round"), Xf = mo(function(e, t) {
				return e - t;
			}, 0);
			function Zf(e) {
				return e && e.length ? zn(e, pf) : 0;
			}
			function Qf(e, t) {
				return e && e.length ? zn(e, U(t, 2)) : 0;
			}
			return L.after = yl, L.ary = bl, L.assign = Lu, L.assignIn = Ru, L.assignInWith = zu, L.assignWith = Bu, L.at = Vu, L.before = xl, L.bind = Sl, L.bindAll = of, L.bindKey = Cl, L.castArray = Hl, L.chain = Fc, L.chunk = Ts, L.compact = Es, L.concat = Ds, L.cond = sf, L.conforms = cf, L.constant = lf, L.countBy = Kc, L.create = Hu, L.curry = wl, L.curryRight = Tl, L.debounce = El, L.defaults = Uu, L.defaultsDeep = Wu, L.defer = Dl, L.delay = Ol, L.difference = Os, L.differenceBy = ks, L.differenceWith = As, L.drop = js, L.dropRight = Ms, L.dropRightWhile = Ns, L.dropWhile = Ps, L.fill = Fs, L.filter = Jc, L.flatMap = Zc, L.flatMapDeep = Qc, L.flatMapDepth = $c, L.flatten = Rs, L.flattenDeep = zs, L.flattenDepth = Bs, L.flip = kl, L.flow = df, L.flowRight = ff, L.fromPairs = Vs, L.functions = Zu, L.functionsIn = Qu, L.groupBy = nl, L.initial = Ws, L.intersection = Gs, L.intersectionBy = Ks, L.intersectionWith = qs, L.invert = nd, L.invertBy = rd, L.invokeMap = il, L.iteratee = mf, L.keyBy = al, L.keys = $, L.keysIn = ad, L.map = ol, L.mapKeys = od, L.mapValues = sd, L.matches = hf, L.matchesProperty = gf, L.memoize = Al, L.merge = cd, L.mergeWith = ld, L.method = _f, L.methodOf = vf, L.mixin = yf, L.negate = jl, L.nthArg = Sf, L.omit = ud, L.omitBy = dd, L.once = Ml, L.orderBy = sl, L.over = Cf, L.overArgs = Nl, L.overEvery = wf, L.overSome = Tf, L.partial = Pl, L.partialRight = Fl, L.partition = cl, L.pick = fd, L.pickBy = pd, L.property = Ef, L.propertyOf = Df, L.pull = Qs, L.pullAll = $s, L.pullAllBy = ec, L.pullAllWith = tc, L.pullAt = nc, L.range = Of, L.rangeRight = kf, L.rearg = Il, L.reject = dl, L.remove = rc, L.rest = Ll, L.reverse = ic, L.sampleSize = pl, L.set = hd, L.setWith = gd, L.shuffle = ml, L.slice = ac, L.sortBy = _l, L.sortedUniq = fc, L.sortedUniqBy = pc, L.split = Wd, L.spread = Rl, L.tail = mc, L.take = hc, L.takeRight = gc, L.takeRightWhile = _c, L.takeWhile = vc, L.tap = Ic, L.throttle = zl, L.thru = Lc, L.toArray = ju, L.toPairs = _d, L.toPairsIn = vd, L.toPath = If, L.toPlainObject = Fu, L.transform = yd, L.unary = Bl, L.union = yc, L.unionBy = bc, L.unionWith = xc, L.uniq = Sc, L.uniqBy = Cc, L.uniqWith = wc, L.unset = bd, L.unzip = Tc, L.unzipWith = Ec, L.update = xd, L.updateWith = Sd, L.values = Cd, L.valuesIn = wd, L.without = Dc, L.words = rf, L.wrap = Vl, L.xor = Oc, L.xorBy = kc, L.xorWith = Ac, L.zip = jc, L.zipObject = Mc, L.zipObjectDeep = Nc, L.zipWith = Pc, L.entries = _d, L.entriesIn = vd, L.extend = Ru, L.extendWith = zu, yf(L, L), L.add = Rf, L.attempt = af, L.camelCase = Od, L.capitalize = kd, L.ceil = zf, L.clamp = Td, L.clone = Ul, L.cloneDeep = Gl, L.cloneDeepWith = Kl, L.cloneWith = Wl, L.conformsTo = ql, L.deburr = Ad, L.defaultTo = uf, L.divide = Bf, L.endsWith = jd, L.eq = Jl, L.escape = Md, L.escapeRegExp = Nd, L.every = qc, L.find = Yc, L.findIndex = Is, L.findKey = Gu, L.findLast = Xc, L.findLastIndex = Ls, L.findLastKey = Ku, L.floor = Vf, L.forEach = el, L.forEachRight = tl, L.forIn = qu, L.forInRight = Ju, L.forOwn = Yu, L.forOwnRight = Xu, L.get = $u, L.gt = Yl, L.gte = Xl, L.has = ed, L.hasIn = td, L.head = Hs, L.identity = pf, L.includes = rl, L.indexOf = Us, L.inRange = Ed, L.invoke = id, L.isArguments = Zl, L.isArray = K, L.isArrayBuffer = Ql, L.isArrayLike = q, L.isArrayLikeObject = J, L.isBoolean = $l, L.isBuffer = eu, L.isDate = tu, L.isElement = nu, L.isEmpty = ru, L.isEqual = iu, L.isEqualWith = au, L.isError = ou, L.isFinite = su, L.isFunction = cu, L.isInteger = lu, L.isLength = uu, L.isMap = du, L.isMatch = fu, L.isMatchWith = pu, L.isNaN = mu, L.isNative = hu, L.isNil = _u, L.isNull = gu, L.isNumber = vu, L.isObject = Y, L.isObjectLike = X, L.isPlainObject = yu, L.isRegExp = bu, L.isSafeInteger = xu, L.isSet = Su, L.isString = Cu, L.isSymbol = wu, L.isTypedArray = Tu, L.isUndefined = Eu, L.isWeakMap = Du, L.isWeakSet = Ou, L.join = Js, L.kebabCase = Pd, L.last = Ys, L.lastIndexOf = Xs, L.lowerCase = Fd, L.lowerFirst = Id, L.lt = ku, L.lte = Au, L.max = Hf, L.maxBy = Uf, L.mean = Wf, L.meanBy = Gf, L.min = Kf, L.minBy = qf, L.stubArray = Af, L.stubFalse = jf, L.stubObject = Mf, L.stubString = Nf, L.stubTrue = Pf, L.multiply = Jf, L.nth = Zs, L.noConflict = bf, L.noop = xf, L.now = vl, L.pad = Ld, L.padEnd = Rd, L.padStart = zd, L.parseInt = Bd, L.random = Dd, L.reduce = ll, L.reduceRight = ul, L.repeat = Vd, L.replace = Hd, L.result = md, L.round = Yf, L.runInContext = e, L.sample = fl, L.size = hl, L.snakeCase = Ud, L.some = gl, L.sortedIndex = oc, L.sortedIndexBy = sc, L.sortedIndexOf = cc, L.sortedLastIndex = lc, L.sortedLastIndexBy = uc, L.sortedLastIndexOf = dc, L.startCase = Gd, L.startsWith = Kd, L.subtract = Xf, L.sum = Zf, L.sumBy = Qf, L.template = qd, L.times = Ff, L.toFinite = Mu, L.toInteger = Z, L.toLength = Nu, L.toLower = Jd, L.toNumber = Pu, L.toSafeInteger = Iu, L.toString = Q, L.toUpper = Yd, L.trim = Xd, L.trimEnd = Zd, L.trimStart = Qd, L.truncate = $d, L.unescape = ef, L.uniqueId = Lf, L.upperCase = tf, L.upperFirst = nf, L.each = el, L.eachRight = tl, L.first = Hs, yf(L, function() {
				var e = {};
				return Di(L, function(t, n) {
					k.call(L.prototype, n) || (e[n] = t);
				}), e;
			}(), { chain: !1 }), L.VERSION = "4.18.1", gn([
				"bind",
				"bindKey",
				"curry",
				"curryRight",
				"partial",
				"partialRight"
			], function(e) {
				L[e].placeholder = L;
			}), gn(["drop", "take"], function(e, t) {
				R.prototype[e] = function(r) {
					r = r === n ? 1 : A(Z(r), 0);
					var i = this.__filtered__ && !t ? new R(this) : this.clone();
					return i.__filtered__ ? i.__takeCount__ = N(r, i.__takeCount__) : i.__views__.push({
						size: N(r, y),
						type: e + (i.__dir__ < 0 ? "Right" : "")
					}), i;
				}, R.prototype[e + "Right"] = function(t) {
					return this.reverse()[e](t).reverse();
				};
			}), gn([
				"filter",
				"map",
				"takeWhile"
			], function(e, t) {
				var n = t + 1, r = n == 1 || n == 3;
				R.prototype[e] = function(e) {
					var t = this.clone();
					return t.__iteratees__.push({
						iteratee: U(e, 3),
						type: n
					}), t.__filtered__ = t.__filtered__ || r, t;
				};
			}), gn(["head", "last"], function(e, t) {
				var n = "take" + (t ? "Right" : "");
				R.prototype[e] = function() {
					return this[n](1).value()[0];
				};
			}), gn(["initial", "tail"], function(e, t) {
				var n = "drop" + (t ? "" : "Right");
				R.prototype[e] = function() {
					return this.__filtered__ ? new R(this) : this[n](1);
				};
			}), R.prototype.compact = function() {
				return this.filter(pf);
			}, R.prototype.find = function(e) {
				return this.filter(e).head();
			}, R.prototype.findLast = function(e) {
				return this.reverse().find(e);
			}, R.prototype.invokeMap = V(function(e, t) {
				return typeof e == "function" ? new R(this) : this.map(function(n) {
					return Ri(n, e, t);
				});
			}), R.prototype.reject = function(e) {
				return this.filter(jl(U(e)));
			}, R.prototype.slice = function(e, t) {
				e = Z(e);
				var r = this;
				return r.__filtered__ && (e > 0 || t < 0) ? new R(r) : (e < 0 ? r = r.takeRight(-e) : e && (r = r.drop(e)), t !== n && (t = Z(t), r = t < 0 ? r.dropRight(-t) : r.take(t - e)), r);
			}, R.prototype.takeRightWhile = function(e) {
				return this.reverse().takeWhile(e).reverse();
			}, R.prototype.toArray = function() {
				return this.take(y);
			}, Di(R.prototype, function(e, t) {
				var r = /^(?:filter|find|map|reject)|While$/.test(t), i = /^(?:head|last)$/.test(t), a = L[i ? "take" + (t == "last" ? "Right" : "") : t], o = i || /^find/.test(t);
				a && (L.prototype[t] = function() {
					var t = this.__wrapped__, s = i ? [1] : arguments, c = t instanceof R, l = s[0], u = c || K(t), d = function(e) {
						var t = a.apply(L, Sn([e], s));
						return i && f ? t[0] : t;
					};
					u && r && typeof l == "function" && l.length != 1 && (c = u = !1);
					var f = this.__chain__, p = !!this.__actions__.length, m = o && !f, h = c && !p;
					if (!o && u) {
						t = h ? t : new R(this);
						var g = e.apply(t, s);
						return g.__actions__.push({
							func: Lc,
							args: [d],
							thisArg: n
						}), new wr(g, f);
					}
					return m && h ? e.apply(this, s) : (g = this.thru(d), m ? i ? g.value()[0] : g.value() : g);
				});
			}), gn([
				"pop",
				"push",
				"shift",
				"sort",
				"splice",
				"unshift"
			], function(e) {
				var t = pt[e], n = /^(?:push|sort|unshift)$/.test(e) ? "tap" : "thru", r = /^(?:pop|shift)$/.test(e);
				L.prototype[e] = function() {
					var e = arguments;
					if (r && !this.__chain__) {
						var i = this.value();
						return t.apply(K(i) ? i : [], e);
					}
					return this[n](function(n) {
						return t.apply(K(n) ? n : [], e);
					});
				};
			}), Di(R.prototype, function(e, t) {
				var n = L[t];
				if (n) {
					var r = n.name + "";
					k.call(In, r) || (In[r] = []), In[r].push({
						name: t,
						func: n
					});
				}
			}), In[fo(n, s).name] = [{
				name: "wrapper",
				func: n
			}], R.prototype.clone = Tr, R.prototype.reverse = Er, R.prototype.value = Dr, L.prototype.at = Rc, L.prototype.chain = zc, L.prototype.commit = Bc, L.prototype.next = Vc, L.prototype.plant = Uc, L.prototype.reverse = Wc, L.prototype.toJSON = L.prototype.valueOf = L.prototype.value = Gc, L.prototype.first = L.prototype.head, Nt && (L.prototype[Nt] = Hc), L;
		})();
		typeof define == "function" && typeof define.amd == "object" && define.amd ? (P._ = gr, define(function() {
			return gr;
		})) : an ? ((an.exports = gr)._ = gr, rn._ = gr) : P._ = gr;
	}).call(n);
})))(), 1);
function $e({ color: e, grayRamp: t }) {
	let n = (r(e) - (t.startL ?? 0)) / ((t.endL ?? 0) - (t.startL ?? 0));
	return /* @__PURE__ */ x("div", {
		className: "hc:absolute hc:border hc:border-[color-mix(in_srgb,var(--huet-background)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:outline hc:outline-[color-mix(in_srgb,var(--huet-foreground)_calc(30%*var(--huet-configurator-contrast,1)),transparent)] hc:-outline-offset-2 hc:top-1/2 hc:-translate-y-1/2",
		style: {
			backgroundColor: e || "transparent",
			width: "1em",
			height: "1em",
			left: `calc(${n * 100}% - 1em * ${n})`
		}
	});
}
function et(e) {
	return [e, e];
}
function tt(e) {
	let t = e.config.classes, n = Array.isArray(t) ? t : [...Qe.default.range(0, 1, 1 / (t ?? 1)), 1], r = Qe.default.first(n) ?? 0, i = Qe.default.last(n) ?? 1, a = Qe.default.initial(Qe.default.tail(n));
	return Qe.default.chunk([
		r,
		...Qe.default.flatMap(a, et),
		i
	], 2);
}
var nt = d.memo(function({ ramp: e }) {
	if (!e) return null;
	switch (e.config.classes ? "classes" : "normal") {
		case "classes": return /* @__PURE__ */ x("div", {
			className: "hc:rounded-xs hc:h-full hc:w-full hc:flex",
			children: tt(e).map(([t = 0, n = 0], r) => /* @__PURE__ */ x("div", {
				className: "hc:h-full",
				style: {
					backgroundColor: s.lab(...e((t + n) / 2)).hex(),
					width: `${(n - t) * 100}%`
				}
			}, r))
		});
		default: return /* @__PURE__ */ x("div", {
			className: "hc:rounded-xs hc:h-full hc:w-full",
			style: { background: `linear-gradient(to right, ${Qe.default.range(0, 1.2, .2).map((t) => s.lab(...e(t)).hex()).join(",")})` }
		});
	}
});
function rt({ ramp: e, theme: t }) {
	return /* @__PURE__ */ x("div", {
		className: "hc:flex hc:w-full hc:flex-row hc:h-4 hc:mb-2",
		style: {
			marginLeft: `${e.startL}%`,
			width: `${(e.endL ?? NaN) - (e.startL ?? NaN)}%`
		},
		children: /* @__PURE__ */ S("div", {
			className: "hc:w-full hc:relative hc:flex",
			children: [/* @__PURE__ */ x(nt, { ramp: e }), e.config.colors.map((e, n) => /* @__PURE__ */ x($e, {
				color: t.pallet[e] ?? "",
				grayRamp: t.ramps.gray
			}, n))]
		})
	});
}
function it({ theme: e }) {
	return /* @__PURE__ */ S("div", {
		className: "hc:w-full",
		children: [/* @__PURE__ */ x("div", { className: "huet-border-10 hc:h-[4px] hc:mb-[6px] hc:w-full hc:bg-[linear-gradient(to_right,black,white)]" }), Object.keys(e.ramps).map((t) => /* @__PURE__ */ x(rt, {
			ramp: e.ramps[t],
			theme: e
		}, t))]
	});
}
// src/configurator.css?inline
var at = "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scale-z:1;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-duration:initial;--tw-ease:initial}}}:root,:host{--hc-spacing:.25rem;--hc-font-weight-normal:400;--hc-font-weight-bold:700;--hc-radius-xs:.125rem;--hc-radius-sm:.25rem;--hc-radius-lg:.5rem;--hc-default-transition-duration:.15s;--hc-default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--hc-font-ui:-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Roboto\", \"Oxygen\", \"Ubuntu\", \"Cantarell\", \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", sans-serif}[data-huet-configurator]{all:initial}[data-huet-configurator] *{all:unset;box-sizing:border-box;display:block}[data-huet-configurator][data-huet-root],[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{background-color:var(--huet-background);color:var(--huet-foreground)}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:var(--huet-relative-text,var(--huet-foreground))}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:var(--huet-relative-border)}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:var(--huet-relative-outline)}@media (forced-colors:active){[data-huet-configurator][data-huet-root],[data-huet-configurator][data-huet-color-bg],[data-huet-configurator] [data-huet-color-bg]{color:canvastext;background-color:canvas}[data-huet-configurator][data-huet-color-text],[data-huet-configurator] [data-huet-color-text]{color:canvastext}[data-huet-configurator][data-huet-color-border],[data-huet-configurator] [data-huet-color-border]{border-color:buttonborder}[data-huet-configurator][data-huet-color-outline],[data-huet-configurator] [data-huet-color-outline]{outline-color:highlight}}[data-huet-configurator] :focus,[data-huet-configurator] [data-focus-within]:focus-within{z-index:1;box-shadow:0 0 0 2px #00f5,0 0 0 2px #fff5!important}[data-huet-configurator] input[type=range]{appearance:none;background:0 0;width:100%!important}[data-huet-configurator] input[type=range]::-webkit-slider-thumb{-webkit-appearance:none!important;background:currentColor!important;width:1px!important;height:1em!important}[data-huet-configurator] input[type=color]::-webkit-color-swatch-wrapper{padding:0;-webkit-appearance:none!important}[data-huet-configurator] input[type=color]::-webkit-color-swatch{border:none;padding:0}.hc\\:pointer-events-none{pointer-events:none}.hc\\:absolute{position:absolute}.hc\\:fixed{position:fixed}.hc\\:relative{position:relative}.hc\\:top-0{top:0}.hc\\:top-1\\/2{top:50%}.hc\\:right-\\[1em\\]{right:1em}.hc\\:bottom-0{bottom:0}.hc\\:bottom-\\[1em\\]{bottom:1em}.hc\\:left-0{left:0}.hc\\:left-1\\/2{left:50%}.hc\\:z-\\[999\\]{z-index:999}.hc\\:mx-2{margin-inline:calc(var(--hc-spacing) * 2)}.hc\\:-mt-2{margin-top:calc(var(--hc-spacing) * -2)}.hc\\:mt-1{margin-top:var(--hc-spacing)}.hc\\:mt-2{margin-top:calc(var(--hc-spacing) * 2)}.hc\\:mt-4{margin-top:calc(var(--hc-spacing) * 4)}.hc\\:mt-px{margin-top:1px}.hc\\:mr-1{margin-right:var(--hc-spacing)}.hc\\:mr-2{margin-right:calc(var(--hc-spacing) * 2)}.hc\\:mb-1{margin-bottom:var(--hc-spacing)}.hc\\:mb-2{margin-bottom:calc(var(--hc-spacing) * 2)}.hc\\:mb-\\[6px\\]{margin-bottom:6px}.hc\\:ml-1{margin-left:var(--hc-spacing)}.hc\\:ml-2{margin-left:calc(var(--hc-spacing) * 2)}.hc\\:ml-4{margin-left:calc(var(--hc-spacing) * 4)}.hc\\:flex{display:flex}.hc\\:inline{display:inline}.hc\\:inline-block{display:inline-block}.hc\\:inline-flex{display:inline-flex}.hc\\:h-0{height:0}.hc\\:h-2{height:calc(var(--hc-spacing) * 2)}.hc\\:h-4{height:calc(var(--hc-spacing) * 4)}.hc\\:h-6{height:calc(var(--hc-spacing) * 6)}.hc\\:h-8{height:calc(var(--hc-spacing) * 8)}.hc\\:h-\\[\\.5em\\]{height:.5em}.hc\\:h-\\[4px\\]{height:4px}.hc\\:h-\\[min\\(64em\\,100vh-2em\\)\\]{height:min(64em,100vh - 2em)}.hc\\:h-full{height:100%}.hc\\:min-h-0{min-height:0}.hc\\:w-0{width:0}.hc\\:w-\\[5em\\]{width:5em}.hc\\:w-\\[30em\\]{width:30em}.hc\\:w-full{width:100%}.hc\\:max-w-\\[30em\\]{max-width:30em}.hc\\:min-w-0{min-width:0}.hc\\:flex-auto{flex:auto}.hc\\:shrink-0{flex-shrink:0}.hc\\:grow{flex-grow:1}.hc\\:basis-\\[20em\\]{flex-basis:20em}.hc\\:-translate-x-1\\/2{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:-translate-y-1\\/2{--tw-translate-y:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-0{--tw-translate-y:0px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-\\[2em\\]{--tw-translate-y:2em;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:translate-y-px{--tw-translate-y:1px;translate:var(--tw-translate-x) var(--tw-translate-y)}.hc\\:scale-y-0{--tw-scale-y:0%;scale:var(--tw-scale-x) var(--tw-scale-y)}.hc\\:cursor-auto{cursor:auto}.hc\\:cursor-default{cursor:default}.hc\\:cursor-pointer{cursor:pointer}.hc\\:flex-col{flex-direction:column}.hc\\:flex-row{flex-direction:row}.hc\\:items-center{align-items:center}.hc\\:justify-between{justify-content:space-between}.hc\\:justify-center{justify-content:center}.hc\\:self-stretch{align-self:stretch}.hc\\:overflow-hidden{overflow:hidden}.hc\\:overflow-x-hidden{overflow-x:hidden}.hc\\:overflow-y-scroll{overflow-y:scroll}.hc\\:overscroll-contain{overscroll-behavior:contain}.hc\\:rounded-lg{border-radius:var(--hc-radius-lg)}.hc\\:rounded-sm{border-radius:var(--hc-radius-sm)}.hc\\:rounded-xs{border-radius:var(--hc-radius-xs)}.hc\\:border{border-style:var(--tw-border-style);border-width:1px}.hc\\:border-x-\\[\\.5em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.5em}.hc\\:border-x-\\[\\.75em\\]{border-inline-style:var(--tw-border-style);border-inline-width:.75em}.hc\\:border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.hc\\:border-b-\\[\\.5em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.5em}.hc\\:border-b-\\[\\.75em\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:.75em}.hc\\:border-\\[color-mix\\(in_srgb\\,var\\(--huet-background\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{border-color:var(--huet-background)}@supports (color:color-mix(in lab, red, red)){.hc\\:border-\\[color-mix\\(in_srgb\\,var\\(--huet-background\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{border-color:color-mix(in srgb,var(--huet-background) calc(30% * var(--huet-configurator-contrast,1)),transparent)}}.hc\\:border-transparent{border-color:#0000}.hc\\:border-x-transparent{border-inline-color:#0000}.hc\\:border-b-current{border-bottom-color:currentColor}.hc\\:bg-\\[linear-gradient\\(to_right\\,black\\,white\\)\\]{background-image:linear-gradient(90deg,#000,#fff)}.hc\\:p-0{padding:0}.hc\\:p-2{padding:calc(var(--hc-spacing) * 2)}.hc\\:p-4{padding:calc(var(--hc-spacing) * 4)}.hc\\:px-2{padding-inline:calc(var(--hc-spacing) * 2)}.hc\\:px-4{padding-inline:calc(var(--hc-spacing) * 4)}.hc\\:px-\\[\\.5em\\]{padding-inline:.5em}.hc\\:py-2{padding-block:calc(var(--hc-spacing) * 2)}.hc\\:py-\\[\\.3em\\]{padding-block:.3em}.hc\\:pt-2{padding-top:calc(var(--hc-spacing) * 2)}.hc\\:font-ui{font-family:var(--hc-font-ui)}.hc\\:text-\\[\\.75rem\\]{font-size:.75rem}.hc\\:text-\\[1\\.25em\\]{font-size:1.25em}.hc\\:leading-none{--tw-leading:1;line-height:1}.hc\\:font-bold{--tw-font-weight:var(--hc-font-weight-bold);font-weight:var(--hc-font-weight-bold)}.hc\\:font-normal{--tw-font-weight:var(--hc-font-weight-normal);font-weight:var(--hc-font-weight-normal)}.hc\\:underline{text-decoration-line:underline}.hc\\:opacity-0{opacity:0}.hc\\:opacity-100{opacity:1}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-foreground))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-foreground) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,var(--huet-relative-text))}@supports (color:color-mix(in lab, red, red)){.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{--tw-shadow:0 5px 30px var(--tw-shadow-color,color-mix(in srgb,var(--huet-relative-text) calc(12.5% * var(--huet-configurator-contrast,1)),transparent))}}.hc\\:shadow-\\[0_5px_30px_color-mix\\(in_srgb\\,var\\(--huet-relative-text\\)_calc\\(12\\.5\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.hc\\:outline{outline-style:var(--tw-outline-style);outline-width:1px}.hc\\:-outline-offset-2{outline-offset:calc(2px * -1)}.hc\\:outline-\\[color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{outline-color:var(--huet-foreground)}@supports (color:color-mix(in lab, red, red)){.hc\\:outline-\\[color-mix\\(in_srgb\\,var\\(--huet-foreground\\)_calc\\(30\\%\\*var\\(--huet-configurator-contrast\\,1\\)\\)\\,transparent\\)\\]{outline-color:color-mix(in srgb,var(--huet-foreground) calc(30% * var(--huet-configurator-contrast,1)),transparent)}}.hc\\:transition-\\[opacity\\,translate\\,height\\]{transition-property:opacity,translate,height;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-\\[scale\\,margin\\,opacity\\]{transition-property:scale,margin,opacity;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--hc-default-transition-timing-function));transition-duration:var(--tw-duration,var(--hc-default-transition-duration))}.hc\\:duration-150{--tw-duration:.15s;transition-duration:.15s}.hc\\:duration-200{--tw-duration:.2s;transition-duration:.2s}.hc\\:duration-400{--tw-duration:.4s;transition-duration:.4s}.hc\\:ease-\\[ease-out\\]{--tw-ease:ease-out;transition-timing-function:ease-out}.hc\\:ease-\\[ease\\]{--tw-ease:ease;transition-timing-function:ease}.hc\\:select-none{-webkit-user-select:none;user-select:none}@property --tw-translate-x{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-y{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-z{syntax:\"*\";inherits:false;initial-value:0}@property --tw-scale-x{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-y{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-z{syntax:\"*\";inherits:false;initial-value:1}@property --tw-border-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-leading{syntax:\"*\";inherits:false}@property --tw-font-weight{syntax:\"*\";inherits:false}@property --tw-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:\"*\";inherits:false}@property --tw-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:\"*\";inherits:false}@property --tw-inset-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:\"*\";inherits:false}@property --tw-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:\"*\";inherits:false}@property --tw-inset-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:\"*\";inherits:false}@property --tw-ring-offset-width{syntax:\"<length>\";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:\"*\";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-duration{syntax:\"*\";inherits:false}@property --tw-ease{syntax:\"*\";inherits:false}";
// src/private/ConfiguratorPortal.tsx
function ot() {
	if (document.head.querySelector("style[data-huet-configurator-styles]")) return;
	let e = document.createElement("style");
	e.setAttribute("data-huet-configurator-styles", ""), e.textContent = at, document.head.append(e);
}
function st({ themeConfig: e, children: t }) {
	let [n, r] = v(null);
	h(() => {
		ot();
		let e = document.createElement("div");
		return e.setAttribute("data-huet-configurator", ""), document.body.append(e), r(e), () => e.remove();
	}, []);
	let i = g(() => u(e), [e]), a = _(i);
	a.current = i;
	let o = _(void 0);
	return h(() => {
		if (!n) return;
		let e = l(n, a.current);
		return o.current = {
			theme: a.current,
			update: e.update
		}, () => {
			e.destroy(), o.current = void 0;
		};
	}, [n]), h(() => {
		let e = o.current;
		e && e.theme !== i && (e.theme = i, e.update(i));
	}, [i]), h(() => {
		n?.style.setProperty("--huet-configurator-contrast", String(e.contrastMultiplier));
	}, [n, e.contrastMultiplier]), n ? C(t, n) : null;
}
// src/private/Labeled.tsx
function ct({ label: e, children: t, className: n, ...r }) {
	return e ? /* @__PURE__ */ S("label", {
		className: n,
		...r,
		children: [/* @__PURE__ */ x("span", {
			className: "hc:mb-1 hc:cursor-default",
			children: e
		}), t]
	}) : /* @__PURE__ */ x("div", {
		className: n,
		...r,
		children: t
	});
}
// src/private/Input.tsx
function lt({ label: e, value: t, onChange: n, className: r, ...i }) {
	return /* @__PURE__ */ x(ct, {
		label: e,
		className: "hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:max-w-[30em]",
		children: /* @__PURE__ */ x("input", {
			"aria-label": e,
			className: T("huet-border-20", Ge, "hc:w-full hc:cursor-auto", r),
			value: t,
			onChange: (e) => n?.(e.target.value),
			...i
		})
	});
}
// src/private/Pallet.tsx
function ut({ color: e, onChange: t }) {
	return /* @__PURE__ */ x("input", {
		type: "color",
		value: e,
		onChange: (e) => t(e.target.value),
		className: "huet-border-12 hc:w-full hc:h-4 hc:p-0 hc:border hc:rounded-xs hc:overflow-hidden",
		style: { backgroundColor: e || "transparent" }
	});
}
function D({ colors: e, onColorsChange: t }) {
	return /* @__PURE__ */ x(Be, {
		growEach: !0,
		children: Qe.default.map(e, (n, r) => /* @__PURE__ */ x(ut, {
			color: n,
			onChange: (n) => t({
				...e,
				[r]: n
			})
		}, r))
	});
}
// src/private/Range.tsx
function dt({ label: e, min: t = 0, max: n = 100, decimals: r = 0, value: i, onChange: a, className: o, hideInput: s = !1 }) {
	let c = 1 / 10 ** r, [l, u] = v(!1), [d, f] = v(i.toFixed(r)), p = i < t || i > n;
	m(() => {
		l || f(i.toFixed(r));
	}, [
		r,
		l,
		i
	]);
	let h = (e) => {
		f(e.target.value);
		let t = Number.parseFloat(e.target.value);
		Number.isFinite(t) && a?.(t);
	}, _ = (e) => {
		let t = Number.parseFloat(e.target.value);
		a?.(t);
	}, y = (e) => {
		let t = null;
		if (e.key === "ArrowUp" && (t = 1), e.key === "ArrowDown" && (t = -1), t) {
			let n = e.shiftKey ? i + c * 10 * t : i + c * t;
			f(n.toFixed(r)), a?.(n), e.preventDefault();
		}
	}, b = g(() => /* @__PURE__ */ S("span", {
		className: "hc:flex hc:justify-between",
		children: [e, /* @__PURE__ */ S("span", {
			className: p ? "huet-text-red-100" : "huet-text-50",
			children: [
				"(",
				t.toFixed(r),
				"-",
				n.toFixed(r),
				")"
			]
		})]
	}), [
		e,
		p,
		r,
		t,
		n
	]);
	return /* @__PURE__ */ x(ct, {
		label: e && b,
		className: T("hc:flex hc:flex-col hc:max-w-[30em]", o),
		onKeyDown: y,
		children: /* @__PURE__ */ S("span", {
			className: "hc:flex hc:items-center",
			children: [!s && /* @__PURE__ */ x("input", {
				"aria-hidden": !0,
				type: "number",
				className: T(p ? "huet-border-red-100 huet-bg-red-12 huet-bg/text-red-100" : "huet-border-20", "hc:py-[.3em] hc:px-[.5em] hc:border hc:max-w-[30em] hc:rounded-xs", "hc:w-[5em] hc:mr-2 hc:cursor-auto"),
				value: d,
				step: c,
				onFocus: () => u(!0),
				onBlur: () => u(!1),
				onChange: h
			}), /* @__PURE__ */ x("input", {
				"aria-label": typeof e == "string" ? e : void 0,
				type: "range",
				className: T("huet-border-20", Ge, "hc:w-full hc:self-stretch hc:cursor-default"),
				min: t,
				max: n,
				step: c,
				value: i,
				onChange: _
			})]
		})
	});
}
// src/private/ThemerShell.tsx
function ft() {
	let e = je();
	return /* @__PURE__ */ x("span", {
		className: T("huet-bg-green-25 huet-bg/text-green-100 hc:inline hc:rounded-lg hc:px-2 hc:font-normal", "hc:transition-opacity hc:duration-400 hc:ease-[ease]", e ? "hc:opacity-0" : "hc:opacity-100"),
		children: "Saved"
	});
}
function O({ isExpanded: e, onClick: t }) {
	return /* @__PURE__ */ S("button", {
		onClick: t,
		"aria-expanded": e,
		title: e ? "Collapse" : "Expand",
		className: "huet-bg-100 hc:w-full hc:flex hc:justify-between hc:shrink-0 hc:select-none",
		children: [/* @__PURE__ */ S("span", {
			className: "hc:py-2 hc:px-2 hc:font-bold",
			children: ["Huet Theme Configurator ", e && /* @__PURE__ */ x(ft, {})]
		}), /* @__PURE__ */ x("span", {
			className: "huet-bg-25 hc:flex hc:justify-center hc:items-center hc:px-4 hc:font-bold",
			children: e ? "↓" : "↑"
		})]
	});
}
var pt = T("huet-outline-25 hc:fixed hc:right-[1em] hc:bottom-[1em] hc:z-[999]", "hc:font-ui hc:text-[.75rem] hc:outline", "hc:transition-[opacity,translate,height] hc:duration-200 hc:ease-[ease-out]"), mt = {
	expanded: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-foreground)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]",
	collapsed: "hc:shadow-[0_5px_30px_color-mix(in_srgb,var(--huet-relative-text)_calc(12.5%*var(--huet-configurator-contrast,1)),transparent)]"
};
function ht({ children: e }) {
	let [t, n] = Me("themer:isExpanded", !0, ge), [r, i] = v(!1);
	return m(() => i(!0), []), t ? /* @__PURE__ */ S("div", {
		className: T(pt, "huet-bg-0", mt.expanded, "hc:flex hc:flex-col hc:h-[min(64em,100vh-2em)]", r ? "hc:translate-y-0 hc:opacity-100" : "hc:translate-y-[2em] hc:opacity-0"),
		children: [/* @__PURE__ */ x(O, {
			isExpanded: !0,
			onClick: () => n((e) => !e)
		}), e]
	}) : /* @__PURE__ */ x("div", {
		className: T(pt, "huet-text-100", mt.collapsed),
		children: /* @__PURE__ */ x(O, { onClick: () => n((e) => !e) })
	});
}
// src/demo/themeConfigs.ts
var gt = [
	n,
	{
		...n,
		id: 2,
		name: "Base Inverted",
		bgRampValue: 0
	},
	{
		...n,
		id: 4,
		name: "Radioactive",
		pallet: {
			...n.pallet,
			black: "#69707f",
			white: "#c1ff00",
			red: "#ff88a4",
			yellow: "#b1bd2d",
			green: "#59c866",
			blue: "#83beff",
			purple: "#d2a8ff"
		},
		bgRampValue: 0,
		startSignalLightness: .46,
		endSignalLightness: .61
	},
	{
		...n,
		id: 5,
		name: "Blueprint",
		pallet: {
			...n.pallet,
			black: "#384cd2",
			white: "#ffffff",
			red: "#ff0030",
			yellow: "#988753",
			green: "#009700",
			blue: "#00a3ff",
			purple: "#af60ff"
		},
		ramps: {
			...n.ramps,
			gray: {
				...n.ramps.gray,
				colorModel: "lrgb"
			}
		},
		startSignalLightness: .26,
		endSignalLightness: .47
	},
	{
		...n,
		id: 6,
		name: "Terminal",
		pallet: {
			...n.pallet,
			black: "#0d171d",
			white: "#7fff8b",
			red: "#f54f75",
			yellow: "#b1bd2d",
			green: "#13a624",
			blue: "#558cff",
			purple: "#d75eff"
		},
		bgRampValue: 0,
		startSignalLightness: .5,
		endSignalLightness: .63
	},
	{
		...n,
		id: 7,
		name: "Paperback",
		pallet: {
			...n.pallet,
			black: "#3d3531",
			white: "#e2c1b1",
			red: "#e13639",
			yellow: "#c89455",
			green: "#238e5d",
			blue: "#366caa",
			purple: "#8e65bf"
		},
		bgRampValue: 1,
		startSignalLightness: .36,
		endSignalLightness: .55
	},
	{
		...n,
		id: 8,
		name: "Deep Dive",
		pallet: {
			...n.pallet,
			black: "#001b4f",
			white: "#b6e8e8",
			red: "#ff6669",
			yellow: "#a09c5c",
			green: "#319647",
			blue: "#496eff",
			purple: "#af5bff"
		},
		bgRampValue: 0,
		startSignalLightness: .44,
		endSignalLightness: .63
	},
	{
		...n,
		id: 9,
		name: "Royal Purple",
		pallet: {
			...n.pallet,
			black: "#37233b",
			white: "#f0c9e7",
			red: "#e13639",
			yellow: "#bd7f33",
			green: "#00878e",
			blue: "#3865da",
			purple: "#7630c8"
		},
		bgRampValue: 0,
		startSignalLightness: .5,
		endSignalLightness: .5
	},
	{
		...n,
		id: 10,
		name: "Orange Boost",
		pallet: {
			...n.pallet,
			black: "#474b56",
			white: "#ff7c49",
			red: "#e32850",
			yellow: "#af7000",
			green: "#00974c",
			blue: "#2292cb",
			purple: "#d961d6"
		},
		bgRampValue: 0,
		startSignalLightness: .27,
		endSignalLightness: .76,
		contrastMultiplier: 1
	},
	{
		...n,
		id: 11,
		name: "Faded Future",
		pallet: {
			...n.pallet,
			black: "#3c3d43",
			white: "#b2bdff",
			red: "#ff3200",
			yellow: "#987a1d",
			green: "#459700",
			blue: "#0073ff",
			purple: "#aa5dff"
		},
		bgRamp: "gray",
		bgRampValue: 0,
		startSignalLightness: .36,
		endSignalLightness: .72
	},
	{
		...n,
		id: 12,
		name: "A Box of Macaroni",
		pallet: {
			...n.pallet,
			black: "#0d0086",
			white: "#ffc900",
			red: "#ff0034",
			yellow: "#8a6420",
			green: "#26b047",
			blue: "#6599ff",
			purple: "#d400ff"
		},
		startSignalLightness: .6,
		endSignalLightness: .6,
		contrastMultiplier: 1.5
	},
	{
		...n,
		id: 13,
		name: "Sunset",
		pallet: {
			...n.pallet,
			black: "#242744",
			white: "#ffe173",
			red: "#f20031",
			yellow: "#c16000",
			green: "#008d29",
			blue: "#12889d",
			purple: "#b555c8"
		},
		ramps: {
			...n.ramps,
			gray: {
				...n.ramps.gray,
				colorModel: "hcl"
			}
		},
		bgRampValue: 0,
		startSignalLightness: .42,
		endSignalLightness: .58
	},
	{
		...n,
		id: 14,
		name: "Astro",
		pallet: {
			...n.pallet,
			black: "#040816",
			gray: "#ffb980",
			white: "#ffffff",
			red: "#cb1c00",
			yellow: "#bd8f5a",
			green: "#02b984",
			blue: "#4f81a7",
			purple: "#b982d5"
		},
		ramps: {
			...n.ramps,
			gray: {
				...n.ramps.gray,
				colors: [
					"black",
					"gray",
					"white"
				],
				colorModel: "hcl"
			}
		},
		bgRampValue: 0,
		startSignalLightness: .42,
		endSignalLightness: .58
	}
];
// src/private/Themes.tsx
function _t(e) {
	return o.fromTheme(e).contrast(0);
}
function k({ theme: e, isSelected: t, children: n, onClick: r, isHidden: i }) {
	let a = o.fromTheme(e), s = a.contrast(0), c = "hc:w-full hc:h-full hc:border hc:rounded-sm hc:relative hc:overflow-hidden", l = {
		backgroundColor: s.hex,
		color: s.contrast(100).hex,
		borderColor: a.contrast(t ? 100 : 12).hex,
		boxShadow: `0 2px 10px ${a.contrast(100).alpha(.2)}`
	}, u = _(null), d = u.current ? u.current.clientHeight : 0;
	return /* @__PURE__ */ x("div", {
		ref: u,
		className: T("hc:flex hc:relative hc:basis-[20em] hc:shrink-0 hc:transition-[scale,margin,opacity] hc:duration-150 hc:ease-[ease-out]", i && "hc:pointer-events-none hc:scale-y-0 hc:opacity-0"),
		style: i ? {
			marginTop: `-${d / 2}px`,
			marginBottom: `-${d / 2}px`
		} : void 0,
		children: t ? /* @__PURE__ */ S("div", {
			className: c,
			style: l,
			children: [n, /* @__PURE__ */ x(Ue, {
				size: ".75em",
				className: "hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2"
			})]
		}) : /* @__PURE__ */ x("button", {
			onClick: r,
			className: c,
			style: l,
			children: /* @__PURE__ */ x("div", {
				className: "hc:h-full",
				children: n
			})
		})
	});
}
function vt({ theme: e }) {
	return /* @__PURE__ */ x("div", {
		className: "hc:flex hc:h-[.5em]",
		children: Object.keys(e.pallet).map((t) => /* @__PURE__ */ x("div", {
			className: "hc:w-full hc:h-full",
			style: { backgroundColor: e.pallet[t] }
		}, t))
	});
}
function yt({ children: e }) {
	return /* @__PURE__ */ x("h3", {
		className: "hc:mx-2 hc:py-2 hc:flex hc:items-center hc:justify-between",
		children: e
	});
}
function bt({ bg: e }) {
	return /* @__PURE__ */ x("div", {
		className: "hc:-mt-2 hc:h-2",
		style: { background: `linear-gradient(${e}, ${e.contrast(12)})` }
	});
}
function xt({ theme: t, bg: n }) {
	return Object.keys(t.ramps).filter((n) => {
		let r = t.ramps[n].config.mode;
		return r === e.SIGNAL || r === e.FURTHEST;
	}).map((e) => {
		let r = n.base(t.ramps[e]);
		return /* @__PURE__ */ x("div", {
			className: "hc:flex",
			children: [
				100,
				75,
				50,
				25
			].map((t) => /* @__PURE__ */ x("div", {
				className: T("hc:w-full hc:mt-px", e === "gray" ? "hc:h-6" : "hc:h-2"),
				style: { backgroundColor: r.contrast(t).hex }
			}, t))
		}, e);
	});
}
function St({ children: e }) {
	return /* @__PURE__ */ x("div", {
		className: "hc:flex",
		children: /* @__PURE__ */ x("div", {
			className: "hc:p-2 hc:w-full hc:flex hc:flex-col",
			children: e
		})
	});
}
var Ct = d.memo(function({ config: e, isSelected: t, onClick: r, onRemove: i }) {
	let [o, s] = v(!1), c = new a(e), l = _t(c), u = e.id === n.id;
	function d() {
		s(!0), setTimeout(() => i(), 200);
	}
	return /* @__PURE__ */ S(k, {
		theme: c,
		isSelected: t,
		onClick: r,
		isHidden: o,
		children: [
			/* @__PURE__ */ x(vt, { theme: c }),
			/* @__PURE__ */ S(yt, { children: [c.name, t && !u && /* @__PURE__ */ x(Je, {
				style: { color: l.base(c.ramps.red).contrast(100).hex },
				onClick: d,
				verify: !0,
				children: "Remove"
			})] }),
			/* @__PURE__ */ x(bt, { bg: l }),
			/* @__PURE__ */ x(St, { children: /* @__PURE__ */ x(xt, {
				theme: c,
				bg: l
			}) })
		]
	});
});
function wt(e, t) {
	let n = e.contrast(100, e.theme.ramps[t]);
	return {
		backgroundColor: n.hex,
		color: n.contrast(100).hex
	};
}
function Tt({ config: e, onReset: t, onCreate: n }) {
	let r = new a(e), i = _t(r);
	return /* @__PURE__ */ S(k, {
		isSelected: !0,
		theme: r,
		children: [
			/* @__PURE__ */ x(vt, { theme: r }),
			/* @__PURE__ */ x(yt, { children: r.name }),
			/* @__PURE__ */ x(bt, { bg: i }),
			/* @__PURE__ */ S(St, { children: [/* @__PURE__ */ x(qe, {
				colors: "",
				style: wt(i, "green"),
				onClick: n,
				children: "Save As New Theme"
			}), /* @__PURE__ */ x(qe, {
				colors: "",
				className: "hc:mt-1",
				style: wt(i, "red"),
				verify: !0,
				onClick: t,
				children: "Reset"
			})] })
		]
	});
}
function Et({ configs: e, config: t, onSelectConfig: n, onConfigsChange: r }) {
	let [i] = Pe(), a = i.config, o = t.id === a.id, s = o && !Qe.default.isEqual(t, a), c = () => n(t), l = () => {
		let i = e.indexOf(t), a = e.filter((e) => e.id !== t.id);
		r(a), n(a[Math.min(i, a.length - 1)]);
	}, u = () => {
		let i = {
			...a,
			id: Math.random(),
			name: t.name === a.name ? `${t.name} Copy` : a.name
		};
		r([i, ...e]), n(i);
	}, d = _(null);
	return h(() => {
		o && d.current && d.current.scrollIntoView({ block: "center" });
	}, []), /* @__PURE__ */ x("div", {
		ref: d,
		children: s ? /* @__PURE__ */ x(Tt, {
			config: a,
			onReset: c,
			onCreate: u
		}) : /* @__PURE__ */ x(Ct, {
			config: t,
			isSelected: o,
			onClick: c,
			onRemove: l
		})
	});
}
var Dt = (e) => {
	if (!Array.isArray(e)) return;
	let t = e.map(de).filter((e) => e !== void 0);
	return t.length > 0 ? t : void 0;
};
function Ot() {
	let [e, t] = Me("themes", gt, Dt), [, n] = Pe();
	return /* @__PURE__ */ S(Ve, {
		size: 3,
		className: "hc:p-4",
		children: [/* @__PURE__ */ x(E, {
			onUpload: (r) => {
				let i = {
					...r,
					id: Math.random()
				};
				t([i, ...e]), n(i);
			},
			children: "Import Theme"
		}), e.map((r) => /* @__PURE__ */ x(Et, {
			configs: e,
			config: r,
			onSelectConfig: n,
			onConfigsChange: t
		}, r.id))]
	});
}
// src/Themer.tsx
var kt = new a(n);
function At({ children: e }) {
	return /* @__PURE__ */ x("div", {
		className: "hc:overflow-y-scroll hc:overflow-x-hidden hc:w-[30em] hc:overscroll-contain hc:flex-auto hc:min-w-0 hc:min-h-0",
		children: e
	});
}
var jt = {
	THEMES: "THEMES",
	EDIT_THEME: "EDIT_THEME"
}, Mt = _e(Object.values(jt));
function Nt({ theme: e, themerTheme: t, onThemeConfigChange: n }) {
	let r = e.config;
	function i(e) {
		return (t) => {
			n({
				...r,
				[e]: t
			});
		};
	}
	let a = i("bgRampValue"), o = i("contrastMultiplier"), s = i("pallet"), c = i("startSignalLightness"), l = i("endSignalLightness"), u = f(() => {
		let e = {
			...r,
			id: Math.random()
		}, t = JSON.stringify(e, null, "  "), n = new Blob([t], { type: "text/plain;charset=utf-8" });
		(0, Ie.default)(n, `${r.name} Huet Theme.json`);
	}, [r]);
	return /* @__PURE__ */ x(b, { children: /* @__PURE__ */ S(Ve, {
		size: 2,
		className: "hc:p-4",
		children: [
			/* @__PURE__ */ S("div", { children: [/* @__PURE__ */ x(lt, {
				label: "Theme Name",
				className: "hc:flex-auto hc:min-w-0 hc:min-h-0 hc:mb-2",
				value: r.name,
				onChange: (e) => n({
					...r,
					name: e
				})
			}), /* @__PURE__ */ x(qe, {
				onClick: u,
				children: "Export Theme"
			})] }),
			/* @__PURE__ */ x(ct, {
				label: "Background Color",
				children: /* @__PURE__ */ x(Xe, {
					theme: e,
					bgRampValue: r.bgRampValue,
					onRampValueChange: a
				})
			}),
			/* @__PURE__ */ x(dt, {
				label: "Contrast",
				min: 0,
				max: 1,
				decimals: 2,
				value: r.contrastMultiplier,
				onChange: o
			}),
			/* @__PURE__ */ x(ct, {
				label: "Pallet",
				children: /* @__PURE__ */ x(D, {
					colors: r.pallet,
					onColorsChange: s
				})
			}),
			/* @__PURE__ */ x(ct, {
				label: "Color ramps",
				children: /* @__PURE__ */ x(it, { theme: t })
			}),
			/* @__PURE__ */ x(dt, {
				label: "Signal Lightness on 'Black'",
				value: r.endSignalLightness,
				onChange: l,
				min: 0,
				max: 1,
				decimals: 2
			}),
			/* @__PURE__ */ x(dt, {
				label: "Signal Lightness on 'White'",
				value: r.startSignalLightness,
				onChange: c,
				min: 0,
				max: 1,
				decimals: 2
			})
		]
	}) });
}
function Pt() {
	let [e, t] = Pe(), [n, r] = Me("themer:shouldThemeSelf", !0, ge), [i, a] = Me("themer:currentTab", jt.THEMES, Mt), o = n ? e : kt;
	return /* @__PURE__ */ x(st, {
		themeConfig: o.config,
		children: /* @__PURE__ */ x(ht, { children: /* @__PURE__ */ S("div", {
			className: "hc:flex hc:flex-col hc:flex-auto hc:min-w-0 hc:min-h-0 hc:overflow-hidden",
			children: [
				/* @__PURE__ */ x("div", {
					className: "hc:px-2 hc:pt-2 hc:border-b",
					children: /* @__PURE__ */ S(Be, {
						growEach: !0,
						children: [/* @__PURE__ */ x(qe, {
							colors: i === jt.THEMES ? "huet-bg-100" : "huet-text-100",
							onClick: () => a(jt.THEMES),
							children: "Themes"
						}), /* @__PURE__ */ x(qe, {
							colors: i === jt.EDIT_THEME ? "huet-bg-100" : "huet-text-100",
							onClick: () => a(jt.EDIT_THEME),
							children: "Edit Theme"
						})]
					})
				}),
				/* @__PURE__ */ x(At, { children: i === jt.EDIT_THEME ? /* @__PURE__ */ x(Nt, {
					theme: e,
					themerTheme: o,
					onThemeConfigChange: t
				}) : /* @__PURE__ */ x(Ot, {}) }),
				/* @__PURE__ */ x("div", {
					className: "huet-bg-12",
					children: /* @__PURE__ */ x(Ve, {
						className: "hc:p-4",
						children: /* @__PURE__ */ x(Ze, {
							label: "Theme the themer",
							value: n,
							onChange: r
						})
					})
				})
			]
		}) })
	});
}
// src/private/ErrorBoundary.tsx
var Ft = class extends d.Component {
	constructor(...e) {
		super(...e), this.state = { hasError: !1 };
	}
	static getDerivedStateFromError() {
		return { hasError: !0 };
	}
	componentDidCatch(e, t) {
		console.error(e, t);
	}
	render() {
		return this.state.hasError ? /* @__PURE__ */ S("div", {
			style: {
				fontFamily: "sans-serif",
				textAlign: "center",
				padding: "1em",
				background: "white",
				color: "black"
			},
			children: [/* @__PURE__ */ S("h1", {
				style: {
					color: "red",
					fontSize: "1em",
					margin: "0"
				},
				children: [this.props.componentName && this.props.componentName + ": ", "Something went wrong"]
			}), /* @__PURE__ */ S("p", {
				style: { margin: ".5em 0" },
				children: [
					"Try clearing local storage:",
					" ",
					/* @__PURE__ */ x("button", {
						onClick: Oe,
						children: "Reset this Page"
					})
				]
			})]
		}) : this.props.children;
	}
};
// src/ThemeConfigurator.tsx
function It(e) {
	let t = typeof e == "string" ? document.querySelector(e) : e;
	if (!t) throw Error(`Huet: no element matches ${String(e)}`);
	return t;
}
function Lt(e, t, n) {
	let r = g(() => u(t), [t]), i = _(r);
	i.current = r;
	let a = _(void 0);
	h(() => {
		if (!e) return;
		let t = l(It(e), i.current);
		return a.current = t, () => {
			t.destroy(), a.current = void 0;
		};
	}, [e]), h(() => a.current?.update(r), [r]);
	let o = _(n);
	o.current = n, h(() => o.current?.(t), [t]);
}
function Rt({ target: e, initialThemeConfig: t, onThemeChange: n }) {
	let [r, i] = Me("theme", t, de), o = g(() => new a(r), [r]);
	return Lt(e, r, n), /* @__PURE__ */ x(Ne.Provider, {
		value: [o, i],
		children: /* @__PURE__ */ x(Pt, {})
	});
}
function zt({ target: e, onThemeChange: t }) {
	let [n] = p(Ne);
	return Lt(e, n.config, t), /* @__PURE__ */ x(Pt, {});
}
function Bt({ target: e, initialThemeConfig: t = n, onThemeChange: r }) {
	let i = p(Ne) !== null;
	return /* @__PURE__ */ x(Ft, {
		componentName: "Theme Configurator",
		children: i ? /* @__PURE__ */ x(zt, {
			target: e,
			onThemeChange: r
		}) : /* @__PURE__ */ x(Rt, {
			target: e,
			initialThemeConfig: t,
			onThemeChange: r
		})
	});
}
export { te as BackgroundContext, i as BaseColor, ae as Block, Fe as Body, o as Color, ie as Contrast, a as Theme, Bt as ThemeConfigurator, ee as ThemeContext, r as getLightness, e as rampModes, re as useBackground, ne as useTheme };

//# sourceMappingURL=huet.js.map