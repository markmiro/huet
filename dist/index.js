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
function h(e) {
	let t = e.trim().split(/\s+/), n = t.filter((e) => /(?:^|:)huet-/.test(e) && !p.has(e)).map((e) => `Unknown Huet class: ${e}`), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = u(e)?.property ?? (p.has(e) ? e.startsWith("huet-surface-") ? "bg" : e === "huet-border" ? "border" : e === "huet-focus" ? "outline" : "text" : void 0);
		t && (r.has(t) && n.push(t === "bg" ? "Use one Huet surface class per element" : `Use one Huet ${t} class per element`), r.add(t));
	}
	return n;
}
// src/core/dom.ts
var g = f.filter((e) => e.startsWith("huet-surface-")), _ = "[class*=\"huet-\"]", v = /* @__PURE__ */ new WeakSet(), y = /* @__PURE__ */ new WeakMap();
function b(t, n) {
	if (v.has(t) || t.parentElement?.closest("[data-huet-root]") || t.querySelector("[data-huet-root]")) throw Error("Huet theme roots must be independent, non-overlapping trees");
	v.add(t);
	let i = t.getAttribute("data-huet-root");
	t.setAttribute("data-huet-root", "");
	let a = n, o = !1, c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), d = {
		"--huet-background": "data-huet-color-bg",
		"--huet-relative-text": "data-huet-color-text",
		"--huet-relative-border": "data-huet-color-border",
		"--huet-relative-outline": "data-huet-color-outline"
	}, f = (e, t) => {
		let n = c.get(e);
		n || (y.get(e)?.(), n = /* @__PURE__ */ new Map(), c.set(e, n), y.set(e, () => p(e)));
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
			l.delete(e), c.delete(e), y.delete(e);
		}
	}, m = (e, t) => {
		let n = g.find((t) => e.classList.contains(t));
		if (!n) return t;
		let r = n.slice(13);
		return a.surface(t, /^\d+$/.test(r) ? Number(r) : r);
	}, b = () => {
		if (o) return;
		let n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), l = [t, ...t.querySelectorAll(_)];
		for (let o of l) {
			let c = [...o.classList], l = c.map(u).filter((e) => e !== void 0), d = c.some((e) => g.includes(e));
			if (o !== t && !l.length && !d) continue;
			let p = h(o.getAttribute("class") ?? "");
			if (p.length) throw Error(p.join("; "));
			let _ = o.parentElement;
			for (; _ && !i.has(_);) _ = _.parentElement;
			let v = i.get(_) ?? a.relative, y = l.find((e) => e.property === "bg"), b = (e, t) => e.contrast(t.amount, t.ramp ? e.theme.ramps[t.ramp] : void 0), x = y ? b(v, y) : v;
			d && (x = new e({
				theme: v.theme,
				bgColor: v,
				lab: s(m(o, v.hex)).lab()
			}));
			let S = {};
			(o === t || y || d) && (i.set(o, x), Object.assign(S, r(a.tokens(x.hex, v.hex))), y && (S["--huet-foreground"] = x.contrast(100).hex));
			for (let e of l) {
				if (e.property === "bg") continue;
				let t = b(e.ownBackground ? x : v, e);
				S[`--huet-relative-${e.property}`] = t.hex;
			}
			n.add(o), f(o, S);
		}
		for (let e of c.keys()) n.has(e) || p(e);
	}, x = t.ownerDocument.defaultView.MutationObserver, S = new x(b);
	try {
		b();
	} catch (e) {
		for (let e of c.keys()) p(e);
		throw i === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", i), v.delete(t), e;
	}
	return S.observe(t, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ["class"]
	}), {
		update(e) {
			if (o) throw Error("Cannot update a destroyed Huet mount");
			a = e, b();
		},
		destroy() {
			if (!o) {
				o = !0, S.disconnect();
				for (let e of c.keys()) p(e);
				i === null ? t.removeAttribute("data-huet-root") : t.setAttribute("data-huet-root", i), v.delete(t);
			}
		}
	};
}
export { f as classes, a as colorModels, i as contrastRatio, n as createTheme, t as hues, m as isHuetClass, b as mountTheme, o as themeFromConfig, r as themeVariables, h as validateClasses };

//# sourceMappingURL=index.js.map