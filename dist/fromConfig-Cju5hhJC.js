import { i as e, n as t, o as n, p as r, s as i, u as a, v as o } from "./theme-NOxmHyYn.js";
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
	...e.map((e) => `huet-surface-${e}`),
	"huet-text",
	"huet-muted",
	"huet-border",
	"huet-focus",
	...e.map((e) => `huet-text-${e}`)
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
function m(e) {
	let t = e.trim().split(/\s+/), n = t.filter((e) => /(?:^|:)huet-/.test(e) && !f.has(e)).map((e) => `Unknown Huet class: ${e}`), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = l(e)?.property ?? (f.has(e) ? e.startsWith("huet-surface-") ? "bg" : e === "huet-border" ? "border" : e === "huet-focus" ? "outline" : "text" : void 0);
		t && (r.has(t) && n.push(t === "bg" ? "Use one Huet surface class per element" : `Use one Huet ${t} class per element`), r.add(t));
	}
	return n;
}
// src/core/dom.ts
var h = d.filter((e) => e.startsWith("huet-surface-")), g = "[class*=\"huet-\"]", _ = /* @__PURE__ */ new WeakSet(), v = /* @__PURE__ */ new WeakMap();
function y(e, t) {
	if (_.has(e) || e.parentElement?.closest("[data-huet-root]") || e.querySelector("[data-huet-root]")) throw Error("Huet theme roots must be independent, non-overlapping trees");
	_.add(e);
	let r = e.getAttribute("data-huet-root");
	e.setAttribute("data-huet-root", "");
	let i = t, s = !1, c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = {
		"--huet-background": "data-huet-color-bg",
		"--huet-relative-text": "data-huet-color-text",
		"--huet-relative-border": "data-huet-color-border",
		"--huet-relative-outline": "data-huet-color-outline"
	}, f = (e, t) => {
		let n = c.get(e);
		n || (v.get(e)?.(), n = /* @__PURE__ */ new Map(), c.set(e, n), v.set(e, () => p(e)));
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
			u.delete(e), c.delete(e), v.delete(e);
		}
	}, y = (e, t) => {
		let n = h.find((t) => e.classList.contains(t));
		if (!n) return t;
		let r = n.slice(13);
		return i.surface(t, /^\d+$/.test(r) ? Number(r) : r);
	}, b = () => {
		if (s) return;
		let t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map(), u = [e, ...e.querySelectorAll(g)];
		for (let s of u) {
			let c = [...s.classList], u = c.map(l).filter((e) => e !== void 0), d = c.some((e) => h.includes(e));
			if (s !== e && !u.length && !d) continue;
			let p = m(s.getAttribute("class") ?? "");
			if (p.length) throw Error(p.join("; "));
			let g = s.parentElement;
			for (; g && !r.has(g);) g = g.parentElement;
			let _ = r.get(g) ?? i.relative, v = u.find((e) => e.property === "bg"), b = (e, t) => e.contrast(t.amount, t.ramp ? e.theme.ramps[t.ramp] : void 0), x = v ? b(_, v) : _;
			d && (x = new a({
				theme: _.theme,
				bgColor: _,
				lab: o(y(s, _.hex)).lab()
			}));
			let S = {};
			(s === e || v || d) && (r.set(s, x), Object.assign(S, n(i.tokens(x.hex, _.hex))), v && (S["--huet-foreground"] = x.contrast(100).hex));
			for (let e of u) {
				if (e.property === "bg") continue;
				let t = b(e.ownBackground ? x : _, e);
				S[`--huet-relative-${e.property}`] = t.hex;
			}
			t.add(s), f(s, S);
		}
		for (let e of c.keys()) t.has(e) || p(e);
	}, x = e.ownerDocument.defaultView.MutationObserver, S = new x(b);
	try {
		b();
	} catch (t) {
		for (let e of c.keys()) p(e);
		throw r === null ? e.removeAttribute("data-huet-root") : e.setAttribute("data-huet-root", r), _.delete(e), t;
	}
	return S.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ["class"]
	}), {
		update(e) {
			if (s) throw Error("Cannot update a destroyed Huet mount");
			i = e, b();
		},
		destroy() {
			if (!s) {
				s = !0, S.disconnect();
				for (let e of c.keys()) p(e);
				r === null ? e.removeAttribute("data-huet-root") : e.setAttribute("data-huet-root", r), _.delete(e);
			}
		}
	};
}
// src/core/fromConfig.ts
function b(n) {
	let s = a.fromTheme(new i(n)), c = n.ramps[n.bgRamp] ?? {}, l = (c.colors ?? ["black", "white"]).map((e) => o(n.pallet[e]).hex()), u = r(l[0]) > r(l[l.length - 1]), d = Object.fromEntries(e.filter((e) => e in n.pallet).map((e) => [e, o(n.pallet[e]).hex()])), f = t({
		neutral: {
			colors: u ? l.reverse() : l,
			colorModel: c.colorModel ?? "lab"
		},
		background: u ? 1 - n.bgRampValue : n.bgRampValue,
		colors: d
	});
	return Object.freeze({
		...f,
		background: s.hex,
		relative: s
	});
}
export { m as a, p as i, y as n, d as r, b as t };

//# sourceMappingURL=fromConfig-Cju5hhJC.js.map