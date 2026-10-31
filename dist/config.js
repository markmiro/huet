import { c as e, d as t, f as n, l as r, s as i, u as a } from "./theme-CZ1vtqrm.js";
import { t as o } from "./fromConfig-DAwnsiqs.js";
// src/private/isThemeConfig.ts
function s(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var c = ["rescaleSaturationToGrayRange"], l = (e) => typeof e == "number" && Number.isFinite(e);
function u(e) {
	if (!s(e)) return !1;
	let { id: t, name: n, pallet: r, ramps: i, bgRamp: o } = e;
	if (!((t === void 0 || l(t)) && (n === void 0 || typeof n == "string") && s(r) && Object.values(r).every((e) => typeof e == "string") && s(i) && Object.values(i).every(s) && typeof o == "string" && o in i && l(e.bgRampValue) && l(e.startSignalLightness) && l(e.endSignalLightness) && l(e.contrastMultiplier) && typeof e.rescaleContrastToGrayRange == "boolean")) return !1;
	try {
		return new a(e), !0;
	} catch {
		return !1;
	}
}
function d(e) {
	if (!s(e)) return;
	let t = Object.fromEntries(Object.entries(e).filter(([e]) => !c.includes(e)));
	return u(t) ? t : void 0;
}
// src/themeConfigs.ts
var f = [
	t,
	{
		...t,
		id: 2,
		name: "Base Inverted",
		bgRampValue: 0
	},
	{
		...t,
		id: 4,
		name: "Radioactive",
		pallet: {
			...t.pallet,
			black: "#69707f",
			white: "#c1ff00",
			red: "#ff88a4",
			yellow: "#b1bd2d",
			green: "#59c866",
			blue: "#83beff",
			purple: "#d2a8ff"
		},
		bgRampValue: 0,
		startSignalLightness: .46,
		endSignalLightness: .61
	},
	{
		...t,
		id: 5,
		name: "Blueprint",
		pallet: {
			...t.pallet,
			black: "#384cd2",
			white: "#ffffff",
			red: "#ff0030",
			yellow: "#988753",
			green: "#009700",
			blue: "#00a3ff",
			purple: "#af60ff"
		},
		ramps: {
			...t.ramps,
			gray: {
				...t.ramps.gray,
				colorModel: "lrgb"
			}
		},
		startSignalLightness: .26,
		endSignalLightness: .47
	},
	{
		...t,
		id: 6,
		name: "Terminal",
		pallet: {
			...t.pallet,
			black: "#0d171d",
			white: "#7fff8b",
			red: "#f54f75",
			yellow: "#b1bd2d",
			green: "#13a624",
			blue: "#558cff",
			purple: "#d75eff"
		},
		bgRampValue: 0,
		startSignalLightness: .5,
		endSignalLightness: .63
	},
	{
		...t,
		id: 7,
		name: "Paperback",
		pallet: {
			...t.pallet,
			black: "#3d3531",
			white: "#e2c1b1",
			red: "#e13639",
			yellow: "#c89455",
			green: "#238e5d",
			blue: "#366caa",
			purple: "#8e65bf"
		},
		bgRampValue: 1,
		startSignalLightness: .36,
		endSignalLightness: .55
	},
	{
		...t,
		id: 8,
		name: "Deep Dive",
		pallet: {
			...t.pallet,
			black: "#001b4f",
			white: "#b6e8e8",
			red: "#ff6669",
			yellow: "#a09c5c",
			green: "#319647",
			blue: "#496eff",
			purple: "#af5bff"
		},
		bgRampValue: 0,
		startSignalLightness: .44,
		endSignalLightness: .63
	},
	{
		...t,
		id: 9,
		name: "Royal Purple",
		pallet: {
			...t.pallet,
			black: "#37233b",
			white: "#f0c9e7",
			red: "#e13639",
			yellow: "#bd7f33",
			green: "#00878e",
			blue: "#3865da",
			purple: "#7630c8"
		},
		bgRampValue: 0,
		startSignalLightness: .5,
		endSignalLightness: .5
	},
	{
		...t,
		id: 10,
		name: "Orange Boost",
		pallet: {
			...t.pallet,
			black: "#474b56",
			white: "#ff7c49",
			red: "#e32850",
			yellow: "#af7000",
			green: "#00974c",
			blue: "#2292cb",
			purple: "#d961d6"
		},
		bgRampValue: 0,
		startSignalLightness: .27,
		endSignalLightness: .76,
		contrastMultiplier: 1
	},
	{
		...t,
		id: 11,
		name: "Faded Future",
		pallet: {
			...t.pallet,
			black: "#3c3d43",
			white: "#b2bdff",
			red: "#ff3200",
			yellow: "#987a1d",
			green: "#459700",
			blue: "#0073ff",
			purple: "#aa5dff"
		},
		bgRamp: "gray",
		bgRampValue: 0,
		startSignalLightness: .36,
		endSignalLightness: .72
	},
	{
		...t,
		id: 12,
		name: "A Box of Macaroni",
		pallet: {
			...t.pallet,
			black: "#0d0086",
			white: "#ffc900",
			red: "#ff0034",
			yellow: "#8a6420",
			green: "#26b047",
			blue: "#6599ff",
			purple: "#d400ff"
		},
		startSignalLightness: .6,
		endSignalLightness: .6,
		contrastMultiplier: 1.5
	},
	{
		...t,
		id: 13,
		name: "Sunset",
		pallet: {
			...t.pallet,
			black: "#242744",
			white: "#ffe173",
			red: "#f20031",
			yellow: "#c16000",
			green: "#008d29",
			blue: "#12889d",
			purple: "#b555c8"
		},
		ramps: {
			...t.ramps,
			gray: {
				...t.ramps.gray,
				colorModel: "hcl"
			}
		},
		bgRampValue: 0,
		startSignalLightness: .42,
		endSignalLightness: .58
	},
	{
		...t,
		id: 14,
		name: "Astro",
		pallet: {
			...t.pallet,
			black: "#040816",
			gray: "#ffb980",
			white: "#ffffff",
			red: "#cb1c00",
			yellow: "#bd8f5a",
			green: "#02b984",
			blue: "#4f81a7",
			purple: "#b982d5"
		},
		ramps: {
			...t.ramps,
			gray: {
				...t.ramps.gray,
				colors: [
					"black",
					"gray",
					"white"
				],
				colorModel: "hcl"
			}
		},
		bgRampValue: 0,
		startSignalLightness: .42,
		endSignalLightness: .58
	}
];
export { i as BaseColor, e as Color, a as Theme, t as baseThemeConfig, r as getLightness, u as isThemeConfig, d as parseThemeConfig, n as rampModes, f as themeConfigs, o as themeFromConfig };

//# sourceMappingURL=config.js.map