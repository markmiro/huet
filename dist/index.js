import { c as e, i as t, n, o as r, p as i, t as a } from "./theme-C2LgQ8y2.js";
import { t as o } from "./fromConfig-CzKp10jk.js";
import s from "chroma-js";
var c = Object.freeze([
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
]), l = [
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
	if (!(!t || t[1] && t[2] === "bg")) return {
		property: t[2],
		ownBackground: !!t[1],
		ramp: t[3],
		amount: Number(t[4])
	};
}
var d = [];
for (let e of [
	"bg",
	"text",
	"border",
	"outline",
	"bg/text",
	"bg/border",
	"bg/outline"
]) for (let t of [void 0, ...l]) for (let n = 0; n <= 100; n++) d.push(`huet-${e}-${t ? t + "-" : ""}${n}`);
var f = Object.freeze([...c, ...d]), p = new Set(f);
function m(e) {
	return p.has(e);
}
var h = (e) => u(e)?.property ?? (p.has(e) ? e.startsWith("huet-surface-") ? "bg" : e === "huet-border" ? "border" : e === "huet-focus" ? "outline" : "text" : void 0);
function g(e) {
	let t = 0, n = 0;
	for (let r = 0; r < e.length; r++) e[r] === "[" || e[r] === "(" ? t++ : e[r] === "]" || e[r] === ")" ? t-- : e[r] === ":" && !t && (n = r + 1);
	return [e.slice(0, n), e.slice(n)];
}
var _ = "huet-fg, huet-muted, huet-border, huet-red, huet-yellow, huet-green, huet-blue, huet-purple";
function v(e) {
	if (p.has(e) || !/(?:^|:)huet-/.test(e)) return;
	let [t, n] = g(e);
	if (!t || !p.has(n)) return `Unknown Huet class: ${e}`;
	let r = h(n);
	return `Huet classes don't support Tailwind variants yet: ${e}. ${n === "huet-focus" ? "Use \"huet-focus\" alone: it already applies only on :focus-visible." : r === "outline" ? `For an outline only with that variant, use "${n} ${t}outline-2": ${n} sets only the outline color, and the variant turns the outline on.` : r === "bg" ? `Changing a Huet background with a variant isn't supported yet. Keep "${n}" without the variant.` : `For a color only with that variant, use a Tailwind token utility from huet/tailwind.css, e.g. "${t}${r}-huet-blue" (tokens: ${_}).`}`;
}
function y(e) {
	let t = e.trim().split(/\s+/), n = t.map(v).filter((e) => e !== void 0), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = h(e);
		t && (r.has(t) && n.push(t === "bg" ? "Use one Huet surface class per element" : `Use one Huet ${t} class per element`), r.add(t));
	}
	return n;
}
// src/core/dom.ts
var b = f.filter((e) => e.startsWith("huet-surface-")), x = "[class*=\"huet-\"]", S = /* @__PURE__ */ new WeakSet(), C = /* @__PURE__ */ new WeakMap();
function w(t, n) {
	if (S.has(t) || t.parentElement?.closest("[data-huet-root]") || t.querySelector("[data-huet-root]")) throw Error("Huet theme roots must be independent, non-overlapping trees");
	S.add(t);
	let i = t.getAttribute("data-huet-root");
	t.setAttribute("data-huet-root", "");
	let a = n, o = !1, c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), d = {
		"--huet-background": "data-huet-color-bg",
		"--huet-relative-text": "data-huet-color-text",
		"--huet-relative-border": "data-huet-color-border",
		"--huet-relative-outline": "data-huet-color-outline"
	}, f = (e, t) => {
		let n = c.get(e);
		n || (C.get(e)?.(), n = /* @__PURE__ */ new Map(), c.set(e, n), C.set(e, () => p(e)));
		for (let [r, [i, a]] of n) r in t || (i ? e.style.setProperty(r, i, a) : e.style.removeProperty(r), n.delete(r));
		let r = l.get(e);
		r || l.set(e, r = /* @__PURE__ */ new Map());
		for (let [n, i] of Object.entries(d)) if (n in t) r.has(i) || r.set(i, e.getAttribute(i)), e.setAttribute(i, "");
		else if (r.has(i)) {
			let t = r.get(i);
			t === null ? e.removeAttribute(i) : e.setAttribute(i, t), r.delete(i);
		}
		for (let [r, i] of Object.entries(t)) n.has(r) || n.set(r, [e.style.getPropertyValue(r), e.style.getPropertyPriority(r)]), e.style.getPropertyValue(r) !== i && e.style.setProperty(r, i);
	}, p = (e) => {
		if (c.has(e)) {
			for (let [t, [n, r]] of c.get(e) ?? []) n ? e.style.setProperty(t, n, r) : e.style.removeProperty(t);
			for (let [t, n] of l.get(e) ?? []) n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
			l.delete(e), c.delete(e), C.delete(e);
		}
	}, m = (e, t) => {
		let n = b.find((t) => e.classList.contains(t));
		if (!n) return t;
		let r = n.slice(13);
		return a.surface(t, /^\d+$/.test(r) ? Number(r) : r);
	}, h = () => {
		if (o) return;
		let n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), l = [t, ...t.querySelectorAll(x)], d = [...new Set(l.flatMap((e) => y(e.getAttribute("class") ?? "")))];
		if (d.length) throw t.setAttribute("data-huet-error", d.join("\n")), Error(d.join("\n"));
		t.removeAttribute("data-huet-error");
		for (let o of l) {
			let c = [...o.classList], l = c.map(u).filter((e) => e !== void 0), d = c.some((e) => b.includes(e));
			if (o !== t && !l.length && !d) continue;
			let p = o.parentElement;
			for (; p && !i.has(p);) p = p.parentElement;
			let h = i.get(p) ?? a.relative, g = l.find((e) => e.property === "bg"), _ = (e, t) => e.contrast(t.amount, t.ramp ? e.theme.ramps[t.ramp] : void 0), v = g ? _(h, g) : h;
			d && (v = new e({
				theme: h.theme,
				bgColor: h,
				lab: s(m(o, h.hex)).lab()
			}));
			let y = {};
			(o === t || g || d) && (i.set(o, v), Object.assign(y, r(a.tokens(v.hex, h.hex))), g && (y["--huet-foreground"] = v.contrast(100).hex));
			for (let e of l) {
				if (e.property === "bg") continue;
				let t = _(e.ownBackground ? v : h, e);
				y[`--huet-relative-${e.property}`] = t.hex;
			}
			n.add(o), f(o, y);
		}
		for (let e of c.keys()) n.has(e) || p(e);
	}, g = t.ownerDocument.defaultView.MutationObserver, _ = new g(h);
	try {
		h();
	} catch (e) {
		for (let e of c.keys()) p(e);
		throw t.removeAttribute("data-huet-error"), i === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", i), S.delete(t), e;
	}
	return _.observe(t, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ["class"]
	}), {
		update(e) {
			if (o) throw Error("Cannot update a destroyed Huet mount");
			a = e, h();
		},
		destroy() {
			if (!o) {
				o = !0, _.disconnect();
				for (let e of c.keys()) p(e);
				t.removeAttribute("data-huet-error"), i === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", i), S.delete(t);
			}
		}
	};
}
export { f as classes, a as colorModels, i as contrastRatio, n as createTheme, t as hues, m as isHuetClass, w as mountTheme, o as themeFromConfig, r as themeVariables, y as validateClasses };

//# sourceMappingURL=index.js.map