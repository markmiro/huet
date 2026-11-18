import { b as e, c as t, h as n, i as r, n as i, s as a, t as o, u as s, v as c, y as l } from "./theme-BaMwzpON.js";
// src/core/themes.ts
var u = {
	Base: {
		neutral: ["#000000", "#ffffff"],
		colorModel: "lab",
		colors: {
			red: "#d14457",
			yellow: "#9d6f00",
			green: "#298830",
			blue: "#0082dc",
			purple: "#a359b9"
		}
	},
	Radioactive: {
		neutral: ["#69707f", "#c1ff00"],
		colorModel: "lab",
		colors: {
			red: "#ff88a4",
			yellow: "#b1bd2d",
			green: "#59c866",
			blue: "#83beff",
			purple: "#d2a8ff"
		},
		signalLightness: {
			onLight: .46,
			onDark: .61
		}
	},
	Blueprint: {
		neutral: ["#384cd2", "#ffffff"],
		colorModel: "lrgb",
		colors: {
			red: "#ff0030",
			yellow: "#988753",
			green: "#009700",
			blue: "#00a3ff",
			purple: "#af60ff"
		},
		signalLightness: {
			onLight: .26,
			onDark: .47
		}
	},
	Terminal: {
		neutral: ["#0d171d", "#7fff8b"],
		colorModel: "lab",
		colors: {
			red: "#f54f75",
			yellow: "#b1bd2d",
			green: "#13a624",
			blue: "#558cff",
			purple: "#d75eff"
		},
		signalLightness: {
			onLight: .5,
			onDark: .63
		}
	},
	Paperback: {
		neutral: ["#3d3531", "#e2c1b1"],
		colorModel: "lab",
		colors: {
			red: "#e13639",
			yellow: "#c89455",
			green: "#238e5d",
			blue: "#366caa",
			purple: "#8e65bf"
		},
		signalLightness: {
			onLight: .36,
			onDark: .55
		}
	},
	"Deep Dive": {
		neutral: ["#001b4f", "#b6e8e8"],
		colorModel: "lab",
		colors: {
			red: "#ff6669",
			yellow: "#a09c5c",
			green: "#319647",
			blue: "#496eff",
			purple: "#af5bff"
		},
		signalLightness: {
			onLight: .44,
			onDark: .63
		}
	},
	"Royal Purple": {
		neutral: ["#37233b", "#f0c9e7"],
		colorModel: "lab",
		colors: {
			red: "#e13639",
			yellow: "#bd7f33",
			green: "#00878e",
			blue: "#3865da",
			purple: "#7630c8"
		},
		signalLightness: {
			onLight: .5,
			onDark: .5
		}
	},
	"Orange Boost": {
		neutral: ["#474b56", "#ff7c49"],
		colorModel: "lab",
		colors: {
			red: "#e32850",
			yellow: "#af7000",
			green: "#00974c",
			blue: "#2292cb",
			purple: "#d961d6"
		},
		signalLightness: {
			onLight: .27,
			onDark: .76
		}
	},
	"Faded Future": {
		neutral: ["#3c3d43", "#b2bdff"],
		colorModel: "lab",
		colors: {
			red: "#ff3200",
			yellow: "#987a1d",
			green: "#459700",
			blue: "#0073ff",
			purple: "#aa5dff"
		},
		signalLightness: {
			onLight: .36,
			onDark: .72
		}
	},
	"A Box of Macaroni": {
		neutral: ["#0d0086", "#ffc900"],
		colorModel: "lab",
		colors: {
			red: "#ff0034",
			yellow: "#8a6420",
			green: "#26b047",
			blue: "#6599ff",
			purple: "#d400ff"
		},
		contrast: 1.5,
		signalLightness: {
			onLight: .6,
			onDark: .6
		}
	},
	Sunset: {
		neutral: ["#242744", "#ffe173"],
		colorModel: "hcl",
		colors: {
			red: "#f20031",
			yellow: "#c16000",
			green: "#008d29",
			blue: "#12889d",
			purple: "#b555c8"
		},
		signalLightness: {
			onLight: .42,
			onDark: .58
		}
	},
	Astro: {
		neutral: [
			"#040816",
			"#ffb980",
			"#ffffff"
		],
		colorModel: "hcl",
		colors: {
			red: "#cb1c00",
			yellow: "#bd8f5a",
			green: "#02b984",
			blue: "#4f81a7",
			purple: "#b982d5"
		},
		signalLightness: {
			onLight: .42,
			onDark: .58
		}
	}
}, d = Object.freeze([
	...[
		0,
		5,
		10,
		25,
		50,
		75,
		100
	].map((e) => `huet-surface-${e}`),
	...r.map((e) => `huet-surface-${e}`),
	"huet-text",
	"huet-muted",
	"huet-border",
	"huet-focus",
	...r.map((e) => `huet-text-${e}`)
]), f = [
	0,
	5,
	10,
	20,
	30,
	40,
	50,
	60,
	70,
	80,
	90,
	95,
	100
], p = [
	"gray",
	"red",
	"yellow",
	"green",
	"blue",
	"purple",
	"white"
];
function m(e) {
	let t = /^huet-(bg\/)?(bg|text|border|outline)-(?:(gray|red|yellow|green|blue|purple|white)-)?(0|[1-9]\d?|100)$/.exec(e);
	if (!(!t || t[1] && t[2] === "bg" || !f.includes(Number(t[4])))) return {
		property: t[2],
		ownBackground: !!t[1],
		ramp: t[3],
		amount: Number(t[4])
	};
}
function h({ ramp: e, amount: t }) {
	return (e ? p.indexOf(e) + 1 : 0) * 101 + t;
}
function ee(e) {
	return "--" + e.replace("/", "-");
}
var g = [];
for (let e of [
	"bg",
	"text",
	"border",
	"outline",
	"bg/text",
	"bg/border",
	"bg/outline"
]) for (let t of [void 0, ...p]) for (let n of f) g.push(`huet-${e}-${t ? t + "-" : ""}${n}`);
var _ = Object.freeze([...d, ...g]), v = new Set(_), y = new Set(d);
function b(e) {
	let t = 0, n = 0;
	for (let r = 0; r < e.length; r++) e[r] === "[" || e[r] === "(" ? t++ : e[r] === "]" || e[r] === ")" ? t-- : e[r] === ":" && !t && (n = r + 1);
	let r = e.slice(n), i = /^!|!$/.test(r);
	return i && (r = r.replace(/^!|!$/, "")), {
		variants: e.slice(0, n),
		base: r,
		important: i
	};
}
function x(e) {
	if (v.has(e)) return !0;
	let { variants: t, base: n, important: r } = b(e);
	return !r && !!t && !y.has(n) && v.has(n) && O(e) === void 0;
}
var S = (e) => m(e)?.property ?? (v.has(e) ? e.startsWith("huet-surface-") ? "bg" : e === "huet-border" ? "border" : e === "huet-focus" ? "outline" : "text" : void 0);
function C(e) {
	let t = [], n = 0, r = 0;
	for (let i = 0; i < e.length; i++) e[i] === "[" || e[i] === "(" ? n++ : e[i] === "]" || e[i] === ")" ? n-- : e[i] === ":" && !n && (t.push(e.slice(r, i)), r = i + 1);
	return t;
}
var w = /^(?:\*|\*\*|before|after|placeholder|file|marker|selection|first-line|first-letter|backdrop|details-content)$|^\[.*&(?:\s|_|>|\+|~|::)/, T = {
	"huet-text": "text-huet-fg",
	"huet-muted": "text-huet-muted",
	"huet-border": "border-huet-border",
	...Object.fromEntries(r.map((e) => [`huet-text-${e}`, `text-huet-${e}`]))
}, E = (e) => f.reduce((t, n) => Math.abs(n - e) < Math.abs(t - e) ? n : t), D = /^bg-(?:huet-([\w-]+?)|\((?:color:)?--huet-([\w-]+)\)|\[(?:color:)?var\(--huet-([\w-]+)\)\])(?:\/.*)?$/;
function O(e) {
	if (v.has(e)) return;
	let { variants: t, base: n } = b(e), i = D.exec(n);
	if (i) {
		let n = i[1] ?? i[2] ?? i[3];
		return `Tailwind background utilities paint colors Huet can't track, so colors inside would be solved against the wrong background: ${e}. Use a Huet background class, e.g. "${t}${r.includes(n) ? `huet-bg-${n}-20` : n === "fg" || n === "foreground" ? "huet-bg-100" : n === "background" ? "huet-bg-0" : "huet-bg-20"}".`;
	}
	if (!/(?:^|:|!)huet-/.test(e)) return;
	let a = /^(.+)\/(?:\d+|\[[^\]]*\]|\([^)]*\))$/.exec(n);
	if (a && v.has(a[1])) return `Huet classes don't take opacity modifiers: ${e}. A see-through color no longer has the contrast Huet chose for it. Use a lower amount instead, e.g. "${t}${a[1].replace(/\d+$/, "10")}".`;
	let o = /^(huet-(?:bg\/)?(?:bg|text|border|outline)-(?:[a-z]+-)?)(\d+)$/.exec(n);
	if (o && !v.has(n) && Number(o[2]) <= 100 && v.has(o[1] + E(Number(o[2])))) {
		let n = Number(o[2]), r = [...f].reverse().find((e) => e < n), i = f.find((e) => e > n);
		return `Huet amounts are ${f.join(", ")}: ${e}. Use "${t}${o[1]}${r}" or "${t}${o[1]}${i}".`;
	}
	if (!v.has(n)) return `Unknown Huet class: ${e}`;
	if (!t) return;
	if (C(t).some((e) => !e)) return `Empty Tailwind variant in ${e}`;
	if (n === "huet-focus") return `Use "huet-focus" alone: it already applies only on :focus-visible. For another outline with a variant, use "${t}huet-outline-100".`;
	if (n.startsWith("huet-surface-")) return `Tailwind variants work on huet-bg-AMOUNT classes, not huet-surface-*: ${e}. Use an amount, e.g. "${t}huet-bg-${/\d+$/.test(n) ? E(Number(n.slice(13))) : `${n.slice(13)}-20`}".`;
	if (y.has(n)) return `Tailwind variants work on explicit-amount classes, not ${n}: ${e}. Use "${t}huet-text-60" or the token utility "${t}${T[n]}".`;
	let s = C(t).find((e) => w.test(e));
	if (S(n) === "bg" && s) return `Background variants must style the element with the class: ${e}. "${s}:" styles a child or pseudo-element, whose background Huet can't track. Put "${n}" on that element instead.`;
}
function k(e) {
	let t = e.trim().split(/\s+/), n = t.map(O).filter((e) => e !== void 0), r = /* @__PURE__ */ new Map();
	for (let e of t) {
		let { variants: t, base: i } = b(e), a = S(i);
		if (!a) continue;
		let o = t + a, s = r.get(o), c = a === "bg" ? "background" : a;
		s ? n.push(t ? `Use one Huet ${c} class per variant: ${s} and ${e} both apply on "${t}"` : `Use one Huet ${c} class per element: ${s} and ${e} conflict`) : r.set(o, e);
	}
	return n;
}
// src/core/css.ts
var A = f;
function j(e, t) {
	return Object.fromEntries(A.map((n) => [`--huet-${n}`, e.step(t, n).hex]));
}
function te(e, { selector: n = ":root", ...r } = {}) {
	let i = a(e, r), o = {
		"color-scheme": c(i.background, i.dark, i.light) === i.light ? "dark" : "light",
		...t(i.tokensOn(i.root)),
		...j(i, i.root)
	};
	return `${n} {\n${Object.entries(o).map(([e, t]) => `  ${e}: ${t};`).join("\n")}\n}\n`;
}
// src/core/dom.ts
var M = "[class*=\"huet-\"]", N = /* @__PURE__ */ new WeakSet(), P = /* @__PURE__ */ new WeakMap(), ne = [
	"data-huet-color-bg",
	"data-huet-color-text",
	"data-huet-color-border",
	"data-huet-color-outline",
	"data-huet-state"
], F = 256, I = (e, t, n) => e.step(t, n.amount, n.ramp), L = /* @__PURE__ */ new Map();
function R(e) {
	let t = L.get(e);
	if (!t) {
		let n = [...new Set(e.split(/\s+/).filter(Boolean))].map(b), r = n.filter((e) => e.base.startsWith("huet-surface-") || m(e.base)?.property === "bg"), i = r.find((e) => !e.variants)?.base, a = [i, ...new Set(r.filter((e) => e.variants && e.base !== i).map((e) => e.base))], o = k(e);
		t = {
			errors: o,
			surface: r.length > 0,
			states: a,
			keys: a.length > 1 && !o.length ? [-1, ...a.slice(1).map((e) => h(m(e)))] : void 0,
			colors: n.flatMap((e) => {
				let t = m(e.base);
				return t && t.property !== "bg" ? [{
					...e,
					spec: t
				}] : [];
			})
		}, L.size >= 4096 && L.clear(), L.set(e, t);
	}
	return t;
}
var z = (e) => `max(0%, (1 - max(var(--huet-state) - ${e}, ${e} - var(--huet-state))) * 100%)`;
function B(e, t) {
	let n = t[0];
	for (let r = 1; r < t.length; r++) t[r] !== t[0] && (n = `color-mix(in srgb, ${t[r]} ${z(e.keys[r])}, ${n})`);
	return n;
}
function V(e, n, r = {}) {
	let i = r.background ?? 1, o = a(n, { background: i });
	if (N.has(e) || e.parentElement?.closest("[data-huet-root]") || e.querySelector("[data-huet-root]")) throw Error("Huet theme roots must be independent, non-overlapping trees");
	N.add(e);
	let s = e.getAttribute("data-huet-root");
	e.setAttribute("data-huet-root", "");
	let c = !1, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new WeakMap(), f = (e, { values: t, markers: n }, r) => {
		let i = r ? d.get(e) : void 0;
		d.set(e, {
			values: t,
			markers: n
		});
		for (let t in i?.values) {
			e.style.getPropertyValue(t) !== i.values[t] && (i = void 0);
			break;
		}
		if (i) {
			let r = i.markers.size === n.size;
			if (r) {
				for (let e of n) if (!i.markers.has(e)) {
					r = !1;
					break;
				}
			}
			if (r) {
				let e = 0;
				for (let n in t) if (e++, !(n in i.values)) {
					r = !1;
					break;
				}
				if (r) {
					for (let t in i.values) if (e-- <= 0) {
						r = !1;
						break;
					}
				}
			}
			if (r) {
				for (let n in t) t[n] !== i.values[n] && e.style.setProperty(n, t[n]);
				return;
			}
		}
		let a = l.get(e);
		a || (P.get(e)?.(), a = /* @__PURE__ */ new Map(), l.set(e, a), P.set(e, () => p(e)));
		for (let [n, [r, i]] of a) n in t || (r ? e.style.setProperty(n, r, i) : e.style.removeProperty(n), a.delete(n));
		let o = u.get(e);
		o || u.set(e, o = /* @__PURE__ */ new Map());
		for (let t of ne) if (n.has(t)) o.has(t) || o.set(t, e.getAttribute(t)), e.setAttribute(t, "");
		else if (o.has(t)) {
			let n = o.get(t);
			n === null ? e.removeAttribute(t) : e.setAttribute(t, n), o.delete(t);
		}
		for (let [n, r] of Object.entries(t)) a.has(n) || a.set(n, [e.style.getPropertyValue(n), e.style.getPropertyPriority(n)]), e.style.getPropertyValue(n) !== r && e.style.setProperty(n, r);
	}, p = (e) => {
		if (l.has(e)) {
			for (let [t, [n, r]] of l.get(e) ?? []) n ? e.style.setProperty(t, n, r) : e.style.removeProperty(t);
			for (let [t, n] of u.get(e) ?? []) n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
			u.delete(e), l.delete(e), P.delete(e), d.delete(e);
		}
	}, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _, v = () => {
		h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _ = void 0;
	}, y = (e, t) => {
		let n = h.get(e);
		n || h.set(e, n = /* @__PURE__ */ new Map());
		let r = n.get(t);
		return r || n.set(t, r = x(e, t)), r;
	}, b = (e, t, n) => {
		let r = g.get(e);
		r || g.set(e, r = /* @__PURE__ */ new Map());
		let i = r.get(t);
		return i === void 0 && r.set(t, i = I(o, e, n).hex), i;
	}, x = (e, n) => {
		let r = m(n), i = n.slice(13), a = r ? I(o, e, r) : o.derive(e, o.surface(e.full.hex, /^\d+$/.test(i) ? Number(i) : i)), s = {
			...t(o.tokensOn(a, e)),
			...j(o, a)
		};
		return {
			bg: a,
			tokens: r ? {
				...s,
				"--huet-foreground": o.step(a, 100).hex
			} : s
		};
	}, S = (t) => {
		throw e.setAttribute("data-huet-error", t), Error(t);
	}, C, w = () => {
		let t = [e, ...e.querySelectorAll(M)], n = t.map((e) => R(e.getAttribute("class") ?? "")), r = [...new Set(n.flatMap((e) => e.errors))];
		r.length && S(r.join("\n"));
		let i = [], a = /* @__PURE__ */ new Map();
		return t.forEach((t, r) => {
			let o = n[r];
			if (t !== e && !o.surface && !o.colors.length) return;
			let s = t === e ? null : t.parentElement;
			for (; s && !a.has(s);) s = s.parentElement;
			(t === e || o.surface) && a.set(t, i.length), i.push({
				...o,
				el: t,
				parent: s ? a.get(s) : -1
			});
		}), i;
	}, T = (n = !1) => {
		if (c) return;
		n || (C = void 0);
		let r = C !== void 0, i = C ??= w(), a = /* @__PURE__ */ new Map(), s = (e) => {
			let t = a.get(e);
			return t || a.set(e, t = {
				values: {},
				markers: /* @__PURE__ */ new Set()
			}), t;
		}, u = 0, d = (e, t, n) => (e.forEach((r, i) => {
			let a = r.keys.length, o = t.length / a;
			t = Array.from({ length: o }, (c, l) => {
				let d = Array.from({ length: a }, (e, n) => t[n * o + l]), f = B(r, d);
				if (f === d[0] || r.el === n && i === e.length - 1) return f;
				let p = `--huet-s${u++}`;
				return s(r.el).values[p] = f, `var(${p})`;
			});
		}), t[0]), m = o.root;
		_ ??= {
			...t(o.tokensOn(m)),
			...j(o, m)
		};
		let h = {
			dims: [],
			bg: [m],
			tokens: [_]
		}, g = [];
		i.forEach(({ el: t, parent: n, surface: r, states: i, keys: a, colors: o }, c) => {
			let l = n < 0 ? h : g[n], u = l;
			if (t === e || r) {
				let e = a ? {
					el: t,
					keys: a
				} : void 0, n = [], r = [];
				l.bg.forEach((e, t) => {
					for (let a of i) {
						let i = a ? y(e, a) : {
							bg: e,
							tokens: l.tokens[t]
						};
						n.push(i.bg), r.push(i.tokens);
					}
				}), n.length > F && S(`Too many background states above "${t.getAttribute("class")}": ${n.length} combinations, at most ${F}. Each enclosing element with Tailwind variants on its Huet background multiplies them. Remove variants from some of those backgrounds.`), u = {
					dims: e ? [...l.dims, e] : l.dims,
					bg: n,
					tokens: r
				}, g[c] = u;
				let o = s(t);
				if (o.markers.add("data-huet-color-bg"), e && o.markers.add("data-huet-state"), !u.dims.length) Object.assign(o.values, r[0]);
				else for (let e of Object.keys(r[0])) o.values[e] = d(u.dims, r.map((t) => t[e]), t);
			}
			for (let { variants: e, base: n, spec: r } of o) {
				let i = s(t), a = r.ownBackground ? u : l, o = i.values[ee(n)] ??= a.dims.length ? d(a.dims, a.bg.map((e) => b(e, n, r)), t) : b(a.bg[0], n, r);
				e || (i.values[`--huet-relative-${r.property}`] = o, i.markers.add(`data-huet-color-${r.property}`));
			}
		}), e.removeAttribute("data-huet-error");
		for (let [e, t] of a) f(e, t, r);
		for (let e of l.keys()) a.has(e) || p(e);
	}, E = (e) => !!e && e.includes("huet-"), D = (e) => {
		if (e.type === "attributes") return E(e.oldValue) || E(e.target.getAttribute("class"));
		for (let t of [e.addedNodes, e.removedNodes]) for (let e of t) if (e.nodeType === 1 && (e.matches(M) || e.querySelector(M))) return !0;
		return !1;
	}, O = e.ownerDocument.defaultView.MutationObserver, k = new O((e) => {
		e.some(D) && T();
	});
	try {
		T();
	} catch (t) {
		for (let e of l.keys()) p(e);
		throw e.removeAttribute("data-huet-error"), s === null ? e.removeAttribute("data-huet-root") : e.setAttribute("data-huet-root", s), N.delete(e), t;
	}
	return k.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ["class"],
		attributeOldValue: !0
	}), {
		update(e, t = {}) {
			if (c) throw Error("Cannot update a destroyed Huet mount");
			let n = t.background ?? i;
			o = a(e, { background: n }), i = n, v(), k.takeRecords().some(D) && (C = void 0), T(!0);
		},
		destroy() {
			if (!c) {
				c = !0, k.disconnect();
				for (let e of l.keys()) p(e);
				e.removeAttribute("data-huet-error"), s === null ? e.removeAttribute("data-huet-root") : e.setAttribute("data-huet-root", s), N.delete(e);
			}
		}
	};
}
// src/core/shiki.ts
var H = {
	foreground: "var(--huet-foreground)",
	background: "var(--huet-background)",
	comment: "var(--huet-muted)",
	keyword: "var(--huet-red)",
	function: "var(--huet-purple)",
	constant: "var(--huet-blue)",
	string: "color-mix(in oklab, var(--huet-blue) 55%, var(--huet-foreground))",
	variable: "var(--huet-yellow)",
	tag: "var(--huet-green)",
	punctuation: "var(--huet-muted)",
	invalid: "var(--huet-red)",
	inserted: "var(--huet-green)",
	deleted: "var(--huet-red)",
	changed: "var(--huet-yellow)"
}, U = (e) => `var(--huet-code-${e}, ${H[e]})`, W = {
	black: "var(--huet-muted)",
	red: "var(--huet-red)",
	green: "var(--huet-green)",
	yellow: "var(--huet-yellow)",
	blue: "var(--huet-blue)",
	magenta: "var(--huet-purple)",
	cyan: "color-mix(in oklab, var(--huet-blue), var(--huet-green))",
	white: "var(--huet-foreground)"
}, re = Object.keys(W).flatMap((e) => {
	let t = e[0].toUpperCase() + e.slice(1);
	return [`terminal.ansi${t}`, `terminal.ansiBright${t}`];
});
function ie(e) {
	let t = {}, n = {};
	return re.forEach((r, i) => {
		let a = r.replace(/^terminal\.ansi(Bright)?/, "").toLowerCase(), o = `#ffff${(i + 1).toString(16).padStart(4, "0")}`;
		n[o] = e(r, a), t[r] = o;
	}), {
		colors: t,
		colorReplacements: n
	};
}
var G = (e) => `var(--huet-code-ansi-${e}, ${W[e]})`, ae = [
	[[
		"comment",
		"punctuation.definition.comment",
		"string.comment"
	], "comment"],
	[[
		"constant",
		"entity.name.constant",
		"variable.other.constant",
		"variable.other.enummember",
		"variable.language"
	], "constant"],
	[["entity", "entity.name"], "function"],
	[["variable.parameter.function"], "foreground"],
	[["entity.name.tag"], "tag"],
	[[
		"keyword",
		"storage",
		"storage.type"
	], "keyword"],
	[[
		"storage.modifier.package",
		"storage.modifier.import",
		"storage.type.java"
	], "foreground"],
	[[
		"string",
		"punctuation.definition.string",
		"string punctuation.section.embedded source"
	], "string"],
	[["support", "meta.property-name"], "constant"],
	[["variable"], "variable"],
	[["variable.other"], "foreground"],
	[
		[
			"invalid.broken",
			"invalid.deprecated",
			"invalid.illegal",
			"invalid.unimplemented"
		],
		"invalid",
		"italic"
	],
	[["message.error"], "invalid"],
	[["string variable"], "constant"],
	[[
		"source.regexp",
		"string.regexp",
		"string.regexp.character-class",
		"string.regexp constant.character.escape",
		"string.regexp source.ruby.embedded",
		"string.regexp string.regexp.arbitrary-repitition"
	], "string"],
	[
		["string.regexp constant.character.escape"],
		"tag",
		"bold"
	],
	[[
		"support.constant",
		"support.variable",
		"meta.module-reference"
	], "constant"],
	[["punctuation.definition.list.begin.markdown"], "variable"],
	[
		["markup.heading", "markup.heading entity.name"],
		"constant",
		"bold"
	],
	[["markup.quote"], "tag"],
	[
		["markup.italic"],
		"foreground",
		"italic"
	],
	[
		["markup.bold"],
		"foreground",
		"bold"
	],
	[
		["markup.underline"],
		void 0,
		"underline"
	],
	[
		["markup.strikethrough"],
		void 0,
		"strikethrough"
	],
	[["markup.inline.raw"], "constant"],
	[[
		"markup.deleted",
		"meta.diff.header.from-file",
		"punctuation.definition.deleted"
	], "deleted"],
	[[
		"markup.inserted",
		"meta.diff.header.to-file",
		"punctuation.definition.inserted"
	], "inserted"],
	[["markup.changed", "punctuation.definition.changed"], "changed"],
	[["markup.ignored", "markup.untracked"], "comment"],
	[
		["meta.diff.range"],
		"function",
		"bold"
	],
	[["meta.diff.header"], "constant"],
	[
		["meta.separator"],
		"constant",
		"bold"
	],
	[["meta.output"], "constant"],
	[[
		"brackethighlighter.tag",
		"brackethighlighter.curly",
		"brackethighlighter.round",
		"brackethighlighter.square",
		"brackethighlighter.angle",
		"brackethighlighter.quote"
	], "punctuation"],
	[["brackethighlighter.unmatched"], "invalid"],
	[
		["constant.other.reference.link", "string.other.link"],
		"string",
		"underline"
	]
];
function oe({ name: e, from: t } = {}) {
	let n = ie(t ? (e, n) => {
		let r = t.colors?.[e];
		return r ? X(r, t, `colors["${e}"]`) : G(n);
	} : (e, t) => G(t));
	return {
		name: e ?? t?.name ?? "huet",
		type: t?.type === "dark" ? "dark" : "light",
		fg: U("foreground"),
		bg: U("background"),
		colors: {
			"editor.foreground": U("foreground"),
			"editor.background": U("background"),
			...n.colors
		},
		colorReplacements: n.colorReplacements,
		tokenColors: t ? (t.tokenColors ?? t.settings ?? []).map(({ settings: e = {}, ...n }, r) => ({
			...n,
			settings: {
				...e,
				...e.foreground && { foreground: X(e.foreground, t, `tokenColors[${r}].foreground`) },
				...e.background && { background: pe(e.background, t, `tokenColors[${r}].background`) }
			}
		})) : ae.map(([e, t, n]) => ({
			scope: e,
			settings: {
				...t && { foreground: U(t) },
				...n && { fontStyle: n }
			}
		}))
	};
}
var se = .03;
function K(t, n) {
	let r = /^#(?:([\da-f]{3})([\da-f])?|([\da-f]{6})([\da-f]{2})?)$/i.exec(t);
	if (!r) throw TypeError(`huetShikiTheme: from.${n} is "${t}"; only hex colors (#rgb, #rgba, #rrggbb, #rrggbbaa) can keep their hue`);
	let i = `#${r[1] ?? r[3]}`, [, a, o] = e(i), [, s, c] = l(i), u = r[2] ? r[2] + r[2] : r[4], d = u ? parseInt(u, 16) / 255 : 1;
	return {
		hex: i,
		gray: Math.hypot(a, o) < se,
		C: s,
		H: c,
		alpha: d
	};
}
var q = ({ C: e, H: t, alpha: n }) => `${de(e, t)} ${+t.toFixed(2)}${n < 1 ? ` / ${+n.toFixed(3)}` : ""}`, ce = [15, 85], le = [
	15,
	30,
	45,
	60,
	75,
	90
], J = /* @__PURE__ */ new Map();
function ue(e) {
	let t = Math.round(e * 100), r = J.get(t);
	if (r) return r;
	let i = 50, a = 0;
	for (let t = 1; t < 100; t++) {
		let r = n(t, e);
		r > a && ([i, a] = [t, r]);
	}
	let o = [.../* @__PURE__ */ new Set([
		0,
		...le,
		i,
		100
	])].sort((e, t) => e - t).map((t) => [t, t === 0 || t === 100 ? 0 : n(t, e)]);
	return r = o.slice(1).map(([e, t], n) => {
		let [r, i] = o[n], a = (t - i) / (e - r);
		return [+a.toFixed(3), +(i - a * r).toFixed(2)];
	}), J.set(t, r), r;
}
function de(e, t) {
	let n = +e.toFixed(2), r = ue(t).filter(([e, t]) => ce.some((r) => e * r + t < n));
	return r.length ? `min(${n}, ${r.map(([e, t]) => `l * ${e} ${t < 0 ? "-" : "+"} ${Math.abs(t)}`).join(", ")})` : `${n}`;
}
var Y = /^(?:inherit|initial|unset|currentcolor|transparent|var\(.+\))$/i;
function X(e, t, n) {
	if (Y.test(e)) return e;
	let r = K(e, n);
	if (!r.gray) return `lch(from var(--huet-code-lightness, var(--huet-muted)) l ${q(r)})`;
	let { fg: i, bg: a } = fe(t), o = K(a, "editor.background").hex;
	return s(o, r.hex) >= .8 * s(o, K(i, "editor.foreground").hex) ? U("foreground") : U("comment");
}
function fe(e) {
	let t = (e.tokenColors ?? e.settings ?? []).find((e) => !e.scope && !e.name)?.settings, n = e.type === "light";
	return {
		fg: e.fg ?? t?.foreground ?? e.colors?.["editor.foreground"] ?? (n ? "#333333" : "#bbbbbb"),
		bg: e.bg ?? t?.background ?? e.colors?.["editor.background"] ?? (n ? "#fffffe" : "#1e1e1e")
	};
}
function pe(e, t, n) {
	return Y.test(e) ? e : `lch(from ${U("background")} l ${q(K(e, n))})`;
}
var Z = {
	add: "huet-bg-green-20",
	remove: "huet-bg-red-20"
}, Q = (e) => {
	let t = e.properties?.class;
	return Array.isArray(t) ? t.map(String) : typeof t == "string" ? t.split(/\s+/).filter(Boolean) : [];
};
function $(e, t) {
	if (m(t)?.property !== "bg") throw TypeError(`huetShikiTransformer: ${e} must be a plain Huet background class like "huet-bg-5" or "huet-bg-green-10", got "${t}"`);
}
function me({ surface: e = "huet-bg-5", lines: t = {} } = {}) {
	$("surface", e);
	let n = t === !1 ? {} : {
		...Z,
		...t
	};
	for (let [e, t] of Object.entries(n)) $(`lines.${e}`, t);
	let r = (e) => {
		let t = Q(e);
		if (t.includes("line")) {
			let r = [...new Set(t.flatMap((e) => n[e] ? [n[e]] : []))];
			if (r.length > 1) throw Error(`huetShikiTransformer: a line has classes for more than one row background (${r.join(", ")}); remove one notation`);
			r.length && (e.properties.class = [...t, r[0]].join(" "));
		} else e.children?.forEach(r);
	};
	return {
		name: "huet",
		pre(t) {
			t.properties.class = [...Q(t), e].join(" ");
		},
		root(e) {
			Object.keys(n).length && r(e);
		}
	};
}
export { f as amounts, W as ansiColors, o as checkTheme, _ as classes, H as codeRoles, i as colorModels, Z as defaultLineSurfaces, r as hues, oe as huetShikiTheme, me as huetShikiTransformer, x as isHuetClass, V as mountTheme, te as themeCss, u as themes, k as validateClasses };

//# sourceMappingURL=index.js.map