import { c as e, i as t, n, o as r, t as i } from "./theme-CZ1vtqrm.js";
import { t as a } from "./fromConfig-DAwnsiqs.js";
import o from "chroma-js";
var s = Object.freeze([
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
// src/core/dom.ts
var D = "[class*=\"huet-\"]", O = /* @__PURE__ */ new WeakSet(), k = /* @__PURE__ */ new WeakMap(), A = [
	"data-huet-color-bg",
	"data-huet-color-text",
	"data-huet-color-border",
	"data-huet-color-outline",
	"data-huet-state"
], j = 256, M = (e, t) => e.contrast(t.amount, t.ramp ? e.theme.ramps[t.ramp] : void 0), N = (e) => `max(0%, (1 - max(var(--huet-state) - ${e}, ${e} - var(--huet-state))) * 100%)`;
function P(e, t) {
	let n = t[0];
	for (let r = 1; r < t.length; r++) t[r] !== t[0] && (n = `color-mix(in srgb, ${t[r]} ${N(e.keys[r])}, ${n})`);
	return n;
}
function F(t, n) {
	if (O.has(t) || t.parentElement?.closest("[data-huet-root]") || t.querySelector("[data-huet-root]")) throw Error("Huet theme roots must be independent, non-overlapping trees");
	O.add(t);
	let i = t.getAttribute("data-huet-root");
	t.setAttribute("data-huet-root", "");
	let a = n, s = !1, c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), p = (e, { values: t, markers: n }) => {
		let r = c.get(e);
		r || (k.get(e)?.(), r = /* @__PURE__ */ new Map(), c.set(e, r), k.set(e, () => m(e)));
		for (let [n, [i, a]] of r) n in t || (i ? e.style.setProperty(n, i, a) : e.style.removeProperty(n), r.delete(n));
		let i = l.get(e);
		i || l.set(e, i = /* @__PURE__ */ new Map());
		for (let t of A) if (n.has(t)) i.has(t) || i.set(t, e.getAttribute(t)), e.setAttribute(t, "");
		else if (i.has(t)) {
			let n = i.get(t);
			n === null ? e.removeAttribute(t) : e.setAttribute(t, n), i.delete(t);
		}
		for (let [n, i] of Object.entries(t)) r.has(n) || r.set(n, [e.style.getPropertyValue(n), e.style.getPropertyPriority(n)]), e.style.getPropertyValue(n) !== i && e.style.setProperty(n, i);
	}, m = (e) => {
		if (c.has(e)) {
			for (let [t, [n, r]] of c.get(e) ?? []) n ? e.style.setProperty(t, n, r) : e.style.removeProperty(t);
			for (let [t, n] of l.get(e) ?? []) n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
			l.delete(e), c.delete(e), k.delete(e);
		}
	}, h = (t, n) => {
		let i = u(n), s = n.slice(13), c = i ? M(t, i) : new e({
			theme: t.theme,
			bgColor: t,
			lab: o(a.surface(t.hex, /^\d+$/.test(s) ? Number(s) : s)).lab()
		}), l = r(a.tokens(c.hex, t.hex));
		return {
			bg: c,
			tokens: i ? {
				...l,
				"--huet-foreground": c.contrast(100).hex
			} : l
		};
	}, g = (e) => {
		throw t.setAttribute("data-huet-error", e), Error(e);
	}, v = () => {
		if (s) return;
		let e = [t, ...t.querySelectorAll(D)], n = [...new Set(e.flatMap((e) => E(e.getAttribute("class") ?? "")))];
		n.length && g(n.join("\n"));
		let i = /* @__PURE__ */ new Map(), o = (e) => {
			let t = i.get(e);
			return t || i.set(e, t = {
				values: {},
				markers: /* @__PURE__ */ new Set()
			}), t;
		}, l = 0, v = (e, t, n) => (e.forEach((r, i) => {
			let a = r.keys.length, s = t.length / a;
			t = Array.from({ length: s }, (c, u) => {
				let d = Array.from({ length: a }, (e, n) => t[n * s + u]), f = P(r, d);
				if (f === d[0] || r.el === n && i === e.length - 1) return f;
				let p = `--huet-s${l++}`;
				return o(r.el).values[p] = f, `var(${p})`;
			});
		}), t[0]), y = a.relative, b = {
			dims: [],
			bg: [y],
			tokens: [r(a.tokens(y.hex, y.hex))]
		}, x = /* @__PURE__ */ new Map();
		for (let n of e) {
			let e = [...n.classList].map(_), r = e.filter((e) => e.base.startsWith("huet-surface-") || u(e.base)?.property === "bg"), i = e.flatMap((e) => {
				let t = u(e.base);
				return t && t.property !== "bg" ? [{
					...e,
					spec: t
				}] : [];
			});
			if (n !== t && !r.length && !i.length) continue;
			let a = n.parentElement;
			for (; a && !x.has(a);) a = a.parentElement;
			let s = n !== t && a && x.get(a) || b, c = s;
			if (n === t || r.length) {
				let e = r.find((e) => !e.variants)?.base, t = [e, ...new Set(r.filter((t) => t.variants && t.base !== e).map((e) => e.base))], i = t.length > 1 ? {
					el: n,
					keys: [-1, ...t.slice(1).map((e) => d(u(e)))]
				} : void 0, a = [], l = [];
				s.bg.forEach((e, n) => {
					for (let r of t) {
						let t = r ? h(e, r) : {
							bg: e,
							tokens: s.tokens[n]
						};
						a.push(t.bg), l.push(t.tokens);
					}
				}), a.length > j && g(`Too many background states above "${n.getAttribute("class")}": ${a.length} combinations, at most ${j}. Each enclosing element with Tailwind variants on its Huet background multiplies them. Remove variants from some of those backgrounds.`), c = {
					dims: i ? [...s.dims, i] : s.dims,
					bg: a,
					tokens: l
				}, x.set(n, c);
				let f = o(n);
				f.markers.add("data-huet-color-bg"), i && f.markers.add("data-huet-state");
				for (let e of Object.keys(l[0])) f.values[e] = v(c.dims, l.map((t) => t[e]), n);
			}
			for (let { variants: e, base: t, spec: r } of i) {
				let i = o(n), a = r.ownBackground ? c : s, l = i.values[f(t)] ??= v(a.dims, a.bg.map((e) => M(e, r).hex), n);
				e || (i.values[`--huet-relative-${r.property}`] = l, i.markers.add(`data-huet-color-${r.property}`));
			}
		}
		t.removeAttribute("data-huet-error");
		for (let [e, t] of i) p(e, t);
		for (let e of c.keys()) i.has(e) || m(e);
	}, y = t.ownerDocument.defaultView.MutationObserver, b = new y(v);
	try {
		v();
	} catch (e) {
		for (let e of c.keys()) m(e);
		throw t.removeAttribute("data-huet-error"), i === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", i), O.delete(t), e;
	}
	return b.observe(t, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ["class"]
	}), {
		update(e) {
			if (s) throw Error("Cannot update a destroyed Huet mount");
			a = e, v();
		},
		destroy() {
			if (!s) {
				s = !0, b.disconnect();
				for (let e of c.keys()) m(e);
				t.removeAttribute("data-huet-error"), i === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", i), O.delete(t);
			}
		}
	};
}
// src/core/shiki.ts
var I = {
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
}, L = (e) => `var(--huet-code-${e}, ${I[e]})`, R = [
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
function z({ name: e = "huet" } = {}) {
	return {
		name: e,
		type: "light",
		fg: L("foreground"),
		bg: L("background"),
		colors: {
			"editor.foreground": L("foreground"),
			"editor.background": L("background")
		},
		tokenColors: R.map(([e, t, n]) => ({
			scope: e,
			settings: {
				...t && { foreground: L(t) },
				...n && { fontStyle: n }
			}
		}))
	};
}
var B = {
	add: "huet-bg-green-20",
	remove: "huet-bg-red-20"
}, V = (e) => {
	let t = e.properties?.class;
	return Array.isArray(t) ? t.map(String) : typeof t == "string" ? t.split(/\s+/).filter(Boolean) : [];
};
function H(e, t) {
	if (u(t)?.property !== "bg") throw TypeError(`huetShikiTransformer: ${e} must be a plain Huet background class like "huet-bg-5" or "huet-bg-green-10", got "${t}"`);
}
function U({ surface: e = "huet-bg-5", lines: t = {} } = {}) {
	H("surface", e);
	let n = t === !1 ? {} : {
		...B,
		...t
	};
	for (let [e, t] of Object.entries(n)) H(`lines.${e}`, t);
	let r = (e) => {
		let t = V(e);
		if (t.includes("line")) {
			let r = [...new Set(t.flatMap((e) => n[e] ? [n[e]] : []))];
			if (r.length > 1) throw Error(`huetShikiTransformer: a line has classes for more than one row background (${r.join(", ")}); remove one notation`);
			r.length && (e.properties.class = [...t, r[0]].join(" "));
		} else e.children?.forEach(r);
	};
	return {
		name: "huet",
		pre(t) {
			t.properties.class = [...V(t), e].join(" ");
		},
		root(e) {
			Object.keys(n).length && r(e);
		}
	};
}
export { c as amounts, m as classes, I as codeRoles, i as colorModels, n as createTheme, B as defaultLineSurfaces, t as hues, z as huetShikiTheme, U as huetShikiTransformer, v as isHuetClass, F as mountTheme, a as themeFromConfig, r as themeVariables, E as validateClasses };

//# sourceMappingURL=index.js.map