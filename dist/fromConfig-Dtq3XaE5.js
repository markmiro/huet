import { c as e, g as t, i as n, n as r, u as i } from "./theme-Dm2Wxxd-.js";
import a from "chroma-js";
// src/core/fromConfig.ts
function o(o) {
	let s = e.fromTheme(new i(o)), c = o.ramps[o.bgRamp] ?? {}, l = (c.colors ?? ["black", "white"]).map((e) => a(o.pallet[e]).hex()), u = t(l[0]) > t(l[l.length - 1]), d = Object.fromEntries(n.filter((e) => e in o.pallet).map((e) => [e, a(o.pallet[e]).hex()])), f = r({
		neutral: {
			colors: u ? l.reverse() : l,
			colorModel: c.colorModel ?? "lab"
		},
		background: u ? 1 - o.bgRampValue : o.bgRampValue,
		colors: d
	});
	return Object.freeze({
		...f,
		background: s.hex,
		relative: s
	});
}
export { o as t };

//# sourceMappingURL=fromConfig-Dtq3XaE5.js.map