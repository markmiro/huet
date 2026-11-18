import { b as e, c as t, f as n, l as r, s as i, u as a } from "./theme-BaMwzpON.js";
import o from "chroma-js";
// src/core/ramp.ts
var s = (e, t, n) => e + (t - e) * n;
function c(t, r, i = []) {
	[t, r] = [o(t).hex(), o(r).hex()];
	let [a, ...c] = e(t), [l, ...u] = e(r), d = i.map((t) => e(o(t).hex())).filter(([e]) => e > a && e < l).sort((e, t) => e[0] - t[0]), f = (e) => {
		let t = (e, t, n) => [s(e[1], t[0], n), s(e[2], t[1], n)];
		if (!d.length) return t([a, ...c], u, (e - a) / (l - a));
		let n = d[0], r = d[d.length - 1];
		if (e <= n[0]) return t(n, c, ((n[0] - e) / (n[0] - a)) ** 3);
		if (e >= r[0]) return t(r, u, ((e - r[0]) / (l - r[0])) ** 3);
		let i = d.findIndex(([t]) => t >= e), [o, f] = [d[i - 1], d[i]];
		return t(o, [f[1], f[2]], (e - o[0]) / (f[0] - o[0]));
	}, p = (e) => e > a ? e >= l ? r : n([e, ...f(e)]) : t;
	return Object.assign((e) => p(s(a, l, e)), {
		at: p,
		stops: Object.freeze([
			t,
			...d.map((e) => n(e)),
			r
		])
	});
}
export { a as contrast, r as fade, c as rampThrough, i as resolveTheme, t as themeVariables };

//# sourceMappingURL=internal.js.map