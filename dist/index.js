import { _ as e, c as t, i as n, l as r, m as i, n as a, s as o, t as s, v as c, y as l } from "./theme-DQdfBJ-D.js";
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
	...n.map((e) => `huet-surface-${e}`),
	"huet-text",
	"huet-muted",
	"huet-border",
	"huet-focus",
	...n.map((e) => `huet-text-${e}`)
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
	...Object.fromEntries(n.map((e) => [`huet-text-${e}`, `text-huet-${e}`]))
}, E = (e) => f.reduce((t, n) => Math.abs(n - e) < Math.abs(t - e) ? n : t), D = /^bg-(?:huet-([\w-]+?)|\((?:color:)?--huet-([\w-]+)\)|\[(?:color:)?var\(--huet-([\w-]+)\)\])(?:\/.*)?$/;
function O(e) {
	if (v.has(e)) return;
	let { variants: t, base: r } = b(e), i = D.exec(r);
	if (i) {
		let r = i[1] ?? i[2] ?? i[3];
		return `Tailwind background utilities paint colors Huet can't track, so colors inside would be solved against the wrong background: ${e}. Use a Huet background class, e.g. "${t}${n.includes(r) ? `huet-bg-${r}-20` : r === "fg" || r === "foreground" ? "huet-bg-100" : r === "background" ? "huet-bg-0" : "huet-bg-20"}".`;
	}
	if (!/(?:^|:|!)huet-/.test(e)) return;
	let a = /^(.+)\/(?:\d+|\[[^\]]*\]|\([^)]*\))$/.exec(r);
	if (a && v.has(a[1])) return `Huet classes don't take opacity modifiers: ${e}. A see-through color no longer has the contrast Huet chose for it. Use a lower amount instead, e.g. "${t}${a[1].replace(/\d+$/, "10")}".`;
	let o = /^(huet-(?:bg\/)?(?:bg|text|border|outline)-(?:[a-z]+-)?)(\d+)$/.exec(r);
	if (o && !v.has(r) && Number(o[2]) <= 100 && v.has(o[1] + E(Number(o[2])))) {
		let n = Number(o[2]), r = [...f].reverse().find((e) => e < n), i = f.find((e) => e > n);
		return `Huet amounts are ${f.join(", ")}: ${e}. Use "${t}${o[1]}${r}" or "${t}${o[1]}${i}".`;
	}
	if (!v.has(r)) return `Unknown Huet class: ${e}`;
	if (!t) return;
	if (C(t).some((e) => !e)) return `Empty Tailwind variant in ${e}`;
	if (r === "huet-focus") return `Use "huet-focus" alone: it already applies only on :focus-visible. For another outline with a variant, use "${t}huet-outline-100".`;
	if (r.startsWith("huet-surface-")) return `Tailwind variants work on huet-bg-AMOUNT classes, not huet-surface-*: ${e}. Use an amount, e.g. "${t}huet-bg-${/\d+$/.test(r) ? E(Number(r.slice(13))) : `${r.slice(13)}-20`}".`;
	if (y.has(r)) return `Tailwind variants work on explicit-amount classes, not ${r}: ${e}. Use "${t}huet-text-60" or the token utility "${t}${T[r]}".`;
	let s = C(t).find((e) => w.test(e));
	if (S(r) === "bg" && s) return `Background variants must style the element with the class: ${e}. "${s}:" styles a child or pseudo-element, whose background Huet can't track. Put "${r}" on that element instead.`;
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
var te = f;
function A(e, t) {
	return Object.fromEntries(te.map((n) => [`--huet-${n}`, e.step(t, n).hex]));
}
function ne(n, { selector: r = ":root", ...i } = {}) {
	let a = o(n, i), s = {
		"color-scheme": e(a.background, a.dark, a.light) === a.light ? "dark" : "light",
		...t(a.tokensOn(a.root)),
		...A(a, a.root)
	};
	return `${r} {\n${Object.entries(s).map(([e, t]) => `  ${e}: ${t};`).join("\n")}\n}\n`;
}
// src/core/dom.ts
var j = "[class*=\"huet-\"]", M = /* @__PURE__ */ new WeakSet(), N = /* @__PURE__ */ new WeakMap(), P = [
	"data-huet-color-bg",
	"data-huet-color-text",
	"data-huet-color-border",
	"data-huet-color-outline",
	"data-huet-state"
], F = 256, I = (e, t, n) => e.step(t, n.amount, n.ramp), re = (e) => `max(0%, (1 - max(var(--huet-state) - ${e}, ${e} - var(--huet-state))) * 100%)`;
function ie(e, t) {
	let n = t[0];
	for (let r = 1; r < t.length; r++) t[r] !== t[0] && (n = `color-mix(in srgb, ${t[r]} ${re(e.keys[r])}, ${n})`);
	return n;
}
function ae(e, n, r = {}) {
	let i = r.background ?? 1, a = o(n, { background: i });
	if (M.has(e) || e.parentElement?.closest("[data-huet-root]") || e.querySelector("[data-huet-root]")) throw Error("Huet theme roots must be independent, non-overlapping trees");
	M.add(e);
	let s = e.getAttribute("data-huet-root");
	e.setAttribute("data-huet-root", "");
	let c = !1, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = (e, { values: t, markers: n }) => {
		let r = l.get(e);
		r || (N.get(e)?.(), r = /* @__PURE__ */ new Map(), l.set(e, r), N.set(e, () => f(e)));
		for (let [n, [i, a]] of r) n in t || (i ? e.style.setProperty(n, i, a) : e.style.removeProperty(n), r.delete(n));
		let i = u.get(e);
		i || u.set(e, i = /* @__PURE__ */ new Map());
		for (let t of P) if (n.has(t)) i.has(t) || i.set(t, e.getAttribute(t)), e.setAttribute(t, "");
		else if (i.has(t)) {
			let n = i.get(t);
			n === null ? e.removeAttribute(t) : e.setAttribute(t, n), i.delete(t);
		}
		for (let [n, i] of Object.entries(t)) r.has(n) || r.set(n, [e.style.getPropertyValue(n), e.style.getPropertyPriority(n)]), e.style.getPropertyValue(n) !== i && e.style.setProperty(n, i);
	}, f = (e) => {
		if (l.has(e)) {
			for (let [t, [n, r]] of l.get(e) ?? []) n ? e.style.setProperty(t, n, r) : e.style.removeProperty(t);
			for (let [t, n] of u.get(e) ?? []) n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
			u.delete(e), l.delete(e), N.delete(e);
		}
	}, p = (e, n) => {
		let r = m(n), i = n.slice(13), o = r ? I(a, e, r) : a.derive(e, a.surface(e.full.hex, /^\d+$/.test(i) ? Number(i) : i)), s = {
			...t(a.tokensOn(o, e)),
			...A(a, o)
		};
		return {
			bg: o,
			tokens: r ? {
				...s,
				"--huet-foreground": a.step(o, 100).hex
			} : s
		};
	}, g = (t) => {
		throw e.setAttribute("data-huet-error", t), Error(t);
	}, _ = () => {
		if (c) return;
		let n = [e, ...e.querySelectorAll(j)], r = [...new Set(n.flatMap((e) => k(e.getAttribute("class") ?? "")))];
		r.length && g(r.join("\n"));
		let i = /* @__PURE__ */ new Map(), o = (e) => {
			let t = i.get(e);
			return t || i.set(e, t = {
				values: {},
				markers: /* @__PURE__ */ new Set()
			}), t;
		}, s = 0, u = (e, t, n) => (e.forEach((r, i) => {
			let a = r.keys.length, c = t.length / a;
			t = Array.from({ length: c }, (l, u) => {
				let d = Array.from({ length: a }, (e, n) => t[n * c + u]), f = ie(r, d);
				if (f === d[0] || r.el === n && i === e.length - 1) return f;
				let p = `--huet-s${s++}`;
				return o(r.el).values[p] = f, `var(${p})`;
			});
		}), t[0]), _ = a.root, v = {
			dims: [],
			bg: [_],
			tokens: [{
				...t(a.tokensOn(_)),
				...A(a, _)
			}]
		}, y = /* @__PURE__ */ new Map();
		for (let t of n) {
			let n = [...t.classList].map(b), r = n.filter((e) => e.base.startsWith("huet-surface-") || m(e.base)?.property === "bg"), i = n.flatMap((e) => {
				let t = m(e.base);
				return t && t.property !== "bg" ? [{
					...e,
					spec: t
				}] : [];
			});
			if (t !== e && !r.length && !i.length) continue;
			let s = t.parentElement;
			for (; s && !y.has(s);) s = s.parentElement;
			let c = t !== e && s && y.get(s) || v, l = c;
			if (t === e || r.length) {
				let e = r.find((e) => !e.variants)?.base, n = [e, ...new Set(r.filter((t) => t.variants && t.base !== e).map((e) => e.base))], i = n.length > 1 ? {
					el: t,
					keys: [-1, ...n.slice(1).map((e) => h(m(e)))]
				} : void 0, a = [], s = [];
				c.bg.forEach((e, t) => {
					for (let r of n) {
						let n = r ? p(e, r) : {
							bg: e,
							tokens: c.tokens[t]
						};
						a.push(n.bg), s.push(n.tokens);
					}
				}), a.length > F && g(`Too many background states above "${t.getAttribute("class")}": ${a.length} combinations, at most ${F}. Each enclosing element with Tailwind variants on its Huet background multiplies them. Remove variants from some of those backgrounds.`), l = {
					dims: i ? [...c.dims, i] : c.dims,
					bg: a,
					tokens: s
				}, y.set(t, l);
				let d = o(t);
				d.markers.add("data-huet-color-bg"), i && d.markers.add("data-huet-state");
				for (let e of Object.keys(s[0])) d.values[e] = u(l.dims, s.map((t) => t[e]), t);
			}
			for (let { variants: e, base: n, spec: r } of i) {
				let i = o(t), s = r.ownBackground ? l : c, d = i.values[ee(n)] ??= u(s.dims, s.bg.map((e) => I(a, e, r).hex), t);
				e || (i.values[`--huet-relative-${r.property}`] = d, i.markers.add(`data-huet-color-${r.property}`));
			}
		}
		e.removeAttribute("data-huet-error");
		for (let [e, t] of i) d(e, t);
		for (let e of l.keys()) i.has(e) || f(e);
	}, v = e.ownerDocument.defaultView.MutationObserver, y = new v(_);
	try {
		_();
	} catch (t) {
		for (let e of l.keys()) f(e);
		throw e.removeAttribute("data-huet-error"), s === null ? e.removeAttribute("data-huet-root") : e.setAttribute("data-huet-root", s), M.delete(e), t;
	}
	return y.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ["class"]
	}), {
		update(e, t = {}) {
			if (c) throw Error("Cannot update a destroyed Huet mount");
			let n = t.background ?? i;
			a = o(e, { background: n }), i = n, _();
		},
		destroy() {
			if (!c) {
				c = !0, y.disconnect();
				for (let e of l.keys()) f(e);
				e.removeAttribute("data-huet-error"), s === null ? e.removeAttribute("data-huet-root") : e.setAttribute("data-huet-root", s), M.delete(e);
			}
		}
	};
}
// src/core/shiki.ts
var L = {
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
}, R = (e) => `var(--huet-code-${e}, ${L[e]})`, z = {
	black: "var(--huet-muted)",
	red: "var(--huet-red)",
	green: "var(--huet-green)",
	yellow: "var(--huet-yellow)",
	blue: "var(--huet-blue)",
	magenta: "var(--huet-purple)",
	cyan: "color-mix(in oklab, var(--huet-blue), var(--huet-green))",
	white: "var(--huet-foreground)"
}, B = Object.keys(z).flatMap((e) => {
	let t = e[0].toUpperCase() + e.slice(1);
	return [`terminal.ansi${t}`, `terminal.ansiBright${t}`];
});
function V(e) {
	let t = {}, n = {};
	return B.forEach((r, i) => {
		let a = r.replace(/^terminal\.ansi(Bright)?/, "").toLowerCase(), o = `#ffff${(i + 1).toString(16).padStart(4, "0")}`;
		n[o] = e(r, a), t[r] = o;
	}), {
		colors: t,
		colorReplacements: n
	};
}
var H = (e) => `var(--huet-code-ansi-${e}, ${z[e]})`, U = [
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
function W({ name: e, from: t } = {}) {
	let n = V(t ? (e, n) => {
		let r = t.colors?.[e];
		return r ? X(r, t, `colors["${e}"]`) : H(n);
	} : (e, t) => H(t));
	return {
		name: e ?? t?.name ?? "huet",
		type: t?.type === "dark" ? "dark" : "light",
		fg: R("foreground"),
		bg: R("background"),
		colors: {
			"editor.foreground": R("foreground"),
			"editor.background": R("background"),
			...n.colors
		},
		colorReplacements: n.colorReplacements,
		tokenColors: t ? (t.tokenColors ?? t.settings ?? []).map(({ settings: e = {}, ...n }, r) => ({
			...n,
			settings: {
				...e,
				...e.foreground && { foreground: X(e.foreground, t, `tokenColors[${r}].foreground`) },
				...e.background && { background: de(e.background, t, `tokenColors[${r}].background`) }
			}
		})) : U.map(([e, t, n]) => ({
			scope: e,
			settings: {
				...t && { foreground: R(t) },
				...n && { fontStyle: n }
			}
		}))
	};
}
var G = .03;
function K(e, t) {
	let n = /^#(?:([\da-f]{3})([\da-f])?|([\da-f]{6})([\da-f]{2})?)$/i.exec(e);
	if (!n) throw TypeError(`huetShikiTheme: from.${t} is "${e}"; only hex colors (#rgb, #rgba, #rrggbb, #rrggbbaa) can keep their hue`);
	let r = `#${n[1] ?? n[3]}`, [, i, a] = l(r), [, o, s] = c(r), u = n[2] ? n[2] + n[2] : n[4], d = u ? parseInt(u, 16) / 255 : 1;
	return {
		hex: r,
		gray: Math.hypot(i, a) < G,
		C: o,
		H: s,
		alpha: d
	};
}
var q = ({ C: e, H: t, alpha: n }) => `${le(e, t)} ${+t.toFixed(2)}${n < 1 ? ` / ${+n.toFixed(3)}` : ""}`, oe = [15, 85], se = [
	15,
	30,
	45,
	60,
	75,
	90
], J = /* @__PURE__ */ new Map();
function ce(e) {
	let t = Math.round(e * 100), n = J.get(t);
	if (n) return n;
	let r = 50, a = 0;
	for (let t = 1; t < 100; t++) {
		let n = i(t, e);
		n > a && ([r, a] = [t, n]);
	}
	let o = [.../* @__PURE__ */ new Set([
		0,
		...se,
		r,
		100
	])].sort((e, t) => e - t).map((t) => [t, t === 0 || t === 100 ? 0 : i(t, e)]);
	return n = o.slice(1).map(([e, t], n) => {
		let [r, i] = o[n], a = (t - i) / (e - r);
		return [+a.toFixed(3), +(i - a * r).toFixed(2)];
	}), J.set(t, n), n;
}
function le(e, t) {
	let n = +e.toFixed(2), r = ce(t).filter(([e, t]) => oe.some((r) => e * r + t < n));
	return r.length ? `min(${n}, ${r.map(([e, t]) => `l * ${e} ${t < 0 ? "-" : "+"} ${Math.abs(t)}`).join(", ")})` : `${n}`;
}
var Y = /^(?:inherit|initial|unset|currentcolor|transparent|var\(.+\))$/i;
function X(e, t, n) {
	if (Y.test(e)) return e;
	let i = K(e, n);
	if (!i.gray) return `lch(from var(--huet-code-lightness, var(--huet-muted)) l ${q(i)})`;
	let { fg: a, bg: o } = ue(t), s = K(o, "editor.background").hex;
	return r(s, i.hex) >= .8 * r(s, K(a, "editor.foreground").hex) ? R("foreground") : R("comment");
}
function ue(e) {
	let t = (e.tokenColors ?? e.settings ?? []).find((e) => !e.scope && !e.name)?.settings, n = e.type === "light";
	return {
		fg: e.fg ?? t?.foreground ?? e.colors?.["editor.foreground"] ?? (n ? "#333333" : "#bbbbbb"),
		bg: e.bg ?? t?.background ?? e.colors?.["editor.background"] ?? (n ? "#fffffe" : "#1e1e1e")
	};
}
function de(e, t, n) {
	return Y.test(e) ? e : `lch(from ${R("background")} l ${q(K(e, n))})`;
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
function fe({ surface: e = "huet-bg-5", lines: t = {} } = {}) {
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
export { f as amounts, z as ansiColors, s as checkTheme, _ as classes, L as codeRoles, a as colorModels, Z as defaultLineSurfaces, n as hues, W as huetShikiTheme, fe as huetShikiTransformer, x as isHuetClass, ae as mountTheme, ne as themeCss, u as themes, k as validateClasses };

//# sourceMappingURL=index.js.map