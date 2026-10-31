import { c as e, i as t, m as n, n as r, s as i, t as a } from "./theme-DneS7YmB.js";
// src/core/themes.ts
var o = {
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
}, s = Object.freeze([
	...[
		0,
		5,
		10,
		25,
		50,
		75,
		100
	].map((e) => `huet-surface-${e}`),
	...t.map((e) => `huet-surface-${e}`),
	"huet-text",
	"huet-muted",
	"huet-border",
	"huet-focus",
	...t.map((e) => `huet-text-${e}`)
]), c = [
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
], l = [
	"gray",
	"red",
	"yellow",
	"green",
	"blue",
	"purple",
	"white"
];
function u(e) {
	let t = /^huet-(bg\/)?(bg|text|border|outline)-(?:(gray|red|yellow|green|blue|purple|white)-)?(0|[1-9]\d?|100)$/.exec(e);
	if (!(!t || t[1] && t[2] === "bg" || !c.includes(Number(t[4])))) return {
		property: t[2],
		ownBackground: !!t[1],
		ramp: t[3],
		amount: Number(t[4])
	};
}
function d({ ramp: e, amount: t }) {
	return (e ? l.indexOf(e) + 1 : 0) * 101 + t;
}
function f(e) {
	return "--" + e.replace("/", "-");
}
var p = [];
for (let e of [
	"bg",
	"text",
	"border",
	"outline",
	"bg/text",
	"bg/border",
	"bg/outline"
]) for (let t of [void 0, ...l]) for (let n of c) p.push(`huet-${e}-${t ? t + "-" : ""}${n}`);
var m = Object.freeze([...s, ...p]), h = new Set(m), g = new Set(s);
function _(e) {
	let t = 0, n = 0;
	for (let r = 0; r < e.length; r++) e[r] === "[" || e[r] === "(" ? t++ : e[r] === "]" || e[r] === ")" ? t-- : e[r] === ":" && !t && (n = r + 1);
	let r = e.slice(n), i = /^!|!$/.test(r);
	return i && (r = r.replace(/^!|!$/, "")), {
		variants: e.slice(0, n),
		base: r,
		important: i
	};
}
function v(e) {
	if (h.has(e)) return !0;
	let { variants: t, base: n, important: r } = _(e);
	return !r && !!t && !g.has(n) && h.has(n) && T(e) === void 0;
}
var y = (e) => u(e)?.property ?? (h.has(e) ? e.startsWith("huet-surface-") ? "bg" : e === "huet-border" ? "border" : e === "huet-focus" ? "outline" : "text" : void 0);
function b(e) {
	let t = [], n = 0, r = 0;
	for (let i = 0; i < e.length; i++) e[i] === "[" || e[i] === "(" ? n++ : e[i] === "]" || e[i] === ")" ? n-- : e[i] === ":" && !n && (t.push(e.slice(r, i)), r = i + 1);
	return t;
}
var x = /^(?:\*|\*\*|before|after|placeholder|file|marker|selection|first-line|first-letter|backdrop|details-content)$|^\[.*&(?:\s|_|>|\+|~|::)/, S = {
	"huet-text": "text-huet-fg",
	"huet-muted": "text-huet-muted",
	"huet-border": "border-huet-border",
	...Object.fromEntries(t.map((e) => [`huet-text-${e}`, `text-huet-${e}`]))
}, C = (e) => c.reduce((t, n) => Math.abs(n - e) < Math.abs(t - e) ? n : t), w = /^bg-(?:huet-([\w-]+?)|\((?:color:)?--huet-([\w-]+)\)|\[(?:color:)?var\(--huet-([\w-]+)\)\])(?:\/.*)?$/;
function T(e) {
	if (h.has(e)) return;
	let { variants: n, base: r } = _(e), i = w.exec(r);
	if (i) {
		let r = i[1] ?? i[2] ?? i[3];
		return `Tailwind background utilities paint colors Huet can't track, so colors inside would be solved against the wrong background: ${e}. Use a Huet background class, e.g. "${n}${t.includes(r) ? `huet-bg-${r}-20` : r === "fg" || r === "foreground" ? "huet-bg-100" : r === "background" ? "huet-bg-0" : "huet-bg-20"}".`;
	}
	if (!/(?:^|:|!)huet-/.test(e)) return;
	let a = /^(.+)\/(?:\d+|\[[^\]]*\]|\([^)]*\))$/.exec(r);
	if (a && h.has(a[1])) return `Huet classes don't take opacity modifiers: ${e}. A see-through color no longer has the contrast Huet chose for it. Use a lower amount instead, e.g. "${n}${a[1].replace(/\d+$/, "10")}".`;
	let o = /^(huet-(?:bg\/)?(?:bg|text|border|outline)-(?:[a-z]+-)?)(\d+)$/.exec(r);
	if (o && !h.has(r) && Number(o[2]) <= 100 && h.has(o[1] + C(Number(o[2])))) {
		let t = Number(o[2]), r = [...c].reverse().find((e) => e < t), i = c.find((e) => e > t);
		return `Huet amounts are ${c.join(", ")}: ${e}. Use "${n}${o[1]}${r}" or "${n}${o[1]}${i}".`;
	}
	if (!h.has(r)) return `Unknown Huet class: ${e}`;
	if (!n) return;
	if (b(n).some((e) => !e)) return `Empty Tailwind variant in ${e}`;
	if (r === "huet-focus") return `Use "huet-focus" alone: it already applies only on :focus-visible. For another outline with a variant, use "${n}huet-outline-100".`;
	if (r.startsWith("huet-surface-")) return `Tailwind variants work on huet-bg-AMOUNT classes, not huet-surface-*: ${e}. Use an amount, e.g. "${n}huet-bg-${/\d+$/.test(r) ? C(Number(r.slice(13))) : `${r.slice(13)}-20`}".`;
	if (g.has(r)) return `Tailwind variants work on explicit-amount classes, not ${r}: ${e}. Use "${n}huet-text-60" or the token utility "${n}${S[r]}".`;
	let s = b(n).find((e) => x.test(e));
	if (y(r) === "bg" && s) return `Background variants must style the element with the class: ${e}. "${s}:" styles a child or pseudo-element, whose background Huet can't track. Put "${r}" on that element instead.`;
}
function E(e) {
	let t = e.trim().split(/\s+/), n = t.map(T).filter((e) => e !== void 0), r = /* @__PURE__ */ new Map();
	for (let e of t) {
		let { variants: t, base: i } = _(e), a = y(i);
		if (!a) continue;
		let o = t + a, s = r.get(o), c = a === "bg" ? "background" : a;
		s ? n.push(t ? `Use one Huet ${c} class per variant: ${s} and ${e} both apply on "${t}"` : `Use one Huet ${c} class per element: ${s} and ${e} conflict`) : r.set(o, e);
	}
	return n;
}
// src/core/css.ts
var D = c;
function O(e, t) {
	return Object.fromEntries(D.map((n) => [`--huet-${n}`, e.step(t, n).hex]));
}
function k(t, { selector: r = ":root", ...a } = {}) {
	let o = i(t, a), s = {
		"color-scheme": n(o.background, o.dark, o.light) === o.light ? "dark" : "light",
		...e(o.tokensOn(o.root)),
		...O(o, o.root)
	};
	return `${r} {\n${Object.entries(s).map(([e, t]) => `  ${e}: ${t};`).join("\n")}\n}\n`;
}
// src/core/dom.ts
var A = "[class*=\"huet-\"]", j = /* @__PURE__ */ new WeakSet(), M = /* @__PURE__ */ new WeakMap(), N = [
	"data-huet-color-bg",
	"data-huet-color-text",
	"data-huet-color-border",
	"data-huet-color-outline",
	"data-huet-state"
], P = 256, F = (e, t, n) => e.step(t, n.amount, n.ramp), I = (e) => `max(0%, (1 - max(var(--huet-state) - ${e}, ${e} - var(--huet-state))) * 100%)`;
function L(e, t) {
	let n = t[0];
	for (let r = 1; r < t.length; r++) t[r] !== t[0] && (n = `color-mix(in srgb, ${t[r]} ${I(e.keys[r])}, ${n})`);
	return n;
}
function R(t, n, r = {}) {
	let a = r.background ?? 1, o = i(n, { background: a });
	if (j.has(t) || t.parentElement?.closest("[data-huet-root]") || t.querySelector("[data-huet-root]")) throw Error("Huet theme roots must be independent, non-overlapping trees");
	j.add(t);
	let s = t.getAttribute("data-huet-root");
	t.setAttribute("data-huet-root", "");
	let c = !1, l = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = (e, { values: t, markers: n }) => {
		let r = l.get(e);
		r || (M.get(e)?.(), r = /* @__PURE__ */ new Map(), l.set(e, r), M.set(e, () => h(e)));
		for (let [n, [i, a]] of r) n in t || (i ? e.style.setProperty(n, i, a) : e.style.removeProperty(n), r.delete(n));
		let i = p.get(e);
		i || p.set(e, i = /* @__PURE__ */ new Map());
		for (let t of N) if (n.has(t)) i.has(t) || i.set(t, e.getAttribute(t)), e.setAttribute(t, "");
		else if (i.has(t)) {
			let n = i.get(t);
			n === null ? e.removeAttribute(t) : e.setAttribute(t, n), i.delete(t);
		}
		for (let [n, i] of Object.entries(t)) r.has(n) || r.set(n, [e.style.getPropertyValue(n), e.style.getPropertyPriority(n)]), e.style.getPropertyValue(n) !== i && e.style.setProperty(n, i);
	}, h = (e) => {
		if (l.has(e)) {
			for (let [t, [n, r]] of l.get(e) ?? []) n ? e.style.setProperty(t, n, r) : e.style.removeProperty(t);
			for (let [t, n] of p.get(e) ?? []) n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
			p.delete(e), l.delete(e), M.delete(e);
		}
	}, g = (t, n) => {
		let r = u(n), i = n.slice(13), a = r ? F(o, t, r) : o.derive(t, o.surface(t.full.hex, /^\d+$/.test(i) ? Number(i) : i)), s = {
			...e(o.tokensOn(a, t)),
			...O(o, a)
		};
		return {
			bg: a,
			tokens: r ? {
				...s,
				"--huet-foreground": o.step(a, 100).hex
			} : s
		};
	}, v = (e) => {
		throw t.setAttribute("data-huet-error", e), Error(e);
	}, y = () => {
		if (c) return;
		let n = [t, ...t.querySelectorAll(A)], r = [...new Set(n.flatMap((e) => E(e.getAttribute("class") ?? "")))];
		r.length && v(r.join("\n"));
		let i = /* @__PURE__ */ new Map(), a = (e) => {
			let t = i.get(e);
			return t || i.set(e, t = {
				values: {},
				markers: /* @__PURE__ */ new Set()
			}), t;
		}, s = 0, p = (e, t, n) => (e.forEach((r, i) => {
			let o = r.keys.length, c = t.length / o;
			t = Array.from({ length: c }, (l, u) => {
				let d = Array.from({ length: o }, (e, n) => t[n * c + u]), f = L(r, d);
				if (f === d[0] || r.el === n && i === e.length - 1) return f;
				let p = `--huet-s${s++}`;
				return a(r.el).values[p] = f, `var(${p})`;
			});
		}), t[0]), y = o.root, b = {
			dims: [],
			bg: [y],
			tokens: [{
				...e(o.tokensOn(y)),
				...O(o, y)
			}]
		}, x = /* @__PURE__ */ new Map();
		for (let e of n) {
			let n = [...e.classList].map(_), r = n.filter((e) => e.base.startsWith("huet-surface-") || u(e.base)?.property === "bg"), i = n.flatMap((e) => {
				let t = u(e.base);
				return t && t.property !== "bg" ? [{
					...e,
					spec: t
				}] : [];
			});
			if (e !== t && !r.length && !i.length) continue;
			let s = e.parentElement;
			for (; s && !x.has(s);) s = s.parentElement;
			let c = e !== t && s && x.get(s) || b, l = c;
			if (e === t || r.length) {
				let t = r.find((e) => !e.variants)?.base, n = [t, ...new Set(r.filter((e) => e.variants && e.base !== t).map((e) => e.base))], i = n.length > 1 ? {
					el: e,
					keys: [-1, ...n.slice(1).map((e) => d(u(e)))]
				} : void 0, o = [], s = [];
				c.bg.forEach((e, t) => {
					for (let r of n) {
						let n = r ? g(e, r) : {
							bg: e,
							tokens: c.tokens[t]
						};
						o.push(n.bg), s.push(n.tokens);
					}
				}), o.length > P && v(`Too many background states above "${e.getAttribute("class")}": ${o.length} combinations, at most ${P}. Each enclosing element with Tailwind variants on its Huet background multiplies them. Remove variants from some of those backgrounds.`), l = {
					dims: i ? [...c.dims, i] : c.dims,
					bg: o,
					tokens: s
				}, x.set(e, l);
				let f = a(e);
				f.markers.add("data-huet-color-bg"), i && f.markers.add("data-huet-state");
				for (let t of Object.keys(s[0])) f.values[t] = p(l.dims, s.map((e) => e[t]), e);
			}
			for (let { variants: t, base: n, spec: r } of i) {
				let i = a(e), s = r.ownBackground ? l : c, u = i.values[f(n)] ??= p(s.dims, s.bg.map((e) => F(o, e, r).hex), e);
				t || (i.values[`--huet-relative-${r.property}`] = u, i.markers.add(`data-huet-color-${r.property}`));
			}
		}
		t.removeAttribute("data-huet-error");
		for (let [e, t] of i) m(e, t);
		for (let e of l.keys()) i.has(e) || h(e);
	}, b = t.ownerDocument.defaultView.MutationObserver, x = new b(y);
	try {
		y();
	} catch (e) {
		for (let e of l.keys()) h(e);
		throw t.removeAttribute("data-huet-error"), s === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", s), j.delete(t), e;
	}
	return x.observe(t, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ["class"]
	}), {
		update(e, t = {}) {
			if (c) throw Error("Cannot update a destroyed Huet mount");
			let n = t.background ?? a;
			o = i(e, { background: n }), a = n, y();
		},
		destroy() {
			if (!c) {
				c = !0, x.disconnect();
				for (let e of l.keys()) h(e);
				t.removeAttribute("data-huet-error"), s === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", s), j.delete(t);
			}
		}
	};
}
// src/core/shiki.ts
var z = {
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
}, B = (e) => `var(--huet-code-${e}, ${z[e]})`, V = [
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
function H({ name: e = "huet" } = {}) {
	return {
		name: e,
		type: "light",
		fg: B("foreground"),
		bg: B("background"),
		colors: {
			"editor.foreground": B("foreground"),
			"editor.background": B("background")
		},
		tokenColors: V.map(([e, t, n]) => ({
			scope: e,
			settings: {
				...t && { foreground: B(t) },
				...n && { fontStyle: n }
			}
		}))
	};
}
var U = {
	add: "huet-bg-green-20",
	remove: "huet-bg-red-20"
}, W = (e) => {
	let t = e.properties?.class;
	return Array.isArray(t) ? t.map(String) : typeof t == "string" ? t.split(/\s+/).filter(Boolean) : [];
};
function G(e, t) {
	if (u(t)?.property !== "bg") throw TypeError(`huetShikiTransformer: ${e} must be a plain Huet background class like "huet-bg-5" or "huet-bg-green-10", got "${t}"`);
}
function K({ surface: e = "huet-bg-5", lines: t = {} } = {}) {
	G("surface", e);
	let n = t === !1 ? {} : {
		...U,
		...t
	};
	for (let [e, t] of Object.entries(n)) G(`lines.${e}`, t);
	let r = (e) => {
		let t = W(e);
		if (t.includes("line")) {
			let r = [...new Set(t.flatMap((e) => n[e] ? [n[e]] : []))];
			if (r.length > 1) throw Error(`huetShikiTransformer: a line has classes for more than one row background (${r.join(", ")}); remove one notation`);
			r.length && (e.properties.class = [...t, r[0]].join(" "));
		} else e.children?.forEach(r);
	};
	return {
		name: "huet",
		pre(t) {
			t.properties.class = [...W(t), e].join(" ");
		},
		root(e) {
			Object.keys(n).length && r(e);
		}
	};
}
export { c as amounts, a as checkTheme, m as classes, z as codeRoles, r as colorModels, U as defaultLineSurfaces, t as hues, H as huetShikiTheme, K as huetShikiTransformer, v as isHuetClass, R as mountTheme, k as themeCss, o as themes, E as validateClasses };

//# sourceMappingURL=index.js.map