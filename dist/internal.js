import { c as e, d as t, l as n, s as r, y as i } from "./theme-DQdfBJ-D.js";
import a from "chroma-js";
// src/core/ramp.ts
var o = (e, t, n) => e + (t - e) * n;
function s(e, n, r = []) {
	[e, n] = [a(e).hex(), a(n).hex()];
	let [s, ...c] = i(e), [l, ...u] = i(n), d = r.map((e) => i(a(e).hex())).filter(([e]) => e > s && e < l).sort((e, t) => e[0] - t[0]), f = (e) => {
		let t = (e, t, n) => [o(e[1], t[0], n), o(e[2], t[1], n)];
		if (!d.length) return t([s, ...c], u, (e - s) / (l - s));
		let n = d[0], r = d[d.length - 1];
		if (e <= n[0]) return t(n, c, ((n[0] - e) / (n[0] - s)) ** 3);
		if (e >= r[0]) return t(r, u, ((e - r[0]) / (l - r[0])) ** 3);
		let i = d.findIndex(([t]) => t >= e), [a, f] = [d[i - 1], d[i]];
		return t(a, [f[1], f[2]], (e - a[0]) / (f[0] - a[0]));
	}, p = (r) => r > s ? r >= l ? n : t([r, ...f(r)]) : e;
	return Object.assign((e) => p(o(s, l, e)), {
		at: p,
		stops: Object.freeze([
			e,
			...d.map((e) => t(e)),
			n
		])
	});
}
export { n as contrast, s as rampThrough, r as resolveTheme, e as themeVariables };

//# sourceMappingURL=internal.js.map