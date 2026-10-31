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
	"gray",
	"red",
	"yellow",
	"green",
	"blue",
	"purple",
	"white"
];
function l(e) {
	let t = /^huet-(bg\/)?(bg|text|border|outline)-(?:(gray|red|yellow|green|blue|purple|white)-)?(0|[1-9]\d?|100)$/.exec(e);
	if (!(!t || t[1] && t[2] === "bg")) return {
		property: t[2],
		ownBackground: !!t[1],
		ramp: t[3],
		amount: Number(t[4])
	};
}
var u = [];
for (let e of [
	"bg",
	"text",
	"border",
	"outline",
	"bg/text",
	"bg/border",
	"bg/outline"
]) for (let t of [void 0, ...c]) for (let n = 0; n <= 100; n++) u.push(`huet-${e}-${t ? t + "-" : ""}${n}`);
var d = Object.freeze([...s, ...u]), f = new Set(d);
function p(e) {
	return f.has(e);
}
var m = (e) => l(e)?.property ?? (f.has(e) ? e.startsWith("huet-surface-") ? "bg" : e === "huet-border" ? "border" : e === "huet-focus" ? "outline" : "text" : void 0);
function h(e) {
	let t = 0, n = 0;
	for (let r = 0; r < e.length; r++) e[r] === "[" || e[r] === "(" ? t++ : e[r] === "]" || e[r] === ")" ? t-- : e[r] === ":" && !t && (n = r + 1);
	return [e.slice(0, n), e.slice(n)];
}
var g = "huet-fg, huet-muted, huet-border, huet-red, huet-yellow, huet-green, huet-blue, huet-purple";
function _(e) {
	if (f.has(e) || !/(?:^|:)huet-/.test(e)) return;
	let [t, n] = h(e);
	if (!t || !f.has(n)) return `Unknown Huet class: ${e}`;
	let r = m(n);
	return `Huet classes don't support Tailwind variants yet: ${e}. ${n === "huet-focus" ? "Use \"huet-focus\" alone: it already applies only on :focus-visible." : r === "outline" ? `For an outline only with that variant, use "${n} ${t}outline-2": ${n} sets only the outline color, and the variant turns the outline on.` : r === "bg" ? `Changing a Huet background with a variant isn't supported yet. Keep "${n}" without the variant.` : `For a color only with that variant, use a Tailwind token utility from huet/tailwind.css, e.g. "${t}${r}-huet-blue" (tokens: ${g}).`}`;
}
function v(e) {
	let t = e.trim().split(/\s+/), n = t.map(_).filter((e) => e !== void 0), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = m(e);
		t && (r.has(t) && n.push(t === "bg" ? "Use one Huet surface class per element" : `Use one Huet ${t} class per element`), r.add(t));
	}
	return n;
}
// src/core/dom.ts
var y = d.filter((e) => e.startsWith("huet-surface-")), b = "[class*=\"huet-\"]", x = /* @__PURE__ */ new WeakSet(), S = /* @__PURE__ */ new WeakMap();
function C(t, n) {
	if (x.has(t) || t.parentElement?.closest("[data-huet-root]") || t.querySelector("[data-huet-root]")) throw Error("Huet theme roots must be independent, non-overlapping trees");
	x.add(t);
	let i = t.getAttribute("data-huet-root");
	t.setAttribute("data-huet-root", "");
	let a = n, s = !1, c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = {
		"--huet-background": "data-huet-color-bg",
		"--huet-relative-text": "data-huet-color-text",
		"--huet-relative-border": "data-huet-color-border",
		"--huet-relative-outline": "data-huet-color-outline"
	}, f = (e, t) => {
		let n = c.get(e);
		n || (S.get(e)?.(), n = /* @__PURE__ */ new Map(), c.set(e, n), S.set(e, () => p(e)));
		for (let [r, [i, a]] of n) r in t || (i ? e.style.setProperty(r, i, a) : e.style.removeProperty(r), n.delete(r));
		let r = u.get(e);
		r || u.set(e, r = /* @__PURE__ */ new Map());
		for (let [n, i] of Object.entries(d)) if (n in t) r.has(i) || r.set(i, e.getAttribute(i)), e.setAttribute(i, "");
		else if (r.has(i)) {
			let t = r.get(i);
			t === null ? e.removeAttribute(i) : e.setAttribute(i, t), r.delete(i);
		}
		for (let [r, i] of Object.entries(t)) n.has(r) || n.set(r, [e.style.getPropertyValue(r), e.style.getPropertyPriority(r)]), e.style.getPropertyValue(r) !== i && e.style.setProperty(r, i);
	}, p = (e) => {
		if (c.has(e)) {
			for (let [t, [n, r]] of c.get(e) ?? []) n ? e.style.setProperty(t, n, r) : e.style.removeProperty(t);
			for (let [t, n] of u.get(e) ?? []) n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
			u.delete(e), c.delete(e), S.delete(e);
		}
	}, m = (e, t) => {
		let n = y.find((t) => e.classList.contains(t));
		if (!n) return t;
		let r = n.slice(13);
		return a.surface(t, /^\d+$/.test(r) ? Number(r) : r);
	}, h = () => {
		if (s) return;
		let n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), u = [t, ...t.querySelectorAll(b)], d = [...new Set(u.flatMap((e) => v(e.getAttribute("class") ?? "")))];
		if (d.length) throw t.setAttribute("data-huet-error", d.join("\n")), Error(d.join("\n"));
		t.removeAttribute("data-huet-error");
		for (let s of u) {
			let c = [...s.classList], u = c.map(l).filter((e) => e !== void 0), d = c.some((e) => y.includes(e));
			if (s !== t && !u.length && !d) continue;
			let p = s.parentElement;
			for (; p && !i.has(p);) p = p.parentElement;
			let h = i.get(p) ?? a.relative, g = u.find((e) => e.property === "bg"), _ = (e, t) => e.contrast(t.amount, t.ramp ? e.theme.ramps[t.ramp] : void 0), v = g ? _(h, g) : h;
			d && (v = new e({
				theme: h.theme,
				bgColor: h,
				lab: o(m(s, h.hex)).lab()
			}));
			let b = {};
			(s === t || g || d) && (i.set(s, v), Object.assign(b, r(a.tokens(v.hex, h.hex))), g && (b["--huet-foreground"] = v.contrast(100).hex));
			for (let e of u) {
				if (e.property === "bg") continue;
				let t = _(e.ownBackground ? v : h, e);
				b[`--huet-relative-${e.property}`] = t.hex;
			}
			n.add(s), f(s, b);
		}
		for (let e of c.keys()) n.has(e) || p(e);
	}, g = t.ownerDocument.defaultView.MutationObserver, _ = new g(h);
	try {
		h();
	} catch (e) {
		for (let e of c.keys()) p(e);
		throw t.removeAttribute("data-huet-error"), i === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", i), x.delete(t), e;
	}
	return _.observe(t, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ["class"]
	}), {
		update(e) {
			if (s) throw Error("Cannot update a destroyed Huet mount");
			a = e, h();
		},
		destroy() {
			if (!s) {
				s = !0, _.disconnect();
				for (let e of c.keys()) p(e);
				t.removeAttribute("data-huet-error"), i === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", i), x.delete(t);
			}
		}
	};
}
// src/core/shiki.ts
var w = {
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
}, T = (e) => `var(--huet-code-${e}, ${w[e]})`, E = [
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
function D({ name: e = "huet" } = {}) {
	return {
		name: e,
		type: "light",
		fg: T("foreground"),
		bg: T("background"),
		colors: {
			"editor.foreground": T("foreground"),
			"editor.background": T("background")
		},
		tokenColors: E.map(([e, t, n]) => ({
			scope: e,
			settings: {
				...t && { foreground: T(t) },
				...n && { fontStyle: n }
			}
		}))
	};
}
var O = {
	add: "huet-bg-green-20",
	remove: "huet-bg-red-20"
}, k = (e) => {
	let t = e.properties?.class;
	return Array.isArray(t) ? t.map(String) : typeof t == "string" ? t.split(/\s+/).filter(Boolean) : [];
};
function A(e, t) {
	if (l(t)?.property !== "bg") throw TypeError(`huetShikiTransformer: ${e} must be a plain Huet background class like "huet-bg-5" or "huet-bg-green-15", got "${t}"`);
}
function j({ surface: e = "huet-bg-5", lines: t = {} } = {}) {
	A("surface", e);
	let n = t === !1 ? {} : {
		...O,
		...t
	};
	for (let [e, t] of Object.entries(n)) A(`lines.${e}`, t);
	let r = (e) => {
		let t = k(e);
		if (t.includes("line")) {
			let r = [...new Set(t.flatMap((e) => n[e] ? [n[e]] : []))];
			if (r.length > 1) throw Error(`huetShikiTransformer: a line has classes for more than one row background (${r.join(", ")}); remove one notation`);
			r.length && (e.properties.class = [...t, r[0]].join(" "));
		} else e.children?.forEach(r);
	};
	return {
		name: "huet",
		pre(t) {
			t.properties.class = [...k(t), e].join(" ");
		},
		root(e) {
			Object.keys(n).length && r(e);
		}
	};
}
export { d as classes, w as codeRoles, i as colorModels, n as createTheme, O as defaultLineSurfaces, t as hues, D as huetShikiTheme, j as huetShikiTransformer, p as isHuetClass, C as mountTheme, a as themeFromConfig, r as themeVariables, v as validateClasses };

//# sourceMappingURL=index.js.map